// Student Career Visibility Blueprint — Light Mode
// Orange progress bar · pill chip · Inter font
// Warning: yellow #F0F024 at 75% · Danger: red-orange at 90%

interface RecordingTimerProps {
    elapsedSeconds?: number;
    maxSeconds?: number;
}

function formatTime(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

export function RecordingTimer({ elapsedSeconds = 0, maxSeconds = 60 }: RecordingTimerProps) {
    const safe = Math.min(Math.max(elapsedSeconds, 0), maxSeconds);
    const pct = (safe / maxSeconds) * 100;
    const isWarning = pct >= 75;
    const isDanger = pct >= 90;

    const trackColor = isDanger ? "#DC2626" : isWarning ? "#D97706" : "#E85D22";

    return (
        <div
            role="timer"
            aria-live="polite"
            aria-label={`Elapsed ${formatTime(safe)} of ${formatTime(maxSeconds)}`}
            className="flex flex-col gap-2 w-full sm:w-44"
        >
            {/* Pill chip — white surface, orange accent border */}
            <div className=" bg-white px-4 py-2 flex items-center justify-between shadow-card">
                <span className="text-[11px] font-medium tracking-[0.05em] uppercase text-brand-muted">
                    Timer
                </span>
                <span
                    className="text-lg font-light tabular-nums leading-none transition-colors duration-150"
                    style={{ color: trackColor }}
                >
                    {formatTime(safe)}
                </span>
            </div>

            {/* Progress track — thin, orange fill */}
            <div className="h-[3px] w-full bg-brand-border rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-[150ms]"
                    style={{ width: `${pct}%`, backgroundColor: trackColor }}
                />
            </div>

            {/* Max label */}
            {/* <p className="text-[11px] font-light text-brand-muted text-right tracking-[0.04em]">
                max {formatTime(maxSeconds)}
            </p> */}
        </div>
    );
}
