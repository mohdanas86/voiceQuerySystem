# Phase 2 — Trip Detail Pop-ups + Smart Detection

**Goal:** After the user records their query, automatically detect up to 4 trip details (city, dates, passengers, budget) from the transcript, then show one pop-up at a time for any missing details. Budget uses a star-rating widget instead of a text input.

**Duration:** 3–4 days  
**Depends on:** Phase 1 complete and verified (all checklist items passed).

**Must read before starting:**
- [CODE_STANDARDS.md](../CODE_STANDARDS.md)

---

## What You Are Changing in This Phase

| File | Action | Why |
|---|---|---|
| `frontend/lib/tripExtractor.ts` | CREATE | Rule-based detector — checks transcript for city, dates, passengers, budget |
| `frontend/components/popups/BudgetStarSelector.tsx` | CREATE | Star-rating widget for budget tier selection |
| `frontend/components/popups/TripDetailPopup.tsx` | CREATE | Bottom-sheet modal that shows one question at a time |
| `frontend/app/details/page.tsx` | CREATE | Screen 3 — orchestrates the pop-up queue |
| `frontend/app/record/page.tsx` | ALREADY DONE in Phase 1 | "Continue" button already points to `/details` |

**Do NOT touch:** `lib/i18n.ts`, `lib/email.ts`, `api/queries/route.ts`, `app/review/page.tsx`

---

## Step 2.1 — Install No New Packages

Phase 2 requires no new npm packages.

```bash
# Verify Phase 1 build still passes
cd frontend
npm run build
```

If build fails, fix Phase 1 issues before continuing.

---

## Step 2.2 — Create `frontend/lib/tripExtractor.ts`

This is a pure TypeScript module. It runs in the browser. It makes zero API calls. It is fast (< 5ms).

**File header:**

```ts
/**
 * tripExtractor.ts — Heuristic scanner that detects trip details from raw voice transcripts.
 * Runs client-side only. Zero API cost. Conservative detection — misses are ok, false
 * positives skip necessary pop-ups and lose data.
 * VoiceBerry | Ulavi Technologies
 */
```

### Exported Types

```ts
/**
 * Represents the 4 trip details extracted from a voice transcript.
 * null means "not confidently detected" — a pop-up will be shown for that field.
 * Empty string means "detected but couldn't parse" — treat same as null.
 */
export interface TripDetails {
  /** Destination city or location name. null = not mentioned. */
  city: string | null;
  /** Travel start date (free text, exactly as mentioned). null = not mentioned. */
  datesFrom: string | null;
  /** Travel end/return date (free text). null = not mentioned. */
  datesTo: string | null;
  /** Number of passengers (free text, e.g. "2 adults"). null = not mentioned. */
  passengers: string | null;
  /** Budget information (free text). null = not mentioned. */
  budget: string | null;
}

/** The 4 field keys that can have pop-ups. */
export type TripDetailField = 'city' | 'dates' | 'passengers' | 'budget';
```

### Main Export

```ts
/**
 * Analyses a raw voice transcript and extracts any trip details that were mentioned.
 * Only marks a field as detected when reasonably confident — it is better to ask
 * the user an extra question than to miss a critical detail.
 *
 * @param transcript - Raw transcribed text from AssemblyAI (in any language)
 * @returns TripDetails with null for any undetected fields
 */
export function extractTripDetails(transcript: string): TripDetails {
  const text = transcript.toLowerCase().trim();

  return {
    city:       detectCity(text),
    datesFrom:  detectDates(text),
    datesTo:    null, // Return date is not extracted — always ask
    passengers: detectPassengers(text),
    budget:     detectBudget(text),
  };
}
```

### City Detection

Maintain a hard-coded list of 80+ known destinations:

