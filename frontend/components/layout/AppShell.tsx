import type { ReactNode } from "react";

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-dvh overflow-x-hidden bg-background text-textPrimary">
            <div className="relative min-h-dvh overflow-x-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,_rgba(10,10,10,1),_rgba(10,10,10,0.7),_rgba(10,10,10,0.2))]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(232,93,34,0.12),_transparent_55%)]" />
                <div className="relative mx-auto flex w-full min-w-0 max-w-[min(100%,72rem)] flex-1 flex-col px-3 py-6 sm:px-6 sm:py-10 md:px-8 md:py-12">
                    <div className="w-full min-w-0 bg-[linear-gradient(to_right,_rgb(10,10,10),_rgba(10,10,10,0.7),_rgba(10,10,10,0.2))] p-[1px]">
                        <div className="border border-white/15 bg-surface text-textPrimary backdrop-blur">
                            <div className="border border-white/15 bg-surface/95">
                                <div className="min-w-0 px-4 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
                                    <div className="grid min-w-0 gap-6 md:gap-8">{children}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
