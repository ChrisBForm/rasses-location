import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

// The environnement variable must be encoded in base64
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, "base64").toString("utf-8")
);

const adminApp = getApps().length
  ? getApp("admin")
  : initializeApp({
      credential: cert(serviceAccount),
      storageBucket: STORAGE_BUCKET,
    }, "admin");
const auth = getAuth(adminApp);
const storage = getStorage(adminApp);

export async function GET(request) {
  const authHeader = request.headers.get("authorization") || "";
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
     const decodedToken = await auth.verifyIdToken(tokenMatch[1]);
     if (!decodedToken.admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(process.env.FIREBASE_ACTIVITIES_URL, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const authHeader = request.headers.get("authorization") || "";
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decodedToken = await auth.verifyIdToken(tokenMatch[1]);
    if (!decodedToken.admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { activities } = await request.json();
    const file = STORAGE_BUCKET.file("activities.json");

    await file.save(JSON.stringify(activities, null, 2), {
      contentType: "application/json",
      metadata: { cacheControl: "public, max-age=0" },
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}