import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Matches style.html button exactly:
// "bg-brand-accent text-white font-bold py-5 px-8 flex items-center gap-4
//  shadow-brutal hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]
//  transition-all uppercase tracking-wider text-sm"
// NOTE: primary button has NO border — only brutal shadow.

const buttonVariants = cva(
    "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap font-mono text-sm font-bold uppercase tracking-widest transition-all duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60 disabled:pointer-events-none disabled:opacity-40",
    {
        variants: {
            variant: {
                // Primary — accent bg, brutal shadow, NO border (matches style.html button)
                default:
                    "bg-brand-accent text-white shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg active:translate-y-0 active:shadow-brutal",

                // Outline — bg-brand-bg with brutal border + shadow (matches style.html receipt card style)
                outline:
                    "border-brutal bg-brand-bg text-brand-text shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg active:translate-y-0",

                // Secondary — white surface card style
                secondary:
                    "border-brutal bg-brand-surface text-brand-text shadow-brutal-sm hover:-translate-y-px hover:shadow-brutal",

                // Ghost — no border, subtle hover
                ghost:
                    "bg-transparent text-brand-text hover:bg-black/5",
            },
            size: {
                default: "h-11 min-h-11 px-6",
                lg:      "h-12 min-h-12 px-8 text-base sm:text-sm",
                icon:    "h-11 min-h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
);
Button.displayName = "Button";

export { Button, buttonVariants };
