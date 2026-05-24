"use client";

export function SuccessCheckmark() {
    return (
        <div
            className="relative flex items-center justify-center"
            role="img"
            aria-label="Query submitted successfully"
        >
            {/* Outer pulse ring */}
            <span className="absolute h-32 w-32 border-2 border-brand-accent/30 success-check-ring" />

            {/* Main circle — accent fill, brutal border & shadow */}
            <div className="success-check-circle relative flex h-24 w-24 items-center justify-center border-2 border-brand-border bg-brand-accent shadow-brutal">
                {/* Inner top shine */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                {/* SVG checkmark */}
                <svg
                    className="relative z-10 h-12 w-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                >
                    <path
                        className="success-check-path"
                        d="M5 13l4 4L19 7"
                        pathLength="1"
                    />
                </svg>
            </div>
        </div>
    );
}