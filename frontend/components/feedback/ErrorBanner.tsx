interface ErrorBannerProps {
    message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
    return (
        <div
            role="alert"
            aria-live="polite"
            className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3"
        >
            <span className="mt-0.5 text-red-500 text-base leading-none select-none" aria-hidden>⚠</span>
            <div>
                <span className="block text-[11px] font-semibold tracking-[0.06em] uppercase text-red-500 mb-0.5">
                    Error
                </span>
                <p className="text-sm font-light leading-relaxed text-red-700">
                    {message}
                </p>
            </div>
        </div>
    );
}
