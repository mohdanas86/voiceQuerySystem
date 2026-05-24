"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { MicButton } from "@/components/speech/MicButton";
import { RecordingTimer } from "@/components/speech/RecordingTimer";
import { LanguageSelect } from "@/components/forms/LanguageSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQueryStore } from "@/store/useQueryStore";

export default function RecordPage() {
    const router = useRouter();
    const maxSeconds = 60;
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const {
        recordingStatus, sourceLanguage, originalTranscript, errorMessage,
        setRecordingStatus, setSourceLanguage, setOriginalTranscript,
        setTranslatedTranscript, setIsTranslating, setErrorMessage,
    } = useQueryStore();

    const hasMounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    const mediaSupported =
        hasMounted &&
        typeof window !== "undefined" &&
        !!window.MediaRecorder &&
        !!navigator.mediaDevices?.getUserMedia;

    useEffect(() => {
        if (!isRecording) return;
        const interval = window.setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
        return () => window.clearInterval(interval);
    }, [isRecording]);

    const pickMimeType = () => {
        const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"];
        return types.find((t) => MediaRecorder.isTypeSupported(t));
    };

    const stopTracks = () => {
        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
    };

    const transcribeRecording = async (blob: Blob, language: string) => {
        const fd = new FormData();
        fd.append("audio", blob, "recording.webm");
        fd.append("language", language);
        const res = await fetch("/api/aai/transcribe", { method: "POST", body: fd });
        if (!res.ok) {
            let detail = "Transcription request failed";
            try {
                const d = await res.json() as { error?: string; detail?: string };
                detail = d.detail || d.error || detail;
            } catch { /* use default */ }
            throw new Error(detail);
        }
        return res.json() as Promise<{
            text?: string;
            translated_texts?: Record<string, string>;
            language_code?: string;
        }>;
    };

    const handleStart = useCallback(async () => {
        if (!mediaSupported) { setErrorMessage("Your browser doesn't support audio recording. Try Chrome or Safari."); return; }
        if (!window.isSecureContext) { setErrorMessage("Recording is only available on secure connections."); return; }
        if (isRecording) return;

        setElapsedSeconds(0);
        setOriginalTranscript("");
        setTranslatedTranscript("");
        setErrorMessage(null);
        setRecordingStatus("recording");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            recordedChunksRef.current = [];
            const mimeType = pickMimeType();
            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                stopTracks();
                setRecordingStatus("processing");
                setIsTranslating(true);
                try {
                    const blob = new Blob(recordedChunksRef.current, {
                        type: recorder.mimeType || "audio/webm",
                    });
                    const result = await transcribeRecording(blob, sourceLanguage);
                    const original = result.text?.trim() ?? "";
                    const translated = result.translated_texts?.en?.trim() || result.text?.trim() || "";
                    const lang = sourceLanguage !== "auto" ? sourceLanguage : result.language_code ?? "auto";

                    if (!original) {
                        setErrorMessage("We couldn't catch that. Please try speaking again.");
                        setRecordingStatus("idle");
                        return;
                    }

                    setOriginalTranscript(original);
                    setTranslatedTranscript(translated);
                    setSourceLanguage(lang);
                    setRecordingStatus("done");
                } catch (err) {
                    console.error("[transcribe] failed", err);
                    setErrorMessage("Something went wrong. Please try recording again.");
                    setRecordingStatus("idle");
                } finally {
                    setIsTranslating(false);
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch {
            setErrorMessage("Microphone access is blocked. Please allow mic permissions and try again.");
            setRecordingStatus("idle");
            stopTracks();
        }
    }, [isRecording, mediaSupported, sourceLanguage, setErrorMessage, setIsTranslating, setOriginalTranscript, setRecordingStatus, setSourceLanguage, setTranslatedTranscript]);

    const handleStop = useCallback(() => {
        if (!mediaRecorderRef.current || !isRecording) return;
        setRecordingStatus("processing");
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }, [isRecording, setRecordingStatus]);

    useEffect(() => {
        if (elapsedSeconds >= maxSeconds && isRecording) handleStop();
    }, [elapsedSeconds, handleStop, isRecording]);

    const handleToggle = () => { if (isRecording) handleStop(); else handleStart(); };
    const canContinue = originalTranscript.trim().length > 0;

    return (
        <div className="pt-12 min-h-screen bg-[#F4F1EB]">
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">

                {/* Page header */}
                <div className="flex flex-col gap-1.5">
                    <div className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#E85D22]" aria-hidden />
                        <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                            Step 01 of 03
                        </span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-4xl">
                        Record your{" "}
                        <span className="text-[#E85D22]">query.</span>
                    </h1>
                    <p className="text-sm font-light text-[#6B6A68] mt-1">
                        Speak in any language — up to 60 seconds.
                    </p>
                </div>

                {/* Errors */}
                {hasMounted && !mediaSupported && (
                    <ErrorBanner message="Audio recording is not supported in this browser." />
                )}
                {errorMessage && <ErrorBanner message={errorMessage} />}

                {/* Recording Card — uses shared Card component */}
                <Card padding="lg">
                    {/* Language + Timer */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 sm:items-end">
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="spoken-language"
                                className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]"
                            >
                                Spoken language
                            </label>
                            <LanguageSelect value={sourceLanguage} onChange={setSourceLanguage} />
                        </div>
                        <RecordingTimer elapsedSeconds={elapsedSeconds} maxSeconds={maxSeconds} />
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[#E8E5DF] my-6" />

                    {/* Mic button — centered */}
                    <div className="flex w-full items-center justify-center py-6">
                        <MicButton
                            status={
                                recordingStatus === "recording" ? "recording" :
                                    recordingStatus === "processing" ? "processing" :
                                        recordingStatus === "done" ? "done" : "idle"
                            }
                            onClick={handleToggle}
                            disabled={!hasMounted || !mediaSupported || recordingStatus === "processing"}
                        />
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[#E8E5DF] mb-4" />

                    {/* Status row */}
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[#6B6A68]">
                            Max 60 seconds
                        </span>
                        <span
                            className="text-[12px] font-semibold transition-colors duration-150"
                            style={{
                                color:
                                    recordingStatus === "recording" ? "#E85D22" :
                                        recordingStatus === "processing" ? "#6B6A68" :
                                            recordingStatus === "done" ? "#16A34A" :
                                                "#9CA3AF",
                            }}
                        >
                            {recordingStatus === "recording" ? "● Live" :
                                recordingStatus === "processing" ? "◌ Processing…" :
                                    recordingStatus === "done" ? "✓ Complete" :
                                        "○ Ready"}
                        </span>
                    </div>
                </Card>

                {/* Transcript preview — uses Card with accent bar */}
                {originalTranscript && (
                    <div className="flex flex-col gap-2 reveal">
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#6B6A68]" aria-hidden />
                            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                                Transcript preview
                            </span>
                        </div>
                        <Card accent padding="md">
                            <p className="text-sm font-light leading-relaxed text-[#111111] whitespace-pre-wrap break-words">
                                {originalTranscript}
                            </p>
                        </Card>
                    </div>
                )}

                {/* Continue CTA */}
                <div className="flex flex-col gap-3">
                    <Button
                        size="lg"
                        className="w-full touch-manipulation"
                        disabled={!canContinue}
                        onClick={() => router.push("/review")}
                    >
                        Continue to review →
                    </Button>
                    {!canContinue && (
                        <p className="text-[12px] font-light text-[#6B6A68] text-center">
                            Record a query above to continue
                        </p>
                    )}
                </div>

                {/* Bottom ticker */}
                <div className="border-t border-[#E8E5DF] pt-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#9CA3AF] tracking-[0.05em] uppercase">
                        Step 01 of 03
                    </span>
                    <span className="text-[11px] text-[#D5D0C4] tracking-widest">
                        / / / / /
                    </span>
                </div>

            </div>
        </div>
    );
}
