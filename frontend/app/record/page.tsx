"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { MicButton } from "@/components/speech/MicButton";
import { RecordingTimer } from "@/components/speech/RecordingTimer";
import { LanguageSelect } from "@/components/forms/LanguageSelect";
import { Button } from "@/components/ui/button";
import { useQueryStore } from "@/store/useQueryStore";

export default function RecordPage() {
    const router = useRouter();
    const maxSeconds = 60;
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [hasMounted, setHasMounted] = useState(false);
    const [mediaSupported, setMediaSupported] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const {
        recordingStatus,
        sourceLanguage,
        originalTranscript,
        errorMessage,
        setRecordingStatus,
        setSourceLanguage,
        setOriginalTranscript,
        setTranslatedTranscript,
        setIsTranslating,
        setErrorMessage,
    } = useQueryStore();
    const activeTranscript = originalTranscript;

    useEffect(() => {
        if (!isRecording) {
            return;
        }
        const interval = window.setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);
        return () => window.clearInterval(interval);
    }, [isRecording]);

    useEffect(() => {
        setHasMounted(true);
        setMediaSupported(
            typeof window !== "undefined" &&
            !!window.MediaRecorder &&
            !!navigator.mediaDevices?.getUserMedia
        );
    }, []);

    const pickMimeType = () => {
        const types = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus",
            "audio/ogg",
        ];
        return types.find((type) => MediaRecorder.isTypeSupported(type));
    };

    const stopTracks = () => {
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
    };

    const transcribeRecording = async (blob: Blob, language: string) => {
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("language", language);
        const response = await fetch("/api/aai/transcribe", {
            method: "POST",
            body: formData,
        });
        if (!response.ok) {
            let detail = "Transcription request failed";
            try {
                const data = (await response.json()) as { error?: string; detail?: string };
                detail = data.detail || data.error || detail;
            } catch (err) {
                detail = detail;
            }
            throw new Error(detail);
        }
        return (await response.json()) as {
            text?: string;
            translated_texts?: Record<string, string>;
            language_code?: string;
        };
    };

    const handleLanguageChange = (value: string) => {
        setSourceLanguage(value);
    };

    const handleStart = useCallback(async () => {
        if (!mediaSupported) {
            setErrorMessage("Audio recording is not supported in this browser.");
            return;
        }
        if (!window.isSecureContext) {
            setErrorMessage("Recording requires HTTPS or localhost.");
            return;
        }
        if (isRecording) {
            return;
        }
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
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
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
                    const translated =
                        result.translated_texts?.en?.trim() || result.text?.trim() || "";
                    const resolvedLanguage =
                        sourceLanguage !== "auto"
                            ? sourceLanguage
                            : result.language_code ?? "auto";
                    setOriginalTranscript(original);
                    setTranslatedTranscript(translated);
                    setSourceLanguage(resolvedLanguage);
                    setRecordingStatus("done");
                } catch (err) {
                    const message = err instanceof Error ? err.message : null;
                    setErrorMessage(message || "Transcription failed. Please try again.");
                    setRecordingStatus("idle");
                } finally {
                    setIsTranslating(false);
                }
            };
            recorder.start();
            setIsRecording(true);
        } catch (err) {
            setErrorMessage("Microphone access blocked. Allow mic permissions and retry.");
            setRecordingStatus("idle");
            stopTracks();
        }
    }, [
        isRecording,
        mediaSupported,
        sourceLanguage,
        setErrorMessage,
        setIsTranslating,
        setOriginalTranscript,
        setRecordingStatus,
        setSourceLanguage,
        setTranslatedTranscript,
    ]);

    const handleStop = useCallback(() => {
        if (!mediaRecorderRef.current || !isRecording) {
            return;
        }
        setRecordingStatus("processing");
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }, [isRecording, setRecordingStatus]);

    useEffect(() => {
        if (elapsedSeconds >= maxSeconds && isRecording) {
            handleStop();
        }
    }, [elapsedSeconds, handleStop, isRecording, maxSeconds]);

    const handleToggle = () => {
        if (isRecording) {
            handleStop();
        } else {
            handleStart();
        }
    };

    const canContinue = originalTranscript.trim().length > 0;

    return (
        <AppShell>
            <div className="flex min-w-0 flex-col gap-8 md:gap-10">

                {hasMounted && !mediaSupported ? (
                    <ErrorBanner message="Audio recording is not supported in this browser." />
                ) : null}
                {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
                <section className="flex min-w-0 flex-col gap-4" aria-labelledby="record-step-label">
                    <h2
                        id="record-step-label"
                        className="text-xs font-light uppercase tracking-[0.24em] text-textMuted"
                    >
                        Record your query
                    </h2>
                    <div className="reveal grid min-w-0 gap-5 border border-white/20 bg-surfaceAlt/70 p-4 sm:gap-6 sm:p-6">
                        <div className="grid min-w-0 gap-4 md:grid-cols-[1fr_auto] md:items-end md:gap-6">
                            <div className="flex min-w-0 flex-col gap-2">
                                <label
                                    htmlFor="spoken-language"
                                    className="text-xs font-light uppercase tracking-[0.2em] text-textMuted"
                                >
                                    Select language
                                </label>
                                <LanguageSelect
                                    value={sourceLanguage}
                                    onChange={handleLanguageChange}
                                />
                            </div>
                            <div className="min-w-0 md:w-[min(100%,12rem)] lg:w-44">
                                <RecordingTimer
                                    elapsedSeconds={elapsedSeconds}
                                    maxSeconds={maxSeconds}
                                />
                            </div>
                        </div>
                        <div className="flex min-h-[12.5rem] w-full flex-col items-center justify-center py-2 sm:min-h-[13rem]">
                            <MicButton
                                status={
                                    recordingStatus === "recording"
                                        ? "recording"
                                        : recordingStatus === "processing"
                                            ? "processing"
                                            : recordingStatus === "done"
                                                ? "done"
                                                : "idle"
                                }
                                onClick={handleToggle}
                                disabled={
                                    !hasMounted ||
                                    !mediaSupported ||
                                    recordingStatus === "processing"
                                }
                            />
                        </div>
                    </div>
                </section>
                <section className="flex min-w-0 flex-col gap-3 sm:gap-4" aria-labelledby="preview-step-label">
                    <h2
                        id="preview-step-label"
                        className="text-xs font-light uppercase tracking-[0.24em] text-textMuted"
                    >
                        Preview
                    </h2>
                    <div className="min-h-[6rem] max-w-full break-words rounded-none border border-white/20 bg-surface p-3 text-base leading-relaxed text-textMuted sm:min-h-[5.5rem] sm:p-4 sm:text-sm">
                        {activeTranscript ? (
                            <p className="whitespace-pre-wrap break-words text-textPrimary">{activeTranscript}</p>
                        ) : (
                            <p className="text-textMuted">Transcript appears here after you record.</p>
                        )}
                    </div>
                    <Button
                        size="lg"
                        className="w-full touch-manipulation"
                        disabled={!canContinue}
                        onClick={() => router.push("/review")}
                    >
                        Continue to review
                    </Button>
                </section>
            </div>
        </AppShell>
    );
}
