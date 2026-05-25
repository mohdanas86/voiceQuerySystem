"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { TranscriptEditor } from "@/components/forms/TranscriptEditor";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError, submitQuery } from "@/services/api";
import { useQueryStore } from "@/store/useQueryStore";
import { getClientTimestamp } from "@/lib/time";

// Human-readable messages per server error code
function resolveErrorMessage(err: unknown): string {
    if (err instanceof ApiError) {
        switch (err.code) {
            case "RATE_LIMITED":
                return "You've submitted too many queries. Please wait a few minutes and try again.";
            case "INVALID_PAYLOAD":
            case "BAD_REQUEST":
                return "Some required fields are missing. Please check your details.";
            case "DB_ERROR":
                return "We could not save your query. Please try again in a moment.";
            default:
                return err.message || "Something went wrong. Please try again.";
        }
    }
    if (err instanceof Error) return err.message;
    return "Something went wrong. Please try again.";
}

export default function ReviewPage() {
    const router = useRouter();

    // Double-submit guard (ref so it doesn't trigger re-render)
    const submittingRef = useRef(false);

    const {
        userName, sourceLanguage, originalTranscript, translatedTranscript,
        phoneCountryCode, phoneNumber, isTranslating, isSubmitting, errorMessage,
        setUserName, setTranslatedTranscript, setPhoneCountryCode, setPhoneNumber,
        setIsSubmitting, setErrorMessage, reset,
    } = useQueryStore();

    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);

    const phoneSchema = useMemo(() => z.object({
        countryCode: z.string().regex(/^\+\d{1,4}$/),
        number: z.string().regex(/^[\d\s]{6,15}$/),
    }), []);

    const nameSchema = useMemo(() => z.string().trim().min(2, "Please enter your name."), []);
    const normalizedUserName = useMemo(() => userName.trim(), [userName]);

    const phoneValidation = useMemo(() =>
        phoneSchema.safeParse({ countryCode: phoneCountryCode, number: phoneNumber }).success,
        [phoneSchema, phoneCountryCode, phoneNumber]);

    const phoneFull = useMemo(
        () => `${phoneCountryCode} ${phoneNumber}`.trim(),
        [phoneCountryCode, phoneNumber]
    );

    const canSubmit =
        normalizedUserName.length > 1 &&
        phoneValidation &&
        translatedTranscript.trim().length > 0 &&
        !isSubmitting &&
        !isTranslating;

    const handleSubmit = async () => {
        // Hard guard against double-submit (e.g. rapid tap on mobile)
        if (submittingRef.current) return;

        const nameResult = nameSchema.safeParse(userName);
        if (!nameResult.success) {
            setNameError(nameResult.error.issues[0]?.message ?? "Please enter your name.");
            return;
        }
        if (!phoneValidation) {
            setPhoneError("Please enter a valid number with country code.");
            return;
        }
        if (!translatedTranscript.trim()) {
            setErrorMessage("Please provide a transcript before sending.");
            return;
        }

        setNameError(null);
        setPhoneError(null);
        setErrorMessage(null);

        // Lock
        submittingRef.current = true;
        setIsSubmitting(true);

        try {
            const { timestamp, timezone } = getClientTimestamp();

            // Single API call — server handles DB write + email in correct order
            await submitQuery({
                user_name: normalizedUserName,
                source_language: sourceLanguage,
                original_transcript: originalTranscript,
                translated_transcript: translatedTranscript,
                phone_country_code: phoneCountryCode,
                phone_number: phoneNumber,
                phone_full: phoneFull,
                client_timestamp: timestamp,
                client_timezone: timezone,
            });

            reset();
            router.push("/confirmation");
        } catch (err) {
            console.error("[submit] failed", err);
            setErrorMessage(resolveErrorMessage(err));
        } finally {
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-12 min-h-screen bg-[#F4F1EB]">
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">

                {/* Page header */}
                <div className="flex flex-col gap-1.5">
                    <div className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#E85D22]" aria-hidden />
                        <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                            Step 02 of 03
                        </span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-4xl">
                        Review &amp; <span className="text-[#E85D22]">submit.</span>
                    </h1>
                    <p className="text-sm font-light text-[#6B6A68] mt-1">
                        Check your details before sending.
                    </p>
                </div>

                {/* Error */}
                {errorMessage && <ErrorBanner message={errorMessage} />}

                {/* Details card */}
                <Card padding="lg">
                    <div className="flex flex-col gap-5">

                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="review-user-name"
                                className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]"
                            >
                                Your Name
                            </label>
                            <input
                                id="review-user-name"
                                name="user_name"
                                type="text"
                                autoComplete="name"
                                placeholder="Enter your name"
                                aria-invalid={nameError ? true : undefined}
                                className="h-11 w-full rounded-xl border border-[#E8E5DF] bg-white px-4 text-sm font-light text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E85D22] focus:ring-2 focus:ring-[#E85D22]/20 transition-colors"
                                value={userName}
                                onChange={(e) => { setUserName(e.target.value); setNameError(null); }}
                            />
                            {nameError && (
                                <p className="text-[12px] font-light text-red-600">{nameError}</p>
                            )}
                        </div>

                        {/* Original transcript (read-only) */}
                        {originalTranscript && (
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                                    Original transcript
                                </span>
                                <div className="rounded-xl border border-[#E8E5DF] bg-[#F9F8F5] overflow-hidden flex">
                                    <div className="w-[3px] bg-[#E85D22] shrink-0" />
                                    <p className="flex-1 px-4 py-3 text-sm font-light leading-relaxed text-[#111111] whitespace-pre-wrap break-words">
                                        {originalTranscript}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Translated transcript */}
                <TranscriptEditor
                    value={translatedTranscript}
                    onChange={setTranslatedTranscript}
                    placeholder={isTranslating ? "Translating…" : "Your translated message will appear here…"}
                />

                {/* Phone */}
                <PhoneInput
                    countryCode={phoneCountryCode}
                    number={phoneNumber}
                    onCountryCodeChange={setPhoneCountryCode}
                    onNumberChange={(v) => { setPhoneNumber(v); setPhoneError(null); }}
                    error={phoneError ?? undefined}
                />

                {/* Send CTA + Back */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                        size="lg"
                        className="w-full sm:flex-1 touch-manipulation"
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                        aria-busy={isSubmitting}
                    >
                        {isSubmitting ? "Sending…" : "Send query →"}
                    </Button>
                    <Link
                        href="/record"
                        className="flex items-center justify-center sm:justify-start gap-1 text-sm font-medium text-[#6B6A68] hover:text-[#E85D22] transition-colors whitespace-nowrap px-2 py-2"
                    >
                        ← Back
                    </Link>
                </div>

                {/* Bottom ticker */}
                <div className="border-t border-[#E8E5DF] pt-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#9CA3AF] tracking-[0.05em] uppercase">Step 02 of 03</span>
                    <span className="text-[11px] text-[#D5D0C4] tracking-widest">/ / / / /</span>
                </div>

            </div>
        </div>
    );
}
