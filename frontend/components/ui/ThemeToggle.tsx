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
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        window.localStorage.setItem("theme", theme);
    }, [theme]);

    const handleToggle = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        window.localStorage.setItem("theme", next);
        document.documentElement.setAttribute("data-theme", next);
    };

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
