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
      storageBucket: "sitelocationrasses.firebasestorage.app"
    }, "admin");
const auth = getAuth(adminApp);
const storage = getStorage(adminApp);

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
    console.error("Token verification failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!decodedToken.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Try fetching from Firebase Messages URL (same as frontend)
    const BUCKET_BASE_URL = process.env.FIREBASE_MESSAGES_URL;
    
    if (!BUCKET_BASE_URL) {
      console.error("FIREBASE_MESSAGES_URL environment variable not set");
      return NextResponse.json({ 
        error: "Server configuration error",
        details: "FIREBASE_MESSAGES_URL not configured"
      }, { status: 500 });
    }

    // Fetch config to get supported locales
    const configRes = await fetch(`${BUCKET_BASE_URL}config.json?alt=media`, {
      cache: "no-store"
    });
    
    if (!configRes.ok) {
      console.error("Failed to fetch config.json:", configRes.status, configRes.statusText);
      return NextResponse.json({ 
        error: "Config file not found",
        details: `HTTP ${configRes.status}: ${configRes.statusText}`
      }, { status: 404 });
    }

    const config = await configRes.json();
    const supportedLocales = config.supportedLocales || [];

    // Fetch all language files
    const languages = {};
    for (const locale of supportedLocales) {
      try {
        const langRes = await fetch(`${BUCKET_BASE_URL}${locale}.json?alt=media`, {
          cache: "no-store"
        });
        
        if (langRes.ok) {
          languages[locale] = await langRes.json();
        } else {
          console.warn(`Language file not found for ${locale}: HTTP ${langRes.status}`);
        }
      } catch (localeError) {
        console.error(`Error fetching language file for ${locale}:`, localeError.message);
      }
    }

    return NextResponse.json({ languages, locales: supportedLocales });
  } catch (error) {
    console.error("Failed to fetch languages:", error.message || error);
    return NextResponse.json({ 
      error: "Failed to fetch languages",
      details: error.message || error.toString()
    }, { status: 500 });
  }
}

export async function PUT(request) {
  const authHeader = request.headers.get("authorization") || "";
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(tokenMatch[1]);
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!decodedToken.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { locale, content } = await request.json();

    if (!locale || !content) {
      return NextResponse.json({ error: "Locale and content are required" }, { status: 400 });
    }

    const bucket = storage.bucket("sitelocationrasses.firebasestorage.app");
    const file = bucket.file(`languages/${locale}.json`);
    
    await file.save(JSON.stringify(content, null, 2), {
      contentType: "application/json",
      metadata: {
        cacheControl: "public, max-age=0"
      }
    });

    revalidatePath("/", "layout")

    return NextResponse.json({ 
      success: true, 
      message: `Language file ${locale} updated successfully`
    });
  } catch (error) {
    console.error("Failed to update language:", error.message || error);
    return NextResponse.json({ 
      error: "Failed to update language",
      details: error.message || error.toString()
    }, { status: 500 });
  }
}
