// Matches style.html nav exactly:
// border-b border-brand-border (warm tan #D1CDAB) — NOT brutal black
// bg-brand-bg/90 backdrop-blur-sm
// font-mono text-xs font-bold tracking-widest text-brand-muted

export const Header = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-border bg-brand-bg/90 backdrop-blur-sm">
            <div className="max-w-[1920px] mx-auto px-6 h-12 flex items-center justify-between font-mono text-xs font-bold tracking-widest text-brand-muted">
                <div className="flex items-center gap-4">
                    {/* Black square — matches style.html "w-3 h-3 bg-brand-text" */}
                    <div className="w-3 h-3 bg-brand-text" aria-hidden="true" />
                    <span className="text-brand-text">VOICE QUERY SYSTEM</span>
                </div>
                <div className="hidden md:flex items-center gap-6">
                    <span>ULAVI TECHNOLOGIES</span>
                    <span aria-hidden="true">•</span>
                    <span>RECORD · REVIEW · SEND</span>
                </div>
            </div>
        </nav>
    );
};