import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { addLog } from "@/lib/debug-logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, userId, model } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    addLog(`Manually triggering job with prompt: ${prompt}`);
    
    const jobId = await inngest.send({
      name: "app/generate.vibe",
      data: {
        prompt,
        userId: userId || "test-user",
        model: model || "gemini-1.5-flash",
      },
    });
    
    addLog(`Job triggered with ID: ${jobId}`);
    
    return NextResponse.json({ 
      success: true, 
      jobId,
      message: "Job triggered manually"
    });
    
  } catch (error) {
    console.error("Error triggering job:", error);
    addLog(`Error triggering job: ${error instanceof Error ? error.message : String(error)}`);
    
    return NextResponse.json(
      { error: "Failed to trigger job", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
