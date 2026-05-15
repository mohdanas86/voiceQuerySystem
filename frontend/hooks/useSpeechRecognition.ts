"use client";

import { useEffect, useRef, useState } from "react";

interface SpeechHookState {
    isSupported: boolean;
    isRecording: boolean;
    interimText: string;
    finalText: string;
    error: string | null;
    start: (language?: string) => void;
    stop: () => void;
    reset: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

export function useSpeechRecognition(): SpeechHookState {
    const isSupported =
        typeof window !== "undefined" &&
        window.isSecureContext &&
        !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [interimText, setInterimText] = useState("");
    const [finalText, setFinalText] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isSupported || typeof window === "undefined") {
            return;
        }
        const SpeechRecognitionConstructor =
            (window.SpeechRecognition || window.webkitSpeechRecognition) as
            | SpeechRecognitionConstructor
            | undefined;
        if (!SpeechRecognitionConstructor) {
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
                recognition.stop();
                return;
            }
            if (errorType === "not-allowed" || errorType === "service-not-allowed") {
                setError("Microphone access blocked. Allow mic permissions and retry.");
                setIsRecording(false);
                recognition.stop();
                return;
            }
            if (errorType === "audio-capture") {
                setError("No microphone found. Check your input device settings.");
                setIsRecording(false);
                recognition.stop();
                return;
            }
            if (errorType === "no-speech") {
                setError("No speech detected. Please speak closer to the mic.");
                setIsRecording(false);
                return;
            }
            setError(errorType);
            setIsRecording(false);
        };
        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [isSupported]);

    const start = (language?: string) => {
        if (!recognitionRef.current || !isSupported || isRecording) {
            return;
        }
        setError(null);
        setInterimText("");
        if (language) {
            recognitionRef.current.lang = language;
        }
        try {
            recognitionRef.current.start();
        } catch {
            setError("Unable to start recording. Please allow microphone access.");
            setIsRecording(false);
        }
    };

    const stop = () => {
        recognitionRef.current?.stop();
        setIsRecording(false);
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
