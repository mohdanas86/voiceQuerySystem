# Voice Query System — Implementation Plan
### Upgrading the Voice Query System to the Full Travel Query Platform

**Author:** [Anas Alam](https://linkedin.com/in/anas86/) — SDE  
**Target:** 100,000+ concurrent users  
**Base project:** `voiceQuerySystem` (Next.js 16, Zustand, AssemblyAI, MongoDB, EmailJS)

---

## Code Writing Standards (Mandatory for Every File)

Every file written in this project must follow these rules without exception. These are not preferences — they are hard requirements for code review.

### 1. Naming Conventions

```
Variables:       camelCase         → tripCity, userEmail, isSubmitting
Constants:       UPPER_SNAKE_CASE  → MAX_RECORD_SECONDS, POLL_INTERVAL_MS
Types/Interfaces:PascalCase        → TripDetails, QueryPayload, SupportedLang
Components:      PascalCase        → TripDetailPopup, BudgetStarSelector
Files:           kebab-case        → trip-extractor.ts, budget-star-selector.tsx
API routes:      kebab-case dirs   → /api/aai/transcribe, /api/queries
Env vars:        UPPER_SNAKE_CASE  → ASSEMBLYAI_API_KEY, MONGODB_URI
```

### 2. Every Function Needs a JSDoc Comment

Writing a function without a description is forbidden. The reader must understand what a function does WITHOUT reading its body.

```ts
// BAD — no comment, reader must decode the logic
export function check(t: string) {
  return /\d+/.test(t);
}

// GOOD — clear intent, clear params, clear return
/**
 * Returns true if the transcript contains a digit sequence
 * that likely represents a passenger count or numeric budget.
 *
 * @param transcript - Raw transcribed text from AssemblyAI
 * @returns true if a number pattern is found, false otherwise
 */
export function containsNumericDetail(transcript: string): boolean {
  return /\d+/.test(t);
}
```

### 3. No Magic Values — Name Every Constant

```ts
// BAD
if (elapsed >= 60) stopRecording();
setTimeout(navigate, 1000);

// GOOD
const MAX_RECORD_SECONDS = 60;
const POST_DETECTION_DELAY_MS = 1_000;

if (elapsed >= MAX_RECORD_SECONDS) stopRecording();
setTimeout(navigate, POST_DETECTION_DELAY_MS);
```

### 4. One Responsibility Per Function

A function that does two things must be split into two functions. A component that handles state, rendering, AND network calls must be split.

```ts
// BAD — one function does 3 things
async function handleSend() {
  validateForm();
  await fetch('/api/queries', ...);
  router.push('/confirmation');
}

// GOOD — each responsibility is a named unit
function validateContactForm(...) { ... }
async function submitQuery(payload: QueryPayload) { ... }
function navigateToConfirmation() { ... }

async function handleSend() {
  if (!validateContactForm(...)) return;
  await submitQuery(buildPayload());
  navigateToConfirmation();
}
```

### 5. Explicit Types — No `any`, No Implicit Returns

```ts
// BAD
const result = await fetch(url).then(r => r.json());
function buildPayload(data) { return { ...data }; }

// GOOD
const result = await fetch(url).then((r) => r.json()) as TranscriptResponse;
function buildPayload(data: ReviewFormState): QueryPayload { return { ...data }; }
```

### 6. Error Handling Must Be Explicit

Every `await` call inside a try-catch must have a specific error path. Never swallow errors silently.

```ts
// BAD
try {
  await sendCustomerEmail(params);
} catch {}

// GOOD — log the failure, mark it in DB, but do not crash the submission
try {
  await sendCustomerEmail(params);
  await markEmailSent(insertedId, 'customer');
} catch (err: unknown) {
  // Email failure is non-fatal — the submission is already saved in MongoDB.
  // Log it so the ops team can manually follow up if needed.
  console.error('[api/queries] customer email failed — submission id:', insertedId, err);
}
```

### 7. Component Props Must Be Typed with an Interface, Not Inline

```tsx
// BAD
function BudgetSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {}

// GOOD
interface BudgetSelectorProps {
  /** Current star rating (1–5). 0 = not selected. */
  value: number;
  /** Called when the user taps a star. Receives the new rating (1–5). */
  onChange: (rating: number) => void;
  /** Language code for accessible aria-labels. */
  lang: SupportedLang;
}

function BudgetStarSelector({ value, onChange, lang }: BudgetSelectorProps) {}
```

### 8. No Commented-Out Code in Commits

If code is disabled temporarily, add a `// TODO:` comment explaining why and what needs to happen. Do not leave dead code blocks.

### 9. File Header Comment

Every new file must start with a 3-line header:

```ts
/**
 * [filename] — [one-line description of what this file does]
 * Voice Query System | Ulavi Technologies
 */
```

### 10. Client/Server Boundary Comments

Every API route file must have a comment at the top clarifying the boundary:

```ts
// ————————————————————————————————————————————————————————————————————————————————————————
// This file runs on the server (Next.js API route). Do NOT import browser APIs.
// Do NOT prefix env vars used here with NEXT_PUBLIC_.
```

---

## Read This First — Ground Rules

> **Rule 1 — Add, don't delete.** Every feature in the current system still works. We are layering new screens and logic on top.
> **Rule 2 — One phase = one working app.** After each phase, the app must build and deploy without errors.
> **Rule 3 — Test before moving on.** Every phase has a verification checklist. Do not skip it.
> **Rule 4 — Scale first, not after.** Every architectural decision in this document is made for 100K+ users from day one.

---

## What Already Exists vs. What We Are Adding

### Already Built (Keep As-Is)

| What | File(s) | Notes |
|---|---|---|
| Voice recording (MediaRecorder, 60s limit) | `app/record/page.tsx` | Works perfectly, keep |
| AssemblyAI transcription + polling | `app/api/aai/transcribe/route.ts` | Extend, don't replace |
| MongoDB write on submission | `app/api/queries/route.ts` | Extend schema |
| IP-based rate limiting (5 per 10 min) | `lib/rateLimit.ts` | Will upgrade for scale |
| Zustand global state | `store/useQueryStore.ts` | Will extend |
| Review screen with phone + name | `app/review/page.tsx` | Will rework |
| Confirmation screen | `app/confirmation/page.tsx` | Will extend with i18n |
| EmailJS notification (server-side) | `lib/email.ts` | Will rework for dual email |
| MyMemory translation fallback | `app/api/translate/route.ts` | Keep, extend |
| Language dropdown (inline on record page) | `components/forms/LanguageSelect.tsx` | Will MOVE to dedicated screen |

### What Needs to Be Built (New)

| What | Phase | Complexity |
|---|---|---|
| Screen 1: Dedicated language picker page (/) | Phase 1 | Medium |
| i18n string dictionary (8 languages x all UI text) | Phase 1 | High — do this first |
| Language context provider across all screens | Phase 1 | Medium |
| Screen 3: Smart pop-ups for 4 missing trip details | Phase 2 | High |
| Trip details detection in transcribed text (NLP-lite) | Phase 2 | High |
| Trip details state in Zustand store | Phase 2 | Low |
| Updated Screen 4 (Review): trip fields + email field | Phase 3 | Medium |
| Zod validation: email + phone (review page) | Phase 3 | Low |
| Dual email system: customer email (user language) + ops email (English) | Phase 3 | High |
| Email templates: 2 separate EmailJS templates | Phase 3 | Medium |
| Confirmation screen in user's language | Phase 4 | Low |
| Redis rate limiter (replace in-memory for scale) | Phase 4 | High |
| Vercel/Cloudflare deployment hardening | Phase 4 | Medium |

---

## Architecture Overview (Target State)

```
User Opens App
     |
     v
[Screen 1: /] Language Picker
     |  <- Stores selected language in Zustand + localStorage
     v
[Screen 2: /record] Record Query (max 60s)
     |  <- MediaRecorder -> POST /api/aai/transcribe
     |  <- Returns: original transcript + English translation
     v
[Screen 3: /details] Smart Pop-ups (1 at a time)
     |  <- Check transcript for: city, dates, passengers, budget
     |  <- Show pop-up in user's language for each missing field
     |  <- Store all 4 values in Zustand
     v
[Screen 4: /review] Review + Contact Details
     |  <- Show transcript (user language, editable)
     |  <- Show 4 trip fields (editable)
     |  <- Collect email + phone (Zod validated)
     |  <- POST /api/queries (extended payload)
     v
     |-- MongoDB: Save full record (all fields)
     |-- EmailJS Template A: Customer email (user language)
     +-- EmailJS Template B: Ops email (English)
     v
[Screen 5: /confirmation] Success (in user's language)
```

---

## Zero-Cost Tools Policy

This project uses ONLY free tiers. No credit card required for any service. Here is the full approved service list:

| Service | What It Does | Free Tier Limit | Sign-Up URL |
|---|---|---|---|
| **AssemblyAI** | Speech-to-text + translation | 5 hours/month | assemblyai.com |
| **MongoDB Atlas** | Database (submissions) | 512MB storage | mongodb.com/atlas |
| **EmailJS** | Send emails from server | 200 emails/month | emailjs.com |
| **MyMemory** | Text translation fallback | 5,000 words/day | mymemory.translated.net |
| **Upstash Redis** | Rate limiting across instances | 10,000 commands/day | upstash.com |
| **Supabase Storage** | Store audio recordings (for ops email link) | 1GB storage, 2GB bandwidth/month | supabase.com |
| **Vercel** | Hosting | Free hobby tier | vercel.com |
| **Sentry** | Error monitoring | 5,000 errors/month | sentry.io |

**What was removed from the original plan (was paid):**
- ~~DeepL API~~ — MyMemory is sufficient for the free tier. If translation quality becomes critical, LibreTranslate (self-hosted, free) is the next step.
- ~~Resend~~ — EmailJS free tier (200 emails/month) covers the MVP. At scale, switch to Brevo (formerly Sendinblue) which offers 300 free emails/day.

---

## Scalability Strategy (100K+ Users)

Before coding, understand these constraints:

| Concern | Current Approach | Production Approach |
|---|---|---|
| Rate limiting | In-memory Map (single server process) | **Upstash Redis** free tier — shared across all Vercel instances |
| AssemblyAI | Polling in one long server request (90s) | Keep polling — AssemblyAI handles load; add hard 90s timeout |
| Translation | MyMemory only | MyMemory primary + fallback to returning original text |
| Email | EmailJS REST (single template) | Two separate EmailJS templates (customer + ops) |
| Audio storage | Not stored | **Supabase Storage** free tier — upload audio → get public URL → link in ops email |
| MongoDB | Single collection | Add indexes on `created_at`, `source_language`, `status` |
| State | Zustand (lost on refresh) | Zustand + `persist` middleware → localStorage (language only) |
| i18n | Hard-coded English strings | Static JSON dictionaries — zero runtime cost |

---

## New Dependencies to Install

Run once before Phase 1 starts:

```bash
cd frontend
npm install @upstash/redis @upstash/ratelimit
npm install @supabase/supabase-js
```

---

---

# PHASE 1 — Language System Foundation

**Goal:** Language picker screen + i18n dictionary + language context working across all screens.
**Duration estimate:** 2-3 days
**This phase does NOT change recording or review logic yet.**

---

## Phase 1, Step 1: Create the i18n dictionary

**File to create:** `frontend/lib/i18n.ts`

This is the single source of truth for all UI strings in all 8 languages. Every piece of text the user ever sees must live here. Never render raw text strings anywhere in JSX — always use the lookup function.

The dictionary covers these language codes:
- `en` — English
- `hi` — Hindi
- `ta` — Tamil
- `te` — Telugu
- `kn` — Kannada
- `ml` — Malayalam
- `bn` — Bengali
- `mr` — Marathi
- `auto` — Auto-detect (shows English UI until language is determined from speech)

Each language entry has these keys (covering all 5 screens):

```
// Language picker
langPickerTitle, langPickerSubtitle, langPickerAutoDetect

// Record screen
recordStep, recordTitle, recordSubtitle
recordIdle, recordRecording, recordProcessing, recordDone
recordTimer, recordContinue, recordTranscriptPreview, recordMinSeconds

// Pop-up screen
popupTitle, popupSkip, popupNext
popupCityQuestion, popupCityPlaceholder
popupDatesQuestion, popupDatesFromPlaceholder, popupDatesToPlaceholder
popupPassengersQuestion, popupPassengersPlaceholder
popupBudgetQuestion, popupBudgetPlaceholder

// Review screen
reviewStep, reviewTitle, reviewSubtitle
reviewTranscriptLabel, reviewCityLabel, reviewDatesLabel
reviewPassengersLabel, reviewBudgetLabel
reviewEmailLabel, reviewEmailPlaceholder
reviewPhoneLabel, reviewNotProvided
reviewSend, reviewSending, reviewBack, reviewNameLabel

// Validation errors
errorEmail, errorPhone, errorName, errorTranscript

// Confirmation screen
confirmStep, confirmTitle, confirmBody, confirmSubAnotherQuery

// Error messages
errorNoSpeech, errorTooShort, errorGeneral, errorMicBlocked, errorBrowserNoMic
```

Provide a lookup helper:

```ts
export function t(lang: SupportedLang, key: keyof LangStrings): string {
  return strings[lang]?.[key] ?? strings['en'][key];
}
```

**Why this approach over a library (next-intl, i18next)?**
- Zero runtime overhead (static dictionary, no API calls)
- No hydration mismatches (same strings on server and client)
- Works completely offline
- 8 languages = about 200KB of strings (acceptable)

---

## Phase 1, Step 2: Extend the Zustand Store

**File to modify:** `frontend/store/useQueryStore.ts`

Add these new fields (do NOT remove existing fields):

```ts
// New fields to ADD:
uiLanguage: SupportedLang        // default: 'auto'
setUiLanguage: (lang) => void

tripCity: string                 // default: ''
tripDatesFrom: string            // default: ''
tripDatesTo: string              // default: ''
tripPassengers: string           // default: ''
tripBudget: string               // default: ''
setTripCity, setTripDatesFrom, setTripDatesTo, setTripPassengers, setTripBudget

userEmail: string                // default: ''
setUserEmail: (v: string) => void
```

Wrap the store with Zustand `persist` middleware to save language selection in localStorage:

```ts
import { persist } from 'zustand/middleware';

export const useQueryStore = create<QueryState>()(
  persist(
    (set) => ({ ...all setters... }),
    {
      name: 'vb-query-store',
      partialize: (state) => ({ uiLanguage: state.uiLanguage }),
      // ONLY persist language — never persist transcripts (privacy)
    }
  )
);
```

Also add `tripCity`, `tripDatesFrom`, `tripDatesTo`, `tripPassengers`, `tripBudget`, `userEmail` to the `reset()` function so they clear after a successful submission.

---

## Phase 1, Step 3: Create Language Picker Screen

**File to replace:** `frontend/app/page.tsx`

The root `/` route becomes Screen 1 — the Language Picker — instead of redirecting to `/record`.

UI Requirements:
- Show app name/logo at top: "Voice Query System"
- Subtitle: "Select your language to get started"
- Grid of language cards (2 columns on mobile, 4 columns on desktop)
- Each card shows:
  - Language name in English (e.g. "Tamil")
  - Language name in its own script (e.g. "தமிழ்")
  - A colored dot or icon
- "Auto-detect" special card at the top with a wand/sparkle icon
- Tapping any card immediately sets `uiLanguage` in Zustand and navigates to `/record`
- No submit button — selection is instant

Languages to display (in order):

```
Auto-detect | English | हिंदी (Hindi) | தமிழ் (Tamil)
తెలుగు (Telugu) | కన్నడ (Kannada) | മലയാളം (Malayalam) | বাংলা (Bengali) | मराठी (Marathi)
```

**File to create:** `frontend/components/language/LanguagePicker.tsx`

This is the visual component containing the grid. The page just renders this.

---

## Phase 1, Step 4: Update All Existing Pages to Use t()

Replace ALL hard-coded English strings with the dictionary lookup.

**Files to modify:**

1. `app/record/page.tsx`
   - Add `const { uiLanguage } = useQueryStore();`
   - Replace every string: "Record your query." → `t(uiLanguage, 'recordTitle')`
   - Replace error messages: "No speech detected..." → `t(uiLanguage, 'errorNoSpeech')`
   - Replace "Continue to review →" → `t(uiLanguage, 'recordContinue')`

2. `app/review/page.tsx`
   - Replace all labels and button text with t() calls

3. `app/confirmation/page.tsx`
   - Replace confirmation message with t() call

4. `components/speech/MicButton.tsx`
   - Accept a `lang: SupportedLang` prop
   - Replace `statusLabel` record with t() calls

---

## Phase 1 — Verification Checklist

Before moving to Phase 2, confirm ALL of these:

- [ ] `npm run build` completes with zero TypeScript errors
- [ ] Opening `localhost:3000` shows the language picker (not a redirect)
- [ ] Selecting Hindi: all text on Record screen appears in Hindi
- [ ] Selecting Tamil: all text appears in Tamil
- [ ] Auto-detect: Record screen shows English
- [ ] Language selection survives page refresh (localStorage persists)
- [ ] No console errors on any screen
- [ ] Existing recording flow still works end-to-end in English

---

---

# PHASE 2 — Trip Detail Pop-ups + Detection Logic

**Goal:** After transcription, automatically check for 4 missing trip fields and show one pop-up at a time.
**Duration estimate:** 3-4 days
**Depends on:** Phase 1 complete and verified.

---

## Phase 2, Step 1: Trip Detail Extractor

**File to create:** `frontend/lib/tripExtractor.ts`

A rule-based (zero API cost) heuristic scanner that reads the transcribed text and determines which of the 4 details were already mentioned by the user. This runs purely in the browser.

Interface:

```ts
export interface TripDetails {
  city: string | null;        // null = not confidently detected in transcript
  datesFrom: string | null;
  datesTo: string | null;
  passengers: string | null;
  budget: string | null;
}

export function extractTripDetails(text: string): TripDetails
```

Detection logic:

**City detection:**
- Maintain a list of 50-100 known Indian + international travel destinations
- Check if any destination name appears (case-insensitive) in the transcript
- Cover names in English AND common spellings in Hindi/Tamil
- Examples: 'ooty', 'kodaikanal', 'goa', 'manali', 'dubai', 'paris', 'singapore'
- Also include native script spellings: 'கொடைக்கானல்', 'ஊட்டி', 'मसूरी'

**Date detection:**
- Check for English month names: jan, feb, mar, ... dec
- Check for Hindi month names in Devanagari
- Check for Tamil month names in Tamil script
- Check for numeric date patterns: `15/08`, `15-08-2026`
- Check for date-related words: 'from', 'to', 'between', 'starting', 'ending', 'depart', 'return'
- If ANY date signal found → mark as "mentioned" (do NOT try to parse exact dates)

**Passenger detection:**
- Regex patterns for numbers followed by person-words in English and Indian languages
- Examples: '2 adults', '3 people', '2 लोग', '2 பேர்', '2 మంది'
- Match: `/(\d+)\s*(person|people|adult|adults|child|children|passenger|travell?er)/i`

**Budget detection:**
- Look for currency symbols: ₹, $, €, £
- Look for currency words: rupees, inr, usd, dollar
- Look for budget-related words: 'budget', 'spend', 'cost'
- Match: `/₹[\s\d,]+/` or `/(\d[\d,]*)\s*(rupee|rupees|inr)/i`

**Important design principle:**
The extractor MUST be conservative — only mark a field as "detected" when it is fairly certain. It is better to ask the user an extra question than to miss important data. Never block the user flow because extraction failed.

---

## Phase 2, Step 2: Budget Star Selector Component

**File to create:** `frontend/components/popups/BudgetStarSelector.tsx`

This replaces the free-text budget input for the budget pop-up only. Instead of asking the user to type a number, they tap stars (1–5) to indicate their budget tier — exactly like a hotel rating.

### Star Tier Definitions

| Stars | Label | Budget Range (approx.) |
|---|---|---|
| ★ | Economy | Under ₹10,000 per person |
| ★★ | Budget | ₹10,000 – ₹25,000 per person |
| ★★★ | Mid-range | ₹25,000 – ₹50,000 per person |
| ★★★★ | Premium | ₹50,000 – ₹1,00,000 per person |
| ★★★★★ | Luxury | ₹1,00,000+ per person |

The label and budget range text MUST come from the i18n dictionary so they appear in the user's language.

### Props Interface

```ts
/**
 * BudgetStarSelectorProps — props for the star-based budget rating widget.
 * Voice Query System | Ulavi Technologies
 */
interface BudgetStarSelectorProps {
  /** Currently selected star count. 0 = nothing selected yet. */
  value: number;
  /**
   * Fired when the user taps a star.
   * Receives the new rating (1–5) as an integer.
   */
  onChange: (rating: number) => void;
  /** Language code — used to render tier labels in the right language. */
  lang: SupportedLang;
}
```

### Behaviour

- Render 5 star icons in a horizontal row, centered
- Stars 1 through `value` are filled (orange `#E85D22`)
- Stars above `value` are empty (grey outline)
- Tapping a star sets `value` to that star number
- Tapping the SAME star a second time de-selects (resets to 0) — gives the user a way to clear their choice
- Below the stars, show a two-line label:
  - Line 1 (bold): tier name, e.g. "Mid-range" (from i18n dict)
  - Line 2 (light): budget range, e.g. "₹25,000 – ₹50,000 per person" (from i18n dict)
  - When nothing is selected (value = 0), show placeholder text: "Tap a star to select" (from i18n dict)
- On hover (desktop) and on press-hold (mobile), show a brief pop-over tooltip with the tier name

### Implementation Notes

- Use `lucide-react`'s `Star` icon (already installed) — fill with `currentColor` when active
- Do NOT use an external star-rating library — this is a simple custom implementation
- The star tap area must be large enough for mobile: minimum 44×44px touch target per star
- Animate the fill transition: `transition-colors duration-[100ms]`
- On submit, convert the numeric rating to a human-readable budget string:

```ts
/**
 * Converts a star rating (1–5) to a human-readable budget tier string
 * for inclusion in emails and the review screen.
 *
 * @param rating - Star count selected by the user (1–5). 0 = not selected.
 * @param lang   - UI language used for label localisation.
 * @returns A formatted string like "★★★ Mid-range (₹25,000 – ₹50,000/person)"
 */
function budgetRatingToString(rating: number, lang: SupportedLang): string {
  if (rating === 0) return '';
  const tier = BUDGET_TIERS[rating - 1]; // array index 0–4
  const tierLabel = t(lang, tier.labelKey);
  const tierRange = t(lang, tier.rangeKey);
  return `${'★'.repeat(rating)} ${tierLabel} (${tierRange})`;
}
```

Add these keys to the i18n dictionary for each language:

```
budgetTier1Label, budgetTier1Range
budgetTier2Label, budgetTier2Range
budgetTier3Label, budgetTier3Range
budgetTier4Label, budgetTier4Range
budgetTier5Label, budgetTier5Range
budgetStarPlaceholder
```

---

## Phase 2, Step 3: Create the Pop-up Component

**File to create:** `frontend/components/popups/TripDetailPopup.tsx`

A bottom-sheet modal component. The `budget` field uses `BudgetStarSelector` instead of a text input. All other fields use a text input.

### Props

```ts
/**
 * TripDetailPopupProps — props for the single-field trip detail modal.
 * Voice Query System | Ulavi Technologies
 */
interface TripDetailPopupProps {
  /** Language code for all displayed text. */
  lang: SupportedLang;
  /** Which detail this pop-up is asking for. */
  field: 'city' | 'dates' | 'passengers' | 'budget';
  /** Index of this pop-up in the overall queue (for step indicator). */
  currentStep: number;
  /** Total number of pop-ups in the queue. */
  totalSteps: number;
  /** Called when the user submits a value. Receives the formatted string. */
  onSubmit: (value: string) => void;
  /** Called when the user taps Skip. The field is stored as empty. */
  onSkip: () => void;
}
```

### Visual Design

- Semi-transparent backdrop (dark overlay, `bg-black/50`)
- White card slides up from the bottom (`translate-y-full` → `translate-y-0`, 200ms ease-out)
- Step indicator at the top: "2 of 4" — rendered in user's language if possible, otherwise English numerals
- Question text: `t(lang, popupXxxQuestion)` — large, clear font
- Input area:
  - `city`, `passengers`: single `<input type="text">` with translated placeholder
  - `dates`: two `<input type="text">` side by side — "From" and "To" — combined on submit
  - `budget`: renders `<BudgetStarSelector>` instead of text inputs
- "Skip" button: ghost style, left-aligned
- "Next" button: primary orange, right-aligned, disabled while budget = 0 (only for budget field)

### Accessibility

```
role="dialog"
aria-modal="true"
aria-labelledby="popup-question-text"   — id on the <p> element containing the question
Focus: first interactive element receives focus on open
Escape key: calls onSkip() (same as tapping Skip)
Focus trap: Tab/Shift+Tab stay inside the modal
```

### Animation (CSS only — no library needed)

```css
/* In globals.css */
@keyframes sheet-up {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

@keyframes sheet-down {
  from { transform: translateY(0);    opacity: 1; }
  to   { transform: translateY(100%); opacity: 0; }
}

.sheet-enter { animation: sheet-up   200ms ease-out both; }
.sheet-exit  { animation: sheet-down 150ms ease-in  both; }
```

---

## Phase 2, Step 4: Create the Details Page (Screen 3)

**File to create:** `frontend/app/details/page.tsx`

This is a `"use client"` page. No server component is needed here.

### Logic on Mount

1. Read `originalTranscript` from the Zustand store
2. If `originalTranscript` is empty — redirect to `/record` (direct visit guard)
3. Run `extractTripDetails(originalTranscript)` — runs instantly, client-side, zero API cost
4. Build a queue of ONLY the missing fields:

```ts
/**
 * Builds an ordered list of trip detail fields that are absent from the transcript.
 * Only fields with null (not detected) values get a pop-up.
 *
 * @param extracted - Result from extractTripDetails()
 * @returns Ordered array of field keys that need user input via pop-ups
 */
function buildMissingFieldQueue(extracted: TripDetails): Array<TripDetailField> {
  const ALL_FIELDS: TripDetailField[] = ['city', 'dates', 'passengers', 'budget'];

  return ALL_FIELDS.filter((field) => {
    if (field === 'city')       return extracted.city === null;
    if (field === 'dates')      return extracted.datesFrom === null;
    if (field === 'passengers') return extracted.passengers === null;
    if (field === 'budget')     return extracted.budget === null;
    return false;
  });
}
```

5. Show a 500ms "Analysing your query..." loading state before the first pop-up (prevents jarring immediate pop-up)
6. Show pop-ups one at a time, using `currentStep` and `totalSteps` from the queue index
7. On submit — store the value in Zustand — advance the queue
8. On skip — store `''` in Zustand — advance the queue
9. When queue is empty — navigate to `/review`

### Visual Design

- Background: transcript card visible (blurred) so the user has context
- Centred loading state: spinner + "Analysing your query..."
- Pop-ups overlay from the bottom via `TripDetailPopup`
- If zero pop-ups are needed (all detected): show a 1-second success message then auto-navigate

---

## Phase 2, Step 5: Update Navigation in Record Page

**File to modify:** `app/record/page.tsx`

Change the "Continue" button destination:

```tsx
// BEFORE:
onClick={() => router.push("/review")}

// AFTER:
onClick={() => router.push("/details")}
```

---

## Phase 2 — Verification Checklist

- [ ] `npm run build` with zero errors
- [ ] Speaking "trip to Goa for 2 people" — city (Goa) + passengers detected — only dates + budget pop-ups appear (2 pop-ups)
- [ ] Speaking with no specific trip details — all 4 pop-ups appear
- [ ] Budget pop-up shows star selector (NOT a text input)
- [ ] Tapping 3 stars — shows "Mid-range" label + budget range in user's language
- [ ] Tapping same star again — deselects (resets to 0)
- [ ] "Next" button in budget pop-up stays disabled until at least 1 star is tapped (or Skip is used)
- [ ] Skipping a pop-up — field stored as empty string — navigates to next pop-up
- [ ] After last pop-up — navigates to `/review`
- [ ] Direct visit to `/details` without transcript — redirected to `/record`
- [ ] All pop-up text in Hindi when Hindi is selected
- [ ] All pop-up text in Tamil when Tamil is selected
- [ ] Budget tier labels appear in Hindi when Hindi is selected
- [ ] Pop-up closes on Escape key (calls onSkip)
- [ ] Focus returns to page after pop-up closes
- [ ] Pop-up animation is smooth (no jank on mobile)
- [ ] Star touch targets are at least 44×44px on mobile

---

---

# PHASE 3 — Audio Upload + Review Screen + Dual Email

**Goal:** Upload audio to Supabase (free), update review screen with all trip fields + email field, send dual emails (customer gets their query back, ops gets everything including audio link).
**Duration estimate:** 4-5 days
**Depends on:** Phase 2 complete and verified.

---

## Phase 3, Step 0: Supabase Storage Setup (One-Time)

This is setup work, not coding. Do this before writing any code.

1. Create a free Supabase account at supabase.com
2. Create a new project (free tier)
3. In the Supabase dashboard: go to Storage — Create a new bucket
   - Bucket name: `voice-recordings`
   - Public bucket: YES (so the audio URL in the ops email is accessible without auth)
4. Copy these two values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` (project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (service role key — server-side only, NOT `NEXT_PUBLIC_`)

> ⚠️ Use the SERVICE ROLE key (not the anon key) for server-side uploads. The service role key bypasses Supabase row-level security — never expose it to the browser.

---

## Phase 3, Step 1: Audio Upload API Route

**File to create:** `frontend/app/api/audio/upload/route.ts`

This is a server-side API route that receives the raw audio Blob from the client and uploads it to Supabase Storage, returning the public URL.

```ts
// ————————————————————————————————————————————————————————————————————————————————————————
// This file runs on the server (Next.js API route). Do NOT import browser APIs.
// Do NOT prefix env vars used here with NEXT_PUBLIC_.

/**
 * POST /api/audio/upload
 * Receives a multipart/form-data request containing the voice recording,
 * uploads it to Supabase Storage, and returns the public URL.
 *
 * The URL is then stored in the Zustand store and sent in the ops email
 * so the support team can listen to the original recording.
 *
 * @returns { audioUrl: string } on success
 * @returns { error: string, code: string } on failure
 */
export async function POST(request: Request): Promise<Response>
```

Logic inside the handler:

1. Parse the FormData to get the `audio` File
2. Generate a unique filename:
   ```ts
   const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webm`;
   ```
3. Upload to Supabase using the service role key:
   ```ts
   const { createClient } = await import('@supabase/supabase-js');
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!,
   );
   const { error } = await supabase.storage
     .from('voice-recordings')
     .upload(filename, audioBuffer, { contentType: 'audio/webm', upsert: false });
   ```
4. Get the public URL:
   ```ts
   const { data } = supabase.storage.from('voice-recordings').getPublicUrl(filename);
   const audioUrl = data.publicUrl;
   ```
5. Return `{ audioUrl }` to the client

**Error handling:**
- If Supabase upload fails — return `{ error: 'Audio upload failed', code: 'AUDIO_UPLOAD_ERROR' }` with status 502
- Audio upload failure is non-fatal for the overall submission — the client must continue even if this fails
- Log the failure: `console.error('[api/audio/upload] Supabase upload failed', error)`

---

## Phase 3, Step 2: Upload Audio After Transcription

**File to modify:** `frontend/app/record/page.tsx`

After `transcribeRecording()` succeeds, also call the upload route in parallel (fire-and-forget, do NOT block navigation on it):

```ts
/**
 * Uploads the recorded audio Blob to Supabase via the /api/audio/upload route.
 * Non-blocking — failure is silently logged and does not affect the user flow.
 *
 * @param blob - The recorded audio Blob from MediaRecorder
 * @returns The public URL of the uploaded audio, or null on failure
 */
async function uploadAudioBlob(blob: Blob): Promise<string | null> {
  try {
    const fd = new FormData();
    fd.append('audio', blob, 'recording.webm');
    const res = await fetch('/api/audio/upload', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = (await res.json()) as { audioUrl?: string };
    return data.audioUrl ?? null;
  } catch {
    // Non-fatal — ops email will just not have an audio link
    console.warn('[record] audio upload failed, continuing without audio URL');
    return null;
  }
}
```

Add `audioUrl: string` and `setAudioUrl: (url: string) => void` to the Zustand store. After the audio is uploaded, call `setAudioUrl(url ?? '')`. This URL is later sent in the ops email payload.

---

## Phase 3, Step 3: Update QueryPayload Type

**File to modify:** `frontend/types/query.ts`

Add to the existing `QueryPayload` interface:

```ts
// NEW fields added to existing interface:
ui_language: string;          // Selected UI language code (e.g. 'ta', 'hi', 'en')
user_email: string;           // Customer email address (validated)
audio_url: string;            // Public Supabase URL of the voice recording ("" if upload failed)
trip_city: string;            // "" if not provided (skipped or not detected)
trip_dates_from: string;      // "" if not provided
trip_dates_to: string;        // "" if not provided
trip_passengers: string;      // "" if not provided
trip_budget: string;          // Star rating string e.g. "★★★ Mid-range (₹25,000 – ₹50,000/person)" or "" if skipped
```

---

## Phase 3, Step 2: Rework the Review Page

**File to modify:** `frontend/app/review/page.tsx`

Major changes:

1. Import `uiLanguage` from the store and use `t(uiLanguage, 'key')` for all labels
2. Add `userEmail` field with Zod validation:
   ```ts
   const emailSchema = z.string().email();
   ```
3. Add all 4 trip detail fields as editable text inputs, pre-filled from Zustand
4. The transcript shown is the ORIGINAL language transcript (not English translation)
5. Trip fields show `t(uiLanguage, 'reviewNotProvided')` placeholder when empty (not an error)

Layout order (top to bottom in the review Cards):

```
Card 1 — Your query:
  [Original transcript — editable textarea, in user's language]

Card 2 — Trip details:
  [Destination — text input, pre-filled from tripCity]
  [Travel from — text input, pre-filled from tripDatesFrom]
  [Travel to — text input, pre-filled from tripDatesTo]
  [Number of travellers — text input, pre-filled from tripPassengers]
  [Budget — BudgetStarSelector widget, pre-filled from tripBudget star count]
  NOTE: Budget is shown as the star widget on review too — not as plain text.
        The user can change their star selection here before sending.

Card 3 — Contact details:
  [Your Name — text input]
  [Email Address — email input]
  [Mobile Number — country code + number]

[Send button — disabled until name + email + phone all valid]
[Back link]
```

> For the budget field on the review screen: render `BudgetStarSelector` with the pre-filled star count derived from `tripBudget`. If `tripBudget` is empty (skipped), start at 0 stars. When the user changes stars, call `setTripBudget(budgetRatingToString(newRating, lang))`.

canSubmit logic (all must be true):
```ts
const canSubmit =
  normalizedUserName.length > 1 &&
  emailValidation.success &&
  phoneValidation &&
  translatedTranscript.trim().length > 0 &&
  !isSubmitting &&
  !isTranslating;
```

---

## Phase 3, Step 5: Create Two EmailJS Templates

In the EmailJS dashboard, create TWO templates under the same service.

### Template A — Customer Confirmation Email

- **Template ID:** `customer_confirmation`
- **To:** `{{to_email}}` (the email address the user entered)
- **Subject:** `{{subject_line}}` (passed from server — will say "We've received your travel query" in English, as non-ASCII subjects are unreliable in some email clients)
- **Body:** One variable `{{body_text}}` — pre-composed entirely on the server using the i18n dictionary

**What the customer receives:**

The customer email is a copy of their own query sent back to them — not just a vague "we received it" message. It contains:

```
[Greeting in user's language — e.g. confirmBody from i18n]

[Section: Your query]
[The original transcript text in their language]

[Section: Trip details]
Destination:         [tripCity or "Not provided" in user's language]
Travel dates:        [tripDatesFrom — tripDatesTo or "Not provided"]
Number of travellers:[tripPassengers or "Not provided"]
Budget:              [tripBudget star string or "Not provided"]

[Section: Your contact details]
Email:  [userEmail]
Phone:  [phoneFull]

[Footer in user's language]
"Our team will reach out to you very soon."
```

**Why send the user a copy of their own query?**
The user spoke in their language. They may not be confident what was transcribed. Sending them the full details confirms what was captured and builds trust. If something is wrong, they can reply to the email.

### Template B — Ops Email (Always English)

- **Template ID:** `ops_notification`
- **To:** `support@ulavitech.com` (hardcoded in the template)
- **Subject:** `New Travel Query — {{trip_city}} — {{phone}}`
- **Body:** Always English, structured with clear labelled sections

Variables the ops template needs:

```
{{customer_name}}             - user's name
{{original_query_language}}   - language name in English (e.g. "Tamil")
{{original_query}}            - exact transcript in user's language
{{english_translation}}       - same query translated to English
{{audio_url}}                 - Supabase public URL to listen to the voice recording
                                (show as a clickable link: "Listen to recording")
                                (if empty/upload failed: show "Audio not available")
{{trip_city}}                 - "Not provided" if empty
{{trip_dates}}                - "Not provided" if empty
{{trip_passengers}}           - "Not provided" if empty
{{trip_budget}}               - e.g. "★★★ Mid-range (₹25,000 – ₹50,000/person)" or "Not provided"
{{user_email}}                - customer's email
{{phone}}                     - full phone with country code
{{submitted_at}}              - ISO timestamp + timezone
{{action_prompt}}             - "Please get in touch with this customer at the earliest to provide a quote."
```

**Example ops email body structure:**

```
New Travel Query Received
—————————————————————————
Customer: [customer_name]
Language: [original_query_language]

Original Query ([original_query_language]):
[original_query]

English Translation:
[english_translation]

🎙 Voice Recording: [Listen to recording] (clickable link)

—————————————————————————
Trip Details
—————————————————————————
Destination:          [trip_city]
Travel Dates:         [trip_dates]
Passengers:           [trip_passengers]
Budget:               [trip_budget]

—————————————————————————
Contact Details
—————————————————————————
Email:  [user_email]
Phone:  [phone]

Submitted at: [submitted_at]

—————————————————————————
⚡ [action_prompt]
—————————————————————————
```

---

## Phase 3, Step 6: Update the Email Library

**File to modify:** `frontend/lib/email.ts`

Replace the single `sendSubmissionEmail()` function with two dedicated functions.

```ts
/**
 * email.ts — Server-side email sending via EmailJS REST API.
 * Two functions: one for the customer copy, one for the ops team.
 * Voice Query System | Ulavi Technologies
 */

// ————————————————————————————————————————————————————————————————————————————————————————
// Never import this file from client components.
// Keys used here must NOT have the NEXT_PUBLIC_ prefix.

const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

// ————————————————————————————————————————————————————————————————————————————————————————

interface CustomerEmailParams {
  to_email: string;
  user_name: string;
  ui_language: SupportedLang;
  original_query: string;
  trip_city: string;
  trip_dates_from: string;
  trip_dates_to: string;
  trip_passengers: string;
  trip_budget: string;      // Star string e.g. "★★★ Mid-range (₹25,000 – ₹50,000/person)"
  phone: string;
  submitted_at: string;
}

interface OpsEmailParams {
  customer_name: string;
  original_query: string;
  original_query_language: string;
  english_translation: string;
  audio_url: string;        // Public Supabase URL — empty string if upload failed
  trip_city: string;
  trip_dates_from: string;
  trip_dates_to: string;
  trip_passengers: string;
  trip_budget: string;
  user_email: string;
  phone: string;
  submitted_at: string;
}

// ————————————————————————————————————————————————————————————————————————————————————————

/**
 * Sends the customer a copy of their submitted travel query,
 * written in their preferred language using the i18n dictionary.
 *
 * The body is pre-composed as plain text on the server so that
 * one generic EmailJS template handles all 8 supported languages.
 *
 * @throws Will throw if EmailJS returns a non-OK status.
 *         Caller must handle this in a try-catch and treat it as non-fatal.
 */
export async function sendCustomerEmail(params: CustomerEmailParams): Promise<void> {
  const lang = params.ui_language;
  const notProvided = t(lang, 'reviewNotProvided');

  // Build the localised body as a plain-text string.
  // Using array.join to avoid template literal indentation noise.
  const bodyText = [
    t(lang, 'confirmBody'),
    '',
    '—'.repeat(40),
    `${t(lang, 'reviewTranscriptLabel')}:`,
    params.original_query,
    '',
    '—'.repeat(40),
    `${t(lang, 'reviewCityLabel')}: ${params.trip_city || notProvided}`,
    `${t(lang, 'reviewDatesLabel')}: ${params.trip_dates_from || notProvided}${params.trip_dates_to ? ' — ' + params.trip_dates_to : ''}`,
    `${t(lang, 'reviewPassengersLabel')}: ${params.trip_passengers || notProvided}`,
    `${t(lang, 'reviewBudgetLabel')}: ${params.trip_budget || notProvided}`,
    '',
    `${t(lang, 'reviewEmailLabel')}: ${params.to_email}`,
    `${t(lang, 'reviewPhoneLabel')}: ${params.phone}`,
  ].join('\n');

  await callEmailJsApi({
    templateId: process.env.EMAILJS_CUSTOMER_TEMPLATE_ID!,
    templateParams: {
      to_email: params.to_email,
      user_name: params.user_name,
      body_text: bodyText,
      subject_line: "We've received your travel query",
    },
  });
}

// ————————————————————————————————————————————————————————————————————————————————————————

/**
 * Sends the ops team a structured English email with all submission details,
 * the original voice query in the user's language, the English translation,
 * and a link to the voice recording in Supabase Storage.
 *
 * @throws Will throw if EmailJS returns a non-OK status.
 *         Caller must handle this in a try-catch and treat it as non-fatal.
 */
export async function sendOpsEmail(params: OpsEmailParams): Promise<void> {
  const NOT_PROVIDED = 'Not provided';

  const audioLine = params.audio_url
    ? `Listen to recording: ${params.audio_url}`
    : 'Audio recording: Not available (upload failed)';

  const dateRange = params.trip_dates_from
    ? `${params.trip_dates_from}${params.trip_dates_to ? ' — ' + params.trip_dates_to : ''}`
    : NOT_PROVIDED;

  await callEmailJsApi({
    templateId: process.env.EMAILJS_OPS_TEMPLATE_ID!,
    templateParams: {
      customer_name: params.customer_name,
      original_query_language: params.original_query_language,
      original_query: params.original_query,
      english_translation: params.english_translation,
      audio_url: params.audio_url,
      audio_line: audioLine,
      trip_city: params.trip_city || NOT_PROVIDED,
      trip_dates: dateRange,
      trip_passengers: params.trip_passengers || NOT_PROVIDED,
      trip_budget: params.trip_budget || NOT_PROVIDED,
      user_email: params.user_email,
      phone: params.phone,
      submitted_at: params.submitted_at,
      action_prompt: 'Please get in touch with this customer at the earliest to provide a quote.',
    },
  });
}

// ————————————————————————————————————————————————————————————————————————————————————————

/**
 * Internal helper that POSTs a template call to the EmailJS REST API.
 * Throws on non-OK HTTP status.
 */
async function callEmailJsApi(options: {
  templateId: string;
  templateParams: Record<string, string>;
}): Promise<void> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !publicKey) {
    console.warn('[email] EmailJS env vars missing — skipping email');
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
    const body = await res.text().catch(() => '(no body)');
    throw new Error(`EmailJS responded ${res.status}: ${body}`);
  }
}
```

---

## Phase 3, Step 7: Update the Queries API Route

**File to modify:** `frontend/app/api/queries/route.ts`

### Changes to `validPayload()`

Add `user_email` and `audio_url` to the validation check:
- `user_email` must be non-empty string with a basic format check (a more thorough Zod check runs client-side; here just check it's non-empty)
- `audio_url` is allowed to be empty string (non-fatal if upload failed)
- All `trip_*` fields are allowed to be empty strings

### MongoDB Document Schema

```ts
await db.collection('query_submissions').insertOne({
  // ————————————————————————————————————————————————————————————————————————————————————————
  user_name:             payload.user_name.trim(),
  source_language:       payload.source_language,
  original_transcript:   payload.original_transcript,
  translated_transcript: payload.translated_transcript,
  phone_country_code:    payload.phone_country_code,
  phone_number:          payload.phone_number,
  phone_full:            payload.phone_full,
  client_timestamp:      payload.client_timestamp,
  client_timezone:       payload.client_timezone,

  // ————————————————————————————————————————————————————————————————————————————————————————
  ui_language:           payload.ui_language,
  user_email:            payload.user_email.trim(),
  audio_url:             payload.audio_url,         // Supabase URL or ''
  trip_city:             payload.trip_city,
  trip_dates_from:       payload.trip_dates_from,
  trip_dates_to:         payload.trip_dates_to,
  trip_passengers:       payload.trip_passengers,
  trip_budget:           payload.trip_budget,       // Star string or ''

  // ————————————————————————————————————————————————————————————————————————————————————————
  status:                'accepted',
  customer_email_sent:   false,
  ops_email_sent:        false,
  created_at:            new Date(),
  ip,
});
```

### Email Execution Order

Both emails are sent AFTER the DB write and INDEPENDENTLY. One failing must never prevent the other from being attempted.

```ts
// ————————————————————————————————————————————————————————————————————————————————————————
try {
  await sendCustomerEmail({
    to_email:       payload.user_email.trim(),
    user_name:      payload.user_name.trim(),
    ui_language:    payload.ui_language as SupportedLang,
    original_query: payload.original_transcript,
    trip_city:      payload.trip_city,
    trip_dates_from:payload.trip_dates_from,
    trip_dates_to:  payload.trip_dates_to,
    trip_passengers:payload.trip_passengers,
    trip_budget:    payload.trip_budget,
    phone:          payload.phone_full,
    submitted_at:   payload.client_timestamp,
  });

  // Best-effort: mark email as sent. Non-fatal if this write fails.
  await db.collection('query_submissions').updateOne(
    { _id: new ObjectId(insertedId) },
    { $set: { customer_email_sent: true, customer_email_sent_at: new Date() } },
  ).catch((e) => console.warn('[api/queries] could not update customer_email_sent flag', e));
} catch (err: unknown) {
  // Email failure is non-fatal — the submission is already saved.
  console.error('[api/queries] customer email failed — submission id:', insertedId, err);
}

// ————————————————————————————————————————————————————————————————————————————————————————
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
    { _id: new ObjectId(insertedId) },
    { $set: { ops_email_sent: true, ops_email_sent_at: new Date() } },
  ).catch((e) => console.warn('[api/queries] could not update ops_email_sent flag', e));
} catch (err: unknown) {
  console.error('[api/queries] ops email failed — submission id:', insertedId, err);
}
```

Add the `LANGUAGE_NAMES` lookup constant near the top of the file:

```ts
/** Maps SupportedLang codes to their English display names for the ops email. */
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

---

## Phase 3, Step 6: Update Confirmation Screen

**File to modify:** `frontend/app/confirmation/page.tsx`

- Read `uiLanguage` from the store
- Replace the confirmation body text with `t(uiLanguage, 'confirmBody')`
- Replace the "Submit another query" button text with `t(uiLanguage, 'confirmSubAnotherQuery')`
- Clicking "Submit another query" should navigate to `/` (language picker), not `/record`

---

## Phase 3 — Verification Checklist

- [ ] `npm run build` with zero errors
- [ ] Tamil user: review screen shows transcript in Tamil, all labels in Tamil
- [ ] Hindi user: review screen shows transcript in Hindi, all labels in Hindi
- [ ] Trip fields from pop-ups pre-fill correctly on review screen
- [ ] Budget field shows star selector on review screen (not a text input)
- [ ] Changing stars on review screen updates `tripBudget` in Zustand immediately
- [ ] Skipped fields show placeholder text "Not provided" (not an error)
- [ ] Empty email field — inline error in user's language
- [ ] Invalid email format — inline error in user's language
- [ ] Empty phone field — inline error
- [ ] After sending:
  - [ ] Audio is uploaded to Supabase before navigating to confirmation
  - [ ] MongoDB document contains: `audio_url`, `user_email`, all `trip_*` fields
  - [ ] `customer_email_sent: true` in MongoDB
  - [ ] `ops_email_sent: true` in MongoDB
  - [ ] Audio URL in MongoDB matches the Supabase public URL
- [ ] Customer email received with body in user's language
- [ ] Customer email body includes: greeting, full transcript, all 4 trip fields, contact details
- [ ] Customer email body shows budget as star string (e.g. "★★★ Mid-range")
- [ ] Ops email received in English
- [ ] Ops email subject: "New Travel Query — [City] — [Phone]"
- [ ] Ops email body contains: original language query, English translation, audio link, all 4 trip fields, contact details, action prompt
- [ ] Clicking the audio link in the ops email opens the Supabase-hosted audio file
- [ ] If audio upload failed: ops email shows "Audio recording: Not available" — does NOT crash
- [ ] Confirmation screen shows message in user's language
- [ ] Clicking "Submit another query" goes back to `/` (language picker)

---

---

# PHASE 4 — Scale Hardening + Production Polish

**Goal:** Make the app production-ready for 100K+ users.
**Duration estimate:** 3-5 days
**Depends on:** Phase 3 complete and verified.

---

## Phase 4, Step 1: Replace In-Memory Rate Limiter with Redis

**Problem:** `lib/rateLimit.ts` uses a `Map` stored in process memory. On Vercel, each invocation can hit a different serverless function instance. The Map is NOT shared — rate limiting does not work correctly at scale.

**Solution:** Upstash Redis with `@upstash/ratelimit` (free tier: 10,000 commands/day, plenty for dev/staging).

**File to create:** `frontend/lib/rateLimitRedis.ts`

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Query submissions: 5 per IP per 10 minutes
export const queryRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "vb:queries",
});

// Transcription: 10 per IP per 10 minutes (AssemblyAI is expensive)
export const transcribeRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 m"),
  analytics: true,
  prefix: "vb:transcribe",
});
```

**Update:**
- `app/api/queries/route.ts` — replace `checkRateLimit()` with `queryRateLimiter.limit(ip)`
- `app/api/aai/transcribe/route.ts` — add `transcribeRateLimiter.limit(ip)` at the start
- Keep `lib/rateLimit.ts` as a backup (mark as deprecated in a comment)

**Why Upstash specifically?**
- HTTP REST API (works in Vercel Edge and serverless without TCP connection overhead)
- Free tier is generous
- Purpose-built for serverless rate limiting

---

## Phase 4, Step 2: MongoDB Index Setup

Run these commands ONCE in MongoDB Atlas (Collections > query_submissions > Indexes):

```js
db.query_submissions.createIndex({ created_at: -1 });
db.query_submissions.createIndex({ source_language: 1, created_at: -1 });
db.query_submissions.createIndex({ ip: 1, created_at: -1 });
db.query_submissions.createIndex({ status: 1 });
db.query_submissions.createIndex({ user_email: 1 });
```

Without these, queries slow down past ~10,000 documents. With them, queries are fast past 10 million.

---

## Phase 4, Step 3: Translation Quality Upgrade

**Problem:** MyMemory is free but rate-limited (~5,000 words/day total) and low-quality for complex multilingual travel queries.

**Solution:** Add DeepL as primary translation engine.

**File to modify:** `frontend/app/api/translate/route.ts`

Strategy:
1. Try DeepL first (if `DEEPL_API_KEY` is set)
2. Fall back to MyMemory if DeepL fails or key not set
3. Fall back to returning original text if both fail

DeepL free tier: 500,000 characters/month — enough for dev and moderate production usage.

```ts
async function translateWithDeepL(text: string, targetLang: string): Promise<string | null> {
  const key = process.env.DEEPL_API_KEY;
  if (!key) return null;
  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: { 'Authorization': `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: [text], target_lang: targetLang.toUpperCase() }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.translations?.[0]?.text ?? null;
}
```

---

## Phase 4, Step 4: Error Monitoring

Add Sentry for production error visibility:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

This automatically instruments all API routes and client-side errors. You will see exactly which API calls fail, which languages have the most errors, and which browser/device combinations cause issues.

Set the Sentry DSN in environment variables:
```
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

---

## Phase 4, Step 5: Final Environment Variables

**File to update:** `frontend/.env.example`

```bash
# ————————————————————————————————————————————————————————————————————————————————————————
ASSEMBLYAI_API_KEY=

# ————————————————————————————————————————————————————————————————————————————————————————
EMAILJS_PUBLIC_KEY=
EMAILJS_SERVICE_ID=
EMAILJS_CUSTOMER_TEMPLATE_ID=     # Template A: customer query copy
EMAILJS_OPS_TEMPLATE_ID=          # Template B: ops notification
EMAILJS_PRIVATE_KEY=              # Optional: access token for authenticated calls

# ————————————————————————————————————————————————————————————————————————————————————————
MONGODB_URI=
MONGODB_DB=Voice Query System

# ————————————————————————————————————————————————————————————————————————————————————————
# NEXT_PUBLIC_ prefix is allowed here because the URL is not a secret.
NEXT_PUBLIC_SUPABASE_URL=
# Service role key — server-side ONLY. Never use NEXT_PUBLIC_ prefix on this.
SUPABASE_SERVICE_ROLE_KEY=

# ————————————————————————————————————————————————————————————————————————————————————————
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ————————————————————————————————————————————————————————————————————————————————————————
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Phase 4 — Verification Checklist

- [ ] Deploy to Vercel with all env vars set
- [ ] Upstash dashboard shows rate limit analytics (requests being counted)
- [ ] Full flow tested on real iOS Safari (HTTPS required for mic)
- [ ] Full flow tested on real Android Chrome
- [ ] Tamil full flow: language pick — record — pop-ups — review — send — both emails
- [ ] Hindi full flow: same
- [ ] English full flow: same
- [ ] Both emails arrive correctly after each test
- [ ] MongoDB Atlas: 5 test documents present with all trip fields
- [ ] MongoDB Atlas: indexes created and query plan shows index usage
- [ ] Sentry dashboard: no unhandled errors after clean demo run
- [ ] Rate limit: submitting 6 times quickly from same IP — 6th attempt gets 429 error

---

---

# Complete File Change Summary

| File | Action | Phase |
|---|---|---|
| `lib/i18n.ts` | CREATE — i18n dictionary for 8 languages | 1 |
| `store/useQueryStore.ts` | MODIFY — add uiLanguage, trip fields, email, audioUrl, persist | 1 |
| `app/page.tsx` | REPLACE — language picker screen (Screen 1) | 1 |
| `components/language/LanguagePicker.tsx` | CREATE — language grid card component | 1 |
| `app/record/page.tsx` | MODIFY — use t(), update Continue to /details, upload audio | 1 + 2 + 3 |
| `components/speech/MicButton.tsx` | MODIFY — accept lang prop, use t() for status labels | 1 |
| `lib/tripExtractor.ts` | CREATE — rule-based trip detail detection | 2 |
| `components/popups/BudgetStarSelector.tsx` | CREATE — star rating widget for budget selection | 2 |
| `components/popups/TripDetailPopup.tsx` | CREATE — bottom-sheet modal, uses BudgetStarSelector for budget field | 2 |
| `app/details/page.tsx` | CREATE — Screen 3, orchestrates pop-up queue | 2 |
| `app/api/audio/upload/route.ts` | CREATE — uploads audio Blob to Supabase, returns public URL | 3 |
| `types/query.ts` | MODIFY — add user_email, audio_url, trip_budget (star string) | 3 |
| `app/review/page.tsx` | MODIFY — trip fields, BudgetStarSelector, email field, i18n labels | 3 |
| `lib/email.ts` | MODIFY — sendCustomerEmail + sendOpsEmail with structured bodies | 3 |
| `app/api/queries/route.ts` | MODIFY — validate new fields, both emails, LANGUAGE_NAMES map | 3 |
| `app/confirmation/page.tsx` | MODIFY — message in user's language, navigate back to / | 3 |
| `lib/rateLimitRedis.ts` | CREATE — Upstash Redis rate limiter (query + transcribe limiters) | 4 |
| `lib/rateLimit.ts` | DEPRECATE — add deprecation comment, no longer called | 4 |
| `app/api/translate/route.ts` | KEEP as-is — MyMemory is sufficient, no paid upgrade needed | 4 |
| `.env.example` | MODIFY — all new env vars (Supabase, Upstash, Sentry) | 4 |
| `frontend/package.json` | MODIFY — add @upstash/redis @upstash/ratelimit @supabase/supabase-js | 4 |

---

---

# Known Hard Problems and How to Handle Them

## Problem 1: Auto-detect + switch UI language after transcription

**Situation:** User selects "Auto-detect". After recording, AssemblyAI returns `language_code: "ta"`. But the UI is still showing English.

**Solution:** After AssemblyAI returns `language_code`, check if it maps to a supported SupportedLang. If yes, update `uiLanguage` in the store. Show a brief non-blocking toast: "We detected Tamil as your language."

```ts
// In record/page.tsx after transcription completes:
if (uiLanguage === 'auto' && result.language_code) {
  const detected = result.language_code as SupportedLang;
  if (strings[detected]) {
    setUiLanguage(detected);
    // Toast: "Detected: Tamil"
  }
}
```

## Problem 2: Date format from pop-ups

**Situation:** Users type dates in different formats: "15 Aug", "August 15", "15/8", "15th August 2026".

**Solution:** Accept free-form text — do NOT parse or validate dates on the client. Display exactly what the user typed in the review screen and include it as-is in the ops email. The ops team reads the date and acts accordingly. Parsing multilingual free-form dates reliably is an entire engineering project.

## Problem 3: Customer email body in 8 languages

**Situation:** EmailJS templates are static HTML. How to send different language bodies?

**Solution:** Build the body as a pre-composed plain-text string in `lib/email.ts` using the i18n dictionary. Pass it as a single `{{body_text}}` variable to a simple EmailJS template. One template handles all languages.

## Problem 4: AssemblyAI accuracy for South Indian languages

**Situation:** AssemblyAI is best for English and Hindi. Tamil, Telugu, Kannada may have lower accuracy.

**Already handled by current code:** When user selects a specific language (not auto-detect), `language_code` is passed explicitly to AssemblyAI in `app/api/aai/transcribe/route.ts`. This hint significantly improves accuracy. Keep this behaviour.

**Additional recommendation:** In the review screen, always show the transcript in an editable field. Users can correct any transcription errors before submitting.

## Problem 5: What if ALL 4 pop-up fields are already in the transcript?

**Situation:** A very detailed user says: "I want to go to Kodaikanal on 15th August for 3 people with a budget of 30,000 rupees."

**Expected behaviour:** The extractor detects all 4 fields. No pop-ups appear. The user is navigated directly from `/details` to `/review`. The `/details` page shows a brief "Great! We found all the details from your query." message before navigating automatically after 1 second.

## Problem 6: Rate limiting for transcription (AssemblyAI costs)

**Situation:** AssemblyAI charges per audio minute. A malicious user or script could spam recordings and rack up costs.

**Solution implemented in Phase 4:** Add a separate `transcribeRateLimiter` (10 per IP per 10 minutes) to the `/api/aai/transcribe` route. This is more restrictive than the submission rate limit.

---

---

# Final Pre-Launch Checklist

## Security
- [ ] No `NEXT_PUBLIC_` prefix on any server-side secrets (AssemblyAI key, EmailJS private key, MongoDB URI, Upstash tokens)
- [ ] CORS headers in `next.config.ts` restrict origins to your domain only
- [ ] Rate limiting confirmed working across Vercel instances (check Upstash analytics)
- [ ] No user PII (email, phone, transcript) logged in `console.log` calls
- [ ] MongoDB Atlas network access restricted to Vercel IP ranges (not 0.0.0.0/0)

## Performance
- [ ] `next build` completes with no TypeScript errors and no warnings
- [ ] No Cumulative Layout Shift (CLS) on mobile during language picker — record transition
- [ ] Pop-up animation smooth on low-end Android (60fps)
- [ ] First Contentful Paint < 2s on 4G (test with Chrome DevTools throttling)
- [ ] Language picker grid does not overflow horizontally on 320px screen width

## Accessibility
- [ ] All pop-ups trap focus (Tab/Shift+Tab stays inside modal)
- [ ] Mic button has correct `aria-label` in all states ("Start recording", "Stop recording", etc.)
- [ ] Language picker cards are keyboard-navigable (Tab + Enter)
- [ ] Pop-ups close on Escape key
- [ ] Color contrast ratio >= 4.5:1 for all body text
- [ ] Error messages have `role="alert"` so screen readers announce them

## Multi-language End-to-End Tests
- [ ] Tamil: language pick — record — pop-ups — review — send — both emails
- [ ] Hindi: same full flow
- [ ] English: same full flow
- [ ] Auto-detect with Tamil speech — UI switches to Tamil after transcription
- [ ] Ops email ALWAYS in English regardless of selected language
- [ ] Customer email body in Tamil when Tamil is selected
- [ ] Customer email body in Hindi when Hindi is selected

## Email
- [ ] Ops email arrives at `support@ulavitech.com`
- [ ] Ops email subject: `New Travel Query — [City] — [Phone]`
- [ ] Ops email body contains: original language query, English translation, audio link, trip details, contact details, action prompt
- [ ] Audio link in ops email is clickable and opens the Supabase-hosted `.webm` file
- [ ] If audio upload failed: ops email shows "Audio recording: Not available" — does NOT crash
- [ ] Customer email arrives at the user's own email address
- [ ] Customer email body is in the user's selected language
- [ ] Customer email body contains: greeting, full transcript, destination, dates, passengers, budget (star string), phone
- [ ] Budget shown in customer email as star string: e.g. "★★★ Mid-range (₹25,000 – ₹50,000/person)"
- [ ] No `undefined`, `null`, or `[object Object]` strings appear in either email body
- [ ] "Not provided" (or localised equivalent) shown correctly for skipped/empty fields

## Audio & Storage
- [ ] After recording stops, audio is uploaded to Supabase `voice-recordings` bucket
- [ ] Supabase bucket is set to PUBLIC so the URL is accessible without login
- [ ] Audio URL stored in MongoDB `audio_url` field
- [ ] Audio file is `.webm` format (from MediaRecorder)
- [ ] Supabase free tier storage not exceeded (monitor via Supabase dashboard)

## Code Quality
- [ ] Every new function has a JSDoc comment
- [ ] No magic numbers — all constants are named
- [ ] No `any` types — all variables explicitly typed
- [ ] Every file starts with the 3-line header comment
- [ ] Every API route file has the `// ————————————————————————————————————————————————————————————————————————————————————————` boundary comment
- [ ] `npm run lint` returns zero errors

---

*This document is the property of Ulavi Technologies. Confidential.*
*Questions? Contact [Anas Alam](https://linkedin.com/in/anas86/) — SDE.*
