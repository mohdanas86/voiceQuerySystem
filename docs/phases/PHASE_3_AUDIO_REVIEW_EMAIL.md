# Phase 3 â€” Audio Upload + Review Screen + Dual Email

**Goal:** Upload the voice recording to Supabase (free, gives a public URL), rework the review screen to show all trip fields and collect the user's email, then send two emails: one to the customer in their language (with a copy of their query), one to the ops team in English (with audio link, original query, English translation, and all trip details).

**Duration:** 4â€“5 days  
**Depends on:** Phase 2 complete and verified (all checklist items passed).

**Must read before starting:**
- [CODE_STANDARDS.md](../CODE_STANDARDS.md)
- [FREE_TOOLS.md](../FREE_TOOLS.md) â€” Supabase setup instructions are here

---

## What You Are Changing in This Phase

| File | Action | Why |
|---|---|---|
| `frontend/app/api/audio/upload/route.ts` | CREATE | Receives audio Blob, uploads to Supabase, returns public URL |
| `frontend/app/record/page.tsx` | MODIFY | After transcription, also upload audio to Supabase |
| `frontend/store/useQueryStore.ts` | Already done in Phase 1 | `audioUrl` and `setAudioUrl` already added |
| `frontend/types/query.ts` | MODIFY | Add `user_email`, `audio_url`, `ui_language`, all `trip_*` fields |
| `frontend/app/review/page.tsx` | MAJOR REWORK | Trip fields, BudgetStarSelector, email field, i18n labels |
| `frontend/lib/email.ts` | MAJOR REWORK | Two functions: `sendCustomerEmail`, `sendOpsEmail` |
| `frontend/app/api/queries/route.ts` | MODIFY | Validate new fields, save `audio_url`, call both email functions |
| `frontend/app/confirmation/page.tsx` | MODIFY | Message in user's language, navigation to `/` |

**Do NOT touch:** `lib/tripExtractor.ts`, `components/popups/BudgetStarSelector.tsx`, `lib/i18n.ts`

---

## Step 3.0 â€” Install New Package and Set Up Supabase

### Install

```bash
cd frontend
npm install @supabase/supabase-js
```

### Supabase Setup (One-Time â€” Follow [FREE_TOOLS.md](../FREE_TOOLS.md) Step 4)

After setting up Supabase, add these to `frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

> âš ï¸ `SUPABASE_SERVICE_ROLE_KEY` must NEVER have the `NEXT_PUBLIC_` prefix. It bypasses row-level security. If it leaks, anyone can read/delete your stored recordings.

Verify the build still passes after install:

```bash
npm run build   # must pass with 0 errors
```

---

## Step 3.1 â€” Create `frontend/app/api/audio/upload/route.ts`

This API route receives a voice recording Blob from the browser, uploads it to Supabase Storage, and returns the public URL.

**Full file content:**

```ts
/**
 * route.ts â€” POST /api/audio/upload
 * Receives a voice recording, uploads it to Supabase Storage,
 * and returns the public URL for inclusion in ops emails.
 * Voice Query System | Ulavi Technologies
 */

// â”€â”€ SERVER ONLY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// This file runs on the server (Next.js API route). Rules:
// 1. Do NOT import browser APIs.
// 2. SUPABASE_SERVICE_ROLE_KEY must NOT have NEXT_PUBLIC_ prefix.
// 3. Never log the audio file contents or the service role key.

import { createClient } from '@supabase/supabase-js';

/** Supabase bucket where recordings are stored. Must be set to PUBLIC. */
const SUPABASE_BUCKET_NAME = 'voice-recordings';

/** Length of the random suffix in the filename (for uniqueness). */
const FILENAME_RANDOM_SUFFIX_LENGTH = 8;

/** Audio file extension from MediaRecorder in Chrome/Safari. */
const AUDIO_FILE_EXTENSION = '.webm';

/**
 * Creates a Supabase client using the service role key.
 * This client bypasses row-level security â€” only use on the server.
 *
 * @returns Authenticated Supabase client
 * @throws If the required environment variables are not set
 */
function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[api/audio/upload] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, key);
}

