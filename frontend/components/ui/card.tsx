import { cn } from "@/lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    /** Orange left accent bar — used for transcript/content previews */
    accent?: boolean;
    /** Padding preset */
    padding?: "sm" | "md" | "lg";
}

const paddingMap = {
    sm: "p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
};

/**
 * Card — reusable elevated white surface card.
 * Implements Student Career Visibility Blueprint light mode:
 *   white bg · subtle border · soft box shadow · 16px rounded
 */
export function Card({ children, className, accent = false, padding = "lg" }: CardProps) {
    return (
        <div
            className={cn(
                "w-full rounded-2xl bg-white overflow-hidden",
                "border border-[#E8E5DF]",
                "shadow-[0_1px_4px_rgba(0,0,0,0.06),_0_4px_20px_rgba(0,0,0,0.05)]",
                accent ? "flex" : "",
                !accent && paddingMap[padding],
                className
            )}
        >
            {accent && (
                <div className="w-[3px] bg-brand-accent shrink-0" />
            )}
            <div className={cn("flex-1", accent && paddingMap[padding])}>
                {children}
            </div>
        </div>
    );
}
