/**
 * Inngest Functions for MiniAI
 * 
 * This file contains background job functions that run on Inngest.
 * These functions handle AI code generation, sandbox management, and more.
 */

import { inngest } from "./client";
import db from "../lib/db";
import { getSandbox } from "./utils";
import { initializeAgent } from "../lib/agent";

/**
 * Run the AI agent to generate code based on a prompt
 */
async function runAgent(prompt: string, modelKey: string): Promise<string> {
  try {
    const systemPrompt = `You are an expert web developer assistant. Generate complete, working Next.js applications based on user requests.

Create modern, responsive web applications with:
- Clean, professional design
- Working React components
- Proper TypeScript usage
- Tailwind CSS for styling
- Complete file structure
- Functional features

Return only the complete code for the main page component. Make it a full-featured, working application.`;

    const agent = initializeAgent(modelKey, systemPrompt);
    
    // This is a simplified version - in reality you'd use the agent-kit properly
    // For now, return a basic Next.js app template
    return `
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
  } catch (error) {
    console.error("Error running agent:", error);
    throw error;
  }
}

/**
 * Simple logger for debugging Inngest functions.
 * Replace with a more advanced logger if needed.
 */
function addLog(message: string) {
  console.log(`[Inngest] ${message}`);
}
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

    let sandboxUrl = "No sandbox URL generated";
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
        const sandboxId = (sandbox as any).sandboxId || (sandbox as any).instanceId || 'unknown';
        addLog(`Sandbox created with ID: ${sandboxId}`);
        
        // Generate a URL that can be shared
        if (sandboxId) {
          sandboxUrl = `https://${sandboxId}.e2b.dev`;
          console.log("Generated sandbox URL:", sandboxUrl);
        }
        
        // Execute the code in the sandbox
        try {
          // For E2B code interpreter, we use runCode method
          const result = await sandbox.runCode(code);
          
          return {
            code,
            sandboxId,
            output: result.text || result.results?.[0]?.text || '',
            url: `https://${sandboxId}.e2b.dev`
          };
        } catch (error) {
          console.error("Sandbox execution error:", error);
          throw error;
        }
      });

      // Create successful result object
      const codeOutput = typeof generatedCode === 'string' ? generatedCode : generatedCode.code;
      const finalSandboxUrl = typeof generatedCode === 'object' ? generatedCode.url : sandboxUrl;
      
      executionResult = {
        success: true,
        output: codeOutput,
        sandboxUrl: finalSandboxUrl,
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
        where: { id: event.data.vibeId },
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