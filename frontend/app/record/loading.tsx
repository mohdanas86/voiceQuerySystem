export default function Loading() {
    return (
        <div className="min-h-[calc(100vh-3rem)] pt-12">
            <div className="max-w-[1920px] mx-auto border-x border-brand-border min-h-[calc(100vh-3rem)]">
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12 md:py-16">
                    <div
                        className="min-h-[20rem] w-full animate-pulse border border-brand-border bg-brand-surface shadow-brutal"
                        role="status"
                        aria-label="Loading"
                    />
                </div>
            </div>
        </div>
    );
}