```ts
/**
 * Known travel destinations — English names and common alternate spellings.
 * Cover the top 50 Indian domestic destinations + 20 international ones.
 * Also include common Hindi and Tamil spellings where applicable.
 */
const KNOWN_DESTINATIONS: readonly string[] = [
  // South India
  'ooty', 'ootacamund', 'udhagamandalam', 'kodaikanal', 'kodai', 'coorg', 'kodagu',
  'munnar', 'alleppey', 'alappuzha', 'kovalam', 'varkala', 'mysore', 'mysuru',
  'hampi', 'gokarna', 'pondicherry', 'puducherry', 'mahabalipuram',
  // North India / Mountains
  'manali', 'shimla', 'dharamshala', 'mcleod ganj', 'mussoorie', 'nainital',
  'rishikesh', 'haridwar', 'leh', 'ladakh', 'spiti', 'kasol', 'kufri',
  'dehradun', 'auli', 'chopta', 'kedarnath', 'badrinath',
  // Rajasthan
  'jaipur', 'udaipur', 'jodhpur', 'jaisalmer', 'pushkar', 'ajmer', 'mount abu',
  // Beaches
  'goa', 'gokarna', 'tarkarli', 'malvan', 'diu', 'daman', 'puri', 'mandarmani',
  // East / Northeast
  'darjeeling', 'sikkim', 'gangtok', 'shillong', 'cherrapunji', 'kaziranga',
  'assam', 'arunachal', 'meghalaya',
  // Cities (as trip destinations)
  'mumbai', 'delhi', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad',
  'kochi', 'ahmedabad', 'pune', 'agra', 'varanasi', 'amritsar',
  // International
  'dubai', 'singapore', 'bali', 'thailand', 'bangkok', 'pattaya', 'paris',
  'london', 'maldives', 'sri lanka', 'nepal', 'bhutan', 'europe',
  'malaysia', 'kuala lumpur', 'vietnam', 'hong kong', 'japan', 'tokyo',
  // Hindi spellings of common destinations
  'मनाली', 'शिमला', 'जयपुर', 'उदयपुर', 'गोवा', 'मसूरी', 'नैनीताल',
  // Tamil spellings
  'கொடைக்கானல்', 'ஊட்டி', 'கேரளா', 'புதுவை',
] as const;

/**
 * Detects the most likely destination from the transcript using a keyword list.
 * Returns the destination name as it appeared in the transcript, or null.
 *
 * @param text - Lowercased transcript text
 * @returns The detected destination string, or null if not found
 */
function detectCity(text: string): string | null {
  for (const dest of KNOWN_DESTINATIONS) {
    if (text.includes(dest)) {
      // Return the destination with proper capitalisation
      return dest.charAt(0).toUpperCase() + dest.slice(1);
    }
  }
  return null;
}
```

### Date Detection

```ts
/** English month names for date detection. */
const ENGLISH_MONTHS: readonly string[] = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

/** Hindi month names in Devanagari. */
const HINDI_MONTHS: readonly string[] = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर',
];

/** Tamil month names in Tamil script. */
const TAMIL_MONTHS: readonly string[] = [
  'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
  'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்',
];

/** Words that strongly imply a date is being discussed. */
const DATE_SIGNAL_WORDS: readonly string[] = [
  'from', 'to', 'between', 'starting', 'ending', 'depart', 'return',
  'travel on', 'going on', 'arriving', 'departure', 'arrival',
  // Hindi
  'से', 'तक', 'पर', 'को',
  // Tamil
  'முதல்', 'வரை',
];

/** Numeric date pattern: 15/08, 15-08-2026, 2026-08-15, etc. */
const NUMERIC_DATE_PATTERN = /\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/;

/**
 * Detects whether the transcript contains any date-related information.
 * Does NOT try to parse the exact date — the ops team reads raw text.
 * Returns a non-null value (the matched signal word/month) if dates are mentioned.
 *
 * @param text - Lowercased transcript text
 * @returns A date signal string if detected, or null
 */
function detectDates(text: string): string | null {
  // Check numeric date patterns first (most reliable signal)
  if (NUMERIC_DATE_PATTERN.test(text)) {
    return 'numeric date mentioned';
  }

  // Check month names (English, Hindi, Tamil)
  const allMonths = [...ENGLISH_MONTHS, ...HINDI_MONTHS, ...TAMIL_MONTHS];
  for (const month of allMonths) {
    if (text.includes(month)) {
      return `month mentioned: ${month}`;
    }
  }

  // Check date signal words
  for (const word of DATE_SIGNAL_WORDS) {
    if (text.includes(word)) {
      return `date signal: ${word}`;
    }
  }

  return null;
}
```

### Passenger Detection

