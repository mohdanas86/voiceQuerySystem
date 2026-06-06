/**
 * route.ts — GET /api/translate
 * Translates queries to English. Prioritises DeepL Free API and falls back to MyMemory.
 * VoiceBerry | Ulavi Technologies
 */

// ── SERVER ONLY ───────────────────────────────────────────────────────────────
// This file runs on the server (Next.js API route). Do NOT import browser APIs.

import { NextResponse } from "next/server";

interface DeepLTranslation {
  detected_source_language: string;
  text: string;
}

interface DeepLResponse {
  translations?: DeepLTranslation[];
}

interface MyMemoryResponse {
  responseData?: {
    translatedText?: string;
  };
  responseStatus?: number;
  responseDetails?: string;
  matches?: Array<{
    translation?: string;
  }>;
}

/**
 * Translates text using the DeepL Free API.
 *
 * @param text - The text content to translate
 * @param targetLang - Target language code (e.g. 'EN')
 * @returns Translated text, or null if the request fails
 */
async function translateWithDeepL(text: string, targetLang: string): Promise<string | null> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang.toUpperCase(),
      }),
    });

    if (!res.ok) {
      console.warn(`[api/translate] DeepL responded with non-OK status: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as DeepLResponse;
    return data.translations?.[0]?.text?.trim() ?? null;
  } catch (err: unknown) {
    console.error("[api/translate] DeepL translation failed:", err);
    return null;
  }
}

/**
 * Translates text using the free MyMemory translation proxy fallback.
 *
 * @param text - The text content to translate
 * @param source - Source language code (e.g. 'ta', 'hi')
 * @param target - Target language code (e.g. 'en')
 * @returns Localized translation or original text on network error
 */
async function translateWithMyMemory(text: string, source: string, target: string): Promise<string> {
  const langPair = source === "auto" ? `autodetect|${target}` : `${source}|${target}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return text;
    }
    const data = (await response.json()) as MyMemoryResponse;
    return (
      data.responseData?.translatedText?.trim() ||
      data.matches?.[0]?.translation?.trim() ||
      text
    );
  } catch {
    return text;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = (searchParams.get("text") ?? "").trim();
  const source = (searchParams.get("source") ?? "auto").trim();
  const target = (searchParams.get("target") ?? "en").trim();

  if (!text) {
    return NextResponse.json({ translatedText: "" }, { status: 200 });
  }

  // 1. Try DeepL API if a key is configured
  if (process.env.DEEPL_API_KEY) {
    const deepLResult = await translateWithDeepL(text, target);
    if (deepLResult) {
      return NextResponse.json({
        translatedText: deepLResult,
        engine: "deepl",
        responseStatus: 200,
        responseDetails: "OK",
      });
    }
  }

  // 2. Fallback to MyMemory if DeepL fails or is not configured
  const myMemoryResult = await translateWithMyMemory(text, source, target);
  return NextResponse.json({
    translatedText: myMemoryResult,
    engine: "mymemory",
    responseStatus: 200,
    responseDetails: "Fallback engine",
  });
}
