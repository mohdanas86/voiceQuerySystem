"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { MicButton } from "@/components/speech/MicButton";
import { RecordingTimer } from "@/components/speech/RecordingTimer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQueryStore } from "@/store/useQueryStore";
import { t } from "@/lib/i18n";
import type { SupportedLang } from "@/lib/i18n";
import { LanguagePicker } from "@/components/language/LanguagePicker";
import { Languages } from "lucide-react";

export default function RecordPage() {
    const router = useRouter();
    const maxSeconds = 60;
    const MIN_RECORD_SECONDS = 3;
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const elapsedRef = useRef(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const {
        recordingStatus, sourceLanguage, originalTranscript, errorMessage,
        setRecordingStatus, setSourceLanguage, setOriginalTranscript,
        setTranslatedTranscript, setIsTranslating, setErrorMessage,
        uiLanguage, setUiLanguage,
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
        const interval = window.setInterval(() => {
            setElapsedSeconds((s) => {
                const next = s + 1;
                elapsedRef.current = next;
                return next;
            });
        }, 1000);
        return () => window.clearInterval(interval);
    }, [isRecording]);

    useEffect(() => {
        try {
            const isInitialized = localStorage.getItem("vb-language-initialized");
            if (!isInitialized) {
                setTimeout(() => setShowLanguageModal(true), 0);
            }
        } catch {
            setTimeout(() => setShowLanguageModal(true), 0);
        }
    }, []);

    const handleLanguageSelect = (lang: SupportedLang) => {
        setUiLanguage(lang);
        try {
            localStorage.setItem("vb-language-initialized", "true");
        } catch {}
        setShowLanguageModal(false);
    };

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
            let code = "UNKNOWN";
            let audioDuration = 0;
            try {
                const d = await res.json() as { error?: string; detail?: string; code?: string; audio_duration?: number };
                detail = d.detail || d.error || detail;
                code = d.code || code;
                audioDuration = d.audio_duration || 0;
            } catch { /* use default */ }
            const err = new Error(detail) as Error & { code: string; audioDuration: number };
            err.code = code;
            err.audioDuration = audioDuration;
            throw err;
        }
        return res.json() as Promise<{
            text?: string;
            translated_texts?: Record<string, string> | null;
            language_code?: string;
            audio_duration?: number;
        }>;
    };

    const handleStart = useCallback(async () => {
        if (!mediaSupported) { setErrorMessage(t(uiLanguage, "errorBrowserNoMic")); return; }
        if (!window.isSecureContext) { setErrorMessage("Recording is only available on secure connections."); return; }
        if (isRecording) return;

        setElapsedSeconds(0);
        elapsedRef.current = 0;
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
                    // Use AssemblyAI translated_texts if available; otherwise fall back to the
                    // original text (server already tried MyMemory fallback before this point).
                    const translated = result.translated_texts?.en?.trim() || original;
                    const lang = sourceLanguage !== "auto" ? sourceLanguage : result.language_code ?? "auto";

                    if (!original) {
                        // This path shouldn't normally be reached anymore since the server now
                        // returns 422 for empty transcripts — but keep it as a safety net.
                        setRetryCount((c) => c + 1);
                        setErrorMessage(t(uiLanguage, "errorNoSpeech"));
                        setRecordingStatus("idle");
                        return;
                    }

                    setRetryCount(0);
                    setOriginalTranscript(original);
                    setTranslatedTranscript(translated);
                    setSourceLanguage(lang);
                    setRecordingStatus("done");
                } catch (err: unknown) {
                    const e = err as { code?: string; audioDuration?: number; message?: string };
                    setRetryCount((c) => c + 1);

                    if (e.code === "NO_SPEECH") {
                        const dur = e.audioDuration ?? 0;
                        // Expected user-behaviour: no speech in clip. Warn, not error.
                        console.warn("[transcribe] no speech detected, duration:", dur);
                        if (dur > 0 && dur < 4) {
                            setErrorMessage(t(uiLanguage, "errorTooShort"));
                        } else {
                            setErrorMessage(t(uiLanguage, "errorNoSpeech"));
                        }
                    } else if (e.code === "RATE_LIMITED") {
                        console.warn("[transcribe] rate limited");
                        setErrorMessage("Too many attempts. Please wait a moment and try again.");
                    } else {
                        // Genuinely unexpected: log as error for debugging.
                        console.error("[transcribe] unexpected failure", e);
                        setErrorMessage(t(uiLanguage, "errorGeneral"));
                    }
                    setRecordingStatus("idle");
                } finally {
                    setIsTranslating(false);
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch {
            setErrorMessage(t(uiLanguage, "errorMicBlocked"));
            setRecordingStatus("idle");
            stopTracks();
        }
    }, [isRecording, mediaSupported, sourceLanguage, setErrorMessage, setIsTranslating, setOriginalTranscript, setRecordingStatus, setSourceLanguage, setTranslatedTranscript, uiLanguage]);

    const handleStop = useCallback(() => {
        if (!mediaRecorderRef.current || !isRecording) return;
        // Enforce minimum recording length — don't waste an API call on a near-empty clip.
        if (elapsedRef.current < MIN_RECORD_SECONDS) {
            setErrorMessage(t(uiLanguage, "recordMinSeconds"));
            // Still stop the recorder and free tracks, but go back to idle.
            mediaRecorderRef.current.onstop = () => {
                stopTracks();
                setRecordingStatus("idle");
                setIsRecording(false);
            };
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            return;
        }
        setRecordingStatus("processing");
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }, [isRecording, setRecordingStatus, setErrorMessage, uiLanguage]);

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
                            {t(uiLanguage, "recordStep")}
                        </span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-4xl">
                        {t(uiLanguage, "recordTitle")}
                    </h1>
                    <p className="text-sm font-light text-[#6B6A68] mt-1">
                        {t(uiLanguage, "recordSubtitle")}
                    </p>
                </div>

                {/* Errors */}
                {hasMounted && !mediaSupported && (
                    <ErrorBanner message="Audio recording is not supported in this browser." />
                )}
                {errorMessage && <ErrorBanner message={errorMessage} />}

                {/* Tips panel — shown after one or more failed attempts */}
                {retryCount >= 1 && !originalTranscript && (
                    <div className="rounded-xl border border-[#E8E5DF] bg-white/60 px-4 py-3 flex flex-col gap-2">
                        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                            💡 Tips for a clear recording
                        </p>
                        <ul className="text-[13px] font-light text-[#6B6A68] flex flex-col gap-1 list-none">
                            <li>• Speak for at least 5 seconds</li>
                            <li>• Hold the device 20–30 cm from your mouth</li>
                            <li>• Move to a quieter place if there is background noise</li>
                            <li>• Select your language from the dropdown for better accuracy</li>
                        </ul>
                    </div>
                )}

                {/* Recording Card — uses shared Card component */}
                <Card padding="lg">
                    {/* Timer only — inline selection removed */}
                    <div className="flex items-center justify-center py-2">
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
                            lang={uiLanguage}
                        />
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[#E8E5DF] mb-4" />

                    {/* Status row */}
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[#6B6A68]">
                            {t(uiLanguage, "recordTimer")}
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
                                {t(uiLanguage, "recordTranscriptPreview")}
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
                        onClick={() => router.push("/details")}
                    >
                        {t(uiLanguage, "recordContinue")}
                    </Button>
                    {!canContinue && (
                        <p className="text-[12px] font-light text-[#6B6A68] text-center">
                            Record a query above to continue
                        </p>
                    )}
                </div>

                {/* Bottom ticker */}
                <div className="border-t border-brand-border pt-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-brand-muted tracking-caps uppercase">
                        {t(uiLanguage, "recordStep")}
                    </span>
                    <span className="text-[11px] text-[#D5D0C4] tracking-widest">/ / / / /</span>
                </div>

            </div>

            {/* Language Modal Popup Overlay */}
            {showLanguageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl border border-brand-border p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col items-center gap-6 reveal">
                        <div className="flex flex-col items-center text-center max-w-md">
                            <div className="h-12 w-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mb-4 shadow-sm">
                                <Languages className="w-6 h-6 text-brand-accent" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                                {t(uiLanguage, "langPickerTitle") || "Select your language"}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {t(uiLanguage, "langPickerSubtitle") || "All screens will adapt to your choice."}
                            </p>
                        </div>
                        
                        <LanguagePicker onSelect={handleLanguageSelect} />
                    </div>
                </div>
            )}
        </div>
    );
}
