# Phase 1 — Language System Foundation

**Goal:** Build the i18n dictionary, extend the Zustand store, create the language picker screen, and update all existing screens to use localized strings.

**Duration:** 2–3 days  
**Depends on:** Nothing — this is the first phase.  
**Rule:** This phase does NOT change the recording logic, review logic, or email logic. Only the language infrastructure.

**Must read before starting:**
- [CODE_STANDARDS.md](../CODE_STANDARDS.md)
- [FREE_TOOLS.md](../FREE_TOOLS.md)

---

## What You Are Changing in This Phase

| File | Action | Why |
|---|---|---|
| `frontend/lib/i18n.ts` | CREATE | Single source of truth for all UI text in 8 languages |
| `frontend/store/useQueryStore.ts` | MODIFY | Add `uiLanguage`, `tripCity`, `tripDates*`, `tripPassengers`, `tripBudget`, `userEmail`, `audioUrl` + persist middleware |
| `frontend/app/page.tsx` | REPLACE | Root route becomes the Language Picker (Screen 1) |
| `frontend/components/language/LanguagePicker.tsx` | CREATE | Grid card component for language selection |
| `frontend/app/record/page.tsx` | MODIFY | Replace hard-coded English strings with `t()` calls |
| `frontend/app/review/page.tsx` | MODIFY | Replace hard-coded English strings with `t()` calls |
| `frontend/app/confirmation/page.tsx` | MODIFY | Replace hard-coded English strings with `t()` calls |
| `frontend/components/speech/MicButton.tsx` | MODIFY | Accept `lang` prop, use `t()` for status labels |

**Do NOT touch:** `lib/email.ts`, `api/aai/transcribe/route.ts`, `api/queries/route.ts`

---

## Step 1.1 — Install No New Packages

Phase 1 requires no new npm packages. The i18n dictionary is a plain TypeScript file.

```bash
# Verify the build passes before you start
cd frontend
npm run build
```

The build must pass before you make any changes. If it doesn't, fix existing errors first.

---

## Step 1.2 — Create `frontend/lib/i18n.ts`

This is the most important file in Phase 1. Everything in the UI reads from this dictionary.

**File header (mandatory):**

```ts
/**
 * i18n.ts — Static localisation dictionary for all 8 supported languages.
 * All UI strings live here. Never hardcode text in JSX — always use t().
 * VoiceBerry | Ulavi Technologies
 */
```

### Supported Language Codes

```ts
export type SupportedLang =
  | 'en'   // English
  | 'hi'   // Hindi
  | 'ta'   // Tamil
  | 'te'   // Telugu
  | 'kn'   // Kannada
  | 'ml'   // Malayalam
  | 'bn'   // Bengali
  | 'mr'   // Marathi
  | 'auto'; // Auto-detect — shows English UI until language is known
```

### Full Key List (Every Key Required for Every Language)

