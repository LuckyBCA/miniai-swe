import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateVibe } from "@/inngest/functions";
import { generateWithAgent } from "@/inngest/functions/agent-vibe";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateVibe, generateWithAgent],
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

export const dynamic = 'force-dynamic';