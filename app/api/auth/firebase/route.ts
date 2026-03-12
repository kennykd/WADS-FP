import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/auth/firebase:
 *   post:
 *     summary: Exchange a Firebase ID token for a session cookie
 *     tags:
 *       - Auth
 *     description: >
 *       Verifies the provided Firebase ID token, upserts the user into the
 *       PostgreSQL database, and sets an httpOnly session cookie. Called
 *       automatically after a successful Firebase login (email/password or Google).
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Firebase ID token in the format "Bearer <idToken>"
 *         example: "Bearer eyJhbGciOiJSUzI1NiJ9..."
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 description: >
 *                   Optional display name for the user. Takes priority over the
 *                   name stored in the Firebase token. Used when registering
 *                   with email/password where Firebase has no display name set.
 *                 example: "Alex Scholar"
 *     responses:
 *       200:
 *         description: Authentication successful — session cookie is set
 *         headers:
 *           Set-Cookie:
 *             description: httpOnly session cookie containing the Firebase ID token
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 userId:
 *                   type: string
 *                   description: The user's database ID
 *                   example: "clxyz123abc"
 *       401:
 *         description: Missing, malformed, or invalid Firebase ID token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 */

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