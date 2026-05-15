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
                background: "rgb(var(--color-background) / <alpha-value>)",
                foreground: "rgb(var(--color-foreground) / <alpha-value>)",
                surface: "rgb(var(--color-surface) / <alpha-value>)",
                surfaceAlt: "rgb(var(--color-surface-alt) / <alpha-value>)",
                primary: "rgb(var(--color-primary) / <alpha-value>)",
                primaryDark: "rgb(var(--color-primary-dark) / <alpha-value>)",
                primaryForeground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
                textPrimary: "rgb(var(--color-text-primary) / <alpha-value>)",
                textMuted: "rgb(var(--color-text-muted) / <alpha-value>)",
                error: "rgb(var(--color-error) / <alpha-value>)",
                success: "rgb(var(--color-success) / <alpha-value>)",
                border: "rgb(var(--color-border) / <alpha-value>)",
                ring: "rgb(var(--color-ring) / <alpha-value>)",
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