interface RecordingTimerProps {
    elapsedSeconds?: number;
    maxSeconds?: number;
}

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, "0");
    return `${minutes}:${seconds}`;
}

export function RecordingTimer({ elapsedSeconds = 0, maxSeconds = 60 }: RecordingTimerProps) {
    const safeElapsed = Math.min(Math.max(elapsedSeconds, 0), maxSeconds);

    return (
        <div
            className="flex w-full min-w-0 flex-col gap-1 border border-brand-border bg-brand-surface px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5"
            role="timer"
            aria-live="polite"
            aria-label={`Elapsed time ${formatTime(safeElapsed)}, limit ${formatTime(maxSeconds)}`}
        >
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-muted lg:hidden">
                Timer
            </span>
            <div className="flex items-baseline gap-2 tabular-nums">
                <span className="font-mono text-xl font-bold leading-none text-brand-text sm:text-2xl">
                    {formatTime(safeElapsed)}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-brand-muted">
                    / {formatTime(maxSeconds)}
                </span>
            </div>
        </div>
    );
}
