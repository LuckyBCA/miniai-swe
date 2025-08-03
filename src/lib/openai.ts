import OpenAI from "openai";

// A map of provider names to their base URLs
const providerBaseUrls: Record<string, string> = {
  openrouter: "https://openrouter.ai/api/v1",
  together: "https://api.together.ai/v1",
  // Add other providers here
};

/**
 * Returns an OpenAI client configured for a specific provider.
 * @param provider The name of the provider (e.g., 'openrouter', 'together').
 * @param apiKey The API key for the provider.
 * @returns A configured OpenAI client instance.
 */
export function getOpenAIClient(provider: string, apiKey: string): OpenAI {
  const baseURL = providerBaseUrls[provider.toLowerCase()];

  if (!baseURL) {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }

  return new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });
}

// Default client for convenience, if needed
export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // Defaulting to OpenRouter or a general key
  baseURL: providerBaseUrls.openrouter,
});
