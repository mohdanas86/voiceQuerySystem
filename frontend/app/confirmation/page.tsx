import Link from "next/link";

import { SuccessCheckmark } from "@/components/feedback/SuccessCheckmark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ConfirmationPage() {
    return (
        <div className="pt-12 min-h-screen bg-[#F4F1EB]">
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">

                {/* Page header */}
                <div className="flex flex-col gap-1.5">
                    <div className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#16A34A]" aria-hidden />
                        <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                            Step 03 of 03
                        </span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-4xl">
                        Query <span className="text-[#16A34A]">submitted.</span>
                    </h1>
                </div>

                {/* Success card — uses shared Card component */}
                <Card padding="lg">
                    <div className="flex flex-col items-center gap-6 text-center py-4">
                        <SuccessCheckmark />
                        <div className="flex flex-col gap-2">
                            <p className="text-base font-semibold text-[#111111]">
                                Your query has been sent!
                            </p>
                            <p className="text-sm font-light text-[#6B6A68] leading-relaxed max-w-sm mx-auto">
                                Thank you. Our team will review your query and get back to you shortly.
                            </p>
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
                    <span className="text-[11px] font-medium text-[#9CA3AF] tracking-[0.05em] uppercase">Complete</span>
                    <span className="text-[11px] text-[#D5D0C4] tracking-widest">/ / / / /</span>
                </div>

            </div>
        </div>
    );
}