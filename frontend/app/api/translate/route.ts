import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const text = (searchParams.get("text") ?? "").trim();
    const source = (searchParams.get("source") ?? "auto").trim();
    const target = (searchParams.get("target") ?? "en").trim();

    if (!text) {
        return NextResponse.json({ translatedText: "" }, { status: 200 });
    }

    const langPair = source === "auto" ? `autodetect|${target}` : `${source}|${target}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            return NextResponse.json(
                {
                    translatedText: text,
                    responseStatus: response.status,
                    responseDetails: "Upstream translation failed",
                },
                { status: 200 }
            );
        }
        const data = (await response.json()) as MyMemoryResponse;
        const translated =
            data.responseData?.translatedText?.trim() ||
            data.matches?.[0]?.translation?.trim() ||
            text;
        return NextResponse.json({
            translatedText: translated,
            responseStatus: data.responseStatus,
            responseDetails: data.responseDetails,
        });
    } catch (error) {
        return NextResponse.json(
            {
                translatedText: text,
                responseStatus: 500,
                responseDetails: "Translation request failed",
            },
            { status: 200 }
        );
    }
}
