import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { inngest } from "@/inngest/client";
import { z } from "zod";
import { BrandedModel } from "@/lib/ai-models";

// Supported Gemini models for internal use
export const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.0-pro",
] as const;

// Branded models for frontend use
export const BRANDED_MODELS = ["Vibe-S", "Vibe-M", "Vibe-L"] as const;

type GeminiModel = (typeof GEMINI_MODELS)[number];

export const inngestRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        prompt: z.string()
          .min(10, "Prompt must be at least 10 characters long")
          .refine(
            (value) => {
              // Avoid overly simple prompts that don't give enough context
              const tooSimple = /^(hi|hello|hey|test|hola|sup|yo)$/i.test(value.trim());
              return !tooSimple;
            },
            {
              message: "Please provide a more descriptive prompt about what you want to build"
            }
          ),
        model: z.enum(BRANDED_MODELS as unknown as [string, ...string[]]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Map branded model to Gemini model
      let geminiModel: GeminiModel = "gemini-1.5-flash"; // default
      
      // Simple mapping from branded models to Gemini models
      if (input.model === "Vibe-S") geminiModel = "gemini-1.5-flash";
      if (input.model === "Vibe-M") geminiModel = "gemini-1.5-pro";
      if (input.model === "Vibe-L") geminiModel = "gemini-1.0-pro";
      
      const jobId = await inngest.send({
        name: "app/generate.vibe",
        data: {
          prompt: input.prompt,
          userId: ctx.auth.userId,
          model: geminiModel,
        },
      });

      return {
        success: true,
        jobId,
        message: "Generation job started",
        timestamp: new Date().toISOString(),
      };
    }),
});
