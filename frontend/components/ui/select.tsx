import * as React from "react";

import { cn } from "@/lib/utils";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    className?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => (
        <select
            ref={ref}
            className={cn(
                "h-12 min-h-12 w-full min-w-0 rounded-none border border-border/20 bg-surface px-3 text-base text-textPrimary outline-none transition focus:ring-2 focus:ring-primary/40 sm:h-11 sm:min-h-11 sm:text-sm",
                className
            )}
            {...props}
        >
            {children}
        </select>
    )
);
Select.displayName = "Select";

export { Select };
