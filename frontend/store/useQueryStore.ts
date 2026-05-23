import { create } from "zustand";

import type { RecordingStatus } from "@/types/query";

interface QueryState {
    recordingStatus: RecordingStatus;
    userName: string;
    sourceLanguage: string;
    originalTranscript: string;
    translatedTranscript: string;
    phoneCountryCode: string;
    phoneNumber: string;
    isTranslating: boolean;
    isSubmitting: boolean;
    errorMessage: string | null;
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
    reset: () => void;
}

const initialState = {
    recordingStatus: "idle" as RecordingStatus,
    userName: "",
    sourceLanguage: "auto",
    originalTranscript: "",
    translatedTranscript: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    isTranslating: false,
    isSubmitting: false,
    errorMessage: null,
};

export const useQueryStore = create<QueryState>((set) => ({
    ...initialState,
    setRecordingStatus: (recordingStatus) => set({ recordingStatus }),
    setUserName: (userName) => set({ userName }),
    setSourceLanguage: (sourceLanguage) => set({ sourceLanguage }),
    setOriginalTranscript: (originalTranscript) => set({ originalTranscript }),
    setTranslatedTranscript: (translatedTranscript) => set({ translatedTranscript }),
    setPhoneCountryCode: (phoneCountryCode) => set({ phoneCountryCode }),
    setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
    setIsTranslating: (isTranslating) => set({ isTranslating }),
    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
    setErrorMessage: (errorMessage) => set({ errorMessage }),
    reset: () => set({ ...initialState }),
}));
