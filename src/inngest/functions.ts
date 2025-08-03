import OpenAI from "openai";
import { inngest } from "./client";
import db from "../lib/db";
import { decrypt } from "../lib/encryption";
import { getModelById, BrandedModel } from "../lib/ai-models";

// Together AI API client (using fetch)
async function callTogetherAI(prompt: string, model: string, apiKey: string) {
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
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
    }),
  });

  if (!response.ok) {
    throw new Error(`Together AI API error: ${response.statusText}`);
  }

  return await response.json();
}

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

    await step.run("run-generation", async () => {
      const user = await db.user.findUnique({ where: { id: userId } });

      let apiKey = process.env.OPENROUTER_API_KEY;
      if (modelDetails.provider === 'TogetherAI' && user?.encryptedTogetherAiApiKey) {
        apiKey = decrypt(user.encryptedTogetherAiApiKey);
      } else if (modelDetails.provider === 'OpenRouter' && user?.encryptedOpenRouterApiKey) {
        apiKey = decrypt(user.encryptedOpenRouterApiKey);
      }

      // Fallback to environment variable if no user key is provided
      if (!apiKey) {
        if (modelDetails.provider === 'TogetherAI') {
          apiKey = process.env.TOGETHER_API_KEY;
        } else {
          apiKey = process.env.OPENROUTER_API_KEY;
        }
      }

      if (!apiKey) {
        throw new Error("API key is not configured.");
      }

      let response;
      if (modelDetails.provider === 'TogetherAI') {
        // Use Together AI API
        response = await callTogetherAI(prompt, modelDetails.id, apiKey);
      } else {
        // Use OpenRouter API (default)
        const openai = new OpenAI({
          apiKey,
          baseURL: process.env.OPENAI_BASE_URL,
        });

        response = await openai.chat.completions.create({
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
      }

      await db.vibe.update({
        where: { id: vibe.id },
        data: {
          code: response.choices[0].message.content,
          status: "COMPLETED",
        },
      });
    }).catch(async (error) => {
      await db.vibe.update({
        where: { id: vibe.id },
        data: { status: "FAILED" },
      });
      throw error;
    });

    return { success: true, vibeId: vibe.id };
  }
);