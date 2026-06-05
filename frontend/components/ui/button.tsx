// Student Career Visibility Blueprint — Light Mode
// Primary: filled orange #E85D22, white text, rounded-full pill
// Clearly visible against #F4F1EB cream background

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    // Base: Inter, 14px, medium weight, pill shape
    "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
    {
        variants: {
            variant: {
                // Primary — vivid orange fill, always visible on any light surface
                default:
                    "bg-[#E85D22] text-white hover:bg-[#D44E1A] hover:shadow-[0_4px_20px_rgba(232,93,34,0.35)] active:scale-[0.98]",

                // Outline — white bg, solid orange border, orange text
                outline:
                    "bg-white text-[#E85D22] border-2 border-[#E85D22] hover:bg-[#E85D22] hover:text-white active:scale-[0.98]",

                // Secondary — cream bg, dark text, visible border
                secondary:
                    "bg-[#F4F1EB] text-[#111111] border border-[#D5D0C4] hover:border-[#E85D22] hover:text-[#E85D22] active:scale-[0.98]",

                // Ghost — transparent, orange text
                ghost:
                    "bg-transparent text-[#E85D22] hover:bg-[#E85D22]/10",
            },
            size: {
                default: "h-11 px-6",
                lg:      "h-12 px-8 text-[15px]",
                icon:    "h-11 w-11",
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
