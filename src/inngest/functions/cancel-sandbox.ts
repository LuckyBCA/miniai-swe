import { inngest } from "../client";
import { addLog } from "@/lib/debug-logger";
import prisma from "@/lib/db";
import { cancelSandbox } from "@/lib/e2b-agent";

// Function to cancel a sandbox preview
export const cancelSandboxPreview = inngest.createFunction(
  { id: "cancel-sandbox-preview" },
  { event: "app/sandbox.cancel" },
  async ({ event, step }) => {
    const { vibeId, userId, sandboxId } = event.data as { 
      vibeId: string; 
      userId: string;
      sandboxId: string;
    };
    
    addLog(`Cancelling sandbox for vibe: ${vibeId}, sandbox ID: ${sandboxId}`);
    
    // Verify the vibe exists and belongs to the user
    const vibe = await step.run("verify-vibe-ownership", async () => {
      const vibeRecord = await prisma.vibe.findUnique({
        where: { id: vibeId }
      });
      
      if (!vibeRecord) {
        throw new Error(`Vibe not found: ${vibeId}`);
      }
      
      if (vibeRecord.userId !== userId) {
        throw new Error("You don't have permission to cancel this sandbox");
      }
      
      return vibeRecord;
    });
    
    // Extract sandbox ID from metadata if not provided directly
    const targetSandboxId = await step.run("get-sandbox-id", async () => {
      if (sandboxId) {
        return sandboxId;
      }
      
      // If no sandboxId provided, try to get it from vibe metadata
      const vibeWithMetadata = await prisma.$queryRaw`
        SELECT metadata FROM "Vibe" WHERE id = ${vibeId}
      `;
      
      if (Array.isArray(vibeWithMetadata) && vibeWithMetadata.length > 0) {
        const metadata = vibeWithMetadata[0].metadata;
        if (metadata && metadata.sandboxId) {
          return metadata.sandboxId;
        }
      }
      
      throw new Error("No sandbox ID found for cancellation");
    });
    
    // Cancel the sandbox
    const result = await step.run("cancel-sandbox", async () => {
      try {
        addLog(`Cancelling sandbox with ID: ${targetSandboxId}`);
        await cancelSandbox(targetSandboxId);
        
        // Update the vibe metadata to remove preview info
        await prisma.$executeRaw`
          UPDATE "Vibe" 
          SET "metadata" = CASE 
            WHEN "metadata" IS NULL THEN '{}'::jsonb
            ELSE "metadata" - 'sandboxId' - 'previewUrl'
          END
          WHERE "id" = ${vibeId}
        `;
        
        return {
          success: true,
          message: `Sandbox ${targetSandboxId} cancelled successfully`
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        addLog(`Error cancelling sandbox: ${errorMessage}`, "error");
        
        return {
          success: false,
          error: errorMessage
        };
      }
    });
    
    return result;
  }
);
