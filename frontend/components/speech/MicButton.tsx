import { Mic } from "lucide-react";

interface MicButtonProps {
    status?: "idle" | "recording" | "done";
    onClick?: () => void;
    disabled?: boolean;
}

const statusCopy = {
    idle: "Tap to start recording",
    recording: "Recording...",
    done: "Recording complete",
};

export function MicButton({ status = "idle", onClick, disabled }: MicButtonProps) {
    return (
        <div className="flex flex-col items-center gap-4">
            <button
                className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-surface text-textPrimary shadow-soft transition duration-150 hover:bg-surfaceAlt disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                aria-label="Start recording"
                aria-pressed={status === "recording"}
                onClick={onClick}
                disabled={disabled}
            >
                <Mic className="h-7 w-7" />
            </button>
            <p className="text-sm text-textMuted">{statusCopy[status]}</p>
        </div>
    );
}
