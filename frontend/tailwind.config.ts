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
                heading: ["Sora", "system-ui", "sans-serif"],
                body: ["Inter", "system-ui", "sans-serif"],
            },
            colors: {
                background: "#0f1115",
                surface: "#141922",
                surfaceAlt: "#1b2230",
                primary: "#4fd1c5",
                primaryDark: "#2c8f86",
                textPrimary: "#f5f7fa",
                textMuted: "#9aa3b2",
                error: "#f87171",
                success: "#34d399",
            },
            borderRadius: {
                xl: "16px",
                lg: "14px",
                md: "12px",
            },
            boxShadow: {
                soft: "0 12px 32px rgba(0,0,0,0.24)",
            },
        },
    },
    plugins: [],
};

export default config;