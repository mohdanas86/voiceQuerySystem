/**
 * email.ts — Server-side email sending via EmailJS REST API.
 * Exports: sendCustomerEmail (user's language), sendOpsEmail (always English).
 * Ulavi Technologies
 */

// ── SERVER ONLY ───────────────────────────────────────────────────────────────
// 1. Never import this file from client components.
// 2. Never prefix keys used here with NEXT_PUBLIC_.
// 3. Never log email addresses, phone numbers, or transcript content.

import { t } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/i18n';

/** EmailJS REST API endpoint for sending emails. */
const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

/** Separator line used in email body formatting. */
const EMAIL_SEPARATOR = '─'.repeat(45);

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
  const notProvided = t(lang, 'reviewNotProvided');

  // Build the date range display string
  const datesDisplay = params.trip_dates_from
    ? `${params.trip_dates_from}${params.trip_dates_to ? ' — ' + params.trip_dates_to : ''}`
    : notProvided;

  // Build body as an array of lines, then join with newlines
  // (Avoids template literal indentation issues)
  const bodyLines = [
    t(lang, 'confirmBody'),
    '',
    EMAIL_SEPARATOR,
    `${t(lang, 'reviewTranscriptLabel')}:`,
    params.original_query,
    '',
    EMAIL_SEPARATOR,
    `${t(lang, 'reviewCityLabel')}: ${params.trip_city || notProvided}`,
    `${t(lang, 'reviewDatesLabel')}: ${datesDisplay}`,
    `${t(lang, 'reviewPassengersLabel')}: ${params.trip_passengers || notProvided}`,
    `${t(lang, 'reviewBudgetLabel')}: ${params.trip_budget || notProvided}`,
    '',
    EMAIL_SEPARATOR,
    `${t(lang, 'reviewEmailLabel')}: ${params.to_email}`,
    `${t(lang, 'reviewPhoneLabel')}: ${params.phone}`,
    '',
    'Our team will reach out to you very soon.',
  ];

  const bodyText = bodyLines.join('\n');

  await callEmailJsApi({
    templateId: process.env.EMAILJS_CUSTOMER_TEMPLATE_ID || 'customer_confirmation',
    templateParams: {
      to_email: params.to_email,
      user_name: params.user_name,
      body_text: bodyText,
      subject_line: "We've received your travel query — Ulavi Technologies",
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
      trip_city: params.trip_city || NOT_PROVIDED_EN,
      trip_dates: tripDatesDisplay,
      trip_passengers: params.trip_passengers || NOT_PROVIDED_EN,
      trip_budget: params.trip_budget || NOT_PROVIDED_EN,
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
