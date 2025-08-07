import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getCreditStatus, upgradeToPremium, cancelPremium } from "@/lib/credit-system";

export const creditsRouter = createTRPCRouter({
  // Get current credit status for authenticated user
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    return await getCreditStatus(ctx.auth.userId!);
  }),

  // Get credit usage history
  getUsageHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const usage = await ctx.db.creditUsage.findMany({
        where: { userId: ctx.auth.userId! },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      const total = await ctx.db.creditUsage.count({
        where: { userId: ctx.auth.userId! }
      });

      return {
        usage,
        total,
        hasMore: total > input.offset + input.limit
      };
    }),

  // Upgrade to premium (after Stripe payment)
  upgradeToPremium: protectedProcedure
    .input(z.object({
      stripeCustomerId: z.string(),
      stripeSubscriptionId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await upgradeToPremium(
        ctx.auth.userId!,
        input.stripeCustomerId,
        input.stripeSubscriptionId
      );
      return { success: true };
    }),

  // Cancel premium subscription
  cancelPremium: protectedProcedure.mutation(async ({ ctx }) => {
    await cancelPremium(ctx.auth.userId!);
    return { success: true };
  }),

  // Get pricing information
  getPricing: protectedProcedure.query(() => {
    return {
      free: {
        name: "Free",
        credits: 50,
        price: 0,
        features: [
          "50 free requests daily",
          "Basic app generation", 
          "Sandbox previews",
          "Community support"
        ]
      },
      premium: {
        name: "Premium",
        credits: 1000,
        price: 19, // $19/month
        features: [
          "1000 requests daily",
          "Priority app generation",
          "Advanced sandbox features",
          "Premium support",
          "No rate limits",
          "Custom templates"
        ]
      }
    };
  })
});