import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");
  let name: string | undefined;

  // Parse the name from the request body (sent by manual registration, not Google sign-in)
  try {
    const body = await req.json() as { name?: unknown };
    if (typeof body.name === "string") {
      name = body.name.trim() || undefined;
    }
  } catch {
    name = undefined;
  }

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authorization.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    // firebaseName/firebaseImage: sourced from the Firebase token (Google sign-in profile data),
    // may differ from what is stored in the database if the user updated their profile here.
    const firebaseName = decodedToken.name?.trim();
    const firebaseImage = decodedToken.picture?.trim();
    // Prefer the name sent in the request body (manual registration), fall back to Firebase token name
    name = name || firebaseName;

    // Upsert user to PostgreSQL database.
    // If firebaseName or firebaseImage exist on the token, sync them to the DB.
    // (THIS IS IMPORTANT) If they are absent, keep whatever is already stored — never overwrite with null.
    const user = await prisma.user.upsert({
      where: { email: decodedToken.email! },
      update: {
        ...(name ? { name } : {}),
        ...(firebaseImage ? { image: firebaseImage } : {}),
      },
      create: {
        email: decodedToken.email!,
        name: name || null,
        image: firebaseImage || null,
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