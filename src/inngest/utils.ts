import { Sandbox } from "@e2b/code-interpreter";
import { addLog } from "@/lib/debug-logger";

// The template ID for our E2B sandbox
const SANDBOX_TEMPLATE_ID = process.env.E2B_TEMPLATE_ID || "5iyfxo657up507oy9eay";

// Default timeout for sandboxes (5 minutes)
const DEFAULT_SANDBOX_TIMEOUT = 5 * 60 * 1000;

// Track active sandboxes for URL management
type SandboxWithMetadata = {
  instance: Sandbox;
  id: string;  // This will be the template ID, not the instance ID
  instanceId?: string; // Actual sandbox instance ID
  createdAt: Date;
  lastUsed: Date;
};

const activeSandboxes: Record<string, SandboxWithMetadata> = {};

/**
 * Creates a new sandbox instance
 * @param timeout Optional timeout in milliseconds
 * @returns The sandbox ID
 */
export async function createSandbox(timeout?: number): Promise<string> {
  try {
    const sandbox = await Sandbox.create({
      template: SANDBOX_TEMPLATE_ID,
      timeout: timeout || DEFAULT_SANDBOX_TIMEOUT
    });
    
    return sandbox.id;
  } catch (error) {
    console.error("Failed to create sandbox:", error);
    throw new Error(`Failed to create sandbox: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Gets or creates a sandbox instance and returns it with metadata
 */
export async function getSandbox(sandboxId: string) {
  // Reuse existing sandbox if available and recent
  const existingSandbox = activeSandboxes[sandboxId];
  if (existingSandbox) {
    console.log("Reusing existing sandbox:", sandboxId);
    existingSandbox.lastUsed = new Date();
    return existingSandbox.instance;
  }

  addLog(`Creating new sandbox with template ID: ${sandboxId}`);
  
  // Create new sandbox with timeout to prevent hanging
  const sandbox = await Promise.race([
    Sandbox.create(sandboxId, {
      timeoutMs: 300000, // 5 minutes timeout (E2B API expects timeoutMs, not timeout)
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Sandbox creation timed out after 5 minutes")), 300000)
    )
  ]) as Sandbox;
  
  addLog(`Sandbox created successfully with ID: ${(sandbox as any).id}`);
  
  // Store metadata
  activeSandboxes[sandboxId] = {
    instance: sandbox,
    id: sandboxId,  // Store the template ID
    instanceId: (sandbox as any).id,  // Store the actual instance ID if available
    createdAt: new Date(),
    lastUsed: new Date(),
  };
  
  return sandbox;
}

/**
 * Gets the URL for a running sandbox if available
 */
export function getSandboxUrl(sandboxId: string): string | null {
  const sandbox = activeSandboxes[sandboxId];
  if (!sandbox) return null;
  
  // E2B sandboxes typically expose a URL in this format
  if (sandbox.instanceId) {
    const url = `https://${sandbox.instanceId}.e2b.dev`;
    console.log(`Generated sandbox URL for ${sandboxId}:`, url);
    return url;
  }
  
  // If we can't find the instance ID in our metadata, try to get it directly
  // from the sandbox instance (it might be accessible there)
  if (sandbox.instance && (sandbox.instance as any).id) {
    const instanceId = (sandbox.instance as any).id;
    const url = `https://${instanceId}.e2b.dev`;
    console.log(`Generated sandbox URL using instance ID for ${sandboxId}:`, url);
    
    // Update our metadata for future reference
    sandbox.instanceId = instanceId;
    
    return url;
  }
  
  console.warn(`Could not generate sandbox URL for ${sandboxId}`);
  return null;
}

/**
 * Cleans up a sandbox
 * @param sandboxId The sandbox ID
 */
export async function cleanupSandbox(sandboxId: string): Promise<void> {
  if (!sandboxId) {
    return;
  }
  
  try {
    const sandbox = await getSandbox(sandboxId);
    await sandbox.close();
    console.log(`Sandbox ${sandboxId} closed successfully`);
  } catch (error) {
    console.error(`Error closing sandbox ${sandboxId}:`, error);
  }
}

/**
 * Extracts the last message content from an agent result
 */
export function getLastAssistantMessage(result: any): string | undefined {
  if (!result?.output?.length) return undefined;
  
  // Find the last assistant message
  for (let i = result.output.length - 1; i >= 0; i--) {
    const message = result.output[i];
    if (message.role === 'assistant') {
      if (typeof message.content === 'string') {
        return message.content;
      } else if (Array.isArray(message.content)) {
        return message.content.map(item => item.text || "").join("\n");
      }
    }
  }
  
  return undefined;
}

// Clean up old sandboxes periodically (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const MAX_SANDBOX_AGE_MS = 60 * 60 * 1000; // 1 hour

setInterval(() => {
  const now = new Date();
  Object.entries(activeSandboxes).forEach(([id, sandbox]) => {
    const age = now.getTime() - sandbox.lastUsed.getTime();
    if (age > MAX_SANDBOX_AGE_MS) {
      console.log(`Cleaning up old sandbox: ${id}`);
      cleanupSandbox(id).catch(console.error);
    }
  });
}, CLEANUP_INTERVAL_MS);
