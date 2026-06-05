"use client";

import { useQueryStore } from "@/store/useQueryStore";
import type { SupportedLang } from "@/lib/i18n";
import { ChevronDown, Languages } from "lucide-react";

export const Footer = () => {
    const { uiLanguage, setUiLanguage } = useQueryStore();

    return (
        <footer className="border-t border-brand-border py-3 px-6 bg-brand-bg">
            <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] tracking-widest text-brand-muted">
                <span className="uppercase font-bold text-brand-muted">+ ULAVI TECHNOLOGIES</span>

                {/* Language selector in global footer */}
                <div className="flex items-center gap-2 select-none font-sans tracking-normal text-xs normal-case">
                    <Languages className="w-3.5 h-3.5 text-brand-muted" />
                    <div className="relative">
                        <select
                            value={uiLanguage}
                            onChange={(e) => {
                                const newLang = e.target.value as SupportedLang;
                                setUiLanguage(newLang);
                                try {
                                    localStorage.setItem("vb-language-initialized", "true");
                                } catch { }
                            }}
                            className="appearance-none pr-7 pl-2.5 py-1 text-[10px] font-semibold text-brand-text bg-white border border-brand-border rounded-lg hover:border-brand-accent/50 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 outline-none shadow-sm transition-all cursor-pointer"
                        >
                            <option value="auto">Auto-detect</option>
                            <option value="en">English</option>
                            <option value="hi">हिंदी (Hindi)</option>
                            <option value="ta">தமிழ் (Tamil)</option>
                            <option value="te">తెలుగు (Telugu)</option>
                            <option value="kn">ಕನ್ನಡ (Kannada)</option>
                            <option value="ml">മലയാളം (Malayalam)</option>
                            <option value="bn">বাংলা (Bengali)</option>
                            <option value="mr">मराठी (Marathi)</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-2 w-3 h-3 -translate-y-1/2 text-brand-muted" aria-hidden />
                    </div>
                </div>
            </div>
        </footer>
    );
};