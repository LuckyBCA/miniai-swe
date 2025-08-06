import { Sandbox } from "@e2b/code-interpreter";

export interface SandboxOptions {
  timeoutMs?: number;
  templateId?: string;
}

export interface SandboxResult {
  sandboxId: string;
  url?: string;
  error?: string;
}

/**
 * Create a new E2B sandbox for code execution
 */
export async function createSandbox(options: SandboxOptions = {}): Promise<SandboxResult> {
  try {
    const sandbox = await Sandbox.create({
      apiKey: process.env.E2B_API_KEY,
      timeoutMs: options.timeoutMs || 300000, // 5 minutes default
      ...(options.templateId && { template: options.templateId }),
    });

    return {
      sandboxId: sandbox.sandboxId,
      url: `https://${sandbox.sandboxId}.e2b.dev`,
    };
  } catch (error: any) {
    console.error("Error creating sandbox:", error);
    return {
      sandboxId: "",
      error: error.message || "Failed to create sandbox",
    };
  }
}

/**
 * Cancel/kill a running sandbox
 */
export async function cancelSandbox(sandboxId: string): Promise<void> {
  try {
    if (!sandboxId) {
      throw new Error("Sandbox ID is required");
    }

    // Connect to the existing sandbox and kill it
    const sandbox = await Sandbox.reconnect(sandboxId, {
      apiKey: process.env.E2B_API_KEY,
    });

    await sandbox.kill();
    console.log(`Sandbox ${sandboxId} cancelled successfully`);
  } catch (error: any) {
    console.error(`Error cancelling sandbox ${sandboxId}:`, error);
    throw new Error(`Failed to cancel sandbox: ${error.message}`);
  }
}

/**
 * Execute code in a sandbox
 */
export async function executeSandboxCode(
  sandboxId: string,
  code: string,
  language: string = "bash"
): Promise<{ output?: string; error?: string }> {
  try {
    const sandbox = await Sandbox.reconnect(sandboxId, {
      apiKey: process.env.E2B_API_KEY,
    });

    const result = await sandbox.notebook.execCell(code, {
      onStdout: (output) => console.log("Sandbox stdout:", output),
      onStderr: (output) => console.error("Sandbox stderr:", output),
    });

    return {
      output: result.text || "",
    };
  } catch (error: any) {
    console.error("Error executing sandbox code:", error);
    return {
      error: error.message || "Failed to execute code",
    };
  }
}

/**
 * Get sandbox status and URL
 */
export async function getSandboxStatus(sandboxId: string): Promise<{
  isRunning: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const sandbox = await Sandbox.reconnect(sandboxId, {
      apiKey: process.env.E2B_API_KEY,
    });

    return {
      isRunning: true,
      url: `https://${sandbox.sandboxId}.e2b.dev`,
    };
  } catch (error: any) {
    return {
      isRunning: false,
      error: error.message || "Sandbox not accessible",
    };
  }
}

/**
 * Clean up old/expired sandboxes
 */
export async function cleanupExpiredSandboxes(sandboxIds: string[]): Promise<void> {
  for (const sandboxId of sandboxIds) {
    try {
      await cancelSandbox(sandboxId);
    } catch (error) {
      console.warn(`Failed to cleanup sandbox ${sandboxId}:`, error);
    }
  }
}