```ts
export interface LangStrings {
  // ── Language Picker Screen ─────────────────────────────────────────────────
  langPickerTitle: string;         // "Select your language"
  langPickerSubtitle: string;      // "All screens will be shown in your selected language"
  langPickerAutoDetect: string;    // "Auto-detect"

  // ── Record Screen ─────────────────────────────────────────────────────────
  recordStep: string;              // "Step 1 of 4"
  recordTitle: string;             // "Record your query."
  recordSubtitle: string;          // "Speak about your travel plan..."
  recordIdle: string;              // "Tap to start speaking"
  recordRecording: string;         // "Recording — tap to stop"
  recordProcessing: string;        // "Converting speech…"
  recordDone: string;              // "Done — tap to record again"
  recordTimer: string;             // "Max 60 seconds"
  recordContinue: string;          // "Continue →"
  recordTranscriptPreview: string; // "Transcript preview"
  recordMinSeconds: string;        // "Please record for at least 3 seconds."

  // ── Pop-up Questions ──────────────────────────────────────────────────────
  popupTitle: string;              // "A quick question"
  popupSkip: string;               // "Skip"
  popupNext: string;               // "Next"
  popupCityQuestion: string;       // "Which city or destination are you travelling to?"
  popupCityPlaceholder: string;    // "E.g., Ooty, Kodaikanal, Paris"
  popupDatesQuestion: string;      // "When are you planning to travel?"
  popupDatesFromPlaceholder: string; // "From date (e.g. 15 Aug 2026)"
  popupDatesToPlaceholder: string;   // "To date (e.g. 20 Aug 2026)"
  popupPassengersQuestion: string; // "How many people will be travelling?"
  popupPassengersPlaceholder: string; // "E.g., 2 adults, 1 child"
  popupBudgetQuestion: string;     // "What is your approximate budget?"
  popupBudgetPlaceholder: string;  // (not used for stars, but keep for consistency)

  // ── Budget Star Tier Labels ────────────────────────────────────────────────
  budgetTier1Label: string;    // "Economy"
  budgetTier1Range: string;    // "Under ₹10,000 per person"
  budgetTier2Label: string;    // "Budget"
  budgetTier2Range: string;    // "₹10,000 – ₹25,000 per person"
  budgetTier3Label: string;    // "Mid-range"
  budgetTier3Range: string;    // "₹25,000 – ₹50,000 per person"
  budgetTier4Label: string;    // "Premium"
  budgetTier4Range: string;    // "₹50,000 – ₹1,00,000 per person"
  budgetTier5Label: string;    // "Luxury"
  budgetTier5Range: string;    // "₹1,00,000+ per person"
  budgetStarPlaceholder: string; // "Tap a star to select your budget"

  // ── Review Screen ─────────────────────────────────────────────────────────
  reviewStep: string;          // "Step 3 of 4"
  reviewTitle: string;         // "Review & submit."
  reviewSubtitle: string;      // "Check your details before sending."
  reviewTranscriptLabel: string;   // "Your query"
  reviewCityLabel: string;         // "Destination"
  reviewDatesLabel: string;        // "Travel dates"
  reviewPassengersLabel: string;   // "Number of travellers"
  reviewBudgetLabel: string;       // "Budget"
  reviewEmailLabel: string;        // "Your Email Address"
  reviewEmailPlaceholder: string;  // "you@example.com"
  reviewPhoneLabel: string;        // "Your Mobile Number"
  reviewNameLabel: string;         // "Your Name"
  reviewNotProvided: string;       // "Not provided"
  reviewSend: string;              // "Send query →"
  reviewSending: string;           // "Sending…"
  reviewBack: string;              // "← Back"

  // ── Validation Errors ─────────────────────────────────────────────────────
  errorEmail: string;      // "Please enter a valid email address."
  errorPhone: string;      // "Please enter a valid phone number with country code."
  errorName: string;       // "Please enter your name."
  errorTranscript: string; // "Please provide a transcript before sending."

  // ── Confirmation Screen ───────────────────────────────────────────────────
  confirmStep: string;             // "Step 4 of 4 — Complete"
  confirmTitle: string;            // "Query submitted."
  confirmBody: string;             // "Thank you! Our team will get back to you very soon."
  confirmSubAnotherQuery: string;  // "Submit another query"

  // ── Recording/System Errors ───────────────────────────────────────────────
  errorNoSpeech: string;       // "No speech was detected. Please speak more clearly."
  errorTooShort: string;       // "Recording too short — please speak for a few seconds."
  errorGeneral: string;        // "Something went wrong. Please try recording again."
  errorMicBlocked: string;     // "Microphone access is blocked. Please allow mic permissions."
  errorBrowserNoMic: string;   // "Audio recording is not supported in this browser."
}
```

### Lookup Helper Function

