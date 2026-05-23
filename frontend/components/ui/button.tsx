import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-none border border-border/20 text-sm font-light transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-surface text-textPrimary hover:bg-surfaceAlt",
                secondary: "bg-transparent text-textMuted hover:text-textPrimary",
                outline: "bg-transparent text-textPrimary hover:bg-surfaceAlt",
                ghost: "bg-transparent text-textPrimary hover:bg-surfaceAlt/60",
            },
            size: {
                default: "h-11 min-h-11 px-4",
                lg: "h-12 min-h-12 px-6 text-base sm:h-12 sm:min-h-12 sm:text-sm",
                icon: "h-11 min-h-11 w-11",
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
    VariantProps<typeof buttonVariants> { }

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
