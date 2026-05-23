## User Flow (notes by Anas Alam)

Overview:

`/record  →  /review  →  /confirmation`

---

### Screen 1 — Record (`/record`)

What I expect the user to do:

1. Choose a spoken language (the UI supports `auto` detection and common languages).
2. Tap the mic to start recording and tap again to stop (or wait for the 60s auto-stop).
3. Wait while the app uploads audio and polls the transcription service.
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
- The server route `/api/aai/transcribe` uploads audio to AssemblyAI and polls the transcript endpoint until completion (I use ~30 polls at 3s intervals).
- When AssemblyAI provides `translated_texts.en` we prefer that; otherwise the app also supports a fallback translation endpoint (`/api/translate`) which proxies MyMemory.
- I persist state in `useQueryStore` so the review screen can use both the original and translated text.

---

### Screen 2 — Review (`/review`)

What the user does here:

1. Edit the **Transcript (English)** textarea if needed.
2. Enter your name.
3. Select the country code and enter the national number.
4. Tap **Send** when the form validates.

Validation rules (as implemented):

- Transcript must not be empty.
- Country code expects `+` followed by 1–4 digits.
- National number accepts 6–15 digits (spaces allowed).

Send behaviour implemented in the code:

1. We build a `phone_full` string (for example `+91 98765 43210`).
2. The client sends directly to `POST /api/queries` implemented inside the Next.js app.
3. The route stores the submission in MongoDB Atlas and returns the inserted record ID.
4. Email is sent via EmailJS from the client and contains `name`, `original_query`, `translated_query`, `phone`, and `submitted_at`.
5. On success we reset `useQueryStore` and navigate to `/confirmation`.

UI notes:

- Country code dropdown options include: `+91`, `+1`, `+44`, `+61`, `+81` (see `CountryCodeSelect`).
- The `Send` button is sticky on mobile to make it reachable.

---

### Screen 3 — Confirmation (`/confirmation`)

Shown to the user:

- A green animated checkmark component
- The exact message: "Thank you for your query. Our team will get back to you shortly."
- A button labelled **Submit another query** which navigates back to `/record` and resets state.

No inputs on this screen.

---

### State between screens

State (in `useQueryStore`) that flows through the screens:

- `sourceLanguage` — set on Record, included in payloads
- `originalTranscript` — set on Record, included in email
- `translatedTranscript` — set on Record or via translation; editable on Review
- `phoneCountryCode` — default `+91`, changeable on Review
- `phoneNumber` — national number entered on Review
- `userName` — entered on Review and included in email + MongoDB record

The store is reset after a successful send.

---

### Error paths (what I implemented)

| Situation                      | User feedback                            |
| ------------------------------ | ---------------------------------------- |
| Browser has no `MediaRecorder` | Banner on the record screen              |
| Mic permission denied          | Inline error and idle state              |
| Transcription API error        | Error banner with details when available |
| Invalid phone on Send          | Inline error under phone field           |
| EmailJS/network failure        | Error banner on review screen            |
