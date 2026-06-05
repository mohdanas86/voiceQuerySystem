"use client";

// SuccessCheckmark — green animated tick
// Layers: outer ripple ring → mid pulse ring → solid green circle → SVG checkmark draw
// All animations: CSS keyframes defined in globals.css

export function SuccessCheckmark() {
    return (
        <div
            className="relative flex items-center justify-center"
            role="img"
            aria-label="Query submitted successfully"
        >
            {/* Layer 1 — outermost slow ripple ring */}
            <span
                className="absolute rounded-full border-2 border-[#16A34A]/20"
                style={{
                    width: 130,
                    height: 130,
                    animation: "success-ripple 700ms cubic-bezier(0.4, 0, 0.2, 1) 120ms both",
                }}
            />

            {/* Layer 2 — mid ring, delayed */}
            <span
                className="absolute rounded-full border-2 border-[#16A34A]/35"
                style={{
                    width: 112,
                    height: 112,
                    animation: "success-ripple 600ms cubic-bezier(0.4, 0, 0.2, 1) 60ms both",
                }}
            />

            {/* Layer 3 — pulse ring (continuous, subtle) */}
            <span
                className="absolute rounded-full border border-[#16A34A]/25"
                style={{
                    width: 112,
                    height: 112,
                    animation: "success-check-ring 700ms cubic-bezier(0.4, 0, 0.2, 1) 180ms both",
                }}
            />

            {/* Layer 4 — solid green circle with pop-in */}
            <div
                className="success-check-circle relative flex h-24 w-24 items-center justify-center rounded-full"
                style={{
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #15803d 100%)",
                    boxShadow: "0 0 0 6px rgba(22,163,74,0.12), 0 8px 32px rgba(22,163,74,0.30)",
                }}
            >
                {/* Top-left shine */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 to-transparent pointer-events-none" />

                {/* SVG checkmark — path draw animation */}
                <svg
                    className="relative z-10 h-11 w-11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                >
                    <path
                        className="success-check-path"
                        d="M4.5 12.5l5 5L19.5 7"
                        pathLength="1"
                    />
                </svg>
            </div>
        </div>
    );
}