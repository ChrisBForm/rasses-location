import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

const adminApp = getApps().length
  ? getApp("admin")
  : initializeApp({
      credential: cert(serviceAccount),
      storageBucket: "sitelocationrasses.firebasestorage.app",
    }, "admin");

const auth = getAuth(adminApp);
const storage = getStorage(adminApp);

export async function PUT(request) {
  const authHeader = request.headers.get("authorization") || "";
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await auth.verifyIdToken(tokenMatch[1]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { locales, localeNames } = await request.json();
    const bucket = storage.bucket("sitelocationrasses.firebasestorage.app");
    const file = bucket.file("languages/config.json");

    await file.save(JSON.stringify({ supportedLocales: locales, localeNames }, null, 2), {
      contentType: "application/json",
      metadata: { cacheControl: "public, max-age=0" },
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}