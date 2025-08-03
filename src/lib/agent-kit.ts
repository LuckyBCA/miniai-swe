import { gemini, createAgent } from "@inngest/agent-kit";

// Initialize the Gemini model
const geminiModel = gemini({ 
  model: "gemini-1.5-flash",
  // apiKey: process.env.GEMINI_API_KEY, // Will be read from env var by default
});

// Create the agent
const codeGeneratorAgent = createAgent({
  name: "Code Generator",
  model: geminiModel,
  system: `You are an expert software engineer. Generate clean, production-ready code based on user requirements.
  Always respond with complete, runnable code. Include any necessary imports and setup.`,
  tools: [
    // We'll add tools here
  ],
});

// Helper function to run the agent with proper typing
async function runAgent(prompt: string): Promise<string> {
  try {
    // Using the agent's run method with the correct message format
    const response = await codeGeneratorAgent.run(prompt);
    
    // The response should be a string with the generated content
    return typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error) {
    console.error("Error running agent:", error);
    throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { codeGeneratorAgent, runAgent };
