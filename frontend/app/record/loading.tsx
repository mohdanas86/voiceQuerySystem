import { AppShell } from "@/components/layout/AppShell";

export default function Loading() {
    return (
        <AppShell>
            <div
                className="min-h-[12rem] w-full min-w-0 animate-pulse rounded-none border border-white/20 bg-white/5 sm:min-h-[16rem]"
                role="status"
                aria-label="Loading"
            />
        </AppShell>
    );
}
