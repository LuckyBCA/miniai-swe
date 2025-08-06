import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const vibesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.vibe.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.vibe.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const vibes = await ctx.db.vibe.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        status: true,
        createdAt: true,
      },
    });

    const stats = {
      total: vibes.length,
      completed: vibes.filter(v => v.status === 'COMPLETED').length,
      pending: vibes.filter(v => v.status === 'PENDING').length,
      failed: vibes.filter(v => v.status === 'FAILED').length,
      thisWeek: vibes.filter(v => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return v.createdAt >= weekAgo;
      }).length,
    };

    return stats;
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const vibe = await ctx.db.vibe.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!vibe) {
        throw new Error('Vibe not found');
      }

      await ctx.db.vibe.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'])
    }))
    .mutation(async ({ ctx, input }) => {
      const vibe = await ctx.db.vibe.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!vibe) {
        throw new Error('Vibe not found');
      }

      return await ctx.db.vibe.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
          updatedAt: new Date(),
        },
      });
    }),
});
