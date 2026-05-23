interface ErrorBannerProps {
    message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
    return (
        <div
            role="alert"
            aria-live="polite"
            className="rounded-none border border-border/20 bg-surfaceAlt p-3 text-sm leading-relaxed text-error focus-within:ring-2 focus-within:ring-ring/40 sm:p-4"
        >
            {message}
        </div>
    );
}