/**
 * Generates a unique filename for the uploaded recording.
 * Format: {timestamp}-{random-8-chars}.webm
 * Example: 1717123456789-a3f8bc12.webm
 *
 * @returns A unique filename string
 */
function generateUniqueFilename(): string {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomUUID().slice(0, FILENAME_RANDOM_SUFFIX_LENGTH);
  return `${timestamp}-${randomSuffix}${AUDIO_FILE_EXTENSION}`;
}

/**
 * POST /api/audio/upload
 *
 * Accepts: multipart/form-data with a single field named "audio" containing the recording Blob.
 *
 * Returns on success:  { audioUrl: string }   â€” the public Supabase URL
 * Returns on failure:  { error: string, code: string }  â€” with HTTP 502
 *
 * Important: Audio upload failure is non-fatal for the submission flow.
 * The client should continue with audioUrl = "" if this endpoint returns an error.
 */
export async function POST(request: Request): Promise<Response> {
  let supabase;

  try {
    supabase = createSupabaseServerClient();
  } catch (configErr: unknown) {
    // Missing environment variables â€” don't crash the whole app
    console.error('[api/audio/upload] Supabase config error:', configErr);
    return Response.json(
      { error: 'Audio upload unavailable (server configuration error)', code: 'CONFIG_ERROR' },
      { status: 503 },
    );
  }

  // Parse the incoming FormData
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: 'Invalid request â€” expected multipart/form-data', code: 'INVALID_REQUEST' },
      { status: 400 },
    );
  }

  const audioFile = formData.get('audio');
  if (!audioFile || !(audioFile instanceof Blob)) {
    return Response.json(
      { error: 'No audio file found in request (expected field name: "audio")', code: 'MISSING_AUDIO' },
      { status: 400 },
    );
  }

  // Convert Blob to ArrayBuffer for Supabase upload
  const audioBuffer = await audioFile.arrayBuffer();
  const filename = generateUniqueFilename();

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_BUCKET_NAME)
    .upload(filename, audioBuffer, {
      contentType: 'audio/webm',
      upsert: false, // Never overwrite â€” filenames are unique by design
    });

  if (uploadError) {
    console.error('[api/audio/upload] Supabase upload failed:', uploadError.message);
    return Response.json(
      { error: 'Audio upload failed', code: 'UPLOAD_ERROR' },
      { status: 502 },
    );
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from(SUPABASE_BUCKET_NAME)
    .getPublicUrl(filename);

  const audioUrl = publicUrlData.publicUrl;

  return Response.json({ audioUrl }, { status: 200 });
}
```

---

## Step 3.2 â€” Modify `frontend/app/record/page.tsx` â€” Upload Audio

After the transcription succeeds, upload the audio Blob in parallel (non-blocking).

**Add this function to `record/page.tsx`:**

```ts
/**
 * Uploads the recorded audio Blob to Supabase via the /api/audio/upload route.
 * This is non-blocking and non-fatal â€” if the upload fails, the submission flow
 * continues normally, and the ops email will note that audio is unavailable.
 *
 * @param blob - The raw audio Blob from MediaRecorder
 * @returns The public Supabase URL of the uploaded audio, or null on failure
 */
async function uploadAudioBlob(blob: Blob): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');

    const res = await fetch('/api/audio/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      console.warn('[record] audio upload returned non-OK status:', res.status);
      return null;
    }

    const data = (await res.json()) as { audioUrl?: string };
    return data.audioUrl ?? null;
  } catch (err: unknown) {
    // Non-fatal â€” the submission will work without an audio URL
    console.warn('[record] audio upload failed, continuing without audio URL:', err);
    return null;
  }
}
```

**Where to call it:** After `transcribeRecording()` succeeds and the transcript is set, call `uploadAudioBlob()` and store the result. Also, if the user had selected `auto` (Auto-detect) language, check the AssemblyAI transcription result's `language_code` and automatically switch the app's `uiLanguage` to the detected language if it is supported.

```ts
// After transcription completes:
const url = await uploadAudioBlob(recordedBlob);
setAudioUrl(url ?? '');

// Auto-detect UI Language Switch (Problem 1 from main plan)
if (uiLanguage === 'auto' && transcribeResult.language_code) {
  const detected = transcribeResult.language_code as SupportedLang;
  // Verify that the detected language code is supported by our dictionary
  const SUPPORTED_LANGUAGES: SupportedLang[] = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr'];
  if (SUPPORTED_LANGUAGES.includes(detected)) {
    setUiLanguage(detected);
    // Optional: Show a brief toast notification to inform the user, e.g.:
    // "We detected Tamil as your language." (localized appropriately or using default toast)
  }
}

// Continue to navigation regardless of whether upload succeeded
```


**Important:** Do not `await` the upload if it would delay showing the transcript to the user. The transcript display and the upload should happen as close to simultaneously as possible.

---

## Step 3.3 â€” Modify `frontend/types/query.ts`

Add the new fields to the existing `QueryPayload` interface:

```ts
// â”€â”€ New fields (Phase 3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Selected UI language code (e.g. 'ta', 'hi', 'en', 'auto'). */
ui_language: string;

/** Customer email address. Non-empty, validated with Zod on the client. */
user_email: string;

/**
 * Public Supabase URL of the voice recording.
 * Empty string ("") if the upload failed â€” the ops email will note this.
 */
audio_url: string;

/** Destination city or location. Empty string if not provided or skipped. */
trip_city: string;

/** Travel start date as free-form text (e.g. "15 Aug 2026"). Empty if not provided. */
trip_dates_from: string;

/** Travel end/return date as free-form text. Empty if not provided. */
trip_dates_to: string;

/** Number of passengers as free-form text (e.g. "2 adults, 1 child"). Empty if not provided. */
trip_passengers: string;

/**
 * Budget tier as a star-prefixed string.
 * Format: "â­â­â­ Mid-range (â‚¹25,000 â€“ â‚¹50,000/person)"
 * Empty string if the user skipped the budget selection.
 */
trip_budget: string;
```

---

## Step 3.4 â€” Major Rework: `frontend/app/review/page.tsx`

The review page is the most significant change in Phase 3. Read this section completely before writing any code.

### What the Review Page Must Show

The review page has 3 cards:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Card 1: YOUR QUERY                       â”‚
â”‚ [Editable textarea â€” original language  â”‚
â”‚  transcript â€” pre-filled from store]     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Card 2: TRIP DETAILS                     â”‚
â”‚ Destination:      [text input]           â”‚
â”‚ Travel from:      [text input]           â”‚
â”‚ Travel to:        [text input]           â”‚
â”‚ No. of travellers:[text input]           â”‚
â”‚ Budget:           [BudgetStarSelector]   â”‚
â”‚  â† Not a text input for budget!          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Card 3: CONTACT DETAILS                  â”‚
â”‚ Your Name:        [text input]           â”‚
â”‚ Email Address:    [email input]          â”‚
â”‚ Mobile Number:    [phone input]          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

[â† Back]                    [Send query â†’]
```

### i18n Labels

Every label, placeholder, button, and error message must use `t(uiLanguage, key)`.

```ts
const { uiLanguage, originalTranscript, tripCity, tripDatesFrom, tripDatesTo,
        tripPassengers, tripBudget, userEmail, audioUrl,
        setTripCity, setTripDatesFrom, setTripDatesTo, setTripPassengers,
        setTripBudget, setUserEmail } = useQueryStore();
```

### Pre-fill Logic

All trip detail fields are pre-filled from the Zustand store:

```tsx
<input
  type="text"
  value={tripCity}
  onChange={(e) => setTripCity(e.target.value)}
  placeholder={t(uiLanguage, 'reviewNotProvided')}
/>
```

### Budget Field on Review

The budget field uses `BudgetStarSelector`, not a text input:

```tsx
import { BudgetStarSelector, budgetRatingToString } from '@/components/popups/BudgetStarSelector';

// Parse the current tripBudget string back to a star count
// The string starts with N stars (â­), so count them
function parseBudgetStarCount(budgetString: string): number {
  if (!budgetString) return 0;
  const starCount = [...budgetString].filter((char) => char === 'â­').length;
  return Math.min(starCount, 5); // Cap at 5 just in case
}

const [budgetStarCount, setBudgetStarCount] = useState<number>(
  () => parseBudgetStarCount(tripBudget)
);

// When the star selection changes, update the store with the new star string
function handleBudgetChange(rating: number): void {
  setBudgetStarCount(rating);
  setTripBudget(budgetRatingToString(rating, uiLanguage));
}

// In JSX:
<BudgetStarSelector
  value={budgetStarCount}
  onChange={handleBudgetChange}
  lang={uiLanguage}
/>
```

### Email Validation with Zod

```bash
# Zod is already a dependency â€” no need to install
```

```ts
import { z } from 'zod';

const emailSchema = z.string().email();

/**
 * Validates the email address string.
 * @param email - Raw email string from the input
 * @returns true if valid, false otherwise
 */
function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email.trim()).success;
}
```

Show the error message inline below the email input:

```tsx
{!isValidEmail(userEmail) && userEmail.length > 0 && (
  <p role="alert" style={{ color: 'red' }}>
    {t(uiLanguage, 'errorEmail')}
  </p>
)}
```

Note the `role="alert"` â€” this ensures screen readers announce the error.

### canSubmit Logic

```ts
/**
 * Returns true only when all required fields are valid.
 * Trip detail fields (city, dates, passengers, budget) are optional.
 */
const canSubmit: boolean =
  userName.trim().length > 1 &&
  isValidEmail(userEmail) &&
  phoneNumber.trim().length > 4 &&
  translatedTranscript.trim().length > 0 &&
  !isSubmitting &&
  !isTranslating;
```

### What Gets Submitted to `/api/queries`

```ts
const payload: QueryPayload = {
  // Existing fields
  user_name:             userName.trim(),
  source_language:       uiLanguage,
  original_transcript:   originalTranscript,
  translated_transcript: translatedTranscript,
  phone_country_code:    phoneCountryCode,
  phone_number:          phoneNumber.trim(),
  phone_full:            `${phoneCountryCode}${phoneNumber.trim()}`,
  client_timestamp:      new Date().toISOString(),
  client_timezone:       Intl.DateTimeFormat().resolvedOptions().timeZone,

  // New fields (Phase 3)
  ui_language:   uiLanguage,
  user_email:    userEmail.trim(),
  audio_url:     audioUrl,       // '' if upload failed
  trip_city:     tripCity,
  trip_dates_from: tripDatesFrom,
  trip_dates_to:   tripDatesTo,
  trip_passengers: tripPassengers,
  trip_budget:     tripBudget,   // star string or ''
};
```

After a successful submission, call `reset()` on the store to clear all trip fields and contact info.

---

## Step 3.5 â€” Create Two EmailJS Templates

In the EmailJS dashboard, create exactly two templates. The body content is built server-side â€” the templates are just wrappers.

### Template A â€” Customer Confirmation (`customer_confirmation`)

```
To:      {{to_email}}          â† dynamic, the user's email address
Subject: {{subject_line}}      â† dynamic, sent from server
Body:
{{body_text}}
```

That's it. No other variables. The `body_text` is the full multi-line email body in the user's language, composed on the server.

### Template B â€” Ops Notification (`ops_notification`)

```
To:      support@ulavitech.com   â† hardcoded in the template "To" field
Subject: New Travel Query â€” {{trip_city}} â€” {{phone}}
Body:

New Travel Query Received
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Customer: {{customer_name}}
Language: {{original_query_language}}

Original Query ({{original_query_language}}):
{{original_query}}

English Translation:
{{english_translation}}

ðŸŽ™ Voice Recording:
{{audio_line}}

â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
TRIP DETAILS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Destination:        {{trip_city}}
Travel Dates:       {{trip_dates}}
Passengers:         {{trip_passengers}}
Budget:             {{trip_budget}}

â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CONTACT DETAILS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Email:  {{user_email}}
Phone:  {{phone}}

Submitted at: {{submitted_at}}

â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
âš¡ {{action_prompt}}
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
```

Save both template IDs and update your `.env.local`:

```bash
EMAILJS_CUSTOMER_TEMPLATE_ID=customer_confirmation
EMAILJS_OPS_TEMPLATE_ID=ops_notification
```

---

## Step 3.6 â€” Major Rework: `frontend/lib/email.ts`

Replace the existing `sendSubmissionEmail()` with two dedicated functions.

**Full file content:**

```ts
/**
 * email.ts â€” Server-side email sending via EmailJS REST API.
 * Exports: sendCustomerEmail (user's language), sendOpsEmail (always English).
 * Voice Query System | Ulavi Technologies
 */

// â”€â”€ SERVER ONLY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 1. Never import this file from client components.
// 2. Never prefix keys used here with NEXT_PUBLIC_.
// 3. Never log email addresses, phone numbers, or transcript content.

import { t } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/i18n';

/** EmailJS REST API endpoint for sending emails. */
const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

/** Separator line used in email body formatting. */
const EMAIL_SEPARATOR = 'â”€'.repeat(45);

/** Placeholder shown when a field was not provided by the user. */
const NOT_PROVIDED_EN = 'Not provided';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Parameters for the customer confirmation email. */
interface CustomerEmailParams {
  /** Recipient email address (user's own email). */
  to_email: string;
  /** User's name for personalization. */
  user_name: string;
  /** Language code â€” determines the language of the email body. */
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
  /** Budget tier string (e.g. "â­â­â­ Mid-range"). Empty if not selected. */
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

// â”€â”€ Customer Email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    ? `${params.trip_dates_from}${params.trip_dates_to ? ' â€” ' + params.trip_dates_to : ''}`
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
    templateId: process.env.EMAILJS_CUSTOMER_TEMPLATE_ID!,
    templateParams: {
      to_email:     params.to_email,
      user_name:    params.user_name,
      body_text:    bodyText,
      subject_line: "We've received your travel query â€” Voice Query System",
    },
  });
}

// â”€â”€ Ops Email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  // Build the audio line â€” show the URL if available, otherwise a note
  const audioLine = params.audio_url
    ? `${params.audio_url}`
    : 'Audio recording: Not available (upload failed or timed out)';

  // Build date range
  const tripDatesDisplay = params.trip_dates_from
    ? `${params.trip_dates_from}${params.trip_dates_to ? ' â€” ' + params.trip_dates_to : ''}`
    : NOT_PROVIDED_EN;

  await callEmailJsApi({
    templateId: process.env.EMAILJS_OPS_TEMPLATE_ID!,
    templateParams: {
      customer_name:           params.customer_name,
      original_query_language: params.original_query_language,
      original_query:          params.original_query,
      english_translation:     params.english_translation,
      audio_url:               params.audio_url,
      audio_line:              audioLine,
      trip_city:               params.trip_city || NOT_PROVIDED_EN,
      trip_dates:              tripDatesDisplay,
      trip_passengers:         params.trip_passengers || NOT_PROVIDED_EN,
      trip_budget:             params.trip_budget || NOT_PROVIDED_EN,
      user_email:              params.user_email,
      phone:                   params.phone,
      submitted_at:            params.submitted_at,
      action_prompt:           'Please contact this customer at the earliest to provide a travel quote.',
    },
  });
}

// â”€â”€ Shared Internal Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  const serviceId  = process.env.EMAILJS_SERVICE_ID;
  const publicKey  = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY; // Optional

  if (!serviceId || !publicKey) {
    // This is a configuration error â€” warn loudly but do not crash
    console.warn('[email] EMAILJS_SERVICE_ID or EMAILJS_PUBLIC_KEY is not set â€” skipping email send');
    return;
  }

  const res = await fetch(EMAILJS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:      serviceId,
      template_id:     options.templateId,
      user_id:         publicKey,
      accessToken:     privateKey ?? undefined,
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
```

---

## Step 3.7 â€” Modify `frontend/app/api/queries/route.ts`

### Add Language Names Map

Add this constant near the top of the file (after imports):

```ts
/**
 * Maps SupportedLang codes to their full English display names.
 * Used in ops emails to identify which language the user spoke.
 */
const LANGUAGE_NAMES: Record<string, string> = {
  en:   'English',
  hi:   'Hindi',
  ta:   'Tamil',
  te:   'Telugu',
  kn:   'Kannada',
  ml:   'Malayalam',
  bn:   'Bengali',
  mr:   'Marathi',
  auto: 'Auto-detected',
};
```

### Update `validPayload()` Validation

Add the new fields to the validation check:

```ts
function validPayload(payload: unknown): payload is QueryPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;

  return (
    // Existing required fields
    typeof p.user_name === 'string' && p.user_name.trim().length > 0 &&
    typeof p.original_transcript === 'string' && p.original_transcript.trim().length > 0 &&
    typeof p.phone_full === 'string' && p.phone_full.trim().length > 4 &&

    // New required fields (Phase 3)
    typeof p.user_email === 'string' && p.user_email.includes('@') && // Basic check; Zod validates on client
    typeof p.ui_language === 'string' && p.ui_language.length > 0 &&

    // New optional fields â€” must be present but can be empty strings
    typeof p.audio_url === 'string' &&
    typeof p.trip_city === 'string' &&
    typeof p.trip_dates_from === 'string' &&
    typeof p.trip_dates_to === 'string' &&
    typeof p.trip_passengers === 'string' &&
    typeof p.trip_budget === 'string'
  );
}
```

### Update MongoDB Insert Document

```ts
await db.collection('query_submissions').insertOne({
  // â”€â”€ Existing fields (unchanged) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  user_name:             payload.user_name.trim(),
  source_language:       payload.source_language,
  original_transcript:   payload.original_transcript,
  translated_transcript: payload.translated_transcript,
  phone_country_code:    payload.phone_country_code,
  phone_number:          payload.phone_number,
  phone_full:            payload.phone_full,
  client_timestamp:      payload.client_timestamp,
  client_timezone:       payload.client_timezone,

  // â”€â”€ New fields (Phase 3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ui_language:     payload.ui_language,
  user_email:      payload.user_email.trim(),
  audio_url:       payload.audio_url,        // Supabase public URL or ''
  trip_city:       payload.trip_city,
  trip_dates_from: payload.trip_dates_from,
  trip_dates_to:   payload.trip_dates_to,
  trip_passengers: payload.trip_passengers,
  trip_budget:     payload.trip_budget,      // Star string or ''

  // â”€â”€ Metadata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  status:                'accepted',
  customer_email_sent:   false,
  ops_email_sent:        false,
  created_at:            new Date(),
  ip,
});
```

### Email Execution â€” After DB Write

Both emails are sent AFTER the MongoDB write. They run sequentially (not in parallel) to avoid hitting EmailJS rate limits. One failing must NEVER prevent the other.

```ts
const insertedId = result.insertedId;

// â”€â”€ Customer Email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
try {
  await sendCustomerEmail({
    to_email:        payload.user_email.trim(),
    user_name:       payload.user_name.trim(),
    ui_language:     payload.ui_language as SupportedLang,
    original_query:  payload.original_transcript,
    trip_city:       payload.trip_city,
    trip_dates_from: payload.trip_dates_from,
    trip_dates_to:   payload.trip_dates_to,
    trip_passengers: payload.trip_passengers,
    trip_budget:     payload.trip_budget,
    phone:           payload.phone_full,
    submitted_at:    payload.client_timestamp,
  });

  // Best-effort status update â€” non-fatal if this write fails
  await db.collection('query_submissions').updateOne(
    { _id: insertedId },
    { $set: { customer_email_sent: true, customer_email_sent_at: new Date() } },
  ).catch((updateErr) =>
    console.warn('[api/queries] could not update customer_email_sent flag:', updateErr)
  );
} catch (err: unknown) {
  // Email failure is NON-FATAL â€” the submission is already saved in MongoDB.
  // The ops team can manually resend using the submission ID.
  console.error('[api/queries] customer email FAILED â€” submission id:', insertedId.toString(), err);
}

// â”€â”€ Ops Email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
try {
  await sendOpsEmail({
    customer_name:           payload.user_name.trim(),
    original_query:          payload.original_transcript,
    original_query_language: LANGUAGE_NAMES[payload.ui_language] ?? 'Unknown',
    english_translation:     payload.translated_transcript,
    audio_url:               payload.audio_url,
    trip_city:               payload.trip_city,
    trip_dates_from:         payload.trip_dates_from,
    trip_dates_to:           payload.trip_dates_to,
    trip_passengers:         payload.trip_passengers,
    trip_budget:             payload.trip_budget,
    user_email:              payload.user_email.trim(),
    phone:                   payload.phone_full,
    submitted_at:            payload.client_timestamp,
  });

  await db.collection('query_submissions').updateOne(
    { _id: insertedId },
    { $set: { ops_email_sent: true, ops_email_sent_at: new Date() } },
  ).catch((updateErr) =>
    console.warn('[api/queries] could not update ops_email_sent flag:', updateErr)
  );
} catch (err: unknown) {
  console.error('[api/queries] ops email FAILED â€” submission id:', insertedId.toString(), err);
}
```

