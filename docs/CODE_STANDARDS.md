# Ulavi Technologies — Code Writing Standards

> **Mandatory for every file in this project.**  
> These are not preferences. They are hard requirements for code review.  
> If your code breaks any of these rules, it must be fixed before committing.

---

## 1. Naming Conventions

Follow these naming schemes without exception:

```
Variables:        camelCase          tripCity, userEmail, isSubmitting, audioUrl
Constants:        UPPER_SNAKE_CASE   MAX_RECORD_SECONDS, POLL_INTERVAL_MS, NOT_PROVIDED
Types/Interfaces: PascalCase         TripDetails, QueryPayload, SupportedLang
React Components: PascalCase         TripDetailPopup, BudgetStarSelector, LanguagePicker
Files:            kebab-case         trip-extractor.ts, budget-star-selector.tsx
API route dirs:   kebab-case         /api/aai/transcribe, /api/audio/upload
Env vars:         UPPER_SNAKE_CASE   ASSEMBLYAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY
```

---

## 2. Every Function Needs a JSDoc Comment

**The reader must understand what a function does WITHOUT reading its body.**  
If you write a function without a JSDoc comment, it will be rejected in code review.

```ts
// BAD — reader must decode the logic to understand intent
export function check(t: string) {
  return /\d+/.test(t);
}

// GOOD — intent, params, and return value are documented
/**
 * Returns true if the transcript contains a digit sequence
 * that likely represents a passenger count or numeric budget.
 *
 * @param transcript - Raw transcribed text from AssemblyAI
 * @returns true if a number pattern is found, false otherwise
 */
export function containsNumericDetail(transcript: string): boolean {
  return /\d+/.test(transcript);
}
```

**JSDoc format:**

- `@param name - description` (dash, not colon)
- `@returns description`
- `@throws description` — for functions that can throw
- First line: one-sentence summary
- Leave a blank line before `@param` blocks

---

## 3. No Magic Values — Name Every Constant

Every literal value that isn't `true`, `false`, `null`, `undefined`, `0`, `1`, or `''` must be a named constant.

```ts
// BAD — what does 60 mean? What does 1000 mean?
if (elapsed >= 60) stopRecording();
setTimeout(navigate, 1000);
const filename = `${Date.now()}-${id.slice(0, 8)}.webm`;

// GOOD — intent is clear from the name
const MAX_RECORD_SECONDS = 60;
const POST_DETECTION_DELAY_MS = 1_000;
const AUDIO_ID_LENGTH = 8;
const AUDIO_FILE_EXTENSION = ".webm";

if (elapsed >= MAX_RECORD_SECONDS) stopRecording();
setTimeout(navigate, POST_DETECTION_DELAY_MS);
const filename = `${Date.now()}-${id.slice(0, AUDIO_ID_LENGTH)}${AUDIO_FILE_EXTENSION}`;
```

---

## 4. One Responsibility Per Function

A function must do exactly one thing.  
A component must not handle state, API calls, AND rendering all in one block.

```ts
// BAD — one handleSend function does three different things
async function handleSend() {
  const errors = {};
  if (!email) errors.email = 'Required';
  if (!phone) errors.phone = 'Required';
  if (Object.keys(errors).length) { setErrors(errors); return; }

  const res = await fetch('/api/queries', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Send failed');

  router.push('/confirmation');
}

// GOOD — each responsibility is named and independently testable
/**
 * Validates the contact form fields.
 * @returns true if all fields pass, false otherwise (also sets error state)
 */
function validateContactForm(email: string, phone: string): boolean { ... }

/**
 * POSTs the query payload to the submissions API.
 * @throws Error with message if the server returns a non-OK status.
 */
async function submitQuery(payload: QueryPayload): Promise<void> { ... }

/** Navigates to the confirmation screen after a successful submission. */
function navigateToConfirmation(): void { ... }

async function handleSend(): Promise<void> {
  if (!validateContactForm(userEmail, phoneFull)) return;
  await submitQuery(buildPayload());
  navigateToConfirmation();
}
```

---

## 5. Explicit Types — No `any`, No Implicit Returns

Every function parameter and every `await` result must have an explicit type.

```ts
// BAD
const result = await fetch(url).then((r) => r.json());
function buildPayload(data) {
  return { ...data };
}
const handleChange = (e) => setValue(e.target.value);

// GOOD
const result = (await fetch(url).then((r) => r.json())) as TranscriptResponse;
function buildPayload(data: ReviewFormState): QueryPayload {
  return { ...data };
}
const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
  setValue(e.target.value);
```

**When to use `as`:**  
Only when the fetch response type is known and stable (e.g. your own API routes). Never use `as any`.

---

## 6. Error Handling Must Be Explicit

Every `try-catch` must have a documented, intentional error path.  
**Never swallow errors silently.**

```ts
// BAD — error is caught and thrown away
try {
  await sendCustomerEmail(params);
} catch {}

// ALSO BAD — error is logged but the developer hasn't thought about impact
try {
  await sendCustomerEmail(params);
} catch (err) {
  console.error(err);
}

// GOOD — error impact is understood and documented
try {
  await sendCustomerEmail(params);
  // Mark as sent so the ops dashboard shows correct status
  await markEmailSent(insertedId, "customer");
} catch (err: unknown) {
  // Email failure is NON-FATAL — the submission is already saved in MongoDB.
  // The ops team can manually follow up using the MongoDB record if needed.
  // Log enough detail to diagnose the failure: submission ID + the error.
  console.error(
    "[api/queries] customer email failed — submission id:",
    insertedId,
    err,
  );
}
```

---

## 7. Component Props Typed with an Interface

Never type props inline. Always define a named interface.

```tsx
// BAD — inline props type is hard to reuse and hard to document
function BudgetSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  ...
}

// GOOD — named interface with JSDoc on every prop
/**
 * BudgetStarSelectorProps — props for the star-based budget rating widget.
 *  Ulavi Technologies
 */
interface BudgetStarSelectorProps {
  /** Currently selected star count (1–5). 0 = nothing selected yet. */
  value: number;
  /**
   * Fired when the user taps a star.
   * Receives the new star count (1–5) as an integer.
   * If the user taps the already-selected star, this is called with 0 (deselect).
   */
  onChange: (rating: number) => void;
  /** Language code used to render tier labels in the correct language. */
  lang: SupportedLang;
}

function BudgetStarSelector({ value, onChange, lang }: BudgetStarSelectorProps) {
  ...
}
```

---

## 8. No Commented-Out Code in Commits

If code is temporarily disabled:

```ts
// BAD — dead code with no explanation
// const result = await translateWithDeepL(text, lang);
// if (result) return result;

// GOOD — explicit TODO with reason
// TODO: Enable DeepL translation once DEEPL_API_KEY is provisioned.
// Currently falling back to MyMemory only.
// Tracking: https://github.com/org/repo/issues/42
```

---

## 9. File Header Comment

Every new `.ts` or `.tsx` file must start with this header:

```ts
/**
 * [exact-filename.ts] — [one-line description of what this file does]
 *  Ulavi Technologies
 */
```

**Examples:**

```ts
/**
 * trip-extractor.ts — Heuristic scanner that detects trip details from raw transcripts.
 *  Ulavi Technologies
 */
```

```tsx
/**
 * BudgetStarSelector.tsx — Star-rating widget for selecting travel budget tier.
 *  Ulavi Technologies
 */
```

---

## 10. Client/Server Boundary Comment

Every API route file (`route.ts` inside `/app/api/`) must start with this comment block immediately after the file header:

```ts
// ── SERVER ONLY ───────────────────────────────────────────────────────────────
// This file runs on the server (Next.js API route). Rules:
// 1. Do NOT import any browser APIs (window, document, navigator, MediaRecorder).
// 2. Do NOT prefix environment variables with NEXT_PUBLIC_ — they will be
//    exposed to the browser bundle and that is a security vulnerability.
// 3. Do NOT import Zustand store — server has no access to client state.
// 4. Keep secrets (ASSEMBLYAI_API_KEY, MONGODB_URI, etc.) in process.env only.
```

Every component file that uses browser APIs must start with:

```ts
"use client";
```

and include a comment explaining WHY it needs to be a client component:

```tsx
"use client";
// Client component: uses MediaRecorder API and Zustand store.
```

---

## 11. Import Order

Group and order imports as follows (enforced by ESLint):

```ts
// 1. React / Next.js
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Star } from "lucide-react";

// 3. Internal — types
import type { SupportedLang, LangStrings } from "@/lib/i18n";
import type { TripDetails } from "@/lib/tripExtractor";

// 4. Internal — lib / utilities
import { t } from "@/lib/i18n";
import { extractTripDetails } from "@/lib/tripExtractor";

// 5. Internal — components
import { BudgetStarSelector } from "@/components/popups/BudgetStarSelector";

// 6. Internal — store
import { useQueryStore } from "@/store/useQueryStore";

// 7. Styles (if any)
import styles from "./page.module.css";
```

---

## 12. `console.log` Policy

**Never commit a `console.log` in production code.**

| What you want to log                      | Use instead                                  |
| ----------------------------------------- | -------------------------------------------- |
| Debug during development                  | `console.log` — remove before commit         |
| Recoverable error (non-fatal)             | `console.warn('[module] message', context)`  |
| Fatal error / unexpected failure          | `console.error('[module] message', context)` |
| Sensitive data (email, phone, transcript) | **Never log — remove entirely**              |

Format: always prefix with the module name in square brackets:

```ts
console.warn(
  "[api/audio/upload] Supabase upload failed — continuing without audio URL",
);
console.error(
  "[api/queries] ops email failed — submission id:",
  insertedId,
  err,
);
```

---

## Summary Checklist (Before Every Commit)

Run through this before committing any file:

- [ ] File starts with 3-line header comment
- [ ] API route files have the `// ── SERVER ONLY` comment block
- [ ] Every function has a JSDoc comment
- [ ] No magic literal values — all named as constants
- [ ] No `any` types anywhere
- [ ] No inline props types — all use named interfaces
- [ ] Every `try-catch` has an explicit error path with a comment
- [ ] No `console.log` — only `console.warn` or `console.error` with module prefix
- [ ] No commented-out dead code — only `// TODO:` with explanation
- [ ] `npm run lint` returns zero errors
- [ ] `npm run build` passes with zero TypeScript errors

---

_Ulavi Technologies — Confidential_
