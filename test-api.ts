import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const providers = {
  openai: {
    baseURL: "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
    models: ['gpt-4-turbo-preview', 'gpt-3.5-turbo']
  },
  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    models: ['z-ai/glm-4.5-air:free', 'deepseek/deepseek-chat-v3-0324:free']
  },
  together: {
    baseURL: "https://api.together.ai/v1",
    apiKey: process.env.TOGETHERAI_API_KEY,
    models: ['deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free', 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free']
  },
  baseten: {
    baseURL: "https://api.baseten.ai/v1",
    apiKey: process.env.BASETEN_API_KEY,
    models: ['openai/gpt-oss-120b']
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const providerName = args[0] || 'openrouter';
const modelIndex = parseInt(args[1] || '0');

// This will test the API key for the specified provider
async function testAPI() {
  const provider = providers[providerName as keyof typeof providers];
  
  if (!provider) {
    console.error(`Provider "${providerName}" not found. Available providers: ${Object.keys(providers).join(', ')}`);
    process.exit(1);
  }
  
  if (!provider.apiKey) {
    console.error(`API key for ${providerName} not found in environment variables. Please set ${providerName.toUpperCase()}_API_KEY`);
    process.exit(1);
  }
  
  const model = provider.models[modelIndex];
  if (!model) {
    console.error(`Model index ${modelIndex} not found for provider ${providerName}. Available models: ${provider.models.join(', ')}`);
    process.exit(1);
  }

  const openai = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
  });

  try {
    console.log(`Testing ${providerName} with model ${model}...`);
    
    const chatCompletion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: "Write a simple React button component with Tailwind styling" }],
      max_tokens: 500,
    });

    console.log(`✅ API Key for ${providerName} is valid!`);
    console.log("Response:");
    console.log(chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error(`❌ API Key test failed for ${providerName}:`, error);
  }
}

testAPI();
