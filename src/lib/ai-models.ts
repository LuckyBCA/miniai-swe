export type BrandedModel = 'Vibe-S' | 'Vibe-M' | 'Vibe-L';

interface ModelDetails {
  id: string;
  name: BrandedModel;
  provider: 'OpenRouter' | 'Together';
  description: string;
}

export const modelMappings: Record<BrandedModel, ModelDetails> = {
  'Vibe-S': {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
    name: 'Vibe-S',
    provider: 'Together',
    description: 'Fast and capable, great for general tasks. (DeepSeek R1 Distill Llama 70B)',
  },
  'Vibe-M': {
    id: 'alibaba/qwen-2-72b-instruct',
    name: 'Vibe-M',
    provider: 'OpenRouter',
    description: 'A powerful model for complex code generation. (Qwen 2 72B)',
  },
  'Vibe-L': {
    id: 'deepseek/deepseek-coder-v2-lite-instruct',
    name: 'Vibe-L',
    provider: 'OpenRouter',
    description: 'Specialized for high-quality code generation. (DeepSeek Coder V2)',
  },
};

export const getAvailableModels = (): ModelDetails[] => {
  return Object.values(modelMappings);
};

export const getModelById = (id: BrandedModel): ModelDetails | undefined => {
  return modelMappings[id];
};
