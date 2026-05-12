"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { MicButton } from "@/components/speech/MicButton";
import { RecordingTimer } from "@/components/speech/RecordingTimer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useQueryStore } from "@/store/useQueryStore";

export default function RecordPage() {
    const router = useRouter();
    const maxSeconds = 60;
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const {
        recordingStatus,
        originalTranscript,
        errorMessage,
        setRecordingStatus,
        setOriginalTranscript,
        setTranslatedTranscript,
        setErrorMessage,
    } = useQueryStore();
    const {
        isSupported,
        isRecording,
        interimText,
        finalText,
        error,
        start,
        stop,
        reset,
    } = useSpeechRecognition();

    const activeTranscript = useMemo(() => {
        if (finalText) {
            return finalText;
        }
        return interimText;
    }, [finalText, interimText]);

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
        if (elapsedSeconds >= maxSeconds && isRecording) {
            handleStop();
        }
    }, [elapsedSeconds, isRecording]);

    useEffect(() => {
        if (error) {
            setErrorMessage(error);
            setRecordingStatus("idle");
        }
    }, [error, setErrorMessage]);

    useEffect(() => {
        if (finalText) {
            setOriginalTranscript(finalText.trim());
        }
    }, [finalText, setOriginalTranscript]);

    const handleStart = () => {
        if (!isSupported) {
            setErrorMessage("Speech recognition is not supported in this browser.");
            return;
        }
        setElapsedSeconds(0);
        reset();
        setOriginalTranscript("");
        setTranslatedTranscript("");
        setErrorMessage(null);
        setRecordingStatus("recording");
        start();
    };

    const handleStop = () => {
        stop();
        if (activeTranscript.trim()) {
            setOriginalTranscript(activeTranscript.trim());
        }
        setRecordingStatus("done");
    };

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
            <div className="flex flex-col gap-10">
                <PageHeader
                    title="Record your query"
                    subtitle="Tap the mic and speak naturally in any language. We will convert and translate for you."
                />
                {!isSupported ? (
                    <ErrorBanner message="Speech recognition is not supported in this browser." />
                ) : null}
                {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
                <div className="reveal flex flex-col gap-6">
                    <MicButton
                        status={
                            isRecording
                                ? "recording"
                                : recordingStatus === "done"
                                    ? "done"
                                    : "idle"
                        }
                        onClick={handleToggle}
                        disabled={!isSupported}
                    />
                    <RecordingTimer elapsedSeconds={elapsedSeconds} maxSeconds={maxSeconds} />
                </div>
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-textMuted">
                        Max duration: 60 seconds. You can review and edit the transcript
                        before sending.
                    </p>
                    {activeTranscript ? (
                        <div className="rounded-md border border-white/10 bg-surface p-4 text-sm text-textMuted">
                            {activeTranscript}
                        </div>
                    ) : null}
                    <PrimaryButton
                        label="Continue to review"
                        disabled={!canContinue}
                        onClick={() => router.push("/review")}
                    />
                </div>
            </div>
        </AppShell>
    );
}