```ts
/**
 * Regex patterns for detecting passenger counts.
 * Matches: "2 people", "3 adults", "2 लोग", "2 பேர்", etc.
 */
const PASSENGER_PATTERNS: readonly RegExp[] = [
  /(\d+)\s*(person|people|adult|adults|child|children|passenger|passengers|travell?er|travell?ers)/i,
  /(\d+)\s*(लोग|व्यक्ति|यात्री)/,      // Hindi
  /(\d+)\s*(பேர்|நபர்கள்)/,             // Tamil
  /(\d+)\s*(మంది|వ్యక్తులు)/,           // Telugu
  /(\d+)\s*(ಜನ|ವ್ಯಕ್ತಿಗಳು)/,           // Kannada
  /(\d+)\s*(ആള്‍|ആള്‍ക്കാര്‍)/,        // Malayalam
  /(\d+)\s*(জন|মানুষ)/,                 // Bengali
  /(\d+)\s*(लोक|माणसे)/,               // Marathi
];

/**
 * Detects passenger count information from the transcript.
 *
 * @param text - Lowercased transcript text
 * @returns The matched passenger string (e.g. "2 adults"), or null
 */
function detectPassengers(text: string): string | null {
  for (const pattern of PASSENGER_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[0]; // Return the full matched string
    }
  }
  return null;
}
```

### Budget Detection

```ts
/**
 * Patterns for detecting budget information.
 * Matches: ₹10000, "30,000 rupees", "budget of 50k", "spend around 20000", etc.
 */
const BUDGET_PATTERNS: readonly RegExp[] = [
  /₹[\s\d,]+/,                                          // ₹ symbol followed by amount
  /(\d[\d,]*)\s*(rupee|rupees|inr)/i,                   // 30000 rupees
  /(\d[\d,]*)\s*k\b/i,                                  // 30k
  /budget\s+(of\s+)?[\d,₹]+/i,                          // budget of 30000
  /spend(ing)?\s+(around\s+)?(₹|rs\.?)?\s*[\d,]+/i,   // spending around 30000
  /cost\s+(of\s+)?(₹|rs\.?)?\s*[\d,]+/i,              // cost of 30000
  /\b(cheap|affordable|luxury|premium|economy|budget)\b/i, // budget tier words
  // Hindi
  /(\d[\d,]*)\s*(रुपये|रुपया)/,
  /बजट/,
  // Tamil
  /(\d[\d,]*)\s*(ரூபாய்|ரூ)/,
  /பட்ஜெட்/,
];

/**
 * Detects budget information from the transcript.
 *
 * @param text - Lowercased transcript text
 * @returns The matched budget string, or null
 */
function detectBudget(text: string): string | null {
  for (const pattern of BUDGET_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return null;
}
```

---

## Step 2.3 — Create `frontend/components/popups/BudgetStarSelector.tsx`

This is the star-rating widget for budget selection. It is used in:
- The budget pop-up (Phase 2)
- The review screen budget field (Phase 3)

**File header:**

```ts
/**
 * BudgetStarSelector.tsx — Star-rating widget for selecting travel budget tier (1–5 stars).
 * Used in the budget pop-up and on the review screen.
 * VoiceBerry | Ulavi Technologies
 */
'use client';
// Client component: uses useState for hover/selection state.
```

### Budget Tier Constants

```ts
import { Star } from 'lucide-react'; // Star icon — already installed
import { t } from '@/lib/i18n';
import type { SupportedLang, LangStrings } from '@/lib/i18n';

/** Minimum touch target size in pixels (mobile accessibility standard). */
const MIN_TOUCH_TARGET_PX = 44;

/** Star icon size in pixels. */
const STAR_ICON_SIZE_PX = 32;

/** Orange colour for filled stars (brand colour). */
const STAR_FILLED_COLOR = '#E85D22';

/** Grey colour for empty/unselected stars. */
const STAR_EMPTY_COLOR = '#D1D5DB';

/** 100ms fill transition — fast enough to feel instant, slow enough to be visible. */
const STAR_TRANSITION_DURATION_MS = 100;

/**
 * Defines the 5 budget tiers, each mapped to a pair of i18n keys.
 * Index 0 = 1 star (Economy), Index 4 = 5 stars (Luxury).
 */
const BUDGET_TIERS: readonly {
  labelKey: keyof LangStrings;
  rangeKey: keyof LangStrings;
}[] = [
  { labelKey: 'budgetTier1Label', rangeKey: 'budgetTier1Range' },
  { labelKey: 'budgetTier2Label', rangeKey: 'budgetTier2Range' },
  { labelKey: 'budgetTier3Label', rangeKey: 'budgetTier3Range' },
  { labelKey: 'budgetTier4Label', rangeKey: 'budgetTier4Range' },
  { labelKey: 'budgetTier5Label', rangeKey: 'budgetTier5Range' },
] as const;
```

