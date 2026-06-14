/**
 * LanguagePicker.tsx — Component displaying a grid of language selection cards.
 * Includes a search filter at the top to search from all 70+ supported languages.
 * Ulavi Technologies
 */

"use client";

import { useState, useMemo } from "react";
import { useQueryStore } from "@/store/useQueryStore";
import { cn } from "@/lib/utils";
import { SupportedLang, LANGUAGE_OPTIONS } from "@/lib/i18n";
import { Globe, Search, X } from "lucide-react";

interface LanguagePickerProps {
  /** Called when the user selects a language. Receives the SupportedLang code. */
  onSelect: (lang: SupportedLang) => void;
}

export function LanguagePicker({ onSelect }: LanguagePickerProps) {
  const { uiLanguage } = useQueryStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLanguages = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return LANGUAGE_OPTIONS;
    return LANGUAGE_OPTIONS.filter(
      (lang) =>
        lang.nameEn.toLowerCase().includes(query) ||
        lang.nameNative.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative w-full px-1">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-10 rounded-xl border border-brand-border bg-white text-sm font-light text-brand-text placeholder:text-gray-400 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-brand-muted hover:text-brand-accent transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Container for Grid */}
      <div className="max-h-[50vh] overflow-y-auto w-full pr-1 px-1">
        {filteredLanguages.length === 0 ? (
          <div className="text-center py-10 text-sm text-brand-muted font-light">
            No languages found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredLanguages.map((lang) => {
              const isSelected = uiLanguage === lang.code;
              const isAutoDetect = lang.code === "auto";

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onSelect(lang.code as SupportedLang)}
                  aria-label={`Select ${lang.nameEn}`}
                  aria-pressed={isSelected}
                  className={cn(
                    "group flex flex-col items-center justify-center p-4 rounded-xl border bg-white select-none text-center transition-all duration-[150ms] ease-out cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent active:scale-[0.97] hover:scale-[1.02] shadow-sm hover:shadow-md",
                    isSelected
                      ? "border-brand-accent bg-brand-accent/[0.02] ring-1 ring-brand-accent"
                      : "border-[#E8E5DF] hover:border-brand-accent/50"
                  )}
                >
                  {/* Circular Badge Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 border transition-all duration-[150ms] ease-out",
                    isSelected
                      ? "bg-brand-accent border-brand-accent text-white shadow-[0_4px_10px_rgba(232,93,34,0.15)]"
                      : "bg-brand-bg border-brand-border text-brand-text group-hover:border-brand-accent/30 group-hover:bg-[#E85D22]/5"
                  )}>
                    {isAutoDetect ? (
                      <Globe className="w-4.5 h-4.5 text-black" />
                    ) : (
                      <span className="font-sans leading-none">{lang.symbol}</span>
                    )}
                  </div>

                  {/* Native Name Label */}
                  <span className="text-xs font-semibold text-brand-text block truncate max-w-full">
                    {lang.nameNative}
                  </span>

                  {/* English translation name */}
                  <span className="text-[10px] text-brand-muted mt-0.5 block truncate max-w-full">
                    {lang.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
