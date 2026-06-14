## User Flow (notes by Anas Alam)

Overview:

`/  →  /record  →  /details  →  /review  →  /confirmation`

---

### Screen 0 — Language Picker (`/`)

What the user does here:

1. Choose a UI language from a searchable list of **72 languages** (71 explicit + auto-detect).
2. The chosen language is stored in Zustand + localStorage and drives all UI translations.
3. Tap **Continue** to go to the Record screen.

Key UI elements:

- `LanguagePicker` component with a search field — user can type to filter instead of scrolling.
- Each language shows both its native name and English name.
- Selected language persists across page reloads via Zustand `persist` middleware.

---

### Screen 1 — Record (`/record`)

What I expect the user to do:

1. Choose a spoken language from the inline language dropdown (all 72 options, searchable).
2. Tap the mic to start recording and tap again to stop (or wait for the 60s auto-stop).
3. Wait while the app uploads audio and polls the transcription service (AssemblyAI).
4. See the original-language transcript preview.
5. Tap **Continue to review** when the transcript is available.

Key UI elements:

- Language dropdown (`LanguageSelect`)
- Recording timer (max `00:60` shown as `00:00 / 01:00`)
- Mic button states: idle, recording, processing, done
- Transcript preview panel
- Error banner on mic/API failures

Technical notes:

- Audio is captured with `MediaRecorder` (WebM/Opus when supported).
- The server route `/api/aai/transcribe` uploads audio to AssemblyAI and polls the transcript endpoint until completion (~30 polls at 3s intervals, ~90s window).
- The detected language code returned by AssemblyAI is normalised to a two-letter base code (e.g. `hi-IN` → `hi`, `en-US` → `en`) before being stored and used for translation.
- When AssemblyAI provides `translated_texts.en`, that is used as the English translation. Otherwise the app falls back to `/api/translate` which proxies MyMemory.
- Both the original transcript and the English translation are persisted in `useQueryStore` for downstream screens.

---

### Screen 2 — Details (`/details`)

What the user does here:

1. Answer a series of smart pop-up questions (one at a time) about their trip.
2. Each pop-up can be skipped.

Pop-up questions:

- **Destination city** — free-text input
- **Travel dates** — from / to date pickers
- **Passengers** — adult and child counters
- **Budget** — star selector (5 tiers with localised labels and price ranges)

Technical notes:

- `extractTripDetails()` runs entirely client-side — zero API cost.
- All collected details are stored in Zustand.
- The Details screen is fully translated into the user's selected language via `useTranslation`.

---

### Screen 3 — Review (`/review`)

What the user does here:

1. View and **edit** the original transcript (in the user's local language) — the editable field fires a debounced auto-translation.
2. View and optionally edit the English translation (auto-populated, updated automatically after 800ms of inactivity).
3. Review trip details (city, dates, passengers, budget).
4. Enter **Name**, **Email**, and **Mobile Number** with country code.
5. Tap **Send** when the form validates.

Auto-translation behaviour:

- When the user edits the original-language transcript, a **debounced timer (800ms)** detects when typing has stopped.
- A "Translating…" inline indicator replaces the manual translate button.
- The translation request fires automatically to `/api/translate` (MyMemory) — no manual button press required.
- Re-translation always uses the **latest edited text**, ensuring accuracy even after user modifications.

Validation rules (as implemented):

- Transcript must not be empty.
- Name must not be empty.
- Email must be a valid email address (Zod validated).
- Country code expects `+` followed by 1–4 digits.
- National number accepts 6–15 digits (spaces allowed).

Send behaviour implemented in the code:

1. We build a `phone_full` string (for example `+91 98765 43210`).
2. The client sends to `POST /api/queries` with the `ui_language` field.
3. The route stores the submission in MongoDB Atlas and returns the inserted record ID.
4. **Customer email** is sent via EmailJS in the user's selected language.
5. **Ops/support email** is always in English — any local-language field values (city, passenger counts, budget tier) are translated server-side before sending.
6. On success we reset `useQueryStore` and navigate to `/confirmation`.

UI notes:

- Country code dropdown includes a wide range of codes (see `PhoneInput` component).
- The **Send** button is sticky on mobile to make it reachable.
- Page is fully translated into the user's selected language.

---

### Screen 4 — Confirmation (`/confirmation`)

Shown to the user:

- A green animated checkmark component.
- The confirmation message translated into the user's selected language (e.g. "Thank you for your query. Our team will get back to you shortly.").
- A button labelled **Submit another query** (localised) which navigates back to `/record` and resets state.

No inputs on this screen.

---

### State between screens

State (in `useQueryStore`) that flows through the screens:

| Field | Set on | Used on |
|---|---|---|
| `uiLanguage` | Language Picker | All screens (drives UI translation) |
| `sourceLanguage` | Record | Transcribe API, Review, Email |
| `originalTranscript` | Record / Review edit | Review (editable), Email |
| `translatedTranscript` | Record / Review auto-translate | Review (editable), Email, MongoDB |
| `tripCity` | Details | Review, Email |
| `tripDates` | Details | Review, Email |
| `tripPassengers` | Details | Review, Email |
| `tripBudget` | Details | Review, Email |
| `phoneCountryCode` | Review (default `+91`) | Email, MongoDB |
| `phoneNumber` | Review | Email, MongoDB |
| `userName` | Review | Email, MongoDB |

The store is reset after a successful send.

---

### Error paths (what I implemented)

| Situation | User feedback |
| ------------------------------ | ---------------------------------------- |
| Browser has no `MediaRecorder` | Banner on the record screen |
| Mic permission denied | Inline error and idle state |
| Transcription API error | Error banner with details when available |
| Translation timeout/error | English field retains last known value |
| Invalid phone on Send | Inline error under phone field |
| Invalid email on Send | Inline error under email field |
| EmailJS/network failure | Error banner on review screen |
