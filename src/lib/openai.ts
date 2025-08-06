/**
 * OpenAI Client Module
 * 
 * This file provides functionality to create OpenAI-compatible clients
 * for different AI providers, including Baseten, OpenRouter, Together.ai,
 * and standard OpenAI.
 */

import OpenAI from "openai";

// A map of provider names to their base URLs
const providerBaseUrls: Record<string, string> = {
  openrouter: "https://openrouter.ai/api/v1",
  together: "https://api.together.ai/v1",
  openai: "https://api.openai.com/v1",
  baseten: "https://inference.baseten.co/v1",
  // Add other providers here as needed
};

// Default models for each provider
const defaultModels: Record<string, string> = {
  openai: "gpt-4",
  baseten: "openai/gpt-oss-120b",
  openrouter: "openrouter/auto",
  together: "together/llama-2-70b-chat",
};

/**
 * Returns an OpenAI client configured for a specific provider.
 * @param provider The name of the provider (e.g., 'openrouter', 'together', 'openai', 'baseten').
 * @param apiKey The API key for the provider.
 * @returns A configured OpenAI client instance.
 */
export function getOpenAIClient(provider: string, apiKey?: string): OpenAI {
  const baseURL = providerBaseUrls[provider.toLowerCase()];

  if (!baseURL) {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }

  // Use provided API key or fall back to environment variable
  const key = apiKey || process.env[`${provider.toUpperCase()}_API_KEY`] || process.env.OPENAI_API_KEY;
  
  if (!key) {
    throw new Error(`No API key provided for ${provider} and none found in environment variables`);
  }

  return new OpenAI({
    apiKey: key,
    baseURL: baseURL,
  });
}

/**
 * Get the default model for a specific provider
 * @param provider The name of the provider
 * @returns The default model name for that provider
 */
export function getDefaultModel(provider: string): string {
  return defaultModels[provider.toLowerCase()] || "gpt-4";
}

/**
 * Get the default client based on environment configuration
 * Prioritizes Baseten if available
 */
export function getDefaultClient(): OpenAI {
  // Determine which provider to use based on available environment variables
  const provider = process.env.AI_PROVIDER || 'baseten'; // Changed default to 'baseten'
  return getOpenAIClient(provider);
}

// Default client for convenience
export const openai = getDefaultClient();
