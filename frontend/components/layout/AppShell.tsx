import type { ReactNode } from "react";

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-background text-textPrimary">
            <div className="min-h-screen bg-gradient-to-br from-[#0f1115] via-[#141922] to-[#0f1115]">
                <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
                    <div className="rounded-xl border border-white/10 bg-surface shadow-soft">
                        <div className="rounded-xl border border-white/10 bg-surfaceAlt/90 p-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
