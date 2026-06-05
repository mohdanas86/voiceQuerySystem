/**
 * useQueryStore.ts — Zustand global state store for query, language, and trip state.
 * Persists the user's selected language in localStorage while keeping other fields ephemeral.
 * VoiceBerry | Ulavi Technologies
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
    uiLanguage: SupportedLang;

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

    // ── Actions ──────────────────────────────────────────────────────────────
    /** Resets all ephemeral user entry fields to initial state (preserves persisted uiLanguage). */
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
};

export const useQueryStore = create<QueryState>()(
    persist(
        (set) => ({
            ...initialEphemeralState,
            uiLanguage: "auto" as SupportedLang,

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
            setUiLanguage: (uiLanguage) => set({ uiLanguage, sourceLanguage: uiLanguage }),

            // Reset action
            reset: () => set({ ...initialEphemeralState }),
        }),
        {
            name: "vb-query-store",
            // Only persist language preference across sessions.
            // Transcripts, contact details, and trip parameters must be lost on page reload for privacy.
            partialize: (state) => ({ uiLanguage: state.uiLanguage }),
        }
    )
);
