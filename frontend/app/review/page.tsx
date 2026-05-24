"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import emailjs from "@emailjs/browser";
import { z } from "zod";

import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { TranscriptEditor } from "@/components/forms/TranscriptEditor";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { submitQuery } from "@/services/api";
import { useQueryStore } from "@/store/useQueryStore";
import { getClientTimestamp } from "@/lib/time";

export default function ReviewPage() {
    const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

    const router = useRouter();

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
        const nameResult = nameSchema.safeParse(userName);
        if (!nameResult.success) {
            setNameError(nameResult.error.issues[0]?.message ?? "Please enter your name.");
            return;
        }
        if (!phoneValidation) { setPhoneError("Please enter a valid number with country code."); return; }

        setNameError(null);
        setPhoneError(null);

        if (!translatedTranscript.trim()) { setErrorMessage("Please provide a transcript before sending."); return; }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const { timestamp, timezone } = getClientTimestamp();
            if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
                throw new Error("EmailJS is not configured");
            }
            emailjs.init(EMAILJS_PUBLIC_KEY);
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                name: normalizedUserName,
                user_name: normalizedUserName,
                original_query: originalTranscript,
                translated_query: translatedTranscript,
                phone: phoneFull,
                submitted_at: timestamp,
            });
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
            setErrorMessage(err instanceof Error ? err.message : "Submission failed.");
        } finally {
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
                </div>

                {/* Error */}
                {errorMessage && <ErrorBanner message={errorMessage} />}

                {/* Details card — uses shared Card component */}
                <Card padding="lg">

                    {/* Name */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="review-user-name"
                            className="font-mono text-xs font-bold uppercase tracking-widest text-brand-muted"
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
                            className="h-11 w-full border border-brand-border bg-brand-bg px-3 font-mono text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 transition-colors"
                            value={userName}
                            onChange={(e) => { setUserName(e.target.value); setNameError(null); }}
                        />
                        {nameError && (
                            <p className="font-mono text-xs text-brand-error">{nameError}</p>
                        )}
                    </div>

                    {/* Original transcript (read-only) */}
                    {originalTranscript && (
                        <div className="flex flex-col gap-2">
                            <span className="font-mono text-xs font-bold uppercase tracking-widest text-brand-muted">
                                Original transcript
                            </span>
                            <div className="border border-brand-border bg-brand-bg p-3 sm:p-4">
                                <p className="font-mono text-sm leading-relaxed text-brand-text whitespace-pre-wrap break-words">
                                    {originalTranscript}
                                </p>
                            </div>
                        </div>
                    )}
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

                {/* Send CTA — sticky on mobile */}
                <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 border-t border-brand-border bg-brand-bg/95 px-4 sm:px-6 py-4 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
                            className="flex items-center justify-center sm:justify-start font-mono text-sm font-bold gap-2 border-b-2 border-brand-accent pb-1 hover:text-brand-accent transition-colors whitespace-nowrap"
                        >
                            ← Back
                        </Link>
                    </div>
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
