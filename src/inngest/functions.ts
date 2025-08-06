/**
 * Inngest Functions for MiniAI
 * 
 * This file contains background job functions that run on Inngest.
 * These functions handle AI code generation, sandbox management, and more.
 */

import { inngest } from "./client";
import db from "../lib/db";
import { getSandbox } from "./utils";

/**
 * Simple logger for debugging Inngest functions.
 * Replace with a more advanced logger if needed.
 */
function addLog(message: string) {
  console.log(`[Inngest] ${message}`);
}

// E2B sandbox template ID - used to create code execution environments
const SANDBOX_TEMPLATE = "5iyfxo657up507oy9eay"; 

/**
 * Interface for the code generation function response
 */
interface CodeExecutionResult {
  success: boolean;
  output: string;
  sandboxUrl?: string;
  error?: string;
  executionTime?: number;
}

/**
 * Main function for generating websites based on user prompts
 * 
 * This function:
 * 1. Creates a database record for the generation
 * 2. Calls the AI agent to generate code based on the prompt
 * 3. Creates a sandbox environment to run the code
 * 4. Returns the result with a live URL
 */
export const generateVibe = inngest.createFunction(
  { id: "generate-vibe" },
  { event: "app/generate.vibe" },
  async ({ event, step }) => {
    // Track execution time for analytics
    const startTime = Date.now();
    
    // Extract data from the event
    const { prompt, userId, model: modelName } = event.data as { 
      prompt: string; 
      userId: string; 
      model: string;
    };
    
    addLog(`Starting vibe generation with model: ${modelName}`);

    // Create database record to track this generation
    const vibe = await step.run("create-vibe-record", () => {
      return db.vibe.create({
        data: {
          userId,
          prompt,
          provider: "agentkit", // Using Inngest Agent Kit
          model: modelName,
          status: "PENDING",
        },
      });
    });

    let sandboxUrl: string | undefined = undefined;
    let executionResult: CodeExecutionResult;

    try {
      // Generate code using the AI model and execute in sandbox
      const generatedCode = await step.run("run-generation", async () => {
        console.log(`Using model ${modelName} for generation`);
        
        // Get AI-generated code using our agent
        const code = await runAgent(prompt, modelName);
        
        // Create sandbox environment to run the code
        addLog(`Creating sandbox using template: ${SANDBOX_TEMPLATE}`);
        const sandbox = await getSandbox(SANDBOX_TEMPLATE);
        
        // Get the sandbox ID and create a public URL
        const sandboxId = sandbox.id || (sandbox as any).instanceId;
        addLog(`Sandbox created with ID: ${sandboxId}`);
        
        // Generate a URL that can be shared
        if (sandboxId) {
          sandboxUrl = `https://${sandboxId}.e2b.dev`;
          console.log("Generated sandbox URL:", sandboxUrl);
        }
        
        // Execute the code in the sandbox
        try {
          // Write the code to a file in the sandbox
          await sandbox.filesystem.write('/code/app.js', code);
          
          // Run the code and capture output
          const proc = await sandbox.process.start({
            cmd: 'node /code/app.js',
            onStdout: (data) => console.log('Sandbox stdout:', data.line),
            onStderr: (data) => console.error('Sandbox stderr:', data.line)
          });
          
          // Wait for execution to complete
          const result = await proc.wait();
          return result.stdout;
        } catch (error) {
          console.error("Sandbox execution error:", error);
          throw error;
        }
      });

      // Create successful result object
      executionResult = {
        success: true,
        output: generatedCode,
        sandboxUrl,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      // Handle any errors that occurred
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error in generateVibe:", error);
      
      executionResult = {
        success: false,
        output: errorMessage,
        sandboxUrl,
        error: errorMessage,
        executionTime: Date.now() - startTime,
      };
    }

    // Update the database record with results
    await step.run("update-vibe-status", async () => {
      // Update the vibe record with results
      const updatedVibe = await db.vibe.update({
        where: { id: vibe.id },
        data: {
          code: executionResult.output,
          status: executionResult.success ? "COMPLETED" : "FAILED",
          error: executionResult.error,
          metadata: {
            sandboxUrl: executionResult.sandboxUrl,
            executionTime: executionResult.executionTime,
            completedAt: new Date().toISOString()
          }
        },
      });
      
      addLog(`Vibe updated successfully. New status: ${updatedVibe.status}`);
      return updatedVibe;
    });

    return executionResult;
  }
);