### The `budgetRatingToString` Helper

Export this so the review page and the pop-up can both use it:

```ts
/**
 * Converts a numeric star rating (1–5) to a human-readable budget string
 * for display in emails and on the review screen.
 *
 * @param rating - Star count selected by the user (1–5). 0 = not selected.
 * @param lang   - Language code for localised tier label text.
 * @returns A formatted string like "⭐⭐⭐ Mid-range (₹25,000 – ₹50,000/person)",
 *          or an empty string if rating is 0.
 */
export function budgetRatingToString(rating: number, lang: SupportedLang): string {
  if (rating === 0 || rating > BUDGET_TIERS.length) return '';
  const tier = BUDGET_TIERS[rating - 1]; // Convert 1-based rating to 0-based index
  const tierLabel = t(lang, tier.labelKey);
  const tierRange = t(lang, tier.rangeKey);
  return `${'⭐'.repeat(rating)} ${tierLabel} (${tierRange})`;
}
```

### Props Interface

```ts
/**
 * BudgetStarSelectorProps — props for the star-based budget rating widget.
 * VoiceBerry | Ulavi Technologies
 */
interface BudgetStarSelectorProps {
  /** Currently selected star count (1–5). 0 = nothing selected yet. */
  value: number;
  /**
   * Fired when the user taps a star.
   * Receives the new star count (1–5) as an integer.
   * Called with 0 if the user taps the already-selected star (deselect).
   */
  onChange: (rating: number) => void;
  /** Language code — used to render tier labels in the correct language. */
  lang: SupportedLang;
}
```

### Component Behaviour

```ts
export function BudgetStarSelector({ value, onChange, lang }: BudgetStarSelectorProps) {
  // hoverRating tracks which star the user is hovering over (desktop).
  // 0 = no hover. Used to show a preview of the selection.
  const [hoverRating, setHoverRating] = useState<number>(0);

  /**
   * Handles a star click.
   * Tapping the already-selected star deselects (resets to 0).
   *
   * @param starIndex - 1-based star number that was clicked (1–5)
   */
  function handleStarClick(starIndex: number): void {
    const newRating = starIndex === value ? 0 : starIndex;
    onChange(newRating);
  }

  // The rating to display visually (hover preview takes priority over selection)
  const displayRating = hoverRating > 0 ? hoverRating : value;

  // Current tier info (based on displayRating)
  const activeTier = displayRating > 0 ? BUDGET_TIERS[displayRating - 1] : null;

  return (
    <div role="group" aria-label={t(lang, 'popupBudgetQuestion')}>
      {/* Stars row */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length: 5 }, (_, i) => i + 1).map((starIndex) => {
          const isFilled = starIndex <= displayRating;
          return (
            <button
              key={starIndex}
              type="button"
              aria-label={`${starIndex} ${isFilled ? 'filled' : 'empty'} star`}
              aria-pressed={value === starIndex}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => setHoverRating(starIndex)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                // Minimum 44×44px touch target (mobile accessibility)
                width: MIN_TOUCH_TARGET_PX,
                height: MIN_TOUCH_TARGET_PX,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                // Smooth colour transition
                transition: `color ${STAR_TRANSITION_DURATION_MS}ms ease`,
                color: isFilled ? STAR_FILLED_COLOR : STAR_EMPTY_COLOR,
              }}
            >
              <Star
                size={STAR_ICON_SIZE_PX}
                fill={isFilled ? 'currentColor' : 'none'}
                stroke="currentColor"
              />
            </button>
          );
        })}
      </div>

      {/* Tier label and range */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        {activeTier ? (
          <>
            <p style={{ fontWeight: 700, margin: 0 }}>
              {t(lang, activeTier.labelKey)}
            </p>
            <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>
              {t(lang, activeTier.rangeKey)}
            </p>
          </>
        ) : (
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>
            {t(lang, 'budgetStarPlaceholder')}
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## Step 2.4 — Create `frontend/components/popups/TripDetailPopup.tsx`

A bottom-sheet modal. It asks ONE question. For budget, it renders `BudgetStarSelector` instead of a text input.

**File header:**

```ts
/**
 * TripDetailPopup.tsx — Bottom-sheet modal asking one trip detail question at a time.
 * Renders different input types depending on the field: text for city/passengers/dates,
 * BudgetStarSelector for the budget field.
 * VoiceBerry | Ulavi Technologies
 */
