import { NextResponse } from "next/server";
import { addLog } from "@/lib/debug-logger";
import { getSandbox, closeSandbox } from "@/inngest/utils";

export async function POST(request: Request) {
  try {
    // Note: In a production environment, you would want to add authentication/authorization here
    const body = await request.json();
    const { sandboxId } = body;
    
    if (!sandboxId) {
      return NextResponse.json({ error: "sandboxId is required" }, { status: 400 });
    }

    addLog(`Attempting to cancel sandbox: ${sandboxId}`, 'warning');
    
    // Try to close the sandbox
    const result = await closeSandbox(sandboxId);
    
    if (result) {
      addLog(`Successfully closed sandbox: ${sandboxId}`, 'info');
      return NextResponse.json({ 
        success: true, 
        message: `Sandbox ${sandboxId} closed successfully`
      });
    } else {
      addLog(`Failed to close sandbox: ${sandboxId}`, 'error');
      return NextResponse.json({ 
        success: false, 
        error: `Sandbox ${sandboxId} could not be closed`
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error("Error cancelling sandbox:", error);
    addLog(`Error cancelling sandbox: ${error instanceof Error ? error.message : String(error)}`, 'error');
    
    return NextResponse.json(
      { error: "Failed to cancel sandbox", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
