"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

type Theme = "dark" | "light";

const getInitialTheme = () => {
    if (typeof window === "undefined") {
        return "dark" as Theme;
    }
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
        return stored;
    }
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        setMounted(true);
        const stored = window.localStorage.getItem("theme") as Theme;
        if (stored === "light" || stored === "dark") {
            setTheme(stored);
        } else {
            const systemPref = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
            setTheme(systemPref);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.setAttribute("data-theme", theme);
        window.localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    const handleToggle = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    if (!mounted) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="border border-border/20 opacity-0"
                disabled
                aria-label="Toggle theme"
            >
                <span className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="border border-border/20"
            onClick={handleToggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}
