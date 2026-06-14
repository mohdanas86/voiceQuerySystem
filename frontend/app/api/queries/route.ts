import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { sendCustomerEmail, sendOpsEmail } from "@/lib/email";
import { getDatabase } from "@/lib/mongodb";
import { queryRateLimiter } from "@/lib/rateLimitRedis";
import type { QueryPayload } from "@/types/query";
import type { SupportedLang } from "@/lib/i18n";


/**
 * Maps SupportedLang codes to their full English display names.
 * Used in ops emails to identify which language the user spoke.
 */
const LANGUAGE_NAMES: Record<string, string> = {
  en:   'English',
  hi:   'Hindi',
  ta:   'Tamil',
  te:   'Telugu',
  kn:   'Kannada',
  ml:   'Malayalam',
  bn:   'Bengali',
  mr:   'Marathi',
  auto: 'Auto-detected',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function getClientIp(headersList: Headers): string {
    return (
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown"
    );
}

function validPayload(payload: unknown): payload is QueryPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;

  return (
    // Existing required fields
    typeof p.user_name === 'string' && p.user_name.trim().length > 0 &&
    typeof p.original_transcript === 'string' && p.original_transcript.trim().length > 0 &&
    typeof p.translated_transcript === 'string' && p.translated_transcript.trim().length > 0 &&
    typeof p.phone_full === 'string' && p.phone_full.trim().length > 4 &&
    typeof p.phone_country_code === 'string' &&
    typeof p.phone_number === 'string' &&
    typeof p.client_timestamp === 'string' &&
    typeof p.client_timezone === 'string' &&

    // New required fields (Phase 3)
    typeof p.user_email === 'string' && p.user_email.includes('@') && // Basic check; Zod validates on client
    typeof p.ui_language === 'string' && p.ui_language.length > 0 &&

    // New optional fields — must be present but can be empty strings
    typeof p.audio_url === 'string' &&
    typeof p.trip_city === 'string' &&
    typeof p.trip_dates_from === 'string' &&
    typeof p.trip_dates_to === 'string' &&
    typeof p.trip_passengers === 'string' &&
    typeof p.trip_budget === 'string'
  );
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
    // 1. Rate-limit check (per IP)
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const rl = await queryRateLimiter.limit(ip);

    if (!rl.success) {
        const retryAfterSec = Math.ceil((rl.reset - Date.now()) / 1000);
        console.warn(`[api/queries] rate-limited IP=${ip}`);
        return NextResponse.json(
            { error: "Too many submissions. Please wait and try again.", code: "RATE_LIMITED" },
            {
                status: 429,
                headers: {
                    "Retry-After": String(retryAfterSec),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(Math.ceil(rl.reset / 1000)),
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
            // ── Existing fields
            user_name:             payload.user_name.trim(),
            source_language:       payload.source_language ?? "auto",
            original_transcript:   payload.original_transcript ?? "",
            translated_transcript: payload.translated_transcript.trim(),
            phone_country_code:    payload.phone_country_code,
            phone_number:          payload.phone_number,
            phone_full:            payload.phone_full.trim(),
            client_timestamp:      payload.client_timestamp,
            client_timezone:       payload.client_timezone,

            // ── New fields (Phase 3)
            ui_language:     payload.ui_language,
            user_email:      payload.user_email.trim(),
            audio_url:       payload.audio_url,
            trip_city:       payload.trip_city,
            trip_dates_from: payload.trip_dates_from,
            trip_dates_to:   payload.trip_dates_to,
            trip_passengers: payload.trip_passengers,
            trip_budget:     payload.trip_budget,

            // ── Metadata
            status:              "accepted",
            customer_email_sent: false,
            ops_email_sent:      false,
            created_at:          new Date(),
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

    // 4. Send emails sequentially AFTER DB write — non-fatal if they fail
    const dbObjectId = new ObjectId(insertedId);

    // ── Customer Email
    try {
        await sendCustomerEmail({
            to_email:        payload.user_email.trim(),
            user_name:       payload.user_name.trim(),
            ui_language:     payload.ui_language as SupportedLang,
            original_query:  payload.original_transcript,
            trip_city:       payload.trip_city,
            trip_dates_from: payload.trip_dates_from,
            trip_dates_to:   payload.trip_dates_to,
            trip_passengers: payload.trip_passengers,
            trip_budget:     payload.trip_budget,
            phone:           payload.phone_full.trim(),
            submitted_at:    payload.client_timestamp,
        });

        // Best-effort status update — non-fatal if this write fails
        try {
            const db = await getDatabase();
            await db.collection("query_submissions").updateOne(
                { _id: dbObjectId },
                { $set: { customer_email_sent: true, customer_email_sent_at: new Date() } }
            );
        } catch (updateErr) {
            console.warn("[api/queries] could not update customer_email_sent flag:", updateErr);
        }
    } catch (err: unknown) {
        console.error("[api/queries] customer email FAILED — submission id:", insertedId, err);
    }

    // ── Ops Email
    try {
        await sendOpsEmail({
            customer_name:           payload.user_name.trim(),
            original_query:          payload.original_transcript,
            original_query_language: LANGUAGE_NAMES[payload.ui_language] ?? "Unknown",
            english_translation:     payload.translated_transcript.trim(),
            audio_url:               payload.audio_url,
            trip_city:               payload.trip_city,
            trip_dates_from:         payload.trip_dates_from,
            trip_dates_to:           payload.trip_dates_to,
            trip_passengers:         payload.trip_passengers,
            trip_budget:             payload.trip_budget,
            user_email:              payload.user_email.trim(),
            phone:                   payload.phone_full.trim(),
            submitted_at:            payload.client_timestamp,
            ui_language:             payload.ui_language,
        });

        try {
            const db = await getDatabase();
            await db.collection("query_submissions").updateOne(
                { _id: dbObjectId },
                { $set: { ops_email_sent: true, ops_email_sent_at: new Date() } }
            );
        } catch (updateErr) {
            console.warn("[api/queries] could not update ops_email_sent flag:", updateErr);
        }
    } catch (err: unknown) {
        console.error("[api/queries] ops email FAILED — submission id:", insertedId, err);
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
                "X-RateLimit-Reset": String(Math.ceil(rl.reset / 1000)),
            },
        }
    );
}
