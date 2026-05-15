"use client";

import { Check } from "lucide-react";

export function SuccessCheckmark() {
    return (
        <div
            className="relative flex items-center justify-center"
            role="img"
            aria-label="Payment successful"
        >
            {/* Expanding pulse ring */}
            <span className="absolute h-24 w-24 rounded-full bg-green-500/20 animate-ping" />

            {/* Soft glow */}
            <span className="absolute h-20 w-20 rounded-full bg-green-500/30 blur-xl" />

            {/* Main success circle */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.45)] animate-success-pop">

                {/* Inner shine */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/30 to-transparent" />

                {/* Check icon */}
                <Check className="relative h-10 w-10 text-white stroke-[3] animate-check-draw" />
            </div>

            <style jsx>{`
                @keyframes successPop {
                    0% {
                        transform: scale(0.4);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.12);
                    }
                    70% {
                        transform: scale(0.96);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes checkDraw {
                    0% {
                        transform: scale(0.5);
                        opacity: 0;
                    }
                    60% {
                        transform: scale(1.2);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                .animate-success-pop {
                    animation: successPop 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .animate-check-draw {
                    animation: checkDraw 0.45s ease-out 0.2s both;
                }
            `}</style>
        </div>
    );
}