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
                display: ["Helvetica Neue", "Helvetica", "Arial", "system-ui"],
                body: ["Helvetica Neue", "Helvetica", "Arial", "system-ui"],
            },
            colors: {
                background: "#000000",
                surface: "#000000",
                primary: "#4b4ba0",
                secondary: "#ffffff",
                tertiary: "#8f47ae",
                textPrimary: "#ffffff",
                textSecondary: "#000000",
                border: "#ffffff",
                accent: "#4b4ba0",
            },
            borderRadius: {
                xl: "9999px",
                lg: "9999px",
                md: "0px",
            },
            boxShadow: {
                glass:
                    "0px 0px 0px rgba(0,0,0,0), 0px 0px 0px rgba(0,0,0,0), 0px 12px 32px rgba(255,255,255,0.12)",
            },
        },
    },
    plugins: [],
};

export default config;