"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import emailjs from "@emailjs/browser";
import { z } from "zod";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { TranscriptEditor } from "@/components/forms/TranscriptEditor";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { submitQuery } from "@/services/api";
import { translateToEnglish } from "@/services/translation";
import { useQueryStore } from "@/store/useQueryStore";
import { getClientTimestamp } from "@/lib/time";

export default function ReviewPage() {
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
        setIsTranslating,
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

    useEffect(() => {
        const runTranslation = async () => {
            if (!originalTranscript || translatedTranscript || isTranslating) {
                return;
            }
            setIsTranslating(true);
            setErrorMessage(null);
            try {
                const translated = await translateToEnglish(originalTranscript, sourceLanguage);
                setTranslatedTranscript(translated);
            } catch (err) {
                setErrorMessage("Translation failed. Please edit the transcript manually.");
            } finally {
                setIsTranslating(false);
            }
        };
        runTranslation();
    }, [
        originalTranscript,
        translatedTranscript,
        isTranslating,
        sourceLanguage,
        setTranslatedTranscript,
        setIsTranslating,
        setErrorMessage,
    ]);

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
            const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";
            const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
            const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
            if (!publicKey || !serviceId || !templateId) {
                throw new Error("EmailJS is not configured");
            }
            emailjs.init(publicKey);
            await emailjs.send(serviceId, templateId, {
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
            setErrorMessage("Submission failed. Please check EmailJS and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppShell>
            <div className="flex flex-col gap-10">
                <PageHeader
                    title="Review and submit"
                    subtitle="Check the English transcript, add your mobile number, and send when ready."
                />
                {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
                <div className="flex flex-col gap-6">
                    <TranscriptEditor
                        value={translatedTranscript}
                        onChange={setTranslatedTranscript}
                        placeholder={
                            isTranslating
                                ? "Translating..."
                                : "Your translated message will appear here..."
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
                <div className="flex flex-col gap-4">
                    <PrimaryButton
                        label={isSubmitting ? "Sending..." : "Send"}
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                    />
                    <Link href="/record" className="text-xs uppercase tracking-[0.2em] text-textMuted">
                        Back to recording
                    </Link>
                </div>
            </div>
        </AppShell>
    );
}
