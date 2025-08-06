import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { triggerPreview } from "@/actions/preview-actions";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // For demo, use a test vibeId (replace with real logic in production)
    const vibeId = "test-vibe-id";
    await triggerPreview(vibeId, session.userId);

    // In a real app, you would fetch the sandbox URL from the DB or Inngest result
    // Here, just return a placeholder
    return NextResponse.json({ success: true, sandboxUrl: "https://sandbox-url-placeholder.e2b.dev" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
  }
}
