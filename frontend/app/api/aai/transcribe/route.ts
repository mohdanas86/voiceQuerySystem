import { NextResponse } from "next/server";

interface TranscriptResponse {
    id?: string;
    status?: string;
    text?: string;
    language_code?: string;
    translated_texts?: Record<string, string>;
    error?: string;
}

const API_BASE_URL = "https://api.assemblyai.com";
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 30;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
        body: audio.stream(),
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
            return NextResponse.json(pollData);
        }
        if (pollData.status === "error") {
            return NextResponse.json({ error: pollData.error ?? "Transcription failed" }, { status: 502 });
        }
    }

    return NextResponse.json({ error: "Transcription timeout" }, { status: 504 });
}
