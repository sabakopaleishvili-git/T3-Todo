import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { publishProjectInvitationCreated } from "~/server/realtime/publish";

const projectIdInput = z.object({
  projectId: z.number().int().positive(),
});

export const projectRouter = createTRPCRouter({
  listInvitableUsers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      where: {
        id: {
          not: ctx.session.user.id,
        },
        email: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: [{ name: "asc" }, { email: "asc" }],
    });
  }),

  listMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
        members: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: { members: true, tasks: true },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          title: input.title.trim(),
          description: input.description?.trim() ? input.description : null,
          ownerId: ctx.session.user.id,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: "OWNER",
            },
          },
        },
      });
    }),

  createInvitation: protectedProcedure
    .input(
      projectIdInput.extend({
        invitedEmail: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: ctx.session.user.id,
          },
        },
        select: {
          id: true,
          project: { select: { id: true, title: true } },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this project.",
        });
      }

      const invitedUser = await ctx.db.user.findUnique({
        where: { email: input.invitedEmail.trim().toLowerCase() },
        select: { id: true, email: true },
      });

      if (!invitedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No registered user found with this email.",
        });
      }

      if (invitedUser.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already in this project.",
        });
      }

      const existingMember = await ctx.db.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: invitedUser.id,
          },
        },
        select: { id: true },
      });

      if (existingMember) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "That user is already a member of this project.",
        });
      }

      const invitation = await ctx.db.projectInvitation.upsert({
        where: {
          projectId_invitedUserId: {
            projectId: input.projectId,
            invitedUserId: invitedUser.id,
          },
        },
        update: {
          invitedById: ctx.session.user.id,
          status: "PENDING",
          respondedAt: null,
        },
        create: {
          projectId: input.projectId,
          invitedById: ctx.session.user.id,
          invitedUserId: invitedUser.id,
          status: "PENDING",
        },
        include: {
          invitedBy: { select: { name: true, email: true } },
        },
      });

      publishProjectInvitationCreated({
        invitationId: invitation.id,
        projectId: membership.project.id,
        projectTitle: membership.project.title,
        invitedByName: invitation.invitedBy.name ?? invitation.invitedBy.email ?? "A teammate",
        invitedByEmail: invitation.invitedBy.email,
        invitedUserId: invitedUser.id,
        invitedUserEmail: invitedUser.email,
      });

      return invitation;
    }),

  listPendingInvitations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.projectInvitation.findMany({
      where: {
        invitedUserId: ctx.session.user.id,
        status: "PENDING",
      },
      orderBy: [{ createdAt: "desc" }],
      include: {
        project: {
          select: { id: true, title: true, description: true },
        },
        invitedBy: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
  }),

  respondToInvitation: protectedProcedure
    .input(
      z.object({
        invitationId: z.number().int().positive(),
        decision: z.enum(["ACCEPTED", "DECLINED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.db.projectInvitation.findUnique({
        where: { id: input.invitationId },
        include: {
          project: {
            select: { id: true, title: true },
          },
        },
      });

      if (!invitation || invitation.invitedUserId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found.",
        });
      }

      if (invitation.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation has already been processed.",
        });
      }

      await ctx.db.$transaction(async (tx) => {
        await tx.projectInvitation.update({
          where: { id: invitation.id },
          data: {
            status: input.decision,
            respondedAt: new Date(),
          },
        });

        if (input.decision === "ACCEPTED") {
          await tx.projectMember.upsert({
            where: {
              projectId_userId: {
                projectId: invitation.projectId,
                userId: ctx.session.user.id,
              },
            },
            update: {},
            create: {
              projectId: invitation.projectId,
              userId: ctx.session.user.id,
              role: "MEMBER",
            },
          });
        }
      });

      return {
        ok: true,
        invitationId: invitation.id,
        projectId: invitation.projectId,
        projectTitle: invitation.project.title,
        decision: input.decision,
      };
    }),
});
