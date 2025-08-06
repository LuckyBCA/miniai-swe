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
});
