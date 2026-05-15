# Testing & Demo Checklist

Use this list before submission or a live demo. Each item maps to the internship grading criteria.

---

## Environment

- [ ] `.env.local` has valid `ASSEMBLYAI_API_KEY`
- [ ] All three `NEXT_PUBLIC_EMAILJS_*` variables set
- [ ] Dev server restarted after env changes
- [ ] Testing on **localhost** or **HTTPS** (mic requirement)

---

## Feature 1 — Voice input

- [ ] Mic starts recording on tap
- [ ] Mic stops on second tap
- [ ] Timer counts up during recording
- [ ] Recording stops automatically at 60 seconds
- [ ] Status text reflects idle / recording / processing / done

---

## Feature 2 — Speech-to-text

- [ ] After recording, original-language text appears in preview on record screen
- [ ] Hindi, Tamil, or other selected language transcribes reasonably when language is set
- [ ] Auto-detect works for an unlisted language

---

## Feature 3 — English translation

- [ ] Review screen shows English in the transcript field
- [ ] Non-English speech produces English text on review (not only raw source script)

---

## Feature 4 — Mobile number

- [ ] Field label reads **Your Mobile Number**
- [ ] Country codes available: `+91`, `+1`, `+44`, `+61`, `+81`
- [ ] Placeholder `98765 43210` visible on number input
- [ ] Send **disabled** with empty number
- [ ] Send **disabled** with invalid number (e.g. `123`)
- [ ] Inline error shown when submit clicked with invalid number
- [ ] Valid example `+91` + `9876543210` enables Send (with non-empty transcript)

---

## Feature 5 — Email submission

- [ ] Send shows “Sending…” while in progress
- [ ] Email arrives at configured support inbox
- [ ] Email contains **English query** (`translated_query`)
- [ ] Email contains **full phone** with country code
- [ ] Email contains **timestamp** (`submitted_at`)
- [ ] Optional: `original_query` present if configured in template

---

## Feature 6 — Confirmation

- [ ] Redirect to `/confirmation` after successful send
- [ ] Exact message: *"Thank you for your query. Our team will get back to you shortly."*
- [ ] **Submit another query** opens a fresh record screen

---

## Cross-device checks

- [ ] Android Chrome — full flow
- [ ] iPhone Safari — full flow (HTTPS)
- [ ] Desktop Chrome or Edge — full flow
- [ ] At least two different country codes tested (`+91` and `+1` recommended)

---

## Regression (UI)

- [ ] No horizontal scroll on small viewport
- [ ] Language dropdown styled and usable
- [ ] Country code dropdown aligned with phone field on review
- [ ] Back link on review returns to record without crashing

---

## Demo script (2 minutes)

1. Open app → Record screen.
2. Select language → record a 10–20 second query → stop.
3. Continue to review → show English text → edit one word.
4. Enter `+91` and a valid test number → Send.
5. Show confirmation screen.
6. Show received email on support inbox (second device or projector).

---

## Known limitations

- Native `<select>` dropdown styling varies by OS on open state; closed state matches app theme.
- Email delivery depends on EmailJS quota and template configuration.
- AssemblyAI usage is metered; failed keys return API error banners.