```ts
/**
 * Retrieves a localised string for the given language and key.
 * Falls back to English if the key is missing in the requested language.
 *
 * @param lang - The language code to look up (e.g. 'ta', 'hi', 'en')
 * @param key  - The string key from LangStrings interface
 * @returns The localised string, or the English fallback if not found
 */
export function t(lang: SupportedLang, key: keyof LangStrings): string {
  return strings[lang]?.[key] ?? strings['en'][key];
}
```

### Translations to Write

Write the full `strings` object with all 9 language entries (`en`, `hi`, `ta`, `te`, `kn`, `ml`, `bn`, `mr`, `auto`). Every key from `LangStrings` must be present for every language.

**English (`en`) values (use exactly these):**

```ts
en: {
  langPickerTitle: "Select your language",
  langPickerSubtitle: "All screens will be shown in your selected language",
  langPickerAutoDetect: "Auto-detect",
  recordStep: "Step 1 of 4",
  recordTitle: "Record your query.",
  recordSubtitle: "Speak about your travel plan in your language — up to 60 seconds.",
  recordIdle: "Tap to start speaking",
  recordRecording: "Recording — tap to stop",
  recordProcessing: "Converting speech…",
  recordDone: "Done — tap to record again",
  recordTimer: "Max 60 seconds",
  recordContinue: "Continue →",
  recordTranscriptPreview: "Transcript preview",
  recordMinSeconds: "Please record for at least 3 seconds.",
  popupTitle: "A quick question",
  popupSkip: "Skip",
  popupNext: "Next",
  popupCityQuestion: "Which city or destination are you travelling to?",
  popupCityPlaceholder: "E.g., Ooty, Kodaikanal, Paris",
  popupDatesQuestion: "When are you planning to travel?",
  popupDatesFromPlaceholder: "From date (e.g. 15 Aug 2026)",
  popupDatesToPlaceholder: "To date (e.g. 20 Aug 2026)",
  popupPassengersQuestion: "How many people will be travelling?",
  popupPassengersPlaceholder: "E.g., 2 adults, 1 child",
  popupBudgetQuestion: "What is your approximate budget for this trip?",
  popupBudgetPlaceholder: "Select a star rating below",
  budgetTier1Label: "Economy",
  budgetTier1Range: "Under ₹10,000 per person",
  budgetTier2Label: "Budget",
  budgetTier2Range: "₹10,000 – ₹25,000 per person",
  budgetTier3Label: "Mid-range",
  budgetTier3Range: "₹25,000 – ₹50,000 per person",
  budgetTier4Label: "Premium",
  budgetTier4Range: "₹50,000 – ₹1,00,000 per person",
  budgetTier5Label: "Luxury",
  budgetTier5Range: "₹1,00,000+ per person",
  budgetStarPlaceholder: "Tap a star to select your budget",
  reviewStep: "Step 3 of 4",
  reviewTitle: "Review & submit.",
  reviewSubtitle: "Check your details before sending.",
  reviewTranscriptLabel: "Your query",
  reviewCityLabel: "Destination",
  reviewDatesLabel: "Travel dates",
  reviewPassengersLabel: "Number of travellers",
  reviewBudgetLabel: "Budget",
  reviewEmailLabel: "Your Email Address",
  reviewEmailPlaceholder: "you@example.com",
  reviewPhoneLabel: "Your Mobile Number",
  reviewNameLabel: "Your Name",
  reviewNotProvided: "Not provided",
  reviewSend: "Send query →",
  reviewSending: "Sending…",
  reviewBack: "← Back",
  errorEmail: "Please enter a valid email address.",
  errorPhone: "Please enter a valid phone number with country code.",
  errorName: "Please enter your name.",
  errorTranscript: "Please provide a transcript before sending.",
  confirmStep: "Step 4 of 4 — Complete",
  confirmTitle: "Query submitted.",
  confirmBody: "Thank you for reaching out! Our operations team has received your travel request and will get back to you very soon.",
  confirmSubAnotherQuery: "Submit another query",
  errorNoSpeech: "No speech was detected. Please speak louder and more clearly.",
  errorTooShort: "Recording too short — please speak for at least a few seconds.",
  errorGeneral: "Something went wrong. Please try recording again.",
  errorMicBlocked: "Microphone access is blocked. Please allow mic permissions and try again.",
  errorBrowserNoMic: "Audio recording is not supported in this browser.",
},
```

