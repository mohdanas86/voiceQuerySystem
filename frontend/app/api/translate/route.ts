import { NextResponse } from "next/server";
import { translateText, translateTexts } from "@/lib/translate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = (searchParams.get("text") ?? "").trim();
  const source = (searchParams.get("source") ?? "auto").trim();
  const target = (searchParams.get("target") ?? "en").trim();

  if (!text) {
    return NextResponse.json({ translatedText: "" }, { status: 200 });
  }

  const result = await translateText(text, source, target);
  return NextResponse.json({ translatedText: result, responseStatus: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const texts = body.texts as string[];
    const source = (body.source ?? "auto").trim();
    const target = (body.target ?? "en").trim();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ translatedTexts: [] }, { status: 200 });
    }

    const results = await translateTexts(texts, source, target);
    return NextResponse.json({ translatedTexts: results, responseStatus: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
