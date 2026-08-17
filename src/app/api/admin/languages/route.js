import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

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
    const localeNames = config.localeNames || {};

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

    return NextResponse.json({ languages, locales: supportedLocales, localeNames });
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

    const bucket = storage.bucket(STORAGE_BUCKET);
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

export async function  DELETE(request) {
  const authHeader = request.headers.get("authorization") || "";
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(tokenMatch[1]);
  } catch (err) {
    console.error("Token verification failed:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!decodedToken.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { locale, remainingLocales } = await request.json();

    if (!locale || !remainingLocales) {
      return NextResponse.json({ error: "Locale and remainingLocales are required" }, { status: 400 });
    }

    if (locale === "en") {
      return NextResponse.json({ error: "The English language cannot be deleted" }, { status: 400 });
    }

    const bucket = storage.bucket(STORAGE_BUCKET);

    // Delete the language file
    const file = bucket.file(`languages/${locale}.json`);
    await file.delete();

    // Read the current config first so we don't overwrite unrelated names
    const configFile = bucket.file("languages/config.json");
    const [existingConfigBuffer] = await configFile.download();
    const existingConfig = JSON.parse(existingConfigBuffer.toString("utf-8"));

    const updatedLocales = (existingConfig.supportedLocales || []).filter((item) => item !== locale);
    const updatedLocaleNames = { ...(existingConfig.localeNames || {}) };
    delete updatedLocaleNames[locale];

    await configFile.save(JSON.stringify({
      ...existingConfig,
      supportedLocales: updatedLocales,
      localeNames: updatedLocaleNames,
    }, null, 2), {
      contentType: "application/json",
      metadata: { cacheControl: "public, max-age=0" }
    });

    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: `Language file ${locale} deleted successfully`
    });
  } catch (err) {
    console.error("Failed to delete language:", err.message || err);
    return NextResponse.json({
      error: "Failed to delete language",
      details: err.message || err.toString()
    }, { status: 500 });
  }
}