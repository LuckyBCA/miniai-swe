import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { inngest } from "@/inngest/client";
import { z } from "zod";
import { modelMappings, BrandedModel } from "@/lib/ai-models";

export const inngestRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        model: z.enum(Object.keys(modelMappings) as [BrandedModel, ...BrandedModel[]]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await inngest.send({
        name: "app/generate.vibe",
        data: {
          prompt: input.prompt,
          userId: ctx.auth.userId,
          model: input.model,
        },
      });

      return { success: true };
    }),
});
