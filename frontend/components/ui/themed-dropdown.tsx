"use client";

import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export type ThemedDropdownOption = {
    value: string;
    label: string;
};

const triggerVariants = cva(
    // Light mode — white bg, warm border, orange focus ring, Inter font
    "w-full min-w-0 cursor-pointer appearance-none rounded-xl border border-[#E8E5DF] bg-white text-[#111111] outline-none transition-all duration-150 hover:border-[#E85D22]/50 focus:border-[#E85D22] focus:ring-2 focus:ring-[#E85D22]/20 disabled:cursor-not-allowed disabled:opacity-40",
    {
        variants: {
            size: {
                default: "h-11 py-0 pl-4 pr-10 text-sm",
                compact: "h-11 py-0 pl-3 pr-9 text-sm sm:w-[5.5rem] sm:shrink-0 sm:pr-8",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

export interface ThemedDropdownProps
    extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" | "onChange">,
        VariantProps<typeof triggerVariants> {
    options: ThemedDropdownOption[];
    value: string;
    onValueChange: (value: string) => void;
    wrapperClassName?: string;
}

export function ThemedDropdown({
    options,
    value,
    onValueChange,
    size,
    className,
    wrapperClassName,
    id,
    disabled,
    "aria-label": ariaLabel,
    ...props
}: ThemedDropdownProps) {
    return (
        <div className={cn("relative min-w-0", wrapperClassName)}>
            <select
                id={id}
                disabled={disabled}
                aria-label={ariaLabel}
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                className={cn(triggerVariants({ size }), className)}
                {...props}
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        className="bg-white text-[#111111]"
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                className={cn(
                    "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-[#6B6A68]",
                    size === "compact" ? "right-2.5" : "right-3"
                )}
                aria-hidden
            />
        </div>
    );
}
