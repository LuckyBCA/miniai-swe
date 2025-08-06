import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { cancelSandbox } from "@/lib/e2b-agent";

// API route to cancel a running sandbox job
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  
  // Check authentication
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { vibeId, sandboxId } = await req.json();
    
    if (!vibeId) {
      return NextResponse.json({ error: "Missing vibeId parameter" }, { status: 400 });
    }

    // Get the vibe record from the database
    const vibe = await prisma.vibe.findUnique({
      where: { id: vibeId },
    });

    if (!vibe) {
      return NextResponse.json({ error: "Vibe not found" }, { status: 404 });
    }

    // Check if the vibe belongs to the current user
    if (vibe.userId !== userId) {
      return NextResponse.json({ error: "You do not have permission to cancel this job" }, { status: 403 });
    }

    // Extract sandboxId from metadata using a raw query
    let targetSandboxId = sandboxId;
    if (!targetSandboxId) {
      // Get metadata using raw query to extract sandboxId
      const metadataResult = await prisma.$queryRaw`SELECT "metadata"->>'sandboxId' as "sandboxId" FROM "Vibe" WHERE "id" = ${vibeId}`;
      
      // metadataResult will be an array with one object
      const metadataRow = metadataResult as any;
      if (metadataRow && metadataRow[0] && metadataRow[0].sandboxId) {
        targetSandboxId = metadataRow[0].sandboxId;
      }
    }

    if (!targetSandboxId) {
      return NextResponse.json({ 
        error: "No sandbox ID found for this vibe", 
        message: "The job may not have created a sandbox yet or the sandbox ID wasn't saved" 
      }, { status: 400 });
    }

    // Attempt to cancel the sandbox
    await cancelSandbox(targetSandboxId);

    // Update the vibe status to cancelled using raw SQL to bypass type checking
    await prisma.$executeRaw`
      UPDATE "Vibe" 
      SET "status" = 'CANCELLED'::"GenerationStatus",
          "metadata" = COALESCE("metadata", '{}'::jsonb) || '{"cancelledAt": "${new Date().toISOString()}"}'::jsonb 
      WHERE "id" = ${vibeId}
    `;

    return NextResponse.json({ 
      success: true,
      message: "Sandbox cancelled successfully"
    });

  } catch (error: any) {
    console.error("Error cancelling sandbox:", error);
    return NextResponse.json({ 
      error: "Failed to cancel sandbox", 
      message: error.message 
    }, { status: 500 });
  }
}
