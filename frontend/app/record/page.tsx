"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
        if (!isRecording) {
            return;
        }
        const interval = window.setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);
        return () => window.clearInterval(interval);
    }, [isRecording]);

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
            } catch {
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

                    // If transcription returned no text (user was silent), prompt to retry
                    if (!original) {
                        setOriginalTranscript("");
                        setTranslatedTranscript("");
                        setErrorMessage("No speech detected. Please try recording again.");
                        setRecordingStatus("idle");
                        return;
                    }

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
        } catch {
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
            <div className="flex min-w-0 flex-col gap-8 md:gap-10 max-w-3xl mx-auto w-full px-4 md:px-0">

                {hasMounted && !mediaSupported ? (
                    <ErrorBanner message="Audio recording is not supported in this browser." />
                ) : null}
                {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
                <section className="flex min-w-0 flex-col gap-4" aria-labelledby="record-step-label">
                    <h2
                        id="record-step-label"
                        className="text-sm md:text-base font-light uppercase tracking-[0.24em] text-textMuted"
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
                <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
                    <Button
                        size="lg"
                        className="w-full touch-manipulation bg-white text-black hover:bg-gray-100 rounded-md"
                        disabled={!canContinue}
                        onClick={() => router.push("/review")}
                    >
                        Continue to review
                    </Button>
                </div>
            </div>
        </AppShell>
    );
}
