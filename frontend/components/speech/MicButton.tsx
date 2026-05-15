import { Loader2, Mic, Square } from "lucide-react";

import { cn } from "@/lib/utils";

interface MicButtonProps {
    status?: "idle" | "recording" | "done" | "processing";
    onClick?: () => void;
    disabled?: boolean;
}

const statusCopy: Record<NonNullable<MicButtonProps["status"]>, string> = {
    idle: "Tap to start speaking",
    recording: "Recording... tap to stop",
    done: "Recording completed",
    processing: "Converting speech to text...",
};

const ariaLabel: Record<NonNullable<MicButtonProps["status"]>, string> = {
    idle: "Start recording",
    recording: "Stop recording",
    done: "Start recording again",
    processing: "Processing recording",
};

export function MicButton({
    status = "idle",
    onClick,
    disabled,
}: MicButtonProps) {
    const isRecording = status === "recording";
    const isProcessing = status === "processing";

    return (
        <div className="flex w-full flex-col items-center justify-center gap-5">
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                aria-label={ariaLabel[status]}
                aria-busy={isProcessing}
                aria-pressed={isRecording}
                className={cn(
                    "group relative flex h-24 w-24 touch-manipulation items-center justify-center overflow-hidden rounded-full transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",

                    // Idle
                    status === "idle" &&
                    "bg-gradient-to-br from-primary to-primary/80 shadow-[0_0_40px_rgba(59,130,246,0.35)] hover:scale-105",

                    // Recording
                    isRecording &&
                    "bg-red-500 shadow-[0_0_60px_rgba(239,68,68,0.55)] scale-110",

                    // Processing
                    isProcessing &&
                    "bg-amber-500 shadow-[0_0_60px_rgba(245,158,11,0.45)]",

                    // Done
                    status === "done" &&
                    "bg-green-500 shadow-[0_0_60px_rgba(34,197,94,0.45)]"
                )}
            >
                {/* Recording pulse rings */}
                {isRecording && (
                    <>
                        <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                        <span className="absolute inset-[-10px] rounded-full border border-red-400/40 animate-pulse" />
                    </>
                )}

                {/* Glow */}
                <div className="absolute inset-0 rounded-full bg-white/10" />

                {/* Icon */}
                <div className="relative z-10 flex items-center justify-center">
                    {isProcessing ? (
                        <Loader2 className="h-10 w-10 animate-spin text-white" />
                    ) : isRecording ? (
                        <Square className="h-8 w-8 fill-white text-white" />
                    ) : (
                        <Mic className="h-10 w-10 text-white" />
                    )}
                </div>
            </button>

            {/* Status text */}
            <div className="flex flex-col items-center gap-1 text-center">
                <p
                    className={cn(
                        "text-sm font-medium transition-all duration-300",
                        isRecording
                            ? "text-red-500"
                            : status === "done"
                                ? "text-green-500"
                                : "text-textMuted"
                    )}
                    aria-live="polite"
                >
                    {statusCopy[status]}
                </p>

                {/* Live recording dots */}
                {isRecording && (
                    <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce" />
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:120ms]" />
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:240ms]" />
                    </div>
                )}
            </div>
        </div>
    );
}