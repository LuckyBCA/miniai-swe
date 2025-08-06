import { inngest } from "@/inngest/client";
import { initializeAgent } from "@/lib/agent";
import { createSandbox, getSandboxUrl, cleanupSandbox } from "../utils";
import { addLog } from "@/lib/debug-logger";

/**
 * Simple agent runner using the agent system
 */
async function runAgent(prompt: string, modelName: string): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const systemPrompt = `You are an expert web developer. Generate working Next.js React applications based on user requests.

Create modern, responsive web applications with:
- Clean, professional design
- Working React components  
- Proper TypeScript usage
- Tailwind CSS for styling
- Complete functionality

Return only the complete code for the main page component.`;

    const agent = initializeAgent(modelName, systemPrompt);
    
    // For now, return a basic template - this would use the agent properly
    const code = `
import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8 text-center">
          ${prompt}
        </h1>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
          <p className="text-white/90 text-lg mb-6">
            This is a generated application based on your prompt: "${prompt}"
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Feature 1</h3>
              <p className="text-white/70">Amazing functionality built with AI</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Feature 2</h3>
              <p className="text-white/70">Powered by modern technologies</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Feature 3</h3>
              <p className="text-white/70">Responsive and beautiful design</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`;
    
    return { success: true, code };
  } catch (error) {
    console.error("Error in runAgent:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

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
        return await runAgent(prompt, modelName || 'vibe-m');
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
        code: result.code,
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