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
  let displayName: string | undefined;

  // EDIT: Parse the displayName from the request body
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
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    // EDIT: added three constants to help the process of checking if the username or image already exist in the database, even if it is not in the firebase console
    const tokenName = decodedToken.name?.trim();
    const tokenImage = decodedToken.picture?.trim();
    // Take the displayName first then fallback to use firebase username (set username when a user registers using our website)
    const userName = displayName || tokenName;

    // Upsert user to PostgreSQL Database
    // Fallback to use displayName if the user registers manually and not using google registration popups
    const user = await prisma.user.upsert({
      where: { email: decodedToken.email! },
      // EDIT: If userName or image from the firebase console exist, update it
      // (THIS IS IMPORTANT) but if it does not exist, do not update, keeping the values in the database
      update: {
        ...(userName ? { name: userName } : {}),
        ...(tokenImage ? { image: tokenImage } : {}),
      },
      create: {
        email: decodedToken.email!,
        name: userName || null,
        image: tokenImage || null,
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