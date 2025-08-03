import OpenAI from 'openai';

// This will test the OpenRouter API key directly
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // Explicitly use the OpenRouter key
  baseURL: "https://openrouter.ai/api/v1",
});

async function testAPI() {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "qwen/qwen2.5-coder-32b-instruct", // A known good model
      messages: [{ role: "user", content: "Say this is a test" }],
      max_tokens: 10,
    });

    console.log("API Key is valid!");
    console.log("Response:", chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error("API Key test failed:", error);
  }
}

testAPI();