**`auto` entry:** Copy the `en` entry exactly. The `auto` language shows English until a language is detected from speech.

**Other languages:** Write translations for `hi`, `ta`, `te`, `kn`, `ml`, `bn`, `mr`. Use the key structure above. For budget tier labels, translate the tier names (Economy, Budget, Mid-range, Premium, Luxury) and keep the ₹ amounts in all languages (₹ is universally understood for Indian users).

---

## Step 1.3 — Extend `frontend/store/useQueryStore.ts`

**Do not remove or rename any existing fields.** Only ADD to the store.

### New Fields to Add

```ts
// ── Language ──────────────────────────────────────────────────────────────────
uiLanguage: SupportedLang;        // default: 'auto'
setUiLanguage: (lang: SupportedLang) => void;

// ── Trip Details (from pop-ups, Phase 2) ─────────────────────────────────────
tripCity: string;                  // default: ''
tripDatesFrom: string;             // default: ''
tripDatesTo: string;               // default: ''
tripPassengers: string;            // default: ''
tripBudget: string;                // default: '' — star string after Phase 2

// ── Contact ───────────────────────────────────────────────────────────────────
userEmail: string;                 // default: ''
setUserEmail: (email: string) => void;

// ── Audio ─────────────────────────────────────────────────────────────────────
audioUrl: string;                  // default: '' — Supabase URL after Phase 3
setAudioUrl: (url: string) => void;
```

### Persist Middleware — Language Only

Wrap the store with Zustand `persist` middleware. Only persist `uiLanguage`. **Never persist transcripts, phone numbers, or emails — those are sensitive.**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SupportedLang } from '@/lib/i18n';

// ... existing state interface + new fields ...

export const useQueryStore = create<QueryState>()(
  persist(
    (set, get) => ({
      // ... all existing state and setters ...

      // New: language
      uiLanguage: 'auto' as SupportedLang,
      setUiLanguage: (lang) => set({ uiLanguage: lang }),

      // New: trip details
      tripCity: '',
      tripDatesFrom: '',
      tripDatesTo: '',
      tripPassengers: '',
      tripBudget: '',
      setTripCity: (v) => set({ tripCity: v }),
      setTripDatesFrom: (v) => set({ tripDatesFrom: v }),
      setTripDatesTo: (v) => set({ tripDatesTo: v }),
      setTripPassengers: (v) => set({ tripPassengers: v }),
      setTripBudget: (v) => set({ tripBudget: v }),

      // New: contact
      userEmail: '',
      setUserEmail: (v) => set({ userEmail: v }),

      // New: audio
      audioUrl: '',
      setAudioUrl: (url) => set({ audioUrl: url }),
    }),
    {
      name: 'vb-query-store',
      // ONLY persist language selection across page refreshes.
      // All other state (transcript, trip details, contact info) is intentionally
      // ephemeral — it should not survive a page refresh for privacy reasons.
      partialize: (state) => ({ uiLanguage: state.uiLanguage }),
    },
  ),
);
```

### Update `reset()` Function

Add all new fields to the existing `reset()` (or create it if it doesn't exist):

```ts
reset: () => set({
  // ... existing reset fields ...
  tripCity: '',
  tripDatesFrom: '',
  tripDatesTo: '',
  tripPassengers: '',
  tripBudget: '',
  userEmail: '',
  audioUrl: '',
  // NOTE: do NOT reset uiLanguage — user's language choice should persist
}),
```

---

## Step 1.4 — Create `frontend/components/language/LanguagePicker.tsx`

```
/**
 * LanguagePicker.tsx — Grid of language selection cards for the app entry screen.
 * Tapping a card immediately sets uiLanguage in the store and navigates to /record.
 * VoiceBerry | Ulavi Technologies
 */
