interface ErrorBannerProps {
    message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
    return (
        <div className="rounded-none border border-white/20 bg-white/5 p-3 text-sm text-white/80">
            {message}
        </div>
    );
}
