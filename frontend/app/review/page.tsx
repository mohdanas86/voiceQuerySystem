"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Plus, Minus, Loader2 } from "lucide-react";

import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { TranscriptEditor } from "@/components/forms/TranscriptEditor";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BudgetStarSelector, budgetRatingToString } from "@/components/popups/BudgetStarSelector";
import { ApiError, submitQuery } from "@/services/api";
import { useQueryStore } from "@/store/useQueryStore";
import { getClientTimestamp } from "@/lib/time";
import { useTranslation } from "@/hooks/useTranslation";

// Parsers for passenger counts (adults, children)
function parsePassengerCounts(passengersString: string) {
    const defaultVal = { adults: 1, childrenCount: 0 };
    if (!passengersString) return defaultVal;
    
    let adults = 1;
    let childrenCount = 0;
    
    const adultMatch = passengersString.match(/(\d+)\s*(?:adult|वयस्क|பெரியவர்)/i);
    if (adultMatch) {
        adults = parseInt(adultMatch[1], 10);
    } else {
        const genericMatch = passengersString.match(/^(\d+)/);
        if (genericMatch) {
            adults = parseInt(genericMatch[1], 10);
        }
    }
    
    const childMatch = passengersString.match(/(\d+)\s*(?:child|बच्चा|குழந்தை|बच्चे|குழந்)/i);
    if (childMatch) {
        childrenCount = parseInt(childMatch[1], 10);
    }
    
    return { adults, childrenCount };
}

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

// Parse the current tripBudget string back to a star count
// The string starts with N stars (⭐), so count them
function parseBudgetStarCount(budgetString: string): number {
    if (!budgetString) return 0;
    const starCount = [...budgetString].filter((char) => char === "⭐").length;
    return Math.min(starCount, 5); // Cap at 5 just in case
}

const emailSchema = z.string().email();

