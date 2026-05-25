import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { sendSubmissionEmail } from "@/lib/email";
import { getDatabase } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/rateLimit";
import type { QueryPayload } from "@/types/query";

// ── Rate-limit config ────────────────────────────────────────────────────────
// 5 submissions per IP per 10 minutes.
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

// ── Helpers ──────────────────────────────────────────────────────────────────
function getClientIp(headersList: Headers): string {
    return (
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown"
    );
}

function validPayload(p: Partial<QueryPayload>): p is QueryPayload {
    return (
        typeof p.user_name === "string" && p.user_name.trim().length > 0 &&
        typeof p.translated_transcript === "string" && p.translated_transcript.trim().length > 0 &&
        typeof p.phone_full === "string" && p.phone_full.trim().length > 0 &&
        typeof p.phone_country_code === "string" &&
        typeof p.phone_number === "string" &&
        typeof p.client_timestamp === "string" &&
        typeof p.client_timezone === "string"
    );
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
    // 1. Rate-limit check (per IP)
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const rl = checkRateLimit(`queries:${ip}`, RATE_LIMIT);

    if (!rl.allowed) {
        const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
        console.warn(`[api/queries] rate-limited IP=${ip}`);
        return NextResponse.json(
            { error: "Too many submissions. Please wait and try again.", code: "RATE_LIMITED" },
            {
                status: 429,
                headers: {
                    "Retry-After": String(retryAfterSec),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
                },
            }
        );
    }

    // 2. Parse & validate payload
    let payload: Partial<QueryPayload>;
    try {
        payload = (await request.json()) as Partial<QueryPayload>;
    } catch {
        return NextResponse.json(
            { error: "Invalid request body.", code: "BAD_REQUEST" },
            { status: 400 }
        );
    }

    if (!validPayload(payload)) {
        return NextResponse.json(
            { error: "Missing required fields.", code: "INVALID_PAYLOAD" },
            { status: 400 }
        );
    }

    // 3. Write to DB first — source of truth
    let insertedId: string;
    try {
        const db = await getDatabase();
        const result = await db.collection("query_submissions").insertOne({
            user_name: payload.user_name.trim(),
            source_language: payload.source_language ?? "auto",
            original_transcript: payload.original_transcript ?? "",
            translated_transcript: payload.translated_transcript.trim(),
            phone_country_code: payload.phone_country_code,
            phone_number: payload.phone_number,
            phone_full: payload.phone_full.trim(),
            client_timestamp: payload.client_timestamp,
            client_timezone: payload.client_timezone,
            status: "accepted",
            email_sent: false,
            created_at: new Date(),
            ip,
        });
        insertedId = String(result.insertedId);
        console.info(`[api/queries] stored id=${insertedId} ip=${ip}`);
    } catch (error) {
        console.error("[api/queries] DB write failed", error);
        return NextResponse.json(
            { error: "Could not save your query. Please try again.", code: "DB_ERROR" },
            { status: 500 }
        );
    }

    // 4. Send email AFTER DB write — non-fatal if it fails
    try {
        await sendSubmissionEmail({
            user_name: payload.user_name.trim(),
            original_query: payload.original_transcript ?? "",
            translated_query: payload.translated_transcript.trim(),
            phone: payload.phone_full.trim(),
            submitted_at: payload.client_timestamp,
        });

        // Mark email as sent in DB (best-effort, don't throw if this fails)
        try {
            const { ObjectId } = await import("mongodb");
            const db = await getDatabase();
            await db.collection("query_submissions").updateOne(
                { _id: new ObjectId(insertedId) },
                { $set: { email_sent: true, email_sent_at: new Date() } }
            );
        } catch {
            console.warn("[api/queries] could not update email_sent flag, continuing.");
        }
    } catch (error) {
        // Email failure is non-fatal — submission is already saved.
        console.error("[api/queries] email notification failed (submission still accepted)", error);
    }

    // 5. Respond success
    return NextResponse.json(
        {
            id: insertedId,
            status: "accepted",
            submitted_at: payload.client_timestamp,
        },
        {
            status: 200,
            headers: {
                "X-RateLimit-Remaining": String(rl.remaining),
                "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
            },
        }
    );
}
