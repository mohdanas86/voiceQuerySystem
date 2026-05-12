import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}

export function PrimaryButton({ label, className, ...props }: PrimaryButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex h-11 w-full items-center justify-center rounded-full border border-white/15 bg-white px-4 text-sm font-medium text-black transition duration-150 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {label}
        </button>
    );
}
