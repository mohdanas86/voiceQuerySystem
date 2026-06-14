/**
 * email.ts — Server-side email sending via EmailJS REST API.
 
 */

// ── SERVER ONLY ───────────────────────────────────────────────────────────────
// This file runs on the server (Next.js API route). Rules:
// 1. Do NOT import any browser APIs (window, document, navigator, MediaRecorder).
// 2. Do NOT prefix environment variables with NEXT_PUBLIC_ — they will be
//    exposed to the browser bundle and that is a security vulnerability.
// 3. Do NOT import Zustand store — server has no access to client state.
// 4. Keep secrets (ASSEMBLYAI_API_KEY, MONGODB_URI, etc.) in process.env only.

import { t } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/i18n';
import { translateText } from '@/lib/translate';

/**
 * Translates a static localization key or dynamic text to the target language on the server.
 *
 * @param text - The text to translate
 * @param targetLang - The destination language code
 * @returns The translated string, or the original text if target language is English or statically mapped
 */
async function translateLabel(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'en' || targetLang === 'hi' || targetLang === 'ta' || targetLang === 'auto') {
    return text;
  }
  try {
    const result = await translateText(text, 'en', targetLang);
    return result || text;
  } catch (err: unknown) {
    console.warn(`[lib/email] Failed to translate "${text}" to ${targetLang}:`, err);
    return text;
  }
}

/**
 * Translates a given user-input field (such as city name or passenger counts) to English.
 *
 * @param text - The raw text content in the user's language
 * @param uiLang - The user's active UI language code
 * @returns The translated English string, or original text if the UI language is already English or translation fails
 */
async function translateToEnglish(text: string, uiLang: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || uiLang === 'en') {
    return text;
  }
  try {
    const source = (uiLang === 'auto' || !uiLang) ? 'auto' : uiLang;
    const result = await translateText(trimmed, source, 'en');
    return result || text;
  } catch (err: unknown) {
    console.warn(`[lib/email] Failed to translate "${text}" to en:`, err);
    return text;
  }
}

/** EmailJS REST API endpoint for sending emails. */
const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

const EMAIL_SEPARATOR_LENGTH = 45;

/** Separator line used in email body formatting. */
const EMAIL_SEPARATOR = '─'.repeat(EMAIL_SEPARATOR_LENGTH);

/** Placeholder shown when a field was not provided by the user. */
const NOT_PROVIDED_EN = 'Not provided';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Parameters for the customer confirmation email. */
interface CustomerEmailParams {
  /** Recipient email address (user's own email). */
  to_email: string;
  /** User's name for personalization. */
  user_name: string;
  /** Language code — determines the language of the email body. */
  ui_language: SupportedLang;
  /** Original transcript in the user's language. */
  original_query: string;
  /** Destination city or location. Empty string if not provided. */
  trip_city: string;
  /** Travel start date (free text). Empty if not provided. */
  trip_dates_from: string;
  /** Travel end/return date (free text). Empty if not provided. */
  trip_dates_to: string;
  /** Number of passengers (free text). Empty if not provided. */
  trip_passengers: string;
  /** Budget tier string (e.g. "⭐⭐⭐ Mid-range"). Empty if not selected. */
  trip_budget: string;
  /** Full phone number with country code. */
  phone: string;
  /** ISO 8601 timestamp of when the query was submitted. */
  submitted_at: string;
}

/** Parameters for the ops team notification email. */
interface OpsEmailParams {
  /** Customer's name. */
  customer_name: string;
  /** Original voice query in the user's language. */
  original_query: string;
  /** Language name in English (e.g. "Tamil", "Hindi"). */
  original_query_language: string;
  /** English translation of the query. */
  english_translation: string;
  /** Public Supabase URL of the voice recording. Empty string if upload failed. */
  audio_url: string;
  /** Destination city. Empty if not provided. */
  trip_city: string;
  /** Travel start date. Empty if not provided. */
  trip_dates_from: string;
  /** Travel end/return date. Empty if not provided. */
  trip_dates_to: string;
  /** Passenger count string. Empty if not provided. */
  trip_passengers: string;
  /** Budget tier string. Empty if not provided. */
  trip_budget: string;
  /** Customer's email address. */
  user_email: string;
  /** Customer's full phone number with country code. */
  phone: string;
  /** ISO 8601 timestamp. */
  submitted_at: string;
  /** User's UI language. */
  ui_language?: string;
}

// ── Customer Email ────────────────────────────────────────────────────────────

/**
 * Sends the customer a structured copy of their submitted travel query,
 * written in their preferred language using the i18n dictionary.
 *
 * The email body is pre-composed as plain text on the server so that
 * one generic EmailJS template (customer_confirmation) serves all 8 languages.
 *
 * @param params - All required customer email parameters
 * @throws Will throw if EmailJS returns a non-OK HTTP status.
 *         Callers must wrap this in a try-catch and treat it as non-fatal.
 */
export async function sendCustomerEmail(params: CustomerEmailParams): Promise<void> {
  const lang = params.ui_language;

  // Resolve labels (translated or static)
  const notProvided = await translateLabel(t(lang, 'reviewNotProvided'), lang);
  const confirmBodyText = await translateLabel(t(lang, 'confirmBody'), lang);
  const transcriptLabel = await translateLabel(t(lang, 'reviewTranscriptLabel'), lang);
  const cityLabel = await translateLabel(t(lang, 'reviewCityLabel'), lang);
  const datesLabel = await translateLabel(t(lang, 'reviewDatesLabel'), lang);
  const passengersLabel = await translateLabel(t(lang, 'reviewPassengersLabel'), lang);
  const budgetLabel = await translateLabel(t(lang, 'reviewBudgetLabel'), lang);
  const emailLabel = await translateLabel(t(lang, 'reviewEmailLabel'), lang);
  const phoneLabel = await translateLabel(t(lang, 'reviewPhoneLabel'), lang);
  const outreachLabel = await translateLabel('Our team will reach out to you very soon.', lang);
  const subjectLine = await translateLabel("We've received your travel query — Ulavi Technologies", lang);

  // Build the date range display string
  const datesDisplay = params.trip_dates_from
    ? `${params.trip_dates_from}${params.trip_dates_to ? ' — ' + params.trip_dates_to : ''}`
    : notProvided;

  // Build body as an array of lines, then join with newlines
  // (Avoids template literal indentation issues)
  const bodyLines = [
    confirmBodyText,
    '',
    EMAIL_SEPARATOR,
    `${transcriptLabel}:`,
    params.original_query,
    '',
    EMAIL_SEPARATOR,
    `${cityLabel}: ${params.trip_city || notProvided}`,
    `${datesLabel}: ${datesDisplay}`,
    `${passengersLabel}: ${params.trip_passengers || notProvided}`,
    `${budgetLabel}: ${params.trip_budget || notProvided}`,
    '',
    EMAIL_SEPARATOR,
    `${emailLabel}: ${params.to_email}`,
    `${phoneLabel}: ${params.phone}`,
    '',
    outreachLabel,
  ];

  const bodyText = bodyLines.join('\n');

  await callEmailJsApi({
    templateId: process.env.EMAILJS_CUSTOMER_TEMPLATE_ID || 'customer_confirmation',
    templateParams: {
      to_email: params.to_email,
      user_name: params.user_name,
      body_text: bodyText,
      subject_line: subjectLine,
    },
  });
}

// ── Ops Email ─────────────────────────────────────────────────────────────────

/**
 * Sends the operations team a structured English email containing:
 * - Customer's original query (in their language) + English translation
 * - A link to the voice recording on Supabase Storage
 * - All 4 trip details
 * - Customer contact information
 * - Action prompt
 *
 * This email is ALWAYS in English, regardless of the user's language selection.
 *
 * @param params - All required ops email parameters
 * @throws Will throw if EmailJS returns a non-OK HTTP status.
 *         Callers must wrap this in a try-catch and treat it as non-fatal.
 */
export async function sendOpsEmail(params: OpsEmailParams): Promise<void> {
  const uiLang = params.ui_language || 'en';

  // Translate trip details to English for the support/ops team if the UI language was not English
  const englishTripCity = await translateToEnglish(params.trip_city, uiLang);
  const englishTripPassengers = await translateToEnglish(params.trip_passengers, uiLang);
  const englishTripBudget = await translateToEnglish(params.trip_budget, uiLang);

  // Build the audio line — show the URL if available, otherwise a note
  const audioLine = params.audio_url
    ? `<a href="${params.audio_url}" target="_blank" style="color:#E85D22;font-weight:700;text-decoration:underline;">Listen to Voice Recording</a>`
    : 'Audio recording: Not available (upload failed or timed out)';

  // Build date range
  const tripDatesDisplay = params.trip_dates_from
    ? `${params.trip_dates_from}${params.trip_dates_to ? ' — ' + params.trip_dates_to : ''}`
    : NOT_PROVIDED_EN;

  await callEmailJsApi({
    templateId: process.env.EMAILJS_OPS_TEMPLATE_ID || 'ops_notification',
    templateParams: {
      customer_name: params.customer_name,
      original_query_language: params.original_query_language,
      original_query: params.original_query,
      english_translation: params.english_translation,
      audio_url: params.audio_url,
      audio_line: audioLine,
      trip_city: englishTripCity || NOT_PROVIDED_EN,
      trip_dates: tripDatesDisplay,
      trip_passengers: englishTripPassengers || NOT_PROVIDED_EN,
      trip_budget: englishTripBudget || NOT_PROVIDED_EN,
      user_email: params.user_email,
      phone: params.phone,
      submitted_at: params.submitted_at,
      action_prompt: 'Please contact this customer at the earliest to provide a travel quote.',
    },
  });
}

// ── Shared Internal Helper ────────────────────────────────────────────────────

/**
 * Makes a POST request to the EmailJS REST API to send a templated email.
 * Used by both sendCustomerEmail and sendOpsEmail.
 *
 * @param options.templateId     - The EmailJS template ID to use
 * @param options.templateParams - Key-value pairs for the template variables
 * @throws Error if EmailJS responds with a non-OK HTTP status
 */
async function callEmailJsApi(options: {
  templateId: string;
  templateParams: Record<string, string>;
}): Promise<void> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY || process.env.EMAILJS_ACCESS_TOKEN; // Fallback

  if (!serviceId || !publicKey) {
    // This is a configuration error — warn loudly but do not crash
    console.warn('[email] EMAILJS_SERVICE_ID or EMAILJS_PUBLIC_KEY is not set — skipping email send');
    return;
  }

  const res = await fetch(EMAILJS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: options.templateId,
      user_id: publicKey,
      accessToken: privateKey ?? undefined,
      template_params: options.templateParams,
    }),
  });

  if (!res.ok) {
    const responseBody = await res.text().catch(() => '(unreadable response body)');
    throw new Error(
      `[email] EmailJS responded with ${res.status} for template "${options.templateId}": ${responseBody}`
    );
  }
}
