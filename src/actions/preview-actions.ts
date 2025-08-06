"use server";

import { inngest } from "@/inngest/client";
import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Trigger a preview for a vibe
export async function triggerPreview(vibeId: string, userId: string) {
  // Authorize the user
  const session = auth();
  if (!session || session.userId !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the vibe to extract necessary information
    const vibe = await db.vibe.findUnique({
      where: { id: vibeId },
    });

    if (!vibe) {
      throw new Error("Vibe not found");
    }

    if (!vibe.code) {
      throw new Error("No code available to preview");
    }

    // Send event to Inngest to create the preview
    await inngestClient.send({
      name: "app/preview.nextjs.app",
      data: {
        userId,
        appName: `Vibe-${vibeId.slice(0, 8)}`,
        projectId: vibeId,
        customization: {
          // You can add customization options here based on vibe data
          theme: "default",
        },
      },
    });

    // Update the vibe with pending preview status
    await db.$queryRaw`
      UPDATE "Vibe"
      SET "metadata" = COALESCE("metadata", '{}')::jsonb || '{"previewStatus": "PENDING", "lastUpdated": "${new Date().toISOString()}"}'::jsonb
      WHERE id = ${vibeId}
    `;

    // Revalidate the path to update the UI
    revalidatePath(`/vibes/${vibeId}/preview`);

    return { success: true };
  } catch (error) {
    console.error("Error triggering preview:", error);
    throw error;
  }
}

// Cancel a preview sandbox
export async function cancelPreview(vibeId: string, userId: string, sandboxId: string) {
  // Authorize the user
  const session = auth();
  if (!session || session.userId !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Update the vibe with cancellation status
    await db.$queryRaw`
      UPDATE "Vibe"
      SET "metadata" = COALESCE("metadata", '{}')::jsonb || '{"previewStatus": "CANCELLING", "lastUpdated": "${new Date().toISOString()}"}'::jsonb
      WHERE id = ${vibeId}
    `;

    // Send cancellation request to E2B
    const response = await fetch("/api/cancel-sandbox", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sandboxId,
        vibeId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to cancel sandbox");
    }

    // Revalidate the path to update the UI
    revalidatePath(`/vibes/${vibeId}/preview`);

    return { success: true };
  } catch (error) {
    console.error("Error canceling preview:", error);
    throw error;
  }
}

// Get the preview status for a vibe
export async function getPreviewStatus(vibeId: string, userId: string) {
  // Authorize the user
  const session = auth();
  if (!session || session.userId !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the vibe metadata using raw query
    const result = await db.$queryRaw`
      SELECT metadata FROM "Vibe" WHERE id = ${vibeId}
    `;

    if (Array.isArray(result) && result.length > 0) {
      const metadata = result[0].metadata || {};
      return {
        previewStatus: metadata.previewStatus || null,
        previewUrl: metadata.previewUrl || null,
        sandboxId: metadata.sandboxId || null,
        lastUpdated: metadata.lastUpdated || null,
      };
    }

    return {
      previewStatus: null,
      previewUrl: null,
      sandboxId: null,
      lastUpdated: null,
    };
  } catch (error) {
    console.error("Error getting preview status:", error);
    throw error;
  }
}
