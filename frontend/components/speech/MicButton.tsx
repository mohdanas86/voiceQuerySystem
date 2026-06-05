// Student Career Visibility Blueprint — Light Mode
// Primary: #E85D22 (orange) · 9999px circle · Inter labels
// Expressive pulse rings · breathing idle · 150ms motion

"use client";

import { Loader2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicButtonProps {
    status?: "idle" | "recording" | "done" | "processing";
    onClick?: () => void;
    disabled?: boolean;
}

const statusLabel: Record<NonNullable<MicButtonProps["status"]>, string> = {
    idle:       "Tap to start speaking",
    recording:  "Recording — tap to stop",
    done:       "Done — tap to record again",
    processing: "Converting speech…",
};

export function MicButton({ status = "idle", onClick, disabled }: MicButtonProps) {
    const isRecording  = status === "recording";
    const isProcessing = status === "processing";
    const isDone       = status === "done";

    return (
        <div className="flex flex-col items-center gap-5 select-none">
            <div
                className="relative flex items-center justify-center"
                style={{ width: 168, height: 168 }}
            >

                {/* Recording pulse rings — three concentric orange rings */}
                {isRecording && (
                    <>
                        <span
                            className="absolute rounded-full border-2 border-brand-accent/40"
                            style={{
                                width: "136px", height: "136px",
                                animation: "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite",
                            }}
                        />
                        <span
                            className="absolute rounded-full border border-brand-accent/25"
                            style={{
                                width: "152px", height: "152px",
                                animation: "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) 0.4s infinite",
                            }}
                        />
                        <span
                            className="absolute rounded-full border border-brand-accent/12"
                            style={{
                                width: "168px", height: "168px",
                                animation: "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) 0.8s infinite",
                            }}
                        />
                    </>
                )}

                {/* Idle breathing glow ring */}
                {status === "idle" && !disabled && (
                    <span
                        className="absolute rounded-full"
                        style={{
                            width: "116px", height: "116px",
                            animation: "breathe 3s ease-in-out infinite",
                        }}
                    />
                )}

                {/* Button circle — 9999px radius */}
                <button
                    type="button"
                    onClick={onClick}
                    disabled={disabled}
                    aria-label={
                        isRecording  ? "Stop recording"       :
                        isProcessing ? "Processing"           :
                        isDone       ? "Start new recording"  :
                                       "Start recording"
                    }
                    aria-pressed={isRecording}
                    aria-busy={isProcessing}
                    className={cn(
                        // Base — 9999px circle, 112px
                        "relative flex h-28 w-28 items-center justify-center rounded-full",
                        "transition-all duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                        "touch-manipulation focus-visible:outline-none",
                        "disabled:cursor-not-allowed disabled:opacity-40",

                        // Idle — white surface, orange border ring, hover glow
                        status === "idle" && [
                            "bg-white border-2 border-brand-accent/30",
                            "hover:border-brand-accent hover:shadow-glow",
                            "active:scale-95",
                        ],

                        // Recording — filled orange, white icon, glow
                        isRecording && [
                            "bg-brand-accent border-2 border-brand-accent",
                            "shadow-glow scale-105 active:scale-100",
                        ],

                        // Processing — light cream surface, muted
                        isProcessing && [
                            "bg-brand-bg border-2 border-brand-border cursor-wait",
                        ],

                        // Done — light green tint
                        isDone && [
                            "bg-green-50 border-2 border-green-400/60",
                            "hover:border-green-500 hover:shadow-[0_0_0_4px_rgba(74,222,128,0.15)]",
                            "active:scale-95",
                        ]
                    )}
                >
                    {isProcessing ? (
                        <Loader2 className="h-9 w-9 animate-spin text-[#6B6A68]" />
                    ) : isRecording ? (
                        /* Animated waveform bars — 4 bars, staggered bounce */
                        <div className="flex items-end gap-[3px]" aria-hidden>
                            {[
                                { h: "60%", delay: "0ms" },
                                { h: "100%", delay: "120ms" },
                                { h: "45%", delay: "240ms" },
                                { h: "80%", delay: "60ms" },
                            ].map((bar, i) => (
                                <span
                                    key={i}
                                    className="w-[4px] rounded-full bg-white"
                                    style={{
                                        height: "28px",
                                        animation: `waveform-bar 0.7s ease-in-out ${bar.delay} infinite alternate`,
                                        transform: `scaleY(${bar.h === "100%" ? 1 : bar.h === "80%" ? 0.8 : bar.h === "60%" ? 0.6 : 0.45})`,
                                        transformOrigin: "bottom",
                                    }}
                                />
                            ))}
                        </div>
                    ) : isDone ? (
                        <Mic className="h-9 w-9 text-green-500" />
                    ) : (
                        <Mic className="h-9 w-9 text-brand-accent" />
                    )}
                </button>
            </div>

            {/* Status label — Inter 14px weight 300 */}
            <div className="flex flex-col items-center gap-2">
                <p
                    className={cn(
                        "text-sm font-light tracking-wide text-center transition-colors duration-150",
                        isRecording  ? "text-brand-accent font-medium"  :
                        isDone       ? "text-green-600 font-medium"     :
                        isProcessing ? "text-brand-muted"               :
                                       "text-brand-muted"
                    )}
                    aria-live="polite"
                >
                    {statusLabel[status]}
                </p>

                {/* Recording bounce dots */}
                {isRecording && (
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce [animation-delay:300ms]" />
                    </div>
                )}
            </div>
        </div>
    );
}