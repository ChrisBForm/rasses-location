import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch(process.env.FIREBASE_ACTIVITIES_URL, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return NextResponse.jsomn({}, { status: 404 });
        return NextResponse.json(await res.json());
    } catch {
        return NextResponse.json({}, { status: 500 });
    }
}