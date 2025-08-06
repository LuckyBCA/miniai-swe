import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const analyticsRouter = createTRPCRouter({
  // Get usage statistics for the user
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    
    // Get user's vibes count by status
    const vibes = await ctx.db.vibe.findMany({
      where: { userId },
      select: { status: true, createdAt: true, model: true },
    });

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return {
      totalVibes: vibes.length,
      completedVibes: vibes.filter((v: any) => v.status === 'COMPLETED').length,
      failedVibes: vibes.filter((v: any) => v.status === 'FAILED').length,
      pendingVibes: vibes.filter((v: any) => v.status === 'PENDING').length,
      thisMonthVibes: vibes.filter((v: any) => v.createdAt >= thisMonth).length,
      lastMonthVibes: vibes.filter((v: any) => v.createdAt >= lastMonth && v.createdAt < thisMonth).length,
      modelUsage: vibes.reduce((acc: any, v: any) => {
        const model = v.model || 'unknown';
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }),

  // Get platform-wide statistics (public)
  getPlatformStats: publicProcedure.query(async ({ ctx }) => {
    const totalVibes = await ctx.db.vibe.count();
    const completedVibes = await ctx.db.vibe.count({
      where: { status: 'COMPLETED' }
    });
    const totalUsers = await ctx.db.user.count();

    return {
      totalVibes,
      completedVibes,
      totalUsers,
      successRate: totalVibes > 0 ? (completedVibes / totalVibes) * 100 : 0,
    };
  }),
});