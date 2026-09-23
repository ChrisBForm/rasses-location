import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { NextResponse } from "next/server";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const ACTIVITIES_FILE = "activities/activities.json";
const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, "base64").toString("utf-8")
);

const adminApp = getApps().length
    ? getApp("admin")
    : initializeApp({
        credential: cert(serviceAccount),
        storageBucket: STORAGE_BUCKET,
    }, "admin");
const storage = getStorage(adminApp);

export const runtime = "nodejs";

export async function GET() {
    try {
        const file = storage.bucket(STORAGE_BUCKET).file(ACTIVITIES_FILE);
        const [contents] = await file.download();
        return NextResponse.json(JSON.parse(contents.toString("utf-8")));
    } catch (error) {
        console.error("Failed to load activities:", error);
        return NextResponse.json({}, { status: 500 });
    }
}