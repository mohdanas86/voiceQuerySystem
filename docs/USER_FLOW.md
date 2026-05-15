# User Flow

## Overview

```
/record  →  /review  →  /confirmation
   │            │              │
 Record      Edit + Send    Thank you
```

---

## Screen 1 — Record (`/record`)

**User actions**

1. Choose spoken language (Auto-detect, English, Hindi, Urdu, Tamil, Telugu, Marathi, Kannada, Gujarati, Bengali).
2. Tap mic to start recording; tap again to stop (or wait for 60s auto-stop).
3. Wait while audio is processed (status: processing).
4. Read the transcript preview in the original language.
5. Tap **Continue to review** (enabled only when transcript is non-empty).

**UI elements**

- Language dropdown (`LanguageSelect`)
- Recording timer (`00:00 / 01:00`)
- Mic button with states: idle, recording, processing, done
- Transcript preview panel
- Error banner on mic or API failure

**Technical notes**

- Audio captured via `MediaRecorder` (WebM/Opus when supported).
- `POST /api/aai/transcribe` returns `text` and `translated_texts.en`.
- Original text stored in Zustand; English translation stored for the review screen.

---

## Screen 2 — Review (`/review`)

**User actions**

1. Edit the **Transcript (English)** textarea.
2. Select country code and enter the national number.
3. Tap **Send** when enabled.

**Validation**

- Transcript must not be empty.
- Country code: `+` and 1–4 digits.
- Number: 6–15 digits (spaces allowed).
- Invalid submit attempt shows: *"Please enter a valid number with country code."*

**Send behaviour**

1. Build `phone_full` (e.g. `+91 98765 43210`).
2. EmailJS sends `original_query`, `translated_query`, `phone`, `submitted_at`.
3. Optional `submitQuery` to backend or `/api/queries` fallback.
4. Clear store and navigate to confirmation.

**Mobile layout**

- Send button is sticky at the bottom on small screens for easier reach.

---

## Screen 3 — Confirmation (`/confirmation`)

**User sees**

- Green animated checkmark
- Message: *"Thank you for your query. Our team will get back to you shortly."*
- **Submit another query** → returns to `/record`

No form fields on this screen.

---

## State between screens

| Field | Set on | Used on |
|-------|--------|---------|
| `sourceLanguage` | Record | Email / API payload |
| `originalTranscript` | Record | Email |
| `translatedTranscript` | Record, editable on Review | Email, validation |
| `phoneCountryCode` | Review (default `+91`) | Validation, email |
| `phoneNumber` | Review | Validation, email |

State lives in `useQueryStore` and resets after successful send.

---

## Error paths

| Situation | User feedback |
|-----------|----------------|
| Browser has no `MediaRecorder` | Banner on record screen |
| Mic permission denied | Error message, recording idle |
| Transcription API error | Banner with API detail when available |
| Invalid phone on Send | Inline error under phone field |
| EmailJS / network failure | Banner on review screen |
