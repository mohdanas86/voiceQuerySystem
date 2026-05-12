interface ErrorBannerProps {
    message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
    return (
        <div className="rounded-md border border-white/10 bg-surfaceAlt p-3 text-sm text-error">
            {message}
        </div>
    );
}
