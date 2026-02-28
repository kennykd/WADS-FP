import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");
  let displayName: string | undefined;

  // Parse the displayName from the request body
  try {
    const body = await req.json() as { displayName?: unknown };
    if (typeof body.displayName === "string") {
      displayName = body.displayName.trim() || undefined;
    }
  } catch {
    displayName = undefined;
  }

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authorization.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);

    // Upsert user to PostgreSQL Database
    // Fallback to use displayName if the user registers manually and not using google registration popups
    const user = await prisma.user.upsert({
      where: { email: decodedToken.email! },
      update: {
        name: decodedToken.name || displayName || null,
        image: decodedToken.picture || null,
      },
      create: {
        email: decodedToken.email!,
        name: decodedToken.name || displayName || null,
        image: decodedToken.picture || null,
        emailVerified: decodedToken.email_verified || false,
      },
    });

    // Set session cookie
    const response = NextResponse.json({ status: "success", userId: user.id });
    response.cookies.set("session", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Firebase auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}