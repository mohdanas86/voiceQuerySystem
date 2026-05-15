import { Mic } from "lucide-react";

import { cn } from "@/lib/utils";

interface MicButtonProps {
    status?: "idle" | "recording" | "done" | "processing";
    onClick?: () => void;
    disabled?: boolean;
}

const statusCopy: Record<NonNullable<MicButtonProps["status"]>, string> = {
    idle: "Tap to record",
    recording: "Recording",
    done: "Done — tap to record again",
    processing: "Converting speech to text…",
};

const ariaLabel: Record<NonNullable<MicButtonProps["status"]>, string> = {
    idle: "Start recording",
    recording: "Stop recording",
    done: "Start a new recording",
    processing: "Converting speech to text, please wait",
};

export function MicButton({ status = "idle", onClick, disabled }: MicButtonProps) {
    return (
        <div className="flex w-full max-w-sm flex-col items-center gap-3 sm:gap-4">
            <button
                className={cn(
                    "flex h-[4.5rem] w-[4.5rem] shrink-0 touch-manipulation items-center justify-center rounded-none border border-white/20 bg-surface text-textPrimary transition duration-150 hover:bg-surfaceAlt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-60 sm:h-20 sm:w-20",
                    status === "recording" ? "ring-2 ring-primary/50" : null,
                    status === "processing" ? "opacity-80" : null
                )}
                type="button"
                aria-label={ariaLabel[status]}
                aria-busy={status === "processing"}
                aria-pressed={status === "recording"}
                onClick={onClick}
                disabled={disabled}
            >
                <Mic className="h-7 w-7 shrink-0" aria-hidden />
            </button>
            <p
                className="min-h-[2.75rem] w-full max-w-[16rem] text-center text-sm leading-snug text-textMuted"
                aria-live="polite"
            >
                {statusCopy[status]}
            </p>
        </div>
    );
}
