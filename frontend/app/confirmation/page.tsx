import Link from "next/link";

import { SuccessCheckmark } from "@/components/feedback/SuccessCheckmark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ConfirmationPage() {
    return (
        <div className="pt-12 min-h-screen bg-[#F4F1EB]">
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">

                {/* Page header */}
                <div className="flex flex-col gap-1.5 reveal">
                    <div className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#16A34A]" aria-hidden />
                        <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                            Step 03 of 03 — Complete
                        </span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-4xl">
                        Query{" "}
                        <span className="text-[#16A34A]">submitted.</span>
                    </h1>
                    <p className="text-sm font-light text-[#6B6A68] mt-1">
                        We&apos;ve received your message and will respond shortly.
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
                                Your query has been sent!
                            </p>
                            <p className="text-sm font-light text-[#6B6A68] leading-relaxed max-w-xs mx-auto">
                                Thank you. Our team will review your request and get back to you as soon as possible.
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
                <Link href="/record" className="touch-manipulation">
                    <Button size="lg" variant="outline" className="w-full">
                        Submit another query
                    </Button>
                </Link>

                {/* Bottom ticker */}
                <div className="border-t border-[#E8E5DF] pt-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#9CA3AF] tracking-[0.05em] uppercase">
                        Complete
                    </span>
                    <span className="text-[11px] text-[#D5D0C4] tracking-widest">/ / / / /</span>
                </div>

            </div>
        </div>
    );
}