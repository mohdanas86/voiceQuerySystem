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

export async function translateToEnglish(text: string, sourceLanguage: string) {
    const trimmed = text.trim();
    if (!trimmed) {
        return "";
    }
    const normalized = sourceLanguage.trim().toLowerCase();
    const shortCode = normalized.includes("-") ? normalized.split("-")[0] : normalized;
    const source = shortCode === "auto" || shortCode === "en" ? "autodetect" : shortCode;
    const query = new URLSearchParams({
        text,
        source,
        target: "en",
    });
    const url = `/api/translate?${query.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Translation failed");
    }
    const data = (await response.json()) as MyMemoryResponse;
    console.info("[translate] api response", {
        status: data.responseStatus,
        details: data.responseDetails,
    });
    const translated =
        data.responseData?.translatedText?.trim() ||
        data.matches?.[0]?.translation?.trim();
    if (!translated) {
        console.warn("[translate] empty response", {
            status: data.responseStatus,
            details: data.responseDetails,
        });
        return trimmed;
    }
    return translated;
}
