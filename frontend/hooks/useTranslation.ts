import { useQueryStore } from "@/store/useQueryStore";
import { t as staticT, type LangStrings } from "@/lib/i18n";

export function useTranslation() {
    const uiLanguage = useQueryStore((state) => state.uiLanguage);
    const uiTranslations = useQueryStore((state) => state.uiTranslations);
    
    const t = (key: keyof LangStrings): string => {
        if (uiTranslations && uiTranslations[key]) {
            return uiTranslations[key];
        }
        return staticT(uiLanguage, key);
    };
    
    return { t, uiLanguage };
}
