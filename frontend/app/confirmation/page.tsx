import Link from "next/link";

import { SuccessCheckmark } from "@/components/feedback/SuccessCheckmark";
import { Button } from "@/components/ui/button";

export default function ConfirmationPage() {
    return (
        <div className="pt-12 min-h-screen">
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">

                {/* Page header */}
                <div>
                    <div className="flex items-center gap-3 font-mono text-xs font-bold tracking-widest text-brand-muted mb-3">
                        <div className="w-2 h-2 bg-brand-success" aria-hidden />
                        <span>// STEP 03 OF 03</span>
                    </div>
                    <h1 className="font-sans text-3xl font-black uppercase tracking-tighter text-brand-text sm:text-4xl">
                        Query submitted
                    </h1>
                </div>

                {/* Success card */}
                <div className="w-full border-brutal shadow-brutal bg-brand-surface p-8 sm:p-10 flex flex-col items-center gap-8 text-center">
                    <SuccessCheckmark />
                    <div className="flex flex-col gap-2">
                        <p className="font-sans text-lg font-bold text-brand-text">
                            Your query has been sent!
                        </p>
                        <p className="font-mono text-sm text-brand-muted leading-relaxed max-w-sm mx-auto">
                            Thank you. Our team will review your query and get back to you shortly.
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <Link href="/record" className="touch-manipulation">
                    <Button size="lg" variant="outline" className="w-full">
                        Submit another query
                    </Button>
                </Link>

                {/* Bottom ticker */}
                <div className="border-t border-brand-border pt-2 font-mono text-[10px] text-brand-muted flex justify-between tracking-widest">
                    <span>+ COMPLETE</span>
                    <span>/ / / / / / / +</span>
                </div>

            </div>
        </div>
    );
}