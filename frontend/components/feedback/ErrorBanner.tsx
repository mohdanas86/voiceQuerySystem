interface ErrorBannerProps {
    message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
    return (
        <div
            role="alert"
            aria-live="polite"
            className="border-l-4 border-brand-accent bg-brand-surface px-4 py-3 shadow-brutal-sm"
        >
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-brand-accent">
                // ERROR
            </span>
            <p className="mt-1 font-mono text-sm leading-relaxed text-brand-text">
                {message}
            </p>
        </div>
    );
}
