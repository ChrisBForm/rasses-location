import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";

// The environnement variable must be encoded in base64
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, "base64").toString("utf-8")
);

const adminApp = getApps().length
  ? getApp("admin")
  : initializeApp({ credential: cert(serviceAccount) }, "admin");
const auth = getAuth(adminApp);

async function listAllUsers(nextPageToken) {
  const result = await auth.listUsers(1000, nextPageToken);
  const users = result.users.map((userRecord) => ({
    uid: userRecord.uid,
    email: userRecord.email || "",
    displayName: userRecord.displayName || "",
    emailVerified: userRecord.emailVerified,
    disabled: userRecord.disabled,
    createdAt: userRecord.metadata.creationTime || "",
    lastSignInAt: userRecord.metadata.lastSignInTime || "",
    customClaims: userRecord.customClaims || {},
  }));

  if (result.pageToken) {
    return users.concat(await listAllUsers(result.pageToken));
  }

  return users;
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization") || "";
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(tokenMatch[1]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!decodedToken.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await listAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to list users:", error);
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}

export async function POST(request) {
  const authHeader = request.headers.get("authorization") || "";
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(tokenMatch[1]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!decodedToken.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, displayName } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const newUser = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
      disabled: false,
    });

    return NextResponse.json({
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName || "",
      emailVerified: newUser.emailVerified,
      disabled: newUser.disabled,
      customClaims: newUser.customClaims || {},
      createdAt: newUser.metadata.creationTime || "",
      lastSignInAt: newUser.metadata.lastSignInTime || "",
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const authHeader = request.headers.get("authorization") || "";
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(tokenMatch[1]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!decodedToken.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { uid, password, role, status } = body;

  if (!uid) {
    return NextResponse.json({ error: "UID is required." }, { status: 400 });
  }

  try {
    const updatePayload = {};
    if (password) updatePayload.password = password;
    if (typeof status === "string") updatePayload.disabled = status === "disabled";

    if (Object.keys(updatePayload).length > 0) {
      await auth.updateUser(uid, updatePayload);
    }

    if (typeof role === "string") {
      const isAdmin = role === "admin";
      await auth.setCustomUserClaims(uid, { admin: isAdmin });
    }

    const updatedUser = await auth.getUser(uid);
    return NextResponse.json({
      uid: updatedUser.uid,
      email: updatedUser.email,
      displayName: updatedUser.displayName || "",
      emailVerified: updatedUser.emailVerified,
      disabled: updatedUser.disabled,
      customClaims: updatedUser.customClaims || {},
      createdAt: updatedUser.metadata.creationTime || "",
      lastSignInAt: updatedUser.metadata.lastSignInTime || "",
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const authHeader = request.headers.get("authorization") || "";
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(tokenMatch[1]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!decodedToken.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { uid } = body;

  if (!uid) {
    return NextResponse.json({ error: "UID is required." }, { status: 400 });
  }

  try {
    await auth.deleteUser(uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
