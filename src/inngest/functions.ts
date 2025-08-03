import { inngest } from "./client";
import db from "../lib/db";
import { decrypt } from "../lib/encryption";
import { getModelById, BrandedModel } from "../lib/ai-models";
import { getOpenAIClient } from "../lib/openai";

export const generateVibe = inngest.createFunction(
  { id: "generate-vibe" },
  { event: "app/generate.vibe" },
  async ({ event, step }) => {
    const { prompt, userId, model: brandedModel } = event.data as { prompt: string; userId: string; model: BrandedModel };

    const modelDetails = getModelById(brandedModel);
    if (!modelDetails) {
      throw new Error(`Invalid model selected: ${brandedModel}`);
    }

    const vibe = await step.run("create-vibe-record", () => {
      return db.vibe.create({
        data: {
          userId,
          prompt,
          provider: modelDetails.provider,
          model: modelDetails.name,
          status: "PENDING",
        },
      });
    });

    try {
      const user = await step.run("get-user", () => {
        return db.user.findUnique({ where: { id: userId } });
      });

      let apiKey: string | undefined;
      if (modelDetails.provider.toLowerCase() === 'together' && user?.encryptedTogetherAiApiKey) {
        apiKey = decrypt(user.encryptedTogetherAiApiKey);
      } else if (modelDetails.provider.toLowerCase() === 'openrouter' && user?.encryptedOpenRouterApiKey) {
        apiKey = decrypt(user.encryptedOpenRouterApiKey);
      }

      // Fallback to environment variables if no user key is provided
      if (!apiKey) {
        if (modelDetails.provider.toLowerCase() === 'together') {
          apiKey = process.env.TOGETHER_API_KEY;
        } else {
          apiKey = process.env.OPENROUTER_API_KEY;
        }
      }

      if (!apiKey) {
        throw new Error(`API key for ${modelDetails.provider} is not configured.`);
      }

      const response = await step.run("run-generation", async () => {
        const openai = getOpenAIClient(modelDetails.provider, apiKey!);
        return openai.chat.completions.create({
          model: modelDetails.id,
          messages: [
            {
              role: "system",
              content:
                "You are a senior software engineer. Your task is to generate a single, production-ready Next.js page component (page.tsx) based on the user's prompt. The component should be written in TypeScript and use Tailwind CSS for styling. It must be a complete, self-contained file.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });
      });

      await step.run("update-vibe-success", () => {
        return db.vibe.update({
          where: { id: vibe.id },
          data: {
            code: response.choices[0].message.content,
            status: "COMPLETED",
          },
        });
      });

    } catch (error) {
      await step.run("update-vibe-failure", () => {
        return db.vibe.update({
          where: { id: vibe.id },
          data: { status: "FAILED" },
        });
      });
      throw error;
    }

    return { success: true, vibeId: vibe.id };
  }
);