import { inngestRouter } from "@/server/api/routers/inngest";
import { vibesRouter } from "@/server/api/routers/vibes";
import { analyticsRouter } from "@/server/api/routers/analytics";
import { creditsRouter } from "@/server/api/routers/credits";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  inngest: inngestRouter,
  vibes: vibesRouter,
  analytics: analyticsRouter,
  credits: creditsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
