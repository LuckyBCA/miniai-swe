/**
 * Agent Configuration Module
 * 
 * This file manages AI model configuration and initialization for the agent system.
 * It supports multiple AI providers (Baseten, OpenAI, Anthropic, Gemini) and 
 * allows seamless switching between them.
 */

import { openai as openaiAdapter, anthropic as anthropicAdapter, gemini as geminiAdapter } from "@inngest/ai";
import { createAgent } from "@inngest/agent-kit";
import { getOpenAIClient } from "./openai";

/**
 * Supported AI providers
 * - openai: OpenAI API (GPT models)
 * - anthropic: Anthropic API (Claude models)
 * - gemini: Google's Gemini API
 * - baseten: Baseten API (compatible with OpenAI)
 */
export type SupportedProvider = "openai" | "anthropic" | "gemini" | "baseten";

/**
 * Configuration for each model
 * @property provider - Which AI provider to use
 * @property modelName - The specific model name from that provider
 * @property temperature - Controls randomness (0.0-1.0)
 */
export interface ModelConfig {
  provider: SupportedProvider;
  modelName: string;
  temperature?: number;
}

// Available models configuration
const models: Record<string, ModelConfig> = {
  // Baseten models (priority)
  "baseten-120b": { provider: "baseten", modelName: "openai/gpt-oss-120b", temperature: 0.7 },
  "baseten-llama3-70b": { provider: "baseten", modelName: "meta-llama/llama-3-70b-instruct", temperature: 0.7 },
  "baseten-llama3-8b": { provider: "baseten", modelName: "meta-llama/llama-3-8b-instruct", temperature: 0.7 },
  // OpenAI models
  "gpt-4-turbo": { provider: "openai", modelName: "gpt-4-turbo-preview", temperature: 0.1 },
  "gpt-4": { provider: "openai", modelName: "gpt-4", temperature: 0.1 },
  "gpt-4-1106": { provider: "openai", modelName: "gpt-4-1106-preview", temperature: 0.1 },
  "gpt-3.5": { provider: "openai", modelName: "gpt-3.5-turbo", temperature: 0.1 },
  // Anthropic models
  "claude-3-opus": { provider: "anthropic", modelName: "claude-3-opus-20240229", temperature: 0.1 },
  "claude-3-sonnet": { provider: "anthropic", modelName: "claude-3-sonnet-20240229", temperature: 0.1 },
  "claude-3-haiku": { provider: "anthropic", modelName: "claude-3-haiku-20240307", temperature: 0.1 },
  // Gemini models
  "gemini-pro": { provider: "gemini", modelName: "gemini-1.5-pro", temperature: 0.1 },
  "gemini-flash": { provider: "gemini", modelName: "gemini-1.5-flash", temperature: 0.1 },
};

// Default model to use if none specified
const DEFAULT_MODEL = "baseten-120b";

/**
 * Get an AI model adapter based on the provider
 */
function getModelAdapter(provider: SupportedProvider, modelName: string) {
  switch (provider) {
    case "openai":
      return openaiAdapter({ 
        model: modelName
      });
    case "anthropic":
      return anthropicAdapter({ 
        model: modelName,
        defaultParameters: { max_tokens: 1024 }
      });
    case "gemini":
      return geminiAdapter({
        model: modelName
      });
    case "baseten":
      // For Baseten, we use the OpenAI adapter since it's compatible
      // but we provide our own client
      const basetenClient = getOpenAIClient("baseten");
      return openaiAdapter({
        model: modelName,
        // @ts-expect-error - client is a valid property but types are strict
        client: basetenClient
      });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Initialize an agent with the specified model configuration
 * 
 * @param modelKey - The key of the model to use from our models dictionary
 * @param systemPrompt - Instructions for the AI agent
 * @returns A configured agent ready to use
 */
export function initializeAgent(modelKey: string = DEFAULT_MODEL, systemPrompt: string) {
  // Get model config or default to the default model
  const modelConfig = models[modelKey] || models[DEFAULT_MODEL];
  
  // Get the AI model adapter
  const adapter = getModelAdapter(
    modelConfig.provider, 
    modelConfig.modelName
  );
  
  // Create the agent with the model adapter
  return createAgent({
    name: "MinAI Assistant",
    description: "An AI assistant that helps build websites and applications",
    system: systemPrompt,
    model: adapter
  });
}

// Export available model keys for UI selection
export const availableModels = Object.keys(models);

// Initialize with default model and an empty prompt (to be overridden when used)
export const agent = initializeAgent(DEFAULT_MODEL, "You are a helpful AI assistant.");
