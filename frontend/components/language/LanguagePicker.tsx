/**
 * LanguagePicker.tsx — Component displaying a grid of language selection cards.
 * Ulavi Technologies
 */

"use client";

import { useQueryStore } from "@/store/useQueryStore";
import { cn } from "@/lib/utils";
import type { SupportedLang } from "@/lib/i18n";
import { Globe } from "lucide-react";

/** List of all selectable languages with their English, native name, and badge symbol. */
const LANGUAGE_OPTIONS = [
  { code: "auto", nameEn: "Auto-detect", nameNative: "Auto-detect", symbol: "Auto" },
  { code: "en", nameEn: "English", nameNative: "English", symbol: "EN" },
  { code: "hi", nameEn: "Hindi", nameNative: "हिंदी", symbol: "हि" },
  { code: "ta", nameEn: "Tamil", nameNative: "தமிழ்", symbol: "த" },
  { code: "te", nameEn: "Telugu", nameNative: "తెలుగు", symbol: "తె" },
  { code: "kn", nameEn: "Kannada", nameNative: "ಕನ್ನಡ", symbol: "ಕ" },
  { code: "ml", nameEn: "Malayalam", nameNative: "മലയാളം", symbol: "മ" },
  { code: "bn", nameEn: "Bengali", nameNative: "বাংলা", symbol: "বা" },
  { code: "mr", nameEn: "Marathi", nameNative: "मराठी", symbol: "म" },
] as const;

interface LanguagePickerProps {
  /** Called when the user selects a language. Receives the SupportedLang code. */
  onSelect: (lang: SupportedLang) => void;
}

export function LanguagePicker({ onSelect }: LanguagePickerProps) {
  const { uiLanguage } = useQueryStore();

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 w-full max-w-3xl px-4"
      role="group"
      aria-label="Select your preferred language"
    >
      {LANGUAGE_OPTIONS.map((lang) => {
        const isSelected = uiLanguage === lang.code;
        const isAutoDetect = lang.code === "auto";

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelect(lang.code)}
            aria-label={`Select ${lang.nameEn}`}
            aria-pressed={isSelected}
            className={cn(
              "group flex flex-col items-center justify-center p-5 rounded-2xl border bg-white select-none text-center transition-all duration-[150ms] ease-out cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent active:scale-[0.97] hover:scale-[1.03] shadow-[0_1px_4px_rgba(0,0,0,0.06),_0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),_0_12px_32px_rgba(0,0,0,0.08)]",
              isSelected
                ? "border-brand-accent bg-brand-accent/[0.02] ring-1 ring-brand-accent"
                : "border-[#E8E5DF] hover:border-brand-accent/50"
            )}
          >
            {/* Circular Badge Icon */}
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-base font-bold mb-3 border transition-all duration-[150ms] ease-out",
              isSelected
                ? "bg-brand-accent border-brand-accent text-white shadow-[0_4px_12px_rgba(232,93,34,0.2)]"
                : "bg-brand-bg border-brand-border text-brand-text group-hover:border-brand-accent/30 group-hover:bg-[#E85D22]/5"
            )}>
              {isAutoDetect ? (
                <Globe className="w-5 h-5 text-black" />
              ) : (
                <span className="font-sans leading-none">{lang.symbol}</span>
              )}
            </div>

            {/* Native Name Label */}
            <span className="text-sm font-semibold text-brand-text block">
              {lang.nameNative}
            </span>

            {/* English translation name */}
            <span className="text-xs text-brand-muted mt-0.5 block">
              {lang.nameEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}
