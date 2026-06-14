# Testing & Demo Checklist (checked by [Anas Alam](https://linkedin.com/in/anas86/))

This is the practical checklist I use before a demo or submission. Follow it step-by-step and mark items as you verify them.

---

## Environment

- [ ] `.env.local` contains a valid `ASSEMBLYAI_API_KEY`
- [ ] `EMAILJS_SERVICE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`, `EMAILJS_CUSTOMER_TEMPLATE_ID`, `EMAILJS_OPS_TEMPLATE_ID` are set
- [ ] `MONGODB_URI` and `MONGODB_DB` are set
- [ ] Dev server restarted after env changes
- [ ] Testing on `localhost` or over `HTTPS` (microphone requires a secure context)

---

## Feature 1 — Language Picker

- [ ] Language picker screen shows 72 languages
- [ ] Search field filters languages by name as user types
- [ ] Selecting a language changes all UI strings on all screens
- [ ] `auto` detect option is available and visible
- [ ] Language selection persists across page reload

---

## Feature 2 — Voice input

- [ ] Mic starts recording on tap
- [ ] Mic stops on second tap
- [ ] Timer counts during recording
- [ ] Recording stops automatically at 60 seconds
- [ ] Status text updates: idle → recording → processing → done

---

## Feature 3 — Speech-to-text

- [ ] After recording, original-language text appears in the preview on the record screen
- [ ] Language-specific transcriptions look reasonable when the language is set
- [ ] Auto-detect (`auto`) produces usable results for unlisted languages
- [ ] Detected language code is normalised correctly (e.g. `hi-IN` stored as `hi`)

---

## Feature 4 — English translation

- [ ] Review screen shows original transcript in user's local language (editable)
- [ ] When user edits the original transcript, the English translation updates automatically after 800ms
- [ ] A "Translating…" inline indicator appears while auto-translation is in progress
- [ ] No manual translate button is needed or present
- [ ] Re-translation always reflects the latest edited original text (not a stale version)
- [ ] For non-English input, either AssemblyAI provides `translated_texts.en` or the MyMemory fallback returns a reasonable translation

---

## Feature 5 — Mobile number & Contact details

- [ ] Name field is present on the Review screen
- [ ] Email field is present on the Review screen and validates format
- [ ] Phone field label reads **Your Mobile Number**
- [ ] Country code dropdown is present
- [ ] Send is disabled with an empty or invalid phone number
- [ ] Send is disabled with an invalid email address
- [ ] Inline error shown when submit clicked with invalid fields
- [ ] Valid example enables the Send button when all required fields are complete

---

## Feature 6 — Email submission

- [ ] Send shows "Sending…" while in progress
- [ ] **Customer email** arrives in the user's selected language
- [ ] Customer email contains the user name, English query, mobile number, and timestamp
- [ ] **Ops/support email** is always in English — city, passenger counts, and budget tier are in English even if user's UI is set to another language
- [ ] Submission is stored in the `query_submissions` collection in MongoDB Atlas

Notes: EmailJS sends from the server (Node.js `emailjs` SDK); check EmailJS quota and template variable names if delivery fails.

---

## Feature 7 — Confirmation

- [ ] Redirect to `/confirmation` after a successful send
- [ ] Confirmation text is shown in the user's selected language
- [ ] **Submit another query** returns to a fresh record screen and resets state

---

## Cross-device checks

- [ ] Android Chrome — full flow
- [ ] iPhone Safari — full flow (HTTPS required)
- [ ] Desktop Chrome or Edge — full flow
- [ ] Test at least two UI languages (e.g. Hindi and Arabic) for page translation
- [ ] Test at least two country codes (recommend `+91` and `+1`)

---

## UI regression checks

- [ ] No horizontal scroll on small viewports
- [ ] Language picker search field usable on mobile
- [ ] Country code dropdown aligns with phone input on review
- [ ] Auto-translate "Translating…" spinner visible during translation
- [ ] Back link on review safely returns to record

---

## Demo script (1–2 minutes)

1. Open the app → Language Picker → select **Hindi** (or any non-English language).
2. Record screen → record a 10–20 second query in that language → stop.
3. Continue to Details → fill in or skip pop-ups.
4. Continue to Review → verify original transcript in Hindi and English translation.
5. Edit a word in the original transcript and watch the English field update automatically (no button needed).
6. Enter name, email, and `+91` with a valid test number → Send.
7. Show confirmation screen (text in Hindi).
8. Verify received emails:
   - Customer email in Hindi.
   - Ops email fully in English.

---

## Known limitations (as observed)

- Native `<select>` open-state styling varies across OSs.
- Email delivery depends on EmailJS quota and template correctness.
- AssemblyAI usage is metered; bad keys or rate limits return API errors.
- MyMemory free tier is limited to 5,000 words/day across all translations.