export default function ReviewPage() {
    const router = useRouter();

    // Double-submit guard (ref so it doesn't trigger re-render)
    const submittingRef = useRef(false);

    const {
        userName, sourceLanguage, originalTranscript, translatedTranscript,
        phoneCountryCode, phoneNumber, isTranslating, isSubmitting, errorMessage,
        setUserName, setTranslatedTranscript, setOriginalTranscript, setPhoneCountryCode, setPhoneNumber,
        setIsTranslating, setIsSubmitting, setErrorMessage, reset,
        // New fields (Phase 3)
        tripCity, setTripCity,
        tripDatesFrom, setTripDatesFrom,
        tripDatesTo, setTripDatesTo,
        tripPassengers, setTripPassengers,
        tripBudget, setTripBudget,
        userEmail, setUserEmail,
        audioUrl,
    } = useQueryStore();

    const { t, uiLanguage } = useTranslation();

    // ── All hooks must be declared before any early return ────────────────────
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [hasMounted, setHasMounted] = useState(false);

    const [debouncedTranscript, setDebouncedTranscript] = useState(originalTranscript);
    const lastTranslatedRef = useRef(originalTranscript);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Debounce originalTranscript changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTranscript(originalTranscript);
        }, 800);
        return () => clearTimeout(timer);
    }, [originalTranscript]);

    // Automatically translate when debouncedTranscript changes
    useEffect(() => {
        const trimmed = debouncedTranscript.trim();
        if (!trimmed) {
            setTranslatedTranscript("");
            return;
        }

        // Avoid translating if unchanged from the last translation request
        if (trimmed === lastTranslatedRef.current) return;

        const triggerTranslation = async () => {
            setIsTranslating(true);
            setErrorMessage(null);
            try {
                const res = await fetch("/api/translate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        texts: [trimmed],
                        source: sourceLanguage,
                        target: "en",
                    }),
                });

                if (!res.ok) {
                    throw new Error("Translation request failed");
                }

                const data = await res.json();
                const translatedTexts = data.translatedTexts as string[];
                if (translatedTexts && translatedTexts.length > 0) {
                    setTranslatedTranscript(translatedTexts[0]);
                    lastTranslatedRef.current = trimmed;
                }
            } catch (err: unknown) {
                console.error("[translate] Failed to re-translate modified query:", err);
                setErrorMessage("Failed to translate the query automatically. Please check your connection.");
            } finally {
                setIsTranslating(false);
            }
        };

        triggerTranslation();
    }, [debouncedTranscript, sourceLanguage, setTranslatedTranscript, setIsTranslating, setErrorMessage]);

    const { adults, childrenCount } = useMemo(() => {
        return parsePassengerCounts(tripPassengers);
    }, [tripPassengers]);

    const handleAdultsChange = (newAdults: number) => {
        const childText = childrenCount === 0 
          ? '' 
          : childrenCount === 1 
            ? (uiLanguage === 'hi' ? '1 बच्चा' : uiLanguage === 'ta' ? '1 குழந்தை' : '1 child')
            : `${childrenCount} ${uiLanguage === 'hi' ? 'बच्चे' : uiLanguage === 'ta' ? 'குழந்தைகள்' : 'children'}`;
        const adultText = newAdults === 1 
          ? (uiLanguage === 'hi' ? '1 वयस्क' : uiLanguage === 'ta' ? '1 பெரியவர்' : '1 adult') 
          : `${newAdults} ${uiLanguage === 'hi' ? 'वयस्क' : uiLanguage === 'ta' ? 'பெரியவர்கள்' : 'adults'}`;
        setTripPassengers(childText ? `${adultText}, ${childText}` : adultText);
    };

    const handleChildrenChange = (newChildren: number) => {
        const adultText = adults === 1 
          ? (uiLanguage === 'hi' ? '1 वयस्क' : uiLanguage === 'ta' ? '1 பெரியவர்' : '1 adult') 
          : `${adults} ${uiLanguage === 'hi' ? 'वयस्क' : uiLanguage === 'ta' ? 'பெரியவர்கள்' : 'adults'}`;
        const childText = newChildren === 0 
          ? '' 
          : newChildren === 1 
            ? (uiLanguage === 'hi' ? '1 बच्चा' : uiLanguage === 'ta' ? '1 குழந்தை' : '1 child')
            : `${newChildren} ${uiLanguage === 'hi' ? 'बच्चे' : uiLanguage === 'ta' ? 'குழந்தைகள்' : 'children'}`;
        setTripPassengers(childText ? `${adultText}, ${childText}` : adultText);
    };

    const budgetStarCount = useMemo(() => parseBudgetStarCount(tripBudget), [tripBudget]);

    function handleBudgetChange(rating: number): void {
        setTripBudget(budgetRatingToString(rating, t));
    }

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
        () => `${phoneCountryCode}${phoneNumber}`.trim(),
        [phoneCountryCode, phoneNumber]
    );

    const emailValidation = useMemo(() =>
        emailSchema.safeParse(userEmail.trim()).success,
        [userEmail]);

    const canSubmit =
        normalizedUserName.length > 1 &&
        phoneValidation &&
        emailValidation &&
        translatedTranscript.trim().length > 0 &&
        !isSubmitting &&
        !isTranslating;

    // ── Direct-visit guard ────────────────────────────────────────────────────
    // If someone lands on /review without going through /record first the store
    // will have no transcript. Redirect them back gracefully.
    // Must be after all hooks to comply with Rules of Hooks.
    useEffect(() => {
        if (!originalTranscript.trim()) {
            router.replace("/record");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount only

    // ── Submit handler ────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        // Hard guard against double-submit (e.g. rapid tap on mobile)
        if (submittingRef.current) return;

        const nameResult = nameSchema.safeParse(userName);
        if (!nameResult.success) {
            setNameError(t("errorName"));
            return;
        }
        if (!emailValidation) {
            setEmailError(t("errorEmail"));
            return;
        }
        if (!phoneValidation) {
            setPhoneError(t("errorPhone"));
            return;
        }
        if (!translatedTranscript.trim()) {
            setErrorMessage(t("errorTranscript"));
            return;
        }

        setNameError(null);
        setPhoneError(null);
        setEmailError(null);
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
                // New fields (Phase 3)
                ui_language: uiLanguage,
                user_email: userEmail.trim(),
                audio_url: audioUrl,
                trip_city: tripCity,
                trip_dates_from: tripDatesFrom,
                trip_dates_to: tripDatesTo,
                trip_passengers: tripPassengers,
                trip_budget: tripBudget,
            });

            // Clear sessionStorage and navigate
            try { sessionStorage.setItem("query_submitted", "1"); } catch { /* private mode */ }
            
            // Wait: we call reset() in confirmation handleSubmitAnother, but let's reset here as well
            // as required by Step 3.4: "After a successful submission, call reset() on the store to clear all trip fields and contact info."
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

    // Auto-translation handles this automatically on user input debounce

    // Show inline email validation error as the user types
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserEmail(value);
        if (value.trim().length > 0 && !emailSchema.safeParse(value.trim()).success) {
            setEmailError(t("errorEmail"));
        } else {
            setEmailError(null);
        }
    };

    // ── Guard: render nothing while redirect is pending or before mount ───────
    // Prevents a flash of the empty form before useEffect fires and avoids hydration mismatches.
    if (!hasMounted || !originalTranscript.trim()) return null;

    return (
        <div className="pt-12 min-h-screen bg-[#F4F1EB]">
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">

                {/* Page header */}
                <div className="flex flex-col gap-1.5">
                    <div className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#E85D22]" aria-hidden />
                        <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                            {t("reviewStep")}
                        </span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-4xl">
                        {t("reviewTitle")}
                    </h1>
                    <p className="text-sm font-light text-[#6B6A68] mt-1">
                        {t("reviewSubtitle")}
                    </p>
                </div>

                {/* Error */}
                {errorMessage && <ErrorBanner message={errorMessage} />}

                {/* Card 1 — Transcripts */}
                <Card padding="lg">
                    <div className="flex flex-col gap-5">

                        {/* Original transcript (editable) */}
                        {originalTranscript && (
                            <div className="flex flex-col gap-3">
                                <TranscriptEditor
                                    id="transcript-original"
                                    label={t("reviewOriginalTranscriptLabel")}
                                    value={originalTranscript}
                                    onChange={setOriginalTranscript}
                                    placeholder="Enter your query in your local language..."
                                />
                                {isTranslating && (
                                    <div className="flex items-center justify-end gap-1.5 text-xs text-[#E85D22] font-semibold -mt-1.5 h-4">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>{t("reviewTranslatingStatus")}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-[#E8E5DF]" />

                        {/* Translated transcript */}
                        <TranscriptEditor
                            value={translatedTranscript}
                            onChange={setTranslatedTranscript}
                            placeholder={isTranslating ? "Translating…" : "Your translated message will appear here…"}
                        />

                    </div>
                </Card>

                {/* Card 2 — Trip Details */}
                <Card padding="lg">
                    <div className="flex flex-col gap-5">
                        <h2 className="text-xs font-bold tracking-[0.08em] uppercase text-[#111111] border-b border-[#E8E5DF] pb-2">
                            Trip Details
                        </h2>

                        {/* Destination */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="review-trip-city" className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                                {t("reviewCityLabel")}
                            </label>
                            <input
                                id="review-trip-city"
                                type="text"
                                className="h-11 w-full rounded-xl border border-[#E8E5DF] bg-white px-4 text-sm font-light text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E85D22] focus:ring-2 focus:ring-[#E85D22]/20 transition-colors"
                                placeholder={t("reviewNotProvided")}
                                value={tripCity}
                                onChange={(e) => setTripCity(e.target.value)}
                            />
                        </div>

                        {/* Travel dates */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                                {t("reviewDatesLabel")}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-semibold tracking-[0.05em] uppercase text-[#9CA3AF]">
                                        From Date
                                    </span>
                                    <input
                                        type="date"
                                        className="h-11 w-full rounded-xl border border-[#E8E5DF] bg-white px-4 text-sm font-light text-[#111111] focus:outline-none focus:border-[#E85D22] focus:ring-2 focus:ring-[#E85D22]/20 transition-colors cursor-pointer"
                                        value={tripDatesFrom}
                                        onChange={(e) => setTripDatesFrom(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-semibold tracking-[0.05em] uppercase text-[#9CA3AF]">
                                        To/Return Date
                                    </span>
                                    <input
                                        type="date"
                                        className="h-11 w-full rounded-xl border border-[#E8E5DF] bg-white px-4 text-sm font-light text-[#111111] focus:outline-none focus:border-[#E85D22] focus:ring-2 focus:ring-[#E85D22]/20 transition-colors cursor-pointer"
                                        value={tripDatesTo}
                                        onChange={(e) => setTripDatesTo(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Passengers */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                                {t("reviewPassengersLabel")}
                            </label>
                            <div className="flex flex-col gap-4 w-full bg-[#F9F8F5] p-5 rounded-2xl border border-[#E8E5DF] shadow-sm">
                                {/* Adults Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-semibold text-[#111111]">
                                            {t('popupAdultsLabel')}
                                        </span>
                                        <span className="text-[11px] text-[#6B6A68] font-light mt-0.5">
                                            {t('popupAdultsSub')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white border border-[#E8E5DF] rounded-xl px-2 py-1 shadow-sm">
                                        <button
                                            type="button"
                                            onClick={() => handleAdultsChange(Math.max(1, adults - 1))}
                                            disabled={adults <= 1}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E8E5DF] text-[#111111] hover:bg-[#E85D22]/5 hover:border-[#E85D22]/30 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer font-bold text-lg select-none"
                                            aria-label="Decrease adults"
                                        >
                                            <Minus className="w-4 h-4 text-[#111111]" />
                                        </button>
                                        <span className="text-base font-semibold min-w-[20px] text-center font-mono select-none">
                                            {adults}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleAdultsChange(Math.min(10, adults + 1))}
                                            disabled={adults >= 10}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E8E5DF] text-[#111111] hover:bg-[#E85D22]/5 hover:border-[#E85D22]/30 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer font-bold text-lg select-none"
                                            aria-label="Increase adults"
                                        >
                                            <Plus className="w-4 h-4 text-[#111111]" />
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-[#E8E5DF]/60" />

                                {/* Children Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-semibold text-[#111111]">
                                            {t('popupChildrenLabel')}
                                        </span>
                                        <span className="text-[11px] text-[#6B6A68] font-light mt-0.5">
                                            {t('popupChildrenSub')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white border border-[#E8E5DF] rounded-xl px-2 py-1 shadow-sm">
                                        <button
                                            type="button"
                                            onClick={() => handleChildrenChange(Math.max(0, childrenCount - 1))}
                                            disabled={childrenCount <= 0}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E8E5DF] text-[#111111] hover:bg-[#E85D22]/5 hover:border-[#E85D22]/30 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer font-bold text-lg select-none"
                                            aria-label="Decrease children"
                                        >
                                            <Minus className="w-4 h-4 text-[#111111]" />
                                        </button>
                                        <span className="text-base font-semibold min-w-[20px] text-center font-mono select-none">
                                            {childrenCount}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleChildrenChange(Math.min(10, childrenCount + 1))}
                                            disabled={childrenCount >= 10}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E8E5DF] text-[#111111] hover:bg-[#E85D22]/5 hover:border-[#E85D22]/30 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer font-bold text-lg select-none"
                                            aria-label="Increase children"
                                        >
                                            <Plus className="w-4 h-4 text-[#111111]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Budget Star Selector */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                                {t("reviewBudgetLabel")}
                            </label>
                            <div className="rounded-xl border border-[#E8E5DF] bg-[#F9F8F5] p-4 flex flex-col items-center shadow-sm">
                                <BudgetStarSelector
                                    value={budgetStarCount}
                                    onChange={handleBudgetChange}
                                />
                            </div>
                        </div>

                    </div>
                </Card>

                {/* Card 3 — Contact details */}
                <Card padding="lg">
                    <div className="flex flex-col gap-5">
                        <h2 className="text-xs font-bold tracking-[0.08em] uppercase text-[#111111] border-b border-[#E8E5DF] pb-2">
                            Contact Details
                        </h2>

                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="review-user-name" className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                                {t("reviewNameLabel")}
                            </label>
                            <input
                                id="review-user-name"
                                name="user_name"
                                type="text"
                                autoComplete="name"
                                placeholder={t("reviewNameLabel")}
                                aria-invalid={nameError ? true : undefined}
                                className="h-11 w-full rounded-xl border border-[#E8E5DF] bg-white px-4 text-sm font-light text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E85D22] focus:ring-2 focus:ring-[#E85D22]/20 transition-colors"
                                value={userName}
                                onChange={(e) => { setUserName(e.target.value); setNameError(null); }}
                            />
                            {nameError && (
                                <p className="text-[12px] font-light text-red-600">{nameError}</p>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-[#E8E5DF]" />

                        {/* Email Address */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="review-user-email" className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6A68]">
                                {t("reviewEmailLabel")}
                            </label>
                            <input
                                id="review-user-email"
                                name="user_email"
                                type="email"
                                autoComplete="email"
                                placeholder={t("reviewEmailPlaceholder")}
                                aria-invalid={emailError ? true : undefined}
                                className="h-11 w-full rounded-xl border border-[#E8E5DF] bg-white px-4 text-sm font-light text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E85D22] focus:ring-2 focus:ring-[#E85D22]/20 transition-colors"
                                value={userEmail}
                                onChange={handleEmailChange}
                            />
                            {emailError && (
                                <p role="alert" className="text-[12px] font-light text-red-600">{emailError}</p>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-[#E8E5DF]" />

                        {/* Phone */}
                        <PhoneInput
                            countryCode={phoneCountryCode}
                            number={phoneNumber}
                            onCountryCodeChange={setPhoneCountryCode}
                            onNumberChange={(v) => { setPhoneNumber(v); setPhoneError(null); }}
                            error={phoneError ?? undefined}
                        />

                    </div>
                </Card>

                {/* Send CTA + Back */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                        size="lg"
                        className="w-full sm:flex-1 touch-manipulation"
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                        aria-busy={isSubmitting}
                    >
                        {isSubmitting ? t("reviewSending") : t("reviewSend")}
                    </Button>
                    <Link
                        href="/record"
                        className="flex items-center justify-center sm:justify-start gap-1 text-sm font-medium text-[#6B6A68] hover:text-[#E85D22] transition-colors whitespace-nowrap px-2 py-2"
                    >
                        {t("reviewBack")}
                    </Link>
                </div>

                {/* Bottom ticker */}
                <div className="border-t border-[#E8E5DF] pt-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#9CA3AF] tracking-[0.05em] uppercase">{t("reviewStep")}</span>
                    <span className="text-[11px] text-[#D5D0C4] tracking-widest">/ / / / /</span>
                </div>

            </div>
        </div>
    );
}
