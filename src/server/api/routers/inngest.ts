import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { inngest } from "@/inngest/client";
import { z } from "zod";

// Supported Gemini models
export const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro'
] as const;

type GeminiModel = typeof GEMINI_MODELS[number];

export const inngestRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1, "Prompt is required"),
        model: z.enum(GEMINI_MODELS as [string, ...string[]]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const jobId = await inngest.send({
        name: "app/generate.vibe",
        data: {
          prompt: input.prompt,
          userId: ctx.auth.userId,
          model: input.model as GeminiModel,
        },
      });

      return { 
        success: true, 
        jobId,
        message: "Generation job started",
        timestamp: new Date().toISOString()
      };
    }),
});
