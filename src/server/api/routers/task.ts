import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { publishTaskChanged } from "~/server/realtime/publish";

const taskStatusSchema = z.enum(["CREATED", "IN_PROGRESS", "FINISHED"]);

const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

const getFinishedDeletionCutoff = () =>
  new Date(Date.now() - TEN_MINUTES_IN_MS);

export const taskRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    await ctx.db.task.deleteMany({
      where: {
        status: "FINISHED",
        finishedAt: { lte: getFinishedDeletionCutoff() },
      },
    });

    return ctx.db.task.findMany({
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

  getAssignableUsers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      select: { id: true, name: true, email: true, image: true },
      orderBy: [{ name: "asc" }, { email: "asc" }],
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().max(500).optional(),
        assignedToId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const createdTask = await ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description?.trim() ? input.description : null,
          createdById: ctx.session.user.id,
          assignedToId: input.assignedToId ?? null,
        },
      });

      publishTaskChanged({
        action: "create",
        taskId: createdTask.id,
        updatedAt: createdTask.updatedAt,
      });

      return createdTask;
    }),

  assign: protectedProcedure
    .input(
      z.object({
        taskId: z.number().int().positive(),
        assignedToId: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedTask = await ctx.db.task.update({
        where: { id: input.taskId },
        data: {
          assignedToId: input.assignedToId,
        },
      });

      publishTaskChanged({
        action: "assign",
        taskId: updatedTask.id,
        updatedAt: updatedTask.updatedAt,
      });

      return updatedTask;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.number().int().positive(),
        status: taskStatusSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedTask = await ctx.db.task.update({
        where: { id: input.taskId },
        data: {
          status: input.status,
          finishedAt: input.status === "FINISHED" ? new Date() : null,
        },
      });

      publishTaskChanged({
        action: "status",
        taskId: updatedTask.id,
        updatedAt: updatedTask.updatedAt,
      });

      return updatedTask;
    }),
});
