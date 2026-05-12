import { AppShell } from "@/components/layout/AppShell";

export default function Loading() {
    return (
        <AppShell>
            <div className="h-64 animate-pulse rounded-none border border-white/10 bg-white/5" />
        </AppShell>
    );
}
