import Link from "next/link";

import { SuccessCheckmark } from "@/components/feedback/SuccessCheckmark";
import { Button } from "@/components/ui/button";

export default function ConfirmationPage() {
    return (
        <div className="pt-12 min-h-screen">
            <div className="max-w-[1920px] mx-auto border-x border-brand-border min-h-screen">

                {/* ── Page header ── */}
                <div className="border-b border-brand-border px-6 py-8 lg:px-16">
                    <div className="flex items-center gap-4 font-mono text-xs font-bold tracking-widest text-brand-muted mb-3">
                        <div className="w-3 h-3 bg-brand-success" aria-hidden />
                        <span>// STEP 03 OF 03</span>
                    </div>
                    <h1 className="font-sans text-4xl font-black uppercase tracking-tighter text-brand-text md:text-5xl">
                        Query submitted
                    </h1>
                </div>

                {/* ── Success card ── */}
                <div className="border-b border-brand-border px-6 py-10 lg:px-16">
                    <div className="flex border-brutal bg-brand-bg shadow-brutal max-w-2xl">
                        {/* Success accent strip */}
                        <div className="w-12 bg-brand-success border-r border-brand-border flex flex-col items-center py-4 justify-between shrink-0">
                            <span className="text-white font-bold font-mono text-sm">03</span>
                            <span className="text-white text-[10px] tracking-widest rotate-[-90deg] whitespace-nowrap mb-6 font-mono opacity-80 select-none">
                                SENT
                            </span>
                        </div>
                        {/* White inner */}
                        <div className="flex-1 bg-brand-surface p-8 flex flex-col items-center gap-8 text-center">
                            <SuccessCheckmark />
                            <div>
                                <p className="font-sans text-lg font-bold text-brand-text mb-1">
                                    Your query has been sent!
                                </p>
                                <p className="font-mono text-sm text-brand-muted leading-relaxed">
                                    Thank you. Our team will review your query and get back to you shortly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CTA ── */}
                <div className="px-6 py-10 lg:px-16">
                    <div className="max-w-2xl">
                        <Link href="/record" className="touch-manipulation">
                            <Button size="lg" variant="outline">
                                Submit another query
                            </Button>
                        </Link>
                    </div>
                    <div className="mt-6 border-t border-brand-border pt-2 font-mono text-[10px] text-brand-muted flex justify-between tracking-widest max-w-2xl">
                        <span>+ COMPLETE</span>
                        <span>/ / / / / / / / / / / +</span>
                    </div>
                </div>

            </div>
        </div>
    );
}