import { inngest } from "./client";
import db from "../lib/db";
import { runAgent } from "@/lib/agent-kit";

export const generateVibe = inngest.createFunction(
  { id: "generate-vibe" },
  { event: "app/generate.vibe" },
  async ({ event, step }) => {
    const { prompt, userId, model: modelName } = event.data as { 
      prompt: string; 
      userId: string; 
      model: string;
    };

    // Create vibe record in database
    const vibe = await step.run("create-vibe-record", () => {
      return db.vibe.create({
        data: {
          userId,
          prompt,
          provider: "agentkit",
          model: modelName,
          status: "PENDING",
        },
      });
    });

    try {
      // Run generation using AgentKit
      const generatedCode = await step.run("run-generation", async () => {
        return runAgent(prompt);
      });

      // Update the vibe with the generated code
      await step.run("update-vibe-success", () => {
        return db.vibe.update({
          where: { id: vibe.id },
          data: {
            code: generatedCode,
            status: "COMPLETED",
          },
        });
      });

      return { success: true, vibeId: vibe.id };
      
    } catch (error) {
      console.error("Failed to run generation:", error);
      await step.run("update-vibe-failure", () => {
        return db.vibe.update({
          where: { id: vibe.id },
          data: { 
            status: "FAILED"
          },
        });
      });
      throw error;
    }
  }
);