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
    return (
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-surfaceAlt px-4 py-2 text-xs uppercase tracking-[0.2em] text-textMuted">
            <span>{formatTime(elapsedSeconds)}</span>
            <span>{formatTime(maxSeconds)}</span>
        </div>
    );
}
