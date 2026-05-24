"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

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
        if (!mediaSupported) { setErrorMessage("Audio recording is not supported in this browser."); return; }
        if (!window.isSecureContext) { setErrorMessage("Recording requires HTTPS or localhost."); return; }
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
                        setErrorMessage("No speech detected. Please try recording again.");
                        setRecordingStatus("idle");
                        return;
                    }

                    setOriginalTranscript(original);
                    setTranslatedTranscript(translated);
                    setSourceLanguage(lang);
                    setRecordingStatus("done");
                } catch (err) {
                    setErrorMessage(err instanceof Error ? err.message : "Transcription failed.");
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
        <div className="pt-12 min-h-screen">
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">

                {/* Page header */}
                <div>
                    <div className="flex items-center gap-3 font-mono text-xs font-bold tracking-widest text-brand-muted mb-3">
                        <div className="w-2 h-2 bg-brand-accent" aria-hidden />
                        <span>// STEP 01 OF 03</span>
                    </div>
                    <h1 className="font-sans text-3xl font-black uppercase tracking-tighter text-brand-text sm:text-4xl">
                        Record your query
                    </h1>
                </div>

                {/* Errors */}
                {hasMounted && !mediaSupported && (
                    <ErrorBanner message="Audio recording is not supported in this browser." />
                )}
                {errorMessage && <ErrorBanner message={errorMessage} />}

                {/* Recording card */}
                <div className="w-full border-brutal shadow-brutal bg-brand-surface p-6 sm:p-8 flex flex-col gap-6">
                    {/* Language + Timer */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 sm:items-end">
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="spoken-language"
                                className="font-mono text-xs font-bold uppercase tracking-widest text-brand-muted"
                            >
                                Select language
                            </label>
                            <LanguageSelect value={sourceLanguage} onChange={setSourceLanguage} />
                        </div>
                        <RecordingTimer elapsedSeconds={elapsedSeconds} maxSeconds={maxSeconds} />
                    </div>
                    {/* Mic — centered */}
                    <div className="flex w-full items-center justify-center py-6">
                        <MicButton
                            status={
                                recordingStatus === "recording"  ? "recording"  :
                                recordingStatus === "processing" ? "processing" :
                                recordingStatus === "done"       ? "done"       : "idle"
                            }
                            onClick={handleToggle}
                            disabled={!hasMounted || !mediaSupported || recordingStatus === "processing"}
                        />
                    </div>
                </div>

                {/* Transcript preview */}
                {originalTranscript && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 font-mono text-xs font-bold tracking-widest text-brand-muted">
                            <div className="w-2 h-2 bg-brand-muted" aria-hidden />
                            <span>// TRANSCRIPT PREVIEW</span>
                        </div>
                        <div className="w-full border-brutal shadow-brutal-sm bg-brand-surface p-4 sm:p-5">
                            <p className="font-mono text-sm leading-relaxed text-brand-text whitespace-pre-wrap break-words">
                                {originalTranscript}
                            </p>
                        </div>
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
                        <p className="font-mono text-xs text-brand-muted tracking-widest text-center">
                            // Record a query above to continue
                        </p>
                    )}
                </div>

                {/* Bottom ticker */}
                <div className="border-t border-brand-border pt-2 font-mono text-[10px] text-brand-muted flex justify-between tracking-widest">
                    <span>+ STEP 01 OF 03</span>
                    <span>/ / / / / / / +</span>
                </div>

            </div>
        </div>
    );
}
