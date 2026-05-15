import { NextResponse } from "next/server";

import type { QueryPayload } from "@/types/query";

export async function POST(request: Request) {
    try {
        const payload = (await request.json()) as QueryPayload;
        if (!payload.translated_transcript?.trim() || !payload.phone_full?.trim()) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        return NextResponse.json({
            id: `local-${Date.now()}`,
            status: "accepted",
            submitted_at: payload.client_timestamp,
        });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
