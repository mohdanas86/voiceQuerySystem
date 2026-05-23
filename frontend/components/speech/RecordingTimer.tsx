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
            className="flex w-full min-w-0 flex-col gap-1 rounded-none border border-border/20 bg-surfaceAlt px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5"
            role="timer"
            aria-live="polite"
            aria-label={`Elapsed time ${formatTime(safeElapsed)}, limit ${formatTime(maxSeconds)}`}
        >
            <span className="text-[10px] font-light uppercase tracking-[0.2em] text-textMuted sm:text-xs lg:hidden">
                Timer
            </span>
            <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-xl font-light leading-none text-textPrimary sm:text-2xl">
                    {formatTime(safeElapsed)}
                </span>
                <span className="text-xs font-light uppercase tracking-[0.16em] text-textMuted">
                    / {formatTime(maxSeconds)}
                </span>
            </div>
        </div>
    );
}
