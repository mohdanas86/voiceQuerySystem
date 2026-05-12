interface RecordingTimerProps {
    elapsed?: string;
    max?: string;
}

export function RecordingTimer({ elapsed = "00:00", max = "01:00" }: RecordingTimerProps) {
    return (
        <div className="flex items-center justify-between rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
            <span>{elapsed}</span>
            <span>{max}</span>
        </div>
    );
}
