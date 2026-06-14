import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { transcribeRateLimiter } from "@/lib/rateLimitRedis";
import { translateText } from "@/lib/translate";

interface TranscriptResponse {
    id?: string;
    status?: string;
    text?: string;
    language_code?: string;
    translated_texts?: Record<string, string> | null;
    audio_duration?: number;
    confidence?: number;
    error?: string;
}

const API_BASE_URL = "https://api.assemblyai.com";
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 30;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extracts the client IP address from the request headers list.
 * 
 * @param headersList - Next.js headers helper object
 * @returns The resolved client IP address string
 */
function getClientIp(headersList: Headers): string {
    return (
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown"
    );
}

const readErrorDetail = async (response: Response) => {
    try {
        const data = (await response.json()) as { error?: string };
        return data.error ?? JSON.stringify(data);
    } catch {
        try {
            return await response.text();
        } catch {
            return "Unknown error";
        }
    }
};

export async function POST(request: Request) {
    // 0. Rate-limit check (per IP)
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const rl = await transcribeRateLimiter.limit(ip);

    if (!rl.success) {
        const retryAfterSec = Math.ceil((rl.reset - Date.now()) / 1000);
        console.warn(`[api/aai/transcribe] rate-limited IP=${ip}`);
        return NextResponse.json(
            { error: "Too many transcription requests. Please wait and try again.", code: "RATE_LIMITED" },
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

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
        return NextResponse.json({ error: "Expected multipart/form-data", code: "BAD_CONTENT_TYPE" }, { status: 400 });
    }

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "AssemblyAI key missing" }, { status: 500 });
    }

    const formData = await request.formData();
    const audio = formData.get("audio");
    const language = formData.get("language");
    if (!(audio instanceof File)) {
        return NextResponse.json({ error: "Missing audio" }, { status: 400 });
    }
    const preferredLanguage = typeof language === "string" ? language : "auto";

    const uploadResponse = await fetch(`${API_BASE_URL}/v2/upload`, {
        method: "POST",
        headers: {
            authorization: apiKey,
            "content-type": audio.type || "application/octet-stream",
        },
        body: audio,
    });

    if (!uploadResponse.ok) {
        const detail = await readErrorDetail(uploadResponse);
        return NextResponse.json({ error: "Upload failed", detail }, { status: 502 });
    }

    const uploadData = (await uploadResponse.json()) as { upload_url?: string };
    if (!uploadData.upload_url) {
        return NextResponse.json({ error: "Upload URL missing" }, { status: 502 });
    }

    const requestBody: Record<string, unknown> = {
        audio_url: uploadData.upload_url,
        speech_models: ["universal-3-pro", "universal-2"],
        speech_understanding: {
            request: {
                translation: {
                    target_languages: ["en"],
                },
            },
        },
    };

    if (preferredLanguage === "auto") {
        requestBody.language_detection = true;
    } else {
        requestBody.language_detection = false;
        requestBody.language_code = preferredLanguage;
    }

    const submitResponse = await fetch(`${API_BASE_URL}/v2/transcript`, {
        method: "POST",
        headers: {
            authorization: apiKey,
            "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
    });

    if (!submitResponse.ok) {
        const detail = await readErrorDetail(submitResponse);
        return NextResponse.json({ error: "Transcription submit failed", detail }, { status: 502 });
    }

    const submitData = (await submitResponse.json()) as TranscriptResponse;
    if (!submitData.id) {
        return NextResponse.json({ error: "Transcript ID missing" }, { status: 502 });
    }

    for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
        await sleep(POLL_INTERVAL_MS);
        const pollResponse = await fetch(`${API_BASE_URL}/v2/transcript/${submitData.id}`, {
            headers: {
                authorization: apiKey,
                "content-type": "application/json",
            },
            cache: "no-store",
        });

        if (!pollResponse.ok) {
            continue;
        }

        const pollData = (await pollResponse.json()) as TranscriptResponse;
        if (pollData.status === "completed") {
            const text = pollData.text?.trim() ?? "";

            // Detect silent / empty recordings — completed but no speech.
            if (!text) {
                return NextResponse.json(
                    {
                        error: "No speech detected in the recording.",
                        code: "NO_SPEECH",
                        audio_duration: pollData.audio_duration ?? 0,
                    },
                    { status: 422 }
                );
            }

            // If AssemblyAI didn't return a translation, fall back to MyMemory
            // server-side so the client always gets an English translation.
            let translatedTexts = pollData.translated_texts ?? null;
            const rawLangCode = pollData.language_code ?? "";
            const baseLang = rawLangCode.split("-")[0].split("_")[0].toLowerCase();

            if ((!translatedTexts || !translatedTexts["en"]) && baseLang && baseLang !== "en") {
                try {
                    const translatedText = await translateText(text, baseLang, "en");
                    if (translatedText && translatedText !== text) {
                        translatedTexts = { en: translatedText };
                    }
                } catch (err) {
                    console.error("[api/aai/transcribe] Translation fallback failed:", err);
                }
            }

            return NextResponse.json({ ...pollData, translated_texts: translatedTexts });
        }
        if (pollData.status === "error") {
            const errMsg = pollData.error ?? "Transcription failed";
            // Map AssemblyAI's silent-audio error to our own structured NO_SPEECH code
            // so the client can show a user-friendly, actionable message.
            const isNoSpeech =
                errMsg.includes("no spoken audio") ||
                errMsg.includes("language_detection cannot be performed");
            if (isNoSpeech) {
                return NextResponse.json(
                    {
                        error: "No speech detected in the recording.",
                        code: "NO_SPEECH",
                        audio_duration: pollData.audio_duration ?? 0,
                    },
                    { status: 422 }
                );
            }
            return NextResponse.json({ error: errMsg }, { status: 502 });
        }
    }

    return NextResponse.json({ error: "Transcription timeout" }, { status: 504 });
}
