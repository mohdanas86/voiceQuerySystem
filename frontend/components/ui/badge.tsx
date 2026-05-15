import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-[11px] font-light uppercase tracking-[0.18em]",
    {
        variants: {
            variant: {
                default: "bg-surface text-textMuted",
                primary: "bg-surface text-textPrimary",
                outline: "bg-transparent text-textMuted",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
