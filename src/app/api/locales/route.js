// app/api/locales/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.FIREBASE_MESSAGES_URL}config.json?alt=media`, {
      cache: "no-store",
    });

    if (!res.ok) return NextResponse.json({ locales: ["en"], localeNames: { en: "English" } });

    const data = await res.json();
    return NextResponse.json({
      locales: data.supportedLocales || ["en"],
      localeNames: data.localeNames || {},
    });
  } catch {
    return NextResponse.json({ locales: ["en"], localeNames: { en: "English" } });
  }
}