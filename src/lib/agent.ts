import { gemini } from "@inngest/agent-kit";

// Initialize the Gemini model
const geminiModel = gemini({ 
  model: "gemini-1.5-flash",
  // apiKey: process.env.GEMINI_API_KEY, // Will be read from env var by default
});

// Export the Gemini model as the agent
export const agent = geminiModel;