"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SuccessCheckmark } from "@/components/feedback/SuccessCheckmark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQueryStore } from "@/store/useQueryStore";
import { t } from "@/lib/i18n";

export default function ConfirmationPage() {
    const router = useRouter();
    const { uiLanguage, reset } = useQueryStore();
    // null = not checked yet (SSR / hydration), true = legit, false = direct visit
    const [isLegit, setIsLegit] = useState<boolean | null>(null);

    useEffect(() => {
        try {
            const flag = sessionStorage.getItem("query_submitted");
            if (flag === "1") {
                setTimeout(() => setIsLegit(true), 0);
                // Clear after a short delay so React's StrictMode double-mount in dev can both read it
                const t = setTimeout(() => {
                    try {
                        sessionStorage.removeItem("query_submitted");
                    } catch {}
                }, 1000);
                return () => clearTimeout(t);
            } else {
                setTimeout(() => setIsLegit(false), 0);
            }
        } catch {
            // sessionStorage unavailable (private mode / old browser) — be lenient
            setTimeout(() => setIsLegit(true), 0);
        }
    }, []);

    // Redirect to /record if no submission flag found
    useEffect(() => {
        if (isLegit === false) {
            router.replace("/record");
        }
    }, [isLegit, router]);

    const handleSubmitAnother = () => {
        reset();
        router.push("/");
    };

    // Render nothing while checking / redirecting
    if (!isLegit) return null;

    return (
        <div className="pt-12 min-h-screen bg-[#F4F1EB]">
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">

                {/* Page header */}
                <div className="flex flex-col gap-1.5 reveal">
                    <div className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#16A34A]" aria-hidden />
                        <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                            {t(uiLanguage, "confirmStep")}
                        </span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-4xl">
                        {t(uiLanguage, "confirmTitle")}
                    </h1>
                    <p className="text-sm font-light text-[#6B6A68] mt-1">
                        {t(uiLanguage, "confirmBody")}
                    </p>
                </div>

                {/* Success card */}
                <Card padding="lg">
                    <div className="flex flex-col items-center gap-8 text-center py-6">

                        {/* Animated checkmark */}
                        <SuccessCheckmark />

                        {/* Text */}
                        <div className="flex flex-col gap-2">
                            <p className="text-lg font-semibold text-[#111111]">
                                {t(uiLanguage, "confirmTitle")}
                            </p>
                            <p className="text-sm font-light text-[#6B6A68] leading-relaxed max-w-xs mx-auto">
                                {t(uiLanguage, "confirmBody")}
                            </p>
                        </div>

                        {/* Green confirmation pill */}
                        <div
                            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                            style={{
                                background: "rgba(22,163,74,0.08)",
                                border: "1px solid rgba(22,163,74,0.2)",
                            }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                            <span className="text-[12px] font-medium text-[#16A34A] tracking-[0.04em]">
                                Submission confirmed
                            </span>
                        </div>
                    </div>
                </Card>

                {/* CTA */}
                <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full touch-manipulation"
                    onClick={handleSubmitAnother}
                >
                    {t(uiLanguage, "confirmSubAnotherQuery")}
                </Button>

                {/* Bottom ticker */}
                <div className="border-t border-[#E8E5DF] pt-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#9CA3AF] tracking-[0.05em] uppercase">
                        {t(uiLanguage, "confirmStep")}
                    </span>
                    <span className="text-[11px] text-[#D5D0C4] tracking-widest">/ / / / /</span>
                </div>

            </div>
        </div>
    );
}