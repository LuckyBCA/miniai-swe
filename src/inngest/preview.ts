import { inngest } from "./client";
import { getSandbox } from "./utils";
import { addLog } from "@/lib/debug-logger";
import prisma from "@/lib/db";

// Interface for sandbox preview response
interface SandboxPreviewResult {
  success: boolean;
  sandboxUrl?: string;
  error?: string;
  previewUrl?: string;
  sandboxId?: string;
  logs?: string[];
}

// Function to deploy a NextJS app to a sandbox and expose it
export const createSandboxPreview = inngest.createFunction(
  { id: "create-sandbox-preview" },
  { event: "app/sandbox.preview" },
  async ({ event, step }) => {
    const { vibeId, userId } = event.data as { 
      vibeId: string; 
      userId: string;
    };
    
    addLog(`Starting sandbox preview for vibe: ${vibeId}`);
    
    // Get the vibe from the database
    const vibe = await step.run("get-vibe-record", async () => {
      const vibeRecord = await prisma.vibe.findUnique({
        where: { id: vibeId }
      });
      
      if (!vibeRecord) {
        throw new Error(`Vibe not found: ${vibeId}`);
      }
      
      if (vibeRecord.userId !== userId) {
        throw new Error("You don't have permission to preview this vibe");
      }
      
      return vibeRecord;
    });
    
    const logs: string[] = [];
    const captureLog = (message: string) => {
      console.log(message);
      logs.push(message);
      addLog(message);
    };
    
    // Create and configure the sandbox
    const result = await step.run("create-and-configure-sandbox", async (): Promise<SandboxPreviewResult> => {
      try {
        // Use the Next.js template for the sandbox
        const NEXTJS_TEMPLATE_ID = '5iyfxo657up507oy9eay'; // miniai-swe-v3
        captureLog(`Creating sandbox with template: ${NEXTJS_TEMPLATE_ID}`);
        
        const sandbox = await getSandbox(NEXTJS_TEMPLATE_ID);
        const sandboxId = (sandbox as any).id || (sandbox as any).instanceId;
        
        if (!sandboxId) {
          throw new Error("Failed to get sandbox ID");
        }
        
        captureLog(`Sandbox created with ID: ${sandboxId}`);
        
        // Set up the Next.js app with the generated code
        if (!vibe.code) {
          throw new Error("No code available to deploy");
        }
        
        // Create necessary directories
        captureLog(`Setting up Next.js project structure`);
        await sandbox.files.makeDir('/app');
        await sandbox.files.makeDir('/app/pages');
        
        // Write the code to a file in the sandbox
        captureLog(`Writing code to sandbox`);
        await sandbox.files.write('/app/pages/index.js', vibe.code);
        
        // Create a basic package.json if it doesn't exist
        const packageJson = JSON.stringify({
          name: "nextjs-preview",
          version: "1.0.0",
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start"
          },
          dependencies: {
            next: "^13.0.0",
            react: "^18.2.0",
            "react-dom": "^18.2.0"
          }
        }, null, 2);
        
        await sandbox.files.write('/app/package.json', packageJson);
        
        // Install dependencies and start the Next.js dev server
        captureLog(`Installing dependencies...`);
        const installResult = await sandbox.runCode('cd /app && npm install');
        
        if (installResult.error) {
          throw new Error(`Failed to install dependencies: ${installResult.error}`);
        }
        
        captureLog(`Starting Next.js server...`);
        // Start the Next.js dev server as a background process
        await sandbox.runCode('cd /app && npx next dev &');
        
        // Wait a few seconds for the server to start
        captureLog(`Waiting for Next.js server to start...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Generate the preview URL
        const previewUrl = `https://${sandboxId}-3000.e2b.dev`;
        captureLog(`Preview URL generated: ${previewUrl}`);
        
        // Store the preview information in the vibe metadata using raw SQL to bypass type checking
        await prisma.$executeRaw`UPDATE "Vibe" SET "metadata" = jsonb_build_object('sandboxId', ${sandboxId}, 'previewUrl', ${previewUrl}, 'lastUpdated', ${new Date().toISOString()}) WHERE "id" = ${vibeId}`;
        
        return {
          success: true,
          sandboxId,
          sandboxUrl: `https://${sandboxId}.e2b.dev`,
          previewUrl,
          logs
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        captureLog(`Error creating sandbox preview: ${errorMessage}`);
        
        return {
          success: false,
          error: errorMessage,
          logs
        };
      }
    });
    
    return result;
  }
);
