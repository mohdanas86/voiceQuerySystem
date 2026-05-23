# Testing & Demo Checklist (checked by Anas Alam)

This is the practical checklist I use before a demo or submission. Follow it step-by-step and mark items as you verify them.

---

## Environment

- [ ] `.env.local` contains a valid `ASSEMBLYAI_API_KEY`
- [ ] `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`, `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` are set
- [ ] `MONGODB_URI` and `MONGODB_DB` are set
- [ ] Dev server restarted after env changes
- [ ] Testing on `localhost` or over `HTTPS` (microphone requires a secure context)

---

## Feature 1 — Voice input

- [ ] Mic starts recording on tap
- [ ] Mic stops on second tap
- [ ] Timer counts during recording
- [ ] Recording stops automatically at 60 seconds
- [ ] Status text updates: idle → recording → processing → done

---

## Feature 2 — Speech-to-text

- [ ] After recording, original-language text appears in the preview on the record screen
- [ ] Language-specific transcriptions look reasonable when the language is set
- [ ] Auto-detect produces usable results for unlisted languages

---

## Feature 3 — English translation

- [ ] Review screen shows English text in the transcript field
- [ ] Review screen shows a name field above the transcript preview
- [ ] For non-English input, either AssemblyAI provides `translated_texts.en` or the fallback `/api/translate` (MyMemory) returns a reasonable translation

---

## Feature 4 — Mobile number

- [ ] Field label reads **Your Mobile Number**
- [ ] Country codes available: `+91`, `+1`, `+44`, `+61`, `+81`
- [ ] Placeholder `98765 43210` appears in the input
- [ ] Send is disabled with an empty or invalid number
- [ ] Inline error shown when submit clicked with invalid number
- [ ] Valid example `+91 9876543210` enables Send when transcript is present

---

## Feature 5 — Email submission

- [ ] Send shows “Sending…” while in progress
- [ ] Email arrives at the configured support inbox
- [ ] Email contains the user name (`name`)
- [ ] Email contains the English query (`translated_query`)
- [ ] Email contains the full phone with country code
- [ ] Email contains the timestamp (`submitted_at`)

- [ ] Submission is stored in the `query_submissions` collection in MongoDB Atlas

Notes: EmailJS sends from the browser; check EmailJS quota and template variable names if delivery fails.

---

## Feature 6 — Confirmation

- [ ] Redirect to `/confirmation` after a successful send
- [ ] Exact confirmation text present: "Thank you for your query. Our team will get back to you shortly."
- [ ] **Submit another query** returns to a fresh record screen

---

## Cross-device checks

- [ ] Android Chrome — full flow
- [ ] iPhone Safari — full flow (HTTPS required)
- [ ] Desktop Chrome or Edge — full flow
- [ ] Test at least two country codes (I recommend `+91` and `+1`)

---

## UI regression checks

- [ ] No horizontal scroll on small viewports
- [ ] Language dropdown usable and styled
- [ ] Country code dropdown aligns with phone input on review
- [ ] Back link on review safely returns to record

---

## Demo script (1–2 minutes)

1. Open the app to the Record screen.
2. Select language → record a 10–20 second query → stop.
3. Continue to Review → verify or edit English text.
4. Enter `+91` and a valid test number → Send.
5. Show confirmation screen.
6. Verify received email in the support inbox.

---

## Known limitations (as observed)

- Native `<select>` open-state styling varies across OSs.
- Email delivery depends on EmailJS quota and template correctness.
- AssemblyAI usage is metered; bad keys or rate limits return API errors.