---

## Step 3.8 â€” Update `frontend/app/confirmation/page.tsx`

```ts
/**
 * page.tsx â€” Screen 5: Confirmation screen shown after successful query submission.
 * Displays a thank-you message in the user's selected language.
 * Voice Query System | Ulavi Technologies
 */
'use client';
// Client component: uses Zustand store for language and reset, next/navigation.
```

Changes:
1. Read `uiLanguage` from the store
2. Replace ALL hard-coded English text with `t(uiLanguage, key)` calls
3. The "Submit another query" button must navigate to `/` (language picker), not `/record`
4. The "Submit another query" button handler must call `reset()` from the store to clear all trip and contact fields

```tsx
function handleSubmitAnother(): void {
  reset(); // Clears tripCity, tripDates*, tripPassengers, tripBudget, userEmail, audioUrl
           // Does NOT clear uiLanguage â€” user keeps their language preference
  router.push('/');
}
```

---

## Phase 3 Testing â€” Full Verification Checklist

### Build Tests

```bash
cd frontend
npm run build   # 0 errors, 0 TypeScript errors
npm run lint    # 0 lint errors
```

### Audio Upload Tests

- [ ] Complete a recording â†’ wait for "Done" status
- [ ] Open Network tab in Chrome DevTools
- [ ] Verify a `POST /api/audio/upload` request appears
- [ ] Response is `{ audioUrl: "https://xxxx.supabase.co/storage/v1/object/public/voice-recordings/..." }`
- [ ] Opening the URL in a new browser tab plays the audio
- [ ] Supabase dashboard > Storage > voice-recordings shows the file

**Audio upload failure handling (test by temporarily breaking the API):**
- [ ] Temporarily set `NEXT_PUBLIC_SUPABASE_URL=` to empty in .env.local
- [ ] Complete a recording â€” upload will fail
- [ ] The app should still navigate to `/details` (not crash)
- [ ] Submission still works end-to-end
- [ ] Ops email shows "Audio recording: Not available" â€” does NOT show "undefined" or crash
- [ ] Restore the env var after this test

### Review Screen Tests

- [ ] All card labels are in the selected language (Hindi, Tamil, English)
- [ ] Trip fields are pre-filled from the pop-up answers (from Phase 2 flow)
- [ ] Budget field shows `BudgetStarSelector`, pre-filled with the correct star count
- [ ] Changing star selection updates the store immediately
- [ ] Skipped fields show `t(uiLanguage, 'reviewNotProvided')` as placeholder â€” not an error state
- [ ] Email field: empty â†’ "Send query" button disabled
- [ ] Email field: invalid format â†’ inline error message in user's language, button disabled
- [ ] Email field: valid â†’ button enabled (assuming other required fields also valid)
- [ ] Phone field: empty â†’ button disabled
- [ ] Name field: 1 character â†’ button disabled; 2+ characters â†’ enables
- [ ] Editing the transcript textarea â†’ changes are reflected in the payload on submit

### Email Tests

**End-to-end test (use real email addresses):**

