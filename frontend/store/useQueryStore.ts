/**
 * useQueryStore.ts — Zustand global state store for query, language, and trip state.
 * 
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SupportedLang } from "@/lib/i18n";
import type { RecordingStatus } from "@/types/query";

export interface QueryState {
    // ── Ephemeral Audio & Status State ───────────────────────────────────────
    recordingStatus: RecordingStatus;
    isTranslating: boolean;
    isSubmitting: boolean;
    errorMessage: string | null;

    // ── Ephemeral User Submission Inputs ─────────────────────────────────────
    userName: string;
    sourceLanguage: string;
    originalTranscript: string;
    translatedTranscript: string;
    phoneCountryCode: string;
    phoneNumber: string;

    // ── Ephemeral Trip Details (from pop-ups) ───────────────────────────────
    tripCity: string;
    tripDatesFrom: string;
    tripDatesTo: string;
    tripPassengers: string;
    tripBudget: string;

    // ── Ephemeral Contact details ──────────────────────────────────────────
    userEmail: string;

    // ── Ephemeral Supabase Audio URL ─────────────────────────────────────────
    audioUrl: string;

    // ── Persisted Language State ─────────────────────────────────────────────
    preferredLanguage: SupportedLang;

    // ── Ephemeral Language State ─────────────────────────────────────────────
    uiLanguage: SupportedLang;

    // ── Ephemeral Translated UI State ────────────────────────────────────────
    uiTranslations: Record<string, string>;

    // ── Setters ──────────────────────────────────────────────────────────────
    setRecordingStatus: (status: RecordingStatus) => void;
    setUserName: (value: string) => void;
    setSourceLanguage: (language: string) => void;
    setOriginalTranscript: (value: string) => void;
    setTranslatedTranscript: (value: string) => void;
    setPhoneCountryCode: (value: string) => void;
    setPhoneNumber: (value: string) => void;
    setIsTranslating: (value: boolean) => void;
    setIsSubmitting: (value: boolean) => void;
    setErrorMessage: (value: string | null) => void;

    // Setters for trip details
    setTripCity: (value: string) => void;
    setTripDatesFrom: (value: string) => void;
    setTripDatesTo: (value: string) => void;
    setTripPassengers: (value: string) => void;
    setTripBudget: (value: string) => void;

    // Setter for contact email
    setUserEmail: (value: string) => void;

    // Setter for audio URL
    setAudioUrl: (value: string) => void;

    // Setter for persisted language
    setUiLanguage: (lang: SupportedLang) => void;
    setDetectedLanguage: (lang: SupportedLang) => void;
    setUiTranslations: (translations: Record<string, string>) => void;

    // ── Actions ──────────────────────────────────────────────────────────────
    /** Resets all ephemeral user entry fields to initial state (preserves persisted preferredLanguage). */
    reset: () => void;
}

const initialEphemeralState = {
    recordingStatus: "idle" as RecordingStatus,
    isTranslating: false,
    isSubmitting: false,
    errorMessage: null as string | null,
    userName: "",
    sourceLanguage: "auto",
    originalTranscript: "",
    translatedTranscript: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    tripCity: "",
    tripDatesFrom: "",
    tripDatesTo: "",
    tripPassengers: "",
    tripBudget: "",
    userEmail: "",
    audioUrl: "",
    uiLanguage: "auto" as SupportedLang,
    uiTranslations: {} as Record<string, string>,
};

export const useQueryStore = create<QueryState>()(
    persist(
        (set) => ({
            preferredLanguage: "auto" as SupportedLang,
            ...initialEphemeralState,

            // Setters for recording & request status
            setRecordingStatus: (recordingStatus) => set({ recordingStatus }),
            setIsTranslating: (isTranslating) => set({ isTranslating }),
            setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
            setErrorMessage: (errorMessage) => set({ errorMessage }),

            // Setters for transcript & phone details
            setUserName: (userName) => set({ userName }),
            setSourceLanguage: (sourceLanguage) => set({ sourceLanguage }),
            setOriginalTranscript: (originalTranscript) => set({ originalTranscript }),
            setTranslatedTranscript: (translatedTranscript) => set({ translatedTranscript }),
            setPhoneCountryCode: (phoneCountryCode) => set({ phoneCountryCode }),
            setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

            // Setters for trip details
            setTripCity: (tripCity) => set({ tripCity }),
            setTripDatesFrom: (tripDatesFrom) => set({ tripDatesFrom }),
            setTripDatesTo: (tripDatesTo) => set({ tripDatesTo }),
            setTripPassengers: (tripPassengers) => set({ tripPassengers }),
            setTripBudget: (tripBudget) => set({ tripBudget }),

            // Setter for email
            setUserEmail: (userEmail) => set({ userEmail }),

            // Setter for audio URL
            setAudioUrl: (audioUrl) => set({ audioUrl }),

            // Setter for UI Language
            setUiLanguage: (uiLanguage) => set({
                preferredLanguage: uiLanguage,
                uiLanguage,
                sourceLanguage: uiLanguage,
                uiTranslations: {}, // clear previous dynamic translations when language updates
            }),

            setDetectedLanguage: (detectedLanguage) => set((state) => {
                if (state.preferredLanguage === "auto") {
                    return {
                        uiLanguage: detectedLanguage,
                        sourceLanguage: detectedLanguage,
                        uiTranslations: {}, // clear previous dynamic translations
                    };
                }
                return {};
            }),

            setUiTranslations: (uiTranslations) => set({ uiTranslations }),

            // Reset action
            reset: () => set((state) => ({
                ...initialEphemeralState,
                uiLanguage: state.preferredLanguage || "auto",
                sourceLanguage: state.preferredLanguage || "auto",
                uiTranslations: {}, // reset dynamic translations
            })),
        }),
        {
            name: "vb-query-store",
            // Only persist preferredLanguage across sessions.
            // Transcripts, contact details, and trip parameters must be lost on page reload for privacy.
            partialize: (state) => ({ preferredLanguage: state.preferredLanguage }),
            onRehydrateStorage: () => (state, error) => {
                if (!error && state) {
                    // Migrate old uiLanguage to preferredLanguage if preferredLanguage is not set
                    if (!state.preferredLanguage && state.uiLanguage) {
                        state.preferredLanguage = state.uiLanguage;
                    }
                    const preferred = state.preferredLanguage || "auto";
                    state.uiLanguage = preferred;
                    state.sourceLanguage = preferred;
                }
            },
        }
    )
);