'use client';
// Client component: uses useState, useEffect, keyboard event listeners.
```

### CSS Animations — Add to `globals.css`

```css
/* Bottom sheet animation for TripDetailPopup */
@keyframes vb-sheet-up {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

@keyframes vb-sheet-down {
  from { transform: translateY(0);    opacity: 1; }
  to   { transform: translateY(100%); opacity: 0; }
}

.vb-sheet-enter { animation: vb-sheet-up   200ms ease-out both; }
.vb-sheet-exit  { animation: vb-sheet-down 150ms ease-in  both; }
```

### Props Interface

```ts
interface TripDetailPopupProps {
  /** Language code for all displayed text. */
  lang: SupportedLang;
  /** Which trip detail this pop-up is collecting. Drives question text and input type. */
  field: TripDetailField;
  /** 1-based index of this pop-up in the overall queue (shown as "2 of 4"). */
  currentStep: number;
  /** Total number of pop-ups in the queue (shown as "2 of 4"). */
  totalSteps: number;
  /**
   * Called when the user submits a value.
   * For city/passengers: the text input value.
   * For dates: "fromDate | toDate" (pipe-separated).
   * For budget: the result of budgetRatingToString().
   */
  onSubmit: (value: string) => void;
  /**
   * Called when the user taps Skip.
   * The parent stores an empty string for this field and moves to the next pop-up.
   */
  onSkip: () => void;
}
```

### Focus Trap Logic

```ts
/**
 * Traps keyboard focus within the modal while it is open.
 * Implements Tab/Shift+Tab cycling and Escape key to skip.
 *
 * @param containerRef - Ref to the modal container element
 * @param onEscape     - Called when the user presses Escape
 */
function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  onEscape: () => void,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => !el.closest('[aria-hidden="true"]'));

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, onEscape]);
}
```

### Question Text Map

```ts
/** Maps TripDetailField to its i18n question key. */
const FIELD_QUESTION_KEY: Record<TripDetailField, keyof LangStrings> = {
  city:       'popupCityQuestion',
  dates:      'popupDatesQuestion',
  passengers: 'popupPassengersQuestion',
  budget:     'popupBudgetQuestion',
};
```

### Component Structure

The modal renders:
1. **Backdrop** — semi-transparent dark overlay, full screen
2. **Sheet** — white card that slides up from the bottom
3. Inside the sheet:
   - Step indicator: "2 of 4" (top-right, small, grey)
   - Question text (large, bold, `id="popup-question-text"`)
   - Input area (see below)
   - Footer with Skip (left) and Next (right)

**Input area by field type:**

```tsx
function renderInputArea(field: TripDetailField): React.ReactNode {
  switch (field) {
    case 'city':
      return (
        <input
          type="text"
          placeholder={t(lang, 'popupCityPlaceholder')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />
      );


    case 'dates':
      // NOTE: Free-form Dates (Problem 2 from main plan): Accept free-form text input for dates.
      // Do NOT attempt to parse or validate dates on the client. Display exactly what the user typed
      // on the review screen and include it as-is in the database payload and emails.
      return (

        <>
          <input
            type="text"
            placeholder={t(lang, 'popupDatesFromPlaceholder')}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            autoFocus
          />
          <input
            type="text"
            placeholder={t(lang, 'popupDatesToPlaceholder')}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </>
      );

    case 'passengers':
      return (
        <input
          type="text"
          placeholder={t(lang, 'popupPassengersPlaceholder')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />
      );

    case 'budget':
      return (
        <BudgetStarSelector
          value={starRating}
          onChange={setStarRating}
          lang={lang}
        />
      );

    default:
      return null;
  }
}
```

**Submit value building:**

```ts
/**
 * Builds the value to store for the current field.
 * Called when the user taps "Next".
 */
function buildSubmitValue(): string {
  switch (field) {
    case 'city':       return inputValue.trim();
    case 'passengers': return inputValue.trim();
    case 'dates':      return [dateFrom.trim(), dateTo.trim()].filter(Boolean).join(' — ');
    case 'budget':     return budgetRatingToString(starRating, lang);
    default:           return '';
  }
}
```

**Next button disabled state:**

```ts
// The "Next" button should be disabled only for the budget field when no star is selected.
// All other fields can be submitted empty (they're optional).
const isNextDisabled = field === 'budget' && starRating === 0;
```

**Accessibility attributes on the modal container:**

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="popup-question-text"
  ref={containerRef}
>
```

---

## Step 2.5 — Create `frontend/app/details/page.tsx`

This is Screen 3. It reads the transcript, runs the extractor, and shows pop-ups for missing fields.

**File header:**

```ts
/**
 * page.tsx — Screen 3: Smart trip detail pop-up orchestrator.
 * Runs extractTripDetails() on the transcript, builds a queue of missing fields,
 * and shows one TripDetailPopup at a time. Navigates to /review when queue is empty.
 * VoiceBerry | Ulavi Technologies
 */
'use client';
// Client component: uses Zustand store, next/navigation, and runs client-side extraction.
```

### State

```ts
type DetailsPageStatus = 'analysing' | 'popups' | 'all-detected' | 'done';

const [status, setStatus] = useState<DetailsPageStatus>('analysing');
const [missingQueue, setMissingQueue] = useState<TripDetailField[]>([]);
const [currentIndex, setCurrentIndex] = useState<number>(0);
```

### Constants

```ts
/** Delay before showing the first pop-up after analysis completes. */
const ANALYSIS_DISPLAY_DELAY_MS = 500;

/** How long to show the "all details detected" message before auto-navigating. */
const ALL_DETECTED_DISPLAY_MS = 1_200;
```

### Mount Logic

```ts
/**
 * Builds an ordered list of trip detail fields that are absent from the transcript.
 * Only fields with null values get a pop-up.
 *
 * @param extracted - Result from extractTripDetails()
 * @returns Ordered array of field keys that need user input
 */
function buildMissingFieldQueue(extracted: TripDetails): TripDetailField[] {
  const ALL_FIELDS: TripDetailField[] = ['city', 'dates', 'passengers', 'budget'];

  return ALL_FIELDS.filter((field) => {
    switch (field) {
      case 'city':       return extracted.city === null;
      case 'dates':      return extracted.datesFrom === null;
      case 'passengers': return extracted.passengers === null;
      case 'budget':     return extracted.budget === null;
      default:           return false;
    }
  });
}

useEffect(() => {
  // Guard: if transcript is missing, user navigated directly — send back to /record
  if (!originalTranscript) {
    router.replace('/record');
    return;
  }

  // Run extraction (instant — no API call)
  const extracted = extractTripDetails(originalTranscript);

  // Pre-fill store with any detected values
  if (extracted.city)       setTripCity(extracted.city);
  if (extracted.datesFrom)  setTripDatesFrom(extracted.datesFrom);
  if (extracted.passengers) setTripPassengers(extracted.passengers);
  // Budget from speech is not reliable enough to pre-fill the star selector

  const queue = buildMissingFieldQueue(extracted);

  // Show "analysing" state briefly before the first pop-up
  setTimeout(() => {
    if (queue.length === 0) {
      // All details were detected — skip pop-ups entirely
      setStatus('all-detected');
      setTimeout(() => router.push('/review'), ALL_DETECTED_DISPLAY_MS);
    } else {
      setMissingQueue(queue);
      setStatus('popups');
    }
  }, ANALYSIS_DISPLAY_DELAY_MS);
}, []);
```

### Pop-up Submit Handler

```ts
/**
 * Handles a value submitted by TripDetailPopup.
 * Stores the value in Zustand and advances to the next pop-up.
 *
 * @param value - The value submitted by the user (may be empty if they filled nothing)
 */
function handlePopupSubmit(value: string): void {
  const field = missingQueue[currentIndex];
  storeFieldValue(field, value);
  advanceQueue();
}

/**
 * Stores the submitted value for the given field in the Zustand store.
 */
function storeFieldValue(field: TripDetailField, value: string): void {
  switch (field) {
    case 'city':       setTripCity(value);       break;
    case 'dates':
      // Value format: "15 Aug 2026 — 20 Aug 2026" (from popup)
      // Split on " — " to get from/to
      const [from = '', to = ''] = value.split(' — ');
      setTripDatesFrom(from.trim());
      setTripDatesTo(to.trim());
      break;
    case 'passengers': setTripPassengers(value); break;
    case 'budget':     setTripBudget(value);     break;
  }
}

/** Advances to the next pop-up, or navigates to /review if queue is exhausted. */
function advanceQueue(): void {
  const nextIndex = currentIndex + 1;
  if (nextIndex >= missingQueue.length) {
    router.push('/review');
  } else {
    setCurrentIndex(nextIndex);
  }
}

/** Handles user tapping Skip — stores empty string and advances. */
function handlePopupSkip(): void {
  storeFieldValue(missingQueue[currentIndex], '');
  advanceQueue();
}
```

### Rendered UI States

```
status === 'analysing':
  → Full-screen centred: spinner + "Analysing your query..." (in user's language)
  → Blurred transcript card visible behind

status === 'all-detected':
  → Full-screen centred: green check icon + "Great! We found all your trip details." (1.2s)

status === 'popups':
  → Transcript card visible (blurred) in background
  → TripDetailPopup rendered on top
  → currentStep = currentIndex + 1, totalSteps = missingQueue.length

status === 'done':
  → (never renders — router.push('/review') is called before this state)
```

---

## Phase 2 Testing — Full Verification Checklist

Run through EVERY item before moving to Phase 3.

### Build Tests

```bash
cd frontend
npm run build   # 0 errors, 0 TypeScript errors
npm run lint    # 0 lint errors
```

### Trip Extractor Unit Tests (Run in Browser Console)

Open `localhost:3000` and paste these in the browser console to test the extractor:

```js
// These are integration tests you can manually verify

// Test 1: All 4 details present
const t1 = extractTripDetails("I want to go to Goa on 15 August for 2 people with a budget of ₹30,000");
console.assert(t1.city === 'Goa', 'City detection failed');
console.assert(t1.datesFrom !== null, 'Date detection failed');
console.assert(t1.passengers !== null, 'Passenger detection failed');
console.assert(t1.budget !== null, 'Budget detection failed');

// Test 2: No details present
const t2 = extractTripDetails("I want to go on a vacation");
console.assert(t2.city === null, 'City should be null');
console.assert(t2.datesFrom === null, 'Date should be null');
console.assert(t2.passengers === null, 'Passengers should be null');
console.assert(t2.budget === null, 'Budget should be null');

// Test 3: Hindi transcript
const t3 = extractTripDetails("मैं मनाली जाना चाहता हूं");
console.assert(t3.city !== null, 'Hindi city detection failed');

// Test 4: Tamil transcript
const t4 = extractTripDetails("நான் கொடைக்கானலுக்கு போக விரும்புகிறேன்");
console.assert(t4.city !== null, 'Tamil city detection failed');
```

### Manual Flow Tests

**Flow 1: No trip details detected (all 4 pop-ups should appear)**
- [ ] Navigate to `/record`
- [ ] Record: "I want to go on a vacation"
- [ ] Click Continue
- [ ] `/details` shows "Analysing your query..." spinner for ~500ms
- [ ] First pop-up appears: City question
- [ ] Fill in "Ooty" → click Next
- [ ] Second pop-up: Dates question — shows two text inputs ("From" and "To")
- [ ] Fill in from and to dates → click Next
- [ ] Third pop-up: Passengers question
- [ ] Fill in "2 adults" → click Next
- [ ] Fourth pop-up: Budget question — shows 5 stars (NOT a text input)
- [ ] After all 4 → navigates to `/review`

**Flow 2: City and passengers detected (only 2 pop-ups)**
- [ ] Record: "trip to Goa for 2 people"
- [ ] Continue → `/details`
- [ ] Only 2 pop-ups appear: Dates, then Budget
- [ ] After 2 pop-ups → navigates to `/review`

**Flow 3: All 4 details detected (zero pop-ups)**
- [ ] Record: "I want to go to Kodaikanal on 15th August for 3 people with a budget of 30,000 rupees"
- [ ] Continue → `/details`
- [ ] "Analysing your query..." appears briefly
- [ ] "Great! We found all your trip details." appears
- [ ] Auto-navigates to `/review` after ~1.2 seconds

**Flow 4: Direct visit to `/details`**
- [ ] Navigate directly to `localhost:3000/details` in the browser address bar
- [ ] Should be immediately redirected to `/record`

**Budget Star Selector Tests**
- [ ] Budget pop-up shows 5 empty stars
- [ ] Tapping 3rd star fills stars 1, 2, 3 — leaves 4 and 5 empty
- [ ] Tier label shows "Mid-range" (or equivalent in selected language)
- [ ] Tier range shows "₹25,000 – ₹50,000 per person"
- [ ] Tapping the 3rd star again → all stars go empty, placeholder text shows
- [ ] "Next" button is disabled when 0 stars selected
- [ ] "Next" button is enabled after any star is tapped (even 1 star)
- [ ] Clicking "Skip" on the budget pop-up → stores empty string → moves to next pop-up

**Language Tests**
- [ ] Select Hindi → all pop-up question text in Hindi
- [ ] Budget tier labels ("Economy", "Mid-range", etc.) appear in Hindi
- [ ] Select Tamil → all pop-up question text in Tamil
- [ ] Budget tier labels appear in Tamil

**Accessibility Tests**
- [ ] Pop-up has `role="dialog"` attribute
- [ ] Pop-up has `aria-modal="true"` attribute
- [ ] Pop-up has `aria-labelledby` pointing to the question text element
- [ ] First input inside pop-up receives focus automatically on open
- [ ] Tab key cycles through: input → Skip button → Next button → input (loop)
- [ ] Pressing Escape key calls onSkip() (same as tapping Skip)
- [ ] After pop-up closes, focus should return to the page background

**Animation Tests**
- [ ] Pop-up card slides up from the bottom on open (200ms)
- [ ] Backdrop fades in on open
- [ ] Animation is smooth on mobile (test on real device or Chrome mobile emulation)
- [ ] No layout shift during animation

**Touch Target Tests**
- [ ] Each star button is at least 44×44px (test in Chrome DevTools: Elements → computed styles)

**Skip Tests**
- [ ] Skipping city → stored as empty string → next pop-up appears
- [ ] Skipping all 4 → navigates to `/review` with all trip fields empty
- [ ] Review screen shows "Not provided" for all skipped fields

### Store State Tests

After completing pop-ups, in the browser console:
```js
// Verify Zustand store contains the submitted values
const store = window.__zustand_store__; // or use React DevTools
```

Alternatively, use the React DevTools extension to inspect the Zustand store state.

### Code Quality Check

- [ ] `tripExtractor.ts` has file header comment
- [ ] `BudgetStarSelector.tsx` has file header comment
- [ ] `TripDetailPopup.tsx` has file header comment
- [ ] `details/page.tsx` has file header comment
- [ ] Every function has a JSDoc comment
- [ ] `budgetRatingToString` is exported and has JSDoc
- [ ] `buildMissingFieldQueue` has JSDoc
- [ ] No `any` types
- [ ] All constants named with UPPER_SNAKE_CASE
- [ ] `npm run lint` returns 0 errors

---

## Known Edge Cases and How to Handle Them

| Edge Case | What Happens | How It's Handled |
|---|---|---|
| All 4 details in transcript | Zero pop-ups | Auto-navigate to /review after 1.2s "all detected" message |
| User types nothing in a pop-up and clicks Next | Empty string stored | Review shows "Not provided" — not an error |
| User clicks Skip on budget | Empty string stored | Review shows "Not provided" — budget is optional |
| User types in "dates from" but not "to" | "15 Aug" stored as datesFrom, datesTo stays empty | Review shows "15 Aug" for from, "Not provided" for to |
| Transcript is empty (user navigates to /details directly) | Redirect to /record | Handled by `if (!originalTranscript) router.replace('/record')` |
| Extractor false-positive (e.g. "may" detected as the month May) | Pop-up may not appear for dates | Acceptable — extractor is conservative, but not perfect |

---

**Phase 2 is complete when:** All checklist items pass, `npm run build` passes, and the full flow from recording to `/review` works with pop-ups.

**Next: [Phase 3 → Audio Upload + Review Screen + Dual Email](./PHASE_3_AUDIO_REVIEW_EMAIL.md)**

---

*Ulavi Technologies — Confidential*
