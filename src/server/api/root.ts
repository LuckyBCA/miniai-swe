import { inngestRouter } from "@/server/api/routers/inngest";
import { vibesRouter } from "@/server/api/routers/vibes";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  inngest: inngestRouter,
  vibes: vibesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
