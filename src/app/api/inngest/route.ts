import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateVibe } from "@/inngest/functions";

// Create an API that serves all of the functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateVibe],
});