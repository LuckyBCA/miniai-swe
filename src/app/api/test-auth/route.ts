import { getAuth } from "@clerk/nextjs/server";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return new Response(JSON.stringify({ userId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
