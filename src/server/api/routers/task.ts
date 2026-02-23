import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { PrismaClient } from "../../../../generated/prisma";
import { publishTaskChanged } from "~/server/realtime/publish";

const taskStatusSchema = z.enum(["CREATED", "IN_PROGRESS", "FINISHED"]);

const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

const getFinishedDeletionCutoff = () =>
  new Date(Date.now() - TEN_MINUTES_IN_MS);

type DbClient = PrismaClient;

const projectIdInput = z.object({
  projectId: z.number().int().positive(),
});

const ensureProjectMembership = async (
  ctx: { db: DbClient; session: { user: { id: string } } },
  projectId: number,
) => {
  const membership = await ctx.db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: ctx.session.user.id,
      },
    },
    select: { id: true },
  });

  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this project.",
    });
  }
};

const ensureUserCanBeAssigned = async (
  db: DbClient,
  projectId: number,
  userId: string,
) => {
  const membership = await db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    select: { id: true },
  });

  if (!membership) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Assigned user must be a member of the selected project.",
    });
  }
};

export const taskRouter = createTRPCRouter({
  list: protectedProcedure.input(projectIdInput).query(async ({ ctx, input }) => {
    await ensureProjectMembership(ctx, input.projectId);

    await ctx.db.task.deleteMany({
      where: {
        projectId: input.projectId,
        status: "FINISHED",
        finishedAt: { lte: getFinishedDeletionCutoff() },
      },
    });

    return ctx.db.task.findMany({
      where: { projectId: input.projectId },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, image: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
  }),

  getAssignableUsers: protectedProcedure
    .input(projectIdInput)
    .query(async ({ ctx, input }) => {
      await ensureProjectMembership(ctx, input.projectId);

      return ctx.db.user.findMany({
        where: {
          projectMemberships: {
            some: { projectId: input.projectId },
          },
        },
        select: { id: true, name: true, email: true, image: true },
        orderBy: [{ name: "asc" }, { email: "asc" }],
      });
    }),

  create: protectedProcedure
    .input(
      projectIdInput.extend({
        title: z.string().min(1).max(120),
        description: z.string().max(500).optional(),
        assignedToId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureProjectMembership(ctx, input.projectId);
      if (input.assignedToId) {
        await ensureUserCanBeAssigned(ctx.db, input.projectId, input.assignedToId);
      }

      const createdTask = await ctx.db.task.create({
        data: {
          projectId: input.projectId,
          title: input.title,
          description: input.description?.trim() ? input.description : null,
          createdById: ctx.session.user.id,
          assignedToId: input.assignedToId ?? null,
        },
      });

      publishTaskChanged({
        action: "create",
        taskId: createdTask.id,
        projectId: input.projectId,
        updatedAt: createdTask.updatedAt,
      });

      return createdTask;
    }),

  updateDetails: protectedProcedure
    .input(
      projectIdInput.extend({
        taskId: z.number().int().positive(),
        title: z.string().min(1).max(120),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureProjectMembership(ctx, input.projectId);

      const updatedTask = await ctx.db.task.updateMany({
        where: { id: input.taskId, projectId: input.projectId },
        data: {
          title: input.title.trim(),
          description: input.description?.trim() ? input.description : null,
        },
      });

      if (updatedTask.count === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found." });
      }

      const task = await ctx.db.task.findUniqueOrThrow({
        where: { id: input.taskId },
      });

      publishTaskChanged({
        action: "details",
        taskId: task.id,
        projectId: input.projectId,
        updatedAt: task.updatedAt,
      });

      return task;
    }),

  delete: protectedProcedure
    .input(
      projectIdInput.extend({
        taskId: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureProjectMembership(ctx, input.projectId);

      const deletedTask = await ctx.db.task.deleteMany({
        where: { id: input.taskId, projectId: input.projectId },
      });

      if (deletedTask.count === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found." });
      }

      publishTaskChanged({
        action: "delete",
        taskId: input.taskId,
        projectId: input.projectId,
        updatedAt: new Date(),
      });

      return { id: input.taskId };
    }),

  assign: protectedProcedure
    .input(
      projectIdInput.extend({
        taskId: z.number().int().positive(),
        assignedToId: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureProjectMembership(ctx, input.projectId);
      if (input.assignedToId) {
        await ensureUserCanBeAssigned(ctx.db, input.projectId, input.assignedToId);
      }

      const updatedTask = await ctx.db.task.updateMany({
        where: { id: input.taskId, projectId: input.projectId },
        data: {
          assignedToId: input.assignedToId,
        },
      });

      if (updatedTask.count === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found." });
      }

      const task = await ctx.db.task.findUniqueOrThrow({
        where: { id: input.taskId },
      });

      publishTaskChanged({
        action: "assign",
        taskId: task.id,
        projectId: input.projectId,
        updatedAt: task.updatedAt,
      });

      return task;
    }),

  updateStatus: protectedProcedure
    .input(
      projectIdInput.extend({
        taskId: z.number().int().positive(),
        status: taskStatusSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureProjectMembership(ctx, input.projectId);

      const updatedTask = await ctx.db.task.updateMany({
        where: { id: input.taskId, projectId: input.projectId },
        data: {
          status: input.status,
          finishedAt: input.status === "FINISHED" ? new Date() : null,
        },
      });

      if (updatedTask.count === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found." });
      }

      const task = await ctx.db.task.findUniqueOrThrow({
        where: { id: input.taskId },
      });

      publishTaskChanged({
        action: "status",
        taskId: task.id,
        projectId: input.projectId,
        updatedAt: task.updatedAt,
      });

      return task;
    }),
});
