import { NextResponse } from "next/server";
import { getSession } from "@/lib/firebase/auth";

// Get authenticated user from session and return a JSON response
export async function GET() {
  const user = await getSession();

  if (!user) {
    console.log("[api/users/me] Unauthorized: no session user");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(user);
}
