import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/mongodb";
import type { QueryPayload } from "@/types/query";

export async function POST(request: Request) {
    try {
        const payload = (await request.json()) as QueryPayload;
        if (
            !payload.user_name?.trim() ||
            !payload.translated_transcript?.trim() ||
            !payload.phone_full?.trim()
        ) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const db = await getDatabase();
        const result = await db.collection("query_submissions").insertOne({
            user_name: payload.user_name.trim(),
            source_language: payload.source_language,
            original_transcript: payload.original_transcript,
            translated_transcript: payload.translated_transcript,
            phone_country_code: payload.phone_country_code,
            phone_number: payload.phone_number,
            phone_full: payload.phone_full,
            client_timestamp: payload.client_timestamp,
            client_timezone: payload.client_timezone,
            status: "accepted",
            created_at: new Date(),
        });

        return NextResponse.json({
            id: String(result.insertedId),
            status: "accepted",
            submitted_at: payload.client_timestamp,
        });
    } catch (error) {
        console.error("[api/queries] submission failed", error);
        return NextResponse.json({ error: "Submission failed" }, { status: 500 });
    }
}
