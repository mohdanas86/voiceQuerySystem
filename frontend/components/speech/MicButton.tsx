import { Loader2, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicButtonProps {
    status?: "idle" | "recording" | "done" | "processing";
    onClick?: () => void;
    disabled?: boolean;
}

const statusCopy: Record<NonNullable<MicButtonProps["status"]>, string> = {
    idle:       "Tap to start speaking",
    recording:  "Recording... tap to stop",
    done:       "Recording completed",
    processing: "Converting speech to text...",
};

const ariaLabel: Record<NonNullable<MicButtonProps["status"]>, string> = {
    idle:       "Start recording",
    recording:  "Stop recording",
    done:       "Start recording again",
    processing: "Processing recording",
};

export function MicButton({
    status = "idle",
    onClick,
    disabled,
}: MicButtonProps) {
    const isRecording  = status === "recording";
    const isProcessing = status === "processing";
    const isDone       = status === "done";

    return (
        <div className="flex w-full flex-col items-center justify-center gap-6">
            {/* Button */}
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                aria-label={ariaLabel[status]}
                aria-busy={isProcessing}
                aria-pressed={isRecording}
                className={cn(
                    "group relative flex h-28 w-28 touch-manipulation items-center justify-center overflow-hidden border-2 border-brand-border transition-all duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",

                    // Idle — accent fill, brutal shadow
                    status === "idle" &&
                        "bg-brand-accent shadow-brutal hover:-translate-y-px hover:shadow-brutal-lg",

                    // Recording — dark brutal, accent ring pulse
                    isRecording &&
                        "bg-brand-text shadow-brutal scale-105",

                    // Processing — tertiary
                    isProcessing &&
                        "bg-brand-tertiary shadow-brutal",

                    // Done — success green
                    isDone &&
                        "bg-brand-success shadow-brutal"
                )}
            >
                {/* Recording pulse rings */}
                {isRecording && (
                    <>
                        <span className="absolute inset-[-8px] border-2 border-brand-accent/60 animate-[ping_1.4s_ease-in-out_infinite]" />
                        <span className="absolute inset-[-16px] border border-brand-accent/30 animate-[ping_1.4s_ease-in-out_0.3s_infinite]" />
                    </>
                )}

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
            <div className="flex flex-col items-center gap-2 text-center">
                <p
                    className={cn(
                        "font-mono text-xs font-bold uppercase tracking-widest transition-all duration-[150ms]",
                        isRecording
                            ? "text-brand-accent"
                            : isDone
                                ? "text-brand-success"
                                : isProcessing
                                    ? "text-brand-tertiary"
                                    : "text-brand-muted"
                    )}
                    aria-live="polite"
                >
                    {statusCopy[status]}
                </p>

                {/* Recording live dots */}
                {isRecording && (
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-brand-accent animate-bounce" />
                        <span className="h-1.5 w-1.5 bg-brand-accent animate-bounce [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 bg-brand-accent animate-bounce [animation-delay:240ms]" />
                    </div>
                )}
            </div>
        </div>
    );
}