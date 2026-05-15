interface SuccessPanelProps {
    message: string;
    /** Center content (e.g. confirmation screen). */
    align?: "start" | "center";
}

export function SuccessPanel({ message, align = "start" }: SuccessPanelProps) {
    const centered = align === "center";
    return (
        <div
            className={`flex w-full max-w-lg flex-col gap-4 rounded-none border border-white/20 bg-surface p-6 sm:p-8 ${centered ? "mx-auto items-center text-center" : "text-left"}`}
        >
            <div className="h-1 w-16 rounded-full bg-primary" />
            <p className="text-base font-light leading-relaxed text-textPrimary sm:text-lg">{message}</p>
        </div>
    );
}
