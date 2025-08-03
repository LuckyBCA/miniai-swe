import { inngest } from "@/inngest/client";
import { agent } from "@/lib/agent";

export const generateWithAgent = inngest.createFunction(
  { id: "generate-with-agent" },
  { event: "app/generate.agent" },
  async ({ event, step }) => {
    const { prompt } = event.data;

    const response = await step.run("generate-with-agent", async () => {
      return agent.chat([
        { 
          role: "system", 
          content: "You are a helpful AI assistant that generates code." 
        },
        { role: "user", content: prompt },
      ]);
    });

    return { result: response };
  }
);