// Matches style.html footer pattern:
// border-t border-brand-border (warm tan structural border)
// font-mono text-[10px] tracking-widest text-brand-muted

export const Footer = () => {
    return (
        <footer className="border-t border-brand-border py-2 px-6">
            <div className="max-w-[1920px] mx-auto flex items-center justify-between font-mono text-[10px] tracking-widest text-brand-muted">
                <span>+ ULAVI TECHNOLOGIES</span>
                <span>/ / / / / / / / / / / +</span>
            </div>
        </footer>
    );
};