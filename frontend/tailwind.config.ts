import type { Config } from "tailwindcss";

// Student Career Visibility Blueprint — Light Mode
// Primary: #E85D22 (orange) · Tertiary: #F0F024 (yellow)
// Background: #F4F1EB · Surface: #FFFFFF
// Inter font · Inter 200-600 weights

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
                    // ── Surfaces (light mode) ──
                    bg:      "#F4F1EB",   // cream background
                    surface: "#FFFFFF",   // card surface (white)

                    // ── Text ──
                    text:    "#111111",   // primary text
                    muted:   "#6B6A68",   // muted/secondary text (slightly warmer)

                    // ── Stitch palette accents ──
                    accent:    "#E85D22", // primary orange (Stitch primary)
                    primary:   "#E85D22", // alias
                    tertiary:  "#F0F024", // yellow tertiary
                    secondary: "#D44E1A", // darker orange for hover

                    // ── Borders ──
                    border: "#E5E2DA",   // subtle warm border

                    // ── Semantic ──
                    error:   "#DC2626",
                    success: "#16A34A",
                },
            },
            boxShadow: {
                // Elevation through shadow (not brutal) — Stitch light mode
                card:    "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
                "card-hover": "0 4px 12px rgba(0,0,0,0.1), 0 12px 32px rgba(0,0,0,0.08)",
                // Orange glow — for active mic state
                "glow-sm": "0 0 0 4px rgba(232,93,34,0.15)",
                "glow":    "0 0 0 4px rgba(232,93,34,0.2), 0 8px 32px rgba(232,93,34,0.25)",
            },
            letterSpacing: {
                display: "-0.025em",
                caps:    "0.05em",
            },
        },
    },
    plugins: [],
};

export default config;