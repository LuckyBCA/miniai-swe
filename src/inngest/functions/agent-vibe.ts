import { inngest } from "@/inngest/client";
import { runAgent } from "@/lib/agent-kit";
import { createSandbox, getSandboxUrl, cleanupSandbox } from "../utils";
import { addLog } from "@/lib/debug-logger";

export const generateWithAgent = inngest.createFunction(
  { id: "generate-with-agent" },
  { event: "app/generate.agent" },
  async ({ event, step }) => {
    const { prompt, userId, model: modelName } = event.data as { 
      prompt: string; 
      userId: string; 
      model?: string;
    };

    try {
      // Log the start of the process
      await step.run("log-start", async () => {
        addLog(`Starting code generation for user ${userId} with prompt: "${prompt}"`);
        return { success: true };
      });

      // Create a sandbox first
      const sandboxId = await step.run("create-sandbox", async () => {
        return await createSandbox();
      });

      // Generate code using the agent
      const result = await step.run("generate-code", async () => {
        return await runAgent(prompt, modelName);
      });

      // If successful, get the sandbox URL
      const sandboxUrl = result.success 
        ? await step.run("get-sandbox-url", async () => {
            return await getSandboxUrl(sandboxId);
          })
        : null;

      // Return the final result
      return { 
        success: true, 
        sandboxId,
        sandboxUrl,
        files: result.files,
        summary: result.summary,
        error: result.error
      };
    } catch (error) {
      // Handle any errors and return a failure response
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      await step.run("log-error", async () => {
        addLog(`Error in generate-with-agent: ${errorMessage}`, "error");
        return { success: false };
      });
      
      return { 
        success: false, 
        error: errorMessage,
        message: "Failed to generate code"
      };
    }
  }
);

// Function to handle cleanup of expired sandboxes
export const cleanupExpiredSandboxes = inngest.createFunction(
  { id: "cleanup-expired-sandboxes" },
  { cron: "0 */6 * * *" }, // Run every 6 hours
  async ({ step }) => {
    try {
      // In a real implementation, you would fetch sandbox IDs from your database
      // and clean them up if they're older than a certain threshold
      
      await step.run("log-cleanup", async () => {
        addLog("Running sandbox cleanup job");
        return { success: true };
      });
      
      return { 
        success: true, 
        message: "Sandbox cleanup completed"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      await step.run("log-error", async () => {
        addLog(`Error in cleanup-expired-sandboxes: ${errorMessage}`, "error");
        return { success: false };
      });
      
      return { 
        success: false, 
        error: errorMessage,
        message: "Failed to clean up sandboxes"
      };
    }
  }
);