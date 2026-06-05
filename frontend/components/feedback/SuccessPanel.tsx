interface SuccessPanelProps {
    message: string;
    /** Center content (e.g. confirmation screen). */
    align?: "start" | "center";
}

export function SuccessPanel({ message, align = "start" }: SuccessPanelProps) {
    const centered = align === "center";
    return (
        <div
            className={`flex w-full max-w-lg flex-col gap-4 border border-brand-border bg-brand-surface p-6 shadow-brutal sm:p-8 ${centered ? "mx-auto items-center text-center" : "text-left"}`}
        >
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-brand-accent">
                // SUCCESS
            </span>
            <p className="font-sans text-base font-medium leading-relaxed text-brand-text sm:text-lg">
                {message}
            </p>
        </div>
    );
}
