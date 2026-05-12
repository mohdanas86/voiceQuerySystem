import type { ReactNode } from "react";

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="min-h-screen bg-[radial-gradient(circle_at_88%_64%,rgba(139,160,176,0.16),rgba(0,0,0,0)_30%),radial-gradient(circle_at_55%_40%,rgba(120,140,154,0.08),rgba(0,0,0,0)_35%)]">
                <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
                    <div className="rounded-none border border-white/10 bg-white/5 shadow-glass backdrop-blur">
                        <div className="rounded-none border border-white/10 bg-black/80 p-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
