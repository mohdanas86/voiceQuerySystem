import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./features/**/*.{ts,tsx}",
        "./hooks/**/*.{ts,tsx}",
        "./services/**/*.{ts,tsx}",
        "./store/**/*.{ts,tsx}",
        "./types/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "Courier New", "monospace"],
            },
            colors: {
                brand: {
                    // ─── from style.html tailwind config ───────────────
                    bg:       "#F4F1EB",  // cream parchment (body background)
                    text:     "#111111",  // near-black (body text, brutal borders)
                    accent:   "#EA4313",  // orange-red (cta, highlights)
                    border:   "#D1CDAB",  // warm tan (nav / section structural dividers)
                    muted:    "#6B6A68",  // warm grey (secondary labels)
                    grid:     "#E8E5DF",  // lighter grid lines

                    // ─── supporting values used across style.html ───────
                    surface:  "#FFFFFF",  // white card interior
                    tertiary: "#1E3A5F",  // deep navy (used on card accents)
                    error:    "#DC2626",
                    success:  "#16A34A",
                },
            },
            boxShadow: {
                // from style.html tailwind config exactly
                brutal:        "4px 4px 0px 0px rgba(17,17,17,1)",
                "brutal-sm":   "2px 2px 0px 0px rgba(17,17,17,1)",
                "brutal-lg":   "6px 6px 0px 0px rgba(17,17,17,1)",
            },
            transitionDuration: {
                fast: "150ms",
            },
        },
    },
    plugins: [],
};

export default config;