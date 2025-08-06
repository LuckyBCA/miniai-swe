// AI model definitions and configurations

export interface BrandedModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  pricing: {
    input: number; // per 1M tokens
    output: number; // per 1M tokens
  };
  capabilities: {
    contextLength: number;
    supportsImages: boolean;
    supportsCodeGeneration: boolean;
    supportsFunction: boolean;
  };
}

// Available AI models configuration
const models: BrandedModel[] = [
  {
    id: 'vibe-s',
    name: 'Vibe-S (Speed)',
    provider: 'gemini',
    description: 'Fast model optimized for quick responses and simple tasks',
    pricing: {
      input: 0.075,
      output: 0.3
    },
    capabilities: {
      contextLength: 128000,
      supportsImages: true,
      supportsCodeGeneration: true,
      supportsFunction: true
    }
  },
  {
    id: 'vibe-m',
    name: 'Vibe-M (Balanced)',
    provider: 'gemini',
    description: 'Balanced model for general-purpose development tasks',
    pricing: {
      input: 0.125,
      output: 0.5
    },
    capabilities: {
      contextLength: 128000,
      supportsImages: true,
      supportsCodeGeneration: true,
      supportsFunction: true
    }
  },
  {
    id: 'vibe-l',
    name: 'Vibe-L (Quality)',
    provider: 'gemini',
    description: 'High-quality model for complex applications and advanced reasoning',
    pricing: {
      input: 0.25,
      output: 1.0
    },
    capabilities: {
      contextLength: 128000,
      supportsImages: true,
      supportsCodeGeneration: true,
      supportsFunction: true
    }
  }
];

// OpenAI models (optional)
const openaiModels: BrandedModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI\'s flagship model for complex reasoning and code generation',
    pricing: {
      input: 2.5,
      output: 10.0
    },
    capabilities: {
      contextLength: 128000,
      supportsImages: true,
      supportsCodeGeneration: true,
      supportsFunction: true
    }
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Faster, more affordable version of GPT-4o',
    pricing: {
      input: 0.15,
      output: 0.6
    },
    capabilities: {
      contextLength: 128000,
      supportsImages: true,
      supportsCodeGeneration: true,
      supportsFunction: true
    }
  }
];

// Anthropic models (optional)
const anthropicModels: BrandedModel[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Anthropic\'s most intelligent model for complex tasks',
    pricing: {
      input: 3.0,
      output: 15.0
    },
    capabilities: {
      contextLength: 200000,
      supportsImages: true,
      supportsCodeGeneration: true,
      supportsFunction: true
    }
  }
];

/**
 * Get all available models based on configured providers
 */
export function getAvailableModels(): BrandedModel[] {
  const availableModels = [...models];

  // Add OpenAI models if API key is configured
  if (process.env.OPENAI_API_KEY) {
    return [...availableModels, ...openaiModels];
  }

  // Add Anthropic models if API key is configured
  if (process.env.ANTHROPIC_API_KEY) {
    return [...availableModels, ...anthropicModels];
  }

  return availableModels;
}

/**
 * Get a specific model by ID
 */
export function getModelById(id: string): BrandedModel | undefined {
  return getAvailableModels().find(model => model.id === id);
}

/**
 * Map internal model IDs to actual provider model names
 */
export function mapToProviderModel(modelId: string): string {
  const mapping: Record<string, string> = {
    'vibe-s': 'gemini-1.5-flash',
    'vibe-m': 'gemini-1.5-pro',
    'vibe-l': 'gemini-1.5-pro-002',
    'gpt-4o': 'gpt-4o',
    'gpt-4o-mini': 'gpt-4o-mini',
    'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022'
  };

  return mapping[modelId] || modelId;
}

/**
 * Calculate estimated cost for a request
 */
export function calculateCost(
  modelId: string, 
  inputTokens: number, 
  outputTokens: number
): number {
  const model = getModelById(modelId);
  if (!model) return 0;

  const inputCost = (inputTokens / 1000000) * model.pricing.input;
  const outputCost = (outputTokens / 1000000) * model.pricing.output;
  
  return inputCost + outputCost;
}

/**
 * Get default model for the application
 */
export function getDefaultModel(): BrandedModel {
  return models[1]; // vibe-m as default
}

// Export all model arrays for specific use cases
export { models as defaultModels, openaiModels, anthropicModels };