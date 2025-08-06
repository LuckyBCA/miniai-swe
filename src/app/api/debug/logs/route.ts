import { NextResponse } from "next/server";
import { getLogs } from "@/lib/debug-logger";

export async function GET() {
  const logs = getLogs();
  
  return NextResponse.json({ 
    logs,
    timestamp: new Date().toISOString() 
  });
}