'use client';
// Client component: uses Zustand store and next/navigation.
```

### Language Cards Data

Define this constant array (one object per card):

```ts
/** List of all selectable languages. The Auto-detect entry must be first. */
const LANGUAGE_OPTIONS = [
  { code: 'auto', nameEn: 'Auto-detect', nameNative: '🔍 Auto', icon: '✨' },
  { code: 'en',   nameEn: 'English',     nameNative: 'English',  icon: '🇬🇧' },
  { code: 'hi',   nameEn: 'Hindi',       nameNative: 'हिंदी',    icon: '🇮🇳' },
  { code: 'ta',   nameEn: 'Tamil',       nameNative: 'தமிழ்',    icon: '🇮🇳' },
  { code: 'te',   nameEn: 'Telugu',      nameNative: 'తెలుగు',   icon: '🇮🇳' },
  { code: 'kn',   nameEn: 'Kannada',     nameNative: 'ಕನ್ನಡ',    icon: '🇮🇳' },
  { code: 'ml',   nameEn: 'Malayalam',   nameNative: 'മലയാളം',   icon: '🇮🇳' },
  { code: 'bn',   nameEn: 'Bengali',     nameNative: 'বাংলা',    icon: '🇮🇳' },
  { code: 'mr',   nameEn: 'Marathi',     nameNative: 'मराठी',    icon: '🇮🇳' },
] as const;
```

### Props Interface

```ts
interface LanguagePickerProps {
  /** Called when the user selects a language. Receives the SupportedLang code. */
  onSelect: (lang: SupportedLang) => void;
}
```

### Visual Requirements

- 2-column grid on mobile (≤640px), 3 columns on tablet, 4 columns on desktop
- Each card is a `<button>` with:
  - Icon/emoji top center
  - `nameNative` below (large, bold)
  - `nameEn` below (small, grey)
  - On tap: immediately calls `onSelect(code)`, no animation delay
  - On hover (desktop): subtle scale-up (`scale(1.03)`) and border highlight
  - Active/pressed state: scale-down (`scale(0.97)`)
- The Auto-detect card has a sparkle/wand icon and a slightly different background colour

### Accessibility

- Each card must be a `<button>` element (not a `<div>`)
- `aria-label="Select English"` (or the correct language name) on each button
- The grid must be keyboard-navigable with Tab → Enter

---

## Step 1.5 — Replace `frontend/app/page.tsx`

The root route becomes Screen 1 — the Language Picker.

```tsx
/**
 * page.tsx — Root route (/). Renders the language picker as the first screen.
 * VoiceBerry | Ulavi Technologies
 */
'use client';
// Client component: uses Zustand store and next/navigation for routing.

import { useRouter } from 'next/navigation';
import { useQueryStore } from '@/store/useQueryStore';
import { LanguagePicker } from '@/components/language/LanguagePicker';
import type { SupportedLang } from '@/lib/i18n';

export default function HomePage() {
  const router = useRouter();
  const { setUiLanguage } = useQueryStore();

  /**
   * Handles language card selection.
   * Sets the language in global store and immediately navigates to the record screen.
   *
   * @param lang - The SupportedLang code the user selected
   */
  function handleLanguageSelect(lang: SupportedLang): void {
    setUiLanguage(lang);
    router.push('/record');
  }

  return (
    <main>
      {/* App name / logo */}
      <h1>VoiceBerry</h1>
      <p>Select your language to get started</p>
      <LanguagePicker onSelect={handleLanguageSelect} />
    </main>
  );
}
```

---

## Step 1.6 — Update Existing Pages to Use `t()`

For each file below, replace ALL hard-coded English text strings with `t(uiLanguage, 'key')` calls.

### Pattern for every page

At the top of the component:

```ts
const { uiLanguage } = useQueryStore();
```

Then replace strings:

```tsx
// BEFORE:
<h1>Record your query.</h1>

// AFTER:
<h1>{t(uiLanguage, 'recordTitle')}</h1>
```

### `app/record/page.tsx` — strings to replace

| Hard-coded string (or equivalent) | i18n key |
|---|---|
| "Step 1 of 4" | `recordStep` |
| "Record your query." | `recordTitle` |
| "Speak about your travel plan..." | `recordSubtitle` |
| "Tap to start speaking" (mic idle) | `recordIdle` |
| "Recording — tap to stop" | `recordRecording` |
| "Converting speech…" | `recordProcessing` |
| "Done — tap to record again" | `recordDone` |
| "Max 60 seconds" | `recordTimer` |
| "Transcript preview" | `recordTranscriptPreview` |
| "Continue to review →" | `recordContinue` |
| "Please record for at least 3 seconds" | `recordMinSeconds` |
| "No speech was detected..." | `errorNoSpeech` |
| "Recording too short..." | `errorTooShort` |
| "Something went wrong..." | `errorGeneral` |
| "Microphone access is blocked..." | `errorMicBlocked` |
| "Audio recording is not supported..." | `errorBrowserNoMic` |

**Also change:** The "Continue" button destination from `/review` to `/details` (needed for Phase 2):

```tsx
// BEFORE:
onClick={() => router.push('/review')}

// AFTER:
onClick={() => router.push('/details')}
```

### `app/review/page.tsx` — strings to replace

| Hard-coded string | i18n key |
|---|---|
| "Step 3 of 4" | `reviewStep` |
| "Review & submit." | `reviewTitle` |
| "Check your details..." | `reviewSubtitle` |
| "Your query" / "Transcript" label | `reviewTranscriptLabel` |
| "Your Email Address" | `reviewEmailLabel` |
| "you@example.com" | `reviewEmailPlaceholder` |
| "Your Mobile Number" | `reviewPhoneLabel` |
| "Your Name" | `reviewNameLabel` |
| "Send query →" | `reviewSend` |
| "Sending…" | `reviewSending` |
| "← Back" | `reviewBack` |
| Email error message | `errorEmail` |
| Phone error message | `errorPhone` |
| Name error message | `errorName` |

### `app/confirmation/page.tsx` — strings to replace

| Hard-coded string | i18n key |
|---|---|
| "Step 4 of 4 — Complete" | `confirmStep` |
| "Query submitted." | `confirmTitle` |
| "Thank you for reaching out!..." | `confirmBody` |
| "Submit another query" | `confirmSubAnotherQuery` |

Also change: "Submit another query" navigation destination from `/record` to `/` (language picker).

### `components/speech/MicButton.tsx` — changes

Add `lang: SupportedLang` to the props interface and replace the status label string lookup:

```ts
// BEFORE: (whatever the current pattern is)
const STATUS_LABELS = { idle: "Tap to start speaking", recording: "Recording...", ... };

