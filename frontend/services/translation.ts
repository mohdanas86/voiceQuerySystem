interface MyMemoryResponse {
    responseData?: {
        translatedText?: string;
    };
}

export async function translateToEnglish(text: string, sourceLanguage: string) {
    const source = sourceLanguage === "auto" ? "autodetect" : sourceLanguage;
    const langPair = `${source}|en`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Translation failed");
    }
    const data = (await response.json()) as MyMemoryResponse;
    const translated = data.responseData?.translatedText;
    if (!translated) {
        throw new Error("Translation response missing translatedText");
    }
    return translated;
}
