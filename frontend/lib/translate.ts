/**
 * translate.ts — Server-side translation utility.
 * Ulavi Technologies
 */

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
      console.warn(`[lib/translate] DeepL responded with non-OK status: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as DeepLResponse;
    return data.translations?.[0]?.text?.trim() ?? null;
  } catch (err: unknown) {
    console.error("[lib/translate] DeepL translation failed:", err);
    return null;
  }
}

/**
 * Translates multiple texts using the DeepL Free API in a single batch.
 */
async function translateBatchWithDeepL(texts: string[], targetLang: string): Promise<string[] | null> {
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
        text: texts,
        target_lang: targetLang.toUpperCase(),
      }),
    });

    if (!res.ok) {
      console.warn(`[lib/translate] DeepL batch responded with non-OK status: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as DeepLResponse;
    return data.translations?.map((t) => t.text.trim()) ?? null;
  } catch (err: unknown) {
    console.error("[lib/translate] DeepL batch translation failed:", err);
    return null;
  }
}

/**
 * Translates text using the free MyMemory translation proxy fallback.
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

/**
 * Main translation function that translates a single text.
 */
export async function translateText(text: string, source: string, target: string): Promise<string> {
  if (process.env.DEEPL_API_KEY) {
    const deepLResult = await translateWithDeepL(text, target);
    if (deepLResult) return deepLResult;
  }
  return translateWithMyMemory(text, source, target);
}

/**
 * Main batch translation function that translates an array of texts.
 */
export async function translateTexts(texts: string[], source: string, target: string): Promise<string[]> {
  if (process.env.DEEPL_API_KEY) {
    const deepLResult = await translateBatchWithDeepL(texts, target);
    if (deepLResult) return deepLResult;
  }
  
  const promises = texts.map((text) => translateWithMyMemory(text, source, target));
  return Promise.all(promises);
}
