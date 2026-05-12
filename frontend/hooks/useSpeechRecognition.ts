"use client";

import { useEffect, useRef, useState } from "react";

interface SpeechHookState {
    isSupported: boolean;
    isRecording: boolean;
    interimText: string;
    finalText: string;
    error: string | null;
    start: () => void;
    stop: () => void;
    reset: () => void;
}

type SpeechRecognitionType = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition;

export function useSpeechRecognition(): SpeechHookState {
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const wantsToRecordRef = useRef(false);
    const stopRequestedRef = useRef(false);
    const [isSupported, setIsSupported] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [interimText, setInterimText] = useState("");
    const [finalText, setFinalText] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        if (!window.isSecureContext) {
            setIsSupported(false);
            setError("Speech recognition requires HTTPS or localhost.");
            return;
        }
        const SpeechRecognitionConstructor =
            (window.SpeechRecognition || window.webkitSpeechRecognition) as SpeechRecognitionType | undefined;

        if (!SpeechRecognitionConstructor) {
            setIsSupported(false);
            setError("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.lang = navigator.language || "en-US";
        recognition.onstart = () => {
            setIsRecording(true);
        };
        recognition.onresult = (event) => {
            let full = "";
            for (let i = 0; i < event.results.length; i += 1) {
                const result = event.results[i];
                const transcript = result[0]?.transcript ?? "";
                full += transcript;
            }
            setFinalText(full.trim());
            setInterimText("");
        };
        recognition.onerror = (event) => {
            const errorType = event.error ?? "speech_error";
            if (errorType === "network") {
                setError("Speech service unavailable on this network. Try again or switch networks.");
                setIsRecording(false);
                wantsToRecordRef.current = false;
                recognition.stop();
                return;
            }
            if (errorType === "not-allowed" || errorType === "service-not-allowed") {
                setError("Microphone access blocked. Allow mic permissions and retry.");
                setIsRecording(false);
                wantsToRecordRef.current = false;
                recognition.stop();
                return;
            }
            if (errorType === "audio-capture") {
                setError("No microphone found. Check your input device settings.");
                setIsRecording(false);
                wantsToRecordRef.current = false;
                recognition.stop();
                return;
            }
            if (errorType === "no-speech") {
                setError("No speech detected. Please speak closer to the mic.");
                setIsRecording(false);
                wantsToRecordRef.current = false;
                return;
            }
            setError(errorType);
            setIsRecording(false);
            wantsToRecordRef.current = false;
        };
        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    const start = () => {
        if (!recognitionRef.current || !isSupported || isRecording) {
            return;
        }
        setError(null);
        setInterimText("");
        stopRequestedRef.current = false;
        wantsToRecordRef.current = true;
        try {
            recognitionRef.current.start();
        } catch (err) {
            setError("Unable to start recording. Please allow microphone access.");
            setIsRecording(false);
            wantsToRecordRef.current = false;
        }
    };

    const stop = () => {
        recognitionRef.current?.stop();
        setIsRecording(false);
        wantsToRecordRef.current = false;
        stopRequestedRef.current = true;
    };

    const reset = () => {
        setFinalText("");
        setInterimText("");
        setError(null);
    };

    return {
        isSupported,
        isRecording,
        interimText,
        finalText,
        error,
        start,
        stop,
        reset,
    };
}