// AFTER:
const statusLabel = t(lang, statusToKey[status]);
// Where statusToKey maps each status to its i18n key:
const STATUS_TO_I18N_KEY: Record<MicStatus, keyof LangStrings> = {
  idle:       'recordIdle',
  recording:  'recordRecording',
  processing: 'recordProcessing',
  done:       'recordDone',
};
```

---

## Phase 1 Testing — Full Verification Checklist

Run through EVERY item before moving to Phase 2. Do not skip any.

### Build Tests (Run These Commands)

```bash
cd frontend
npm run build     # Must complete with 0 errors, 0 TypeScript errors
npm run lint      # Must return 0 errors
```

### Manual Tests (Test in Browser at localhost:3000)

**Language Picker Screen:**
- [ ] `localhost:3000` shows the language picker screen (NOT a redirect to /record)
- [ ] Language picker shows 9 cards: Auto-detect + 8 languages
- [ ] Each card shows the language name in English AND in its native script
- [ ] Tapping any card navigates immediately to `/record`
- [ ] No submit button — selection is instant

**Language Propagation — English:**
- [ ] Select "English" → all text on `/record` is in English
- [ ] All labels, buttons, error messages, and status labels are in English
- [ ] Complete the recording → `/record` still shows English

**Language Propagation — Hindi:**
- [ ] Go back to `/` → select "Hindi" → all text on `/record` is in Hindi (हिंदी)
- [ ] Status label "Tap to start speaking" appears in Hindi
- [ ] Error messages appear in Hindi

**Language Propagation — Tamil:**
- [ ] Go back to `/` → select "Tamil" → all text on `/record` is in Tamil (தமிழ்)

**Language Propagation — Auto-detect:**
- [ ] Select "Auto-detect" → `/record` shows English
- [ ] Record a few seconds → English text throughout

**Persistence:**
- [ ] Select Hindi → navigate to `/record`
- [ ] Refresh the page (F5) → language stays as Hindi (from localStorage)
- [ ] Open a new tab at `localhost:3000` → still shows Hindi selected? (No — picker shows, but Hindi is pre-highlighted if applicable)

**Existing Flow (Regression Test):**
- [ ] Complete a full recording in English
- [ ] Transcript appears on the record screen
- [ ] "Continue" button is present and clickable
- [ ] Clicking "Continue" navigates to `/details` (not `/review` — this is intentional; `/details` will be built in Phase 2)
  - At this stage, `/details` will show a 404 — this is expected and acceptable

**Console:**
- [ ] Zero `console.error` messages during normal usage
- [ ] No TypeScript warnings about missing keys or undefined

### Completeness Check

- [ ] Every string on the record screen comes from `t()` — no raw strings
- [ ] Every string on the review screen comes from `t()` — no raw strings
- [ ] Every string on the confirmation screen comes from `t()` — no raw strings
- [ ] MicButton status label uses `t()` via the `lang` prop
- [ ] `i18n.ts` has ALL keys from `LangStrings` filled in for ALL 9 language entries
- [ ] No missing keys (TypeScript will enforce this if the interface is correct)

### Code Quality Check

- [ ] `i18n.ts` has the file header comment
- [ ] `LanguagePicker.tsx` has the file header comment
- [ ] `page.tsx` has the file header comment and `'use client'` directive with explanation comment
- [ ] `handleLanguageSelect` has a JSDoc comment
- [ ] No `any` types
- [ ] `npm run lint` returns 0 errors

---

## Common Mistakes to Avoid in Phase 1

| Mistake | Correct Approach |
|---|---|
| Forgetting `'use client'` on components that use `useQueryStore` | Add `'use client'` at the top of any component using hooks or browser APIs |
| Using `strings['en']` directly instead of `t()` | Always use `t(uiLanguage, key)` — fallback to English is built into `t()` |
| Persisting more than `uiLanguage` in localStorage | Only persist language. Transcripts and contact info are private. |
| Changing the "Continue" button to go to `/details` and then breaking the review | Phase 2 builds `/details` — the 404 at this stage is temporary and expected |
| Missing keys in one language entry | TypeScript will catch this — `LangStrings` interface enforces all keys |

---

## What Happens if You Run the App After Phase 1 (Without Phase 2)

The app will work like this:
1. User opens `/` — sees language picker ✅
2. Selects a language — navigates to `/record` ✅
3. Records a voice query — transcript appears ✅
4. Clicks "Continue" — gets a 404 (because `/details` doesn't exist yet) ⚠️

This is expected. Phase 2 builds the `/details` screen.

---

**Phase 1 is complete when:** Every item in the verification checklist above is checked, `npm run build` passes, and the language picker is working with localized strings on all existing screens.

**Next: [Phase 2 → Trip Detail Pop-ups](./PHASE_2_TRIP_DETAILS_POPUPS.md)**

---

*Ulavi Technologies — Confidential*
