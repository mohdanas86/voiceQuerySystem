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
import { submitQuery } from "@/services/api";
import { useQueryStore } from "@/store/useQueryStore";
import { getClientTimestamp } from "@/lib/time";

export default function ReviewPage() {
    const EMAILJS_PUBLIC_KEY =
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const EMAILJS_SERVICE_ID =
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID =
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const router = useRouter();
    const {
        sourceLanguage,
        originalTranscript,
        translatedTranscript,
        phoneCountryCode,
        phoneNumber,
        isTranslating,
        isSubmitting,
        errorMessage,
        setTranslatedTranscript,
        setPhoneCountryCode,
        setPhoneNumber,
        setIsSubmitting,
        setErrorMessage,
        reset,
    } = useQueryStore();
    const [phoneError, setPhoneError] = useState<string | null>(null);

    const phoneSchema = useMemo(
        () =>
            z.object({
                countryCode: z.string().regex(/^\+\d{1,4}$/),
                number: z.string().regex(/^[\d\s]{6,15}$/),
            }),
        []
    );

    const phoneValidation = useMemo(() => {
        const result = phoneSchema.safeParse({
            countryCode: phoneCountryCode,
            number: phoneNumber,
        });
        return result.success;
    }, [phoneSchema, phoneCountryCode, phoneNumber]);

    const phoneFull = useMemo(
        () => `${phoneCountryCode} ${phoneNumber}`.trim(),
        [phoneCountryCode, phoneNumber]
    );

    const canSubmit =
        phoneValidation &&
        translatedTranscript.trim().length > 0 &&
        !isSubmitting &&
        !isTranslating;

    const handleSubmit = async () => {
        if (!phoneValidation) {
            setPhoneError("Please enter a valid number with country code.");
            return;
        }
        setPhoneError(null);
        if (!translatedTranscript.trim()) {
            setErrorMessage("Please provide a transcript before sending.");
            return;
        }
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            const { timestamp, timezone } = getClientTimestamp();
            if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
                throw new Error("EmailJS is not configured");
            }
            emailjs.init(EMAILJS_PUBLIC_KEY);
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                original_query: originalTranscript,
                translated_query: translatedTranscript,
                phone: phoneFull,
                submitted_at: timestamp,
            });
            await submitQuery({
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
            const message = err instanceof Error ? err.message : "Submission failed.";
            console.error("[submit] failed", err);
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[82vh] items-center justify-center p-6">
            <div className="flex w-full flex-col gap-8 md:gap-10">
                {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
                <div className="flex w-full flex-col gap-6 pb-2 sm:pb-0">
                    <TranscriptEditor
                        value={translatedTranscript}
                        onChange={setTranslatedTranscript}
                        placeholder={
                            isTranslating
                                ? "Translating…"
                                : "Your translated message will appear here…"
                        }
                    />
                    <PhoneInput
                        countryCode={phoneCountryCode}
                        number={phoneNumber}
                        onCountryCodeChange={setPhoneCountryCode}
                        onNumberChange={(value) => {
                            setPhoneNumber(value);
                            setPhoneError(null);
                        }}
                        error={phoneError ?? undefined}
                    />
                </div>
                <div className="sticky bottom-0 z-10 -mx-4 mt-auto border-t border-white/10 bg-surface/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-md supports-[backdrop-filter]:bg-surface/90 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pb-0 sm:pt-0 sm:backdrop-blur-none">
                    <div className="mx-auto flex w-full min-w-0 max-w-full flex-col gap-3">
                        <Button
                            size="lg"
                            className="w-full touch-manipulation bg-white text-black hover:bg-gray-100 rounded-md"
                            disabled={!canSubmit}
                            onClick={handleSubmit}
                            aria-busy={isSubmitting}
                        >
                            {isSubmitting ? "Sending…" : "Send"}
                        </Button>
                        <Link
                            href="/record"
                            className="flex min-h-11 items-center justify-center rounded-none text-center text-xs uppercase tracking-[0.2em] text-textMuted transition-colors hover:text-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-0 sm:justify-start sm:py-1 underline underline-offset-5 cursor-pointer"
                        >
                            Back to recording
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