For each language (Tamil, Hindi, English):
1. Select the language
2. Record a travel query
3. Complete pop-ups
4. Fill email field with a real email address you own
5. Submit

**Customer email checks:**
- [ ] Customer email arrives at the email address entered
- [ ] Email subject is in English ("We've received your travel query â€” Voice Query System")
- [ ] Email body is in the user's selected language (Hindi body for Hindi, Tamil body for Tamil)
- [ ] Body contains: greeting, original transcript, destination, dates, passengers, budget (star string), email, phone
- [ ] Budget shows as star string: e.g. "â­â­â­ Mid-range (â‚¹25,000 â€“ â‚¹50,000/person)"
- [ ] Skipped fields show "Not provided" (or localised equivalent)
- [ ] No literal "undefined", "null", or "[object Object]" anywhere in the body
- [ ] Email feels personal and trustworthy â€” not like a system message

**Ops email checks:**
- [ ] Ops email arrives at support@ulavitech.com
- [ ] Subject: "New Travel Query â€” [City] â€” [Phone]"
- [ ] Body is ALWAYS in English (even when user selected Tamil or Hindi)
- [ ] Body contains: customer name, language used, original transcript (in user's language), English translation
- [ ] Body contains: clickable audio link (or "Not available" if upload failed)
- [ ] Body contains: all 4 trip details (or "Not provided")
- [ ] Body contains: customer email, phone, submission timestamp
- [ ] Body ends with the action prompt: "Please contact this customer..."

### MongoDB Tests

After a successful submission, check MongoDB Atlas:
- [ ] A new document exists in `query_submissions` collection
- [ ] Document has: `audio_url` (either a URL or empty string)
- [ ] Document has: `user_email` (the email the user entered)
- [ ] Document has: `ui_language`
- [ ] Document has: `trip_city`, `trip_dates_from`, `trip_dates_to`, `trip_passengers`, `trip_budget`
- [ ] Document has: `customer_email_sent: true`
- [ ] Document has: `ops_email_sent: true`
- [ ] Document has: `created_at` timestamp

### Confirmation Screen Tests

- [ ] After submission, confirmation screen shows message in user's language
- [ ] "Submit another query" button navigates to `/` (language picker)
- [ ] After clicking "Submit another query":
  - [ ] Store is reset (tripCity, tripDates, etc. are empty)
  - [ ] uiLanguage is preserved (user keeps their language choice)

### Code Quality Check

- [ ] `api/audio/upload/route.ts` has file header and SERVER ONLY comment
- [ ] `lib/email.ts` has file header and SERVER ONLY comment
- [ ] Both `sendCustomerEmail` and `sendOpsEmail` have full JSDoc
- [ ] `callEmailJsApi` has JSDoc
- [ ] `createSupabaseServerClient` has JSDoc
- [ ] `generateUniqueFilename` has JSDoc
- [ ] All constants are UPPER_SNAKE_CASE
- [ ] No `any` types
- [ ] No `console.log` â€” only `console.warn` and `console.error` with module prefix
- [ ] `npm run lint` returns 0 errors

---

## Common Mistakes to Avoid in Phase 3

| Mistake | Correct Approach |
|---|---|
| Awaiting the audio upload before showing the transcript | Start the upload after transcription; don't block UI |
| Using `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Never prefix the service role key with NEXT_PUBLIC_ |
| Having both emails fail if one throws | Wrap each in its own independent try-catch |
| Showing "undefined" in ops email when audio_url is empty | Use `audio_url || NOT_PROVIDED_EN` before passing to template |
| Budget field on review being a text input | It must be `BudgetStarSelector` â€” same component as in pop-ups |
| Forgetting to call `reset()` after navigation to confirmation | Without reset, next submission starts with old trip data |

---

**Phase 3 is complete when:** All checklist items pass, `npm run build` passes, and you have verified both emails arrive correctly with no "undefined" or missing values, in 3 different languages.

**Next: [Phase 4 â†’ Scale Hardening + Production Polish](./PHASE_4_SCALE_HARDENING.md)**

---

*Ulavi Technologies â€” Confidential*

