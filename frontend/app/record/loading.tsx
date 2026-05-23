import { AppShell } from "@/components/layout/AppShell";

export default function Loading() {
    return (
        <AppShell>
            <div
                className="min-h-[12rem] w-full min-w-0 animate-pulse rounded-none border border-border/20 bg-surfaceAlt/50 sm:min-h-[16rem]"
                role="status"
                aria-label="Loading"
            />
        </AppShell>
    );
}
