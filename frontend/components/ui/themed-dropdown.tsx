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
    "w-full min-w-0 cursor-pointer appearance-none rounded-none border border-border/20 bg-surface text-textPrimary outline-none transition hover:border-border/30 focus:border-primary/30 focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            size: {
                default:
                    "h-12 min-h-12 py-0 pl-3 pr-10 text-base sm:h-11 sm:min-h-11 sm:pr-9 sm:text-sm",
                compact:
                    "h-12 min-h-12 py-0 pl-3 pr-9 text-base sm:h-11 sm:min-h-11 sm:w-[5.5rem] sm:shrink-0 sm:pr-8 sm:text-sm",
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
                        className="bg-surface text-textPrimary"
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                className={cn(
                    "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-textMuted",
                    size === "compact" ? "right-2.5 sm:right-2" : "right-3"
                )}
                aria-hidden
            />
        </div>
    );
}
