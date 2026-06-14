"use client";

import { useEffect } from "react";
import { useQueryStore } from "@/store/useQueryStore";
import { enStrings } from "@/lib/i18n";

export function TranslationProvider() {
    const { uiLanguage, setUiTranslations } = useQueryStore();

    useEffect(() => {
        // Statically supported languages do not need dynamic translation
        if (uiLanguage === "en" || uiLanguage === "hi" || uiLanguage === "ta" || uiLanguage === "auto") {
            setUiTranslations({});
            return;
        }

        let active = true;

        async function fetchTranslations() {
            try {
                // Get all keys and values from enStrings
                const keys = Object.keys(enStrings);
                const values = Object.values(enStrings);

                const res = await fetch("/api/translate", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    texts: values,
                    source: "en",
                    target: uiLanguage,
                  }),
                });

                if (!res.ok) {
                    throw new Error("Translation failed");
                }

                const data = await res.json();
                const translatedTexts = data.translatedTexts as string[];

                if (translatedTexts && translatedTexts.length === values.length && active) {
                    const translationsMap: Record<string, string> = {};
                    keys.forEach((key, index) => {
                        translationsMap[key] = translatedTexts[index];
                    });
                    setUiTranslations(translationsMap);
                }
            } catch (err) {
                console.error("[TranslationProvider] Failed to translate UI:", err);
            }
        }

        fetchTranslations();

        return () => {
            active = false;
        };
    }, [uiLanguage, setUiTranslations]);

    return null;
}
