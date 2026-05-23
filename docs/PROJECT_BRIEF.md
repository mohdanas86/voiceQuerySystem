# Internship Project Brief — Voice-Based Query Submission System

**Ulavi Technologies · 4 weeks · Web platform**

---

## What you will build

A web app that lets users speak their query in any language, converts it to text, translates it to English, collects their mobile number with country code, and sends everything as a structured email to the support team.

- **Platform:** Web — any phone or computer, no install  
- **Approach:** AI-assisted development (Vibe Coding)

---

## 1. What are we building?

Users who struggle to type long queries — especially in their own language — get a simple flow:

1. Tap mic and speak (any language, max 60 seconds)
2. App converts speech to text
3. App translates to English
4. User reviews and edits the English text
5. User enters name and mobile number with country code
6. User taps **Send** — support receives a structured email and the submission is stored in MongoDB Atlas
7. User sees a confirmation message

**Example:** A user in Tamil Nadu speaks in Tamil for 30 seconds. The app transcribes, translates to English, captures `+91` phone number, and ops receives a clean English email.

---

## 2. Who uses it?

| User                       | Need                                                |
| -------------------------- | --------------------------------------------------- |
| Website visitor / customer | Open app, record, review, enter number, send        |
| Support team               | Receive emails with query, mobile number, timestamp |

The UI must stay simple for non-technical users.

---

## 3. Required features (6)

| #   | Feature          | Requirement                                                          |
| --- | ---------------- | -------------------------------------------------------------------- |
| 1   | Voice input      | Mic button, max 60 seconds                                           |
| 2   | Speech-to-text   | Text in the language spoken                                          |
| 3   | Auto-translation | English before send                                                  |
| 4   | Mobile number    | Country code + number, validated before submit                       |
| 5   | Email submission | Name, English query, full phone, timestamp to support + MongoDB save |
| 6   | Confirmation     | *"Thank you for your query. Our team will get back to you shortly."* |

---

## 4. Mobile number field

| Requirement | Detail                                                         |
| ----------- | -------------------------------------------------------------- |
| Screen      | Review — below transcript, above Send                          |
| Label       | **Your Mobile Number**                                         |
| Layout      | Country code dropdown + number field side by side              |
| Placeholder | e.g. `98765 43210`                                             |
| Validation  | Not empty; valid format; inline error; block submit if invalid |
| Email       | Full number with code, e.g. `+91 98765 43210`                  |

Send must stay disabled or show an error until the number is valid.

---

## 5. Screens (3)

| Screen     | Content                                                          |
| ---------- | ---------------------------------------------------------------- |
| **Record** | Mic, status (idle / recording / done), timer (max 60s)           |
| **Review** | Editable English text, mobile field, Send (disabled until valid) |
# Internship Project Brief — Voice-Based Query Submission System

Ulavi Technologies · Web platform

---

Notes from my implementation (Anas Alam — SDE):

I implemented a mobile-first web app that lets users speak their query in a supported language, converts speech to text, translates to English, collects a mobile number with country code, and sends a structured email to support.

Key points:

- Recording is limited to 60 seconds in the UI.
- Server-side transcription uses AssemblyAI via `/api/aai/transcribe` and the server polls the transcript endpoint until the job completes (the poll window is ~90 seconds in my implementation).
- If AssemblyAI doesn't provide a translated English text, the client can request `/api/translate` which proxies MyMemory as a fallback.

---

## What I built

Core flow the app implements:

1. Tap mic and speak (max 60s)
2. App uploads audio and requests transcription/translation
3. User reviews and edits the English text on `/review`
4. User enters mobile number with country code
5. User taps **Send** and the app attempts to deliver the payload (EmailJS + optional backend)
6. Confirmation screen appears with a success message

---

## Mobile number & email

- The Review screen contains the `Your Mobile Number` field (country code + national number). The default country code in the store is `+91`.
- The Review screen also contains a `Your Name` field above the transcript preview.
- I included a small set of country codes in the dropdown: `+91`, `+1`, `+44`, `+61`, `+81`.
- Email content (via EmailJS template) should include labeled lines for the user name, English query, mobile number, and `submitted_at` timestamp.

---

## Screens

- **Record** — mic, timer, status, language select
- **Review** — editable English transcript, phone input, Send
- **Confirmation** — checkmark and required thank-you text

---

## Development notes

- The client now posts directly to the built-in `POST /api/queries` route, which stores accepted submissions in MongoDB Atlas.
- Translation fallback is kept intentionally simple (MyMemory) for demos; replace with a paid translation API for production-quality translation.

---

## Deliverables

- Working web app (deployable to Vercel)
- Documentation and demo checklist in `docs/`

---

## Confidentiality

This project and materials are the property of Ulavi Technologies.
