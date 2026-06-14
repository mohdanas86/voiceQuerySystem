# Project Brief — Voice-Based Query Submission System

**Ulavi Technologies · Web platform**  
**Author:** [Anas Alam](https://linkedin.com/in/anas86/) — SDE

---

## What this app does

A web app that lets users speak their travel query in **any supported language** (72 total), converts it to text, translates it to English, collects contact details, and sends a structured email to the support team while storing the submission in MongoDB Atlas.

- **Platform:** Web — any phone or computer, no install required
- **Approach:** AI-assisted development (Vibe Coding)

---

## 1. Core flow

1. User selects a UI language from the language picker (searchable, 72 options)
2. User taps mic and speaks (max 60 seconds, any supported language)
3. App converts speech to text via AssemblyAI
4. App translates transcript to English (AssemblyAI `translated_texts.en` or MyMemory fallback)
5. User reviews trip details via smart pop-ups (city, dates, passengers, budget)
6. User reviews and edits the original transcript — translation auto-updates with 800ms debounce
7. User enters name, email, and mobile number with country code
8. User taps **Send** — MongoDB saves the submission; two emails are dispatched:
   - **Customer email** — in the user's selected UI language
   - **Ops/support email** — always in English (field values translated server-side)
9. User sees a confirmation message in their selected language

**Example:** A user in Tamil Nadu opens the app in Tamil, speaks for 30 seconds. The app transcribes in Tamil, translates to English, and ops receives a clean English email. The user sees the confirmation in Tamil.

---

## 2. Who uses it?

| User | Need |
| -------------------------- | --------------------------------------------------- |
| Website visitor / customer | Open app, select language, record, review, send |
| Support team | Receive English emails with query, contact, timestamp |

The UI must stay simple for non-technical users.

---

## 3. Required features

| # | Feature | Requirement |
| --- | ---------------- | -------------------------------------------------------------------- |
| 1 | Voice input | Mic button, max 60 seconds |
| 2 | Speech-to-text | Text in the language spoken |
| 3 | Auto-translation | Automatic English translation with 800ms debounce — no manual button |
| 4 | Mobile number | Country code + number, validated before submit |
| 5 | Email submission | Name, English query, full phone, timestamp to support + MongoDB save |
| 6 | Confirmation | Translated thank-you message in user's language |
| 7 | 72-language support | UI and transcription in all AssemblyAI-supported languages |
| 8 | Language search | Searchable language picker — no need to scroll through 72 options |

---

## 4. Language support

The app ships with support for **72 languages** covering all languages provided by AssemblyAI:

- Indian regional languages (Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Assamese, Urdu, Nepali, Sinhala)
- European languages (Spanish, French, German, Italian, Portuguese, Dutch, Polish, Swedish, Danish, Finnish, Norwegian, Czech, Greek, Hebrew, Ukrainian, Romanian, Hungarian, Slovak, Bulgarian, Croatian, Serbian, Slovenian, Estonian, Latvian, Lithuanian, Russian, Turkish, Albanian, Armenian, Georgian, Basque, Belarusian, Bosnian, Catalan, Galician, Icelandic, Macedonian, Welsh)
- East Asian (Japanese, Korean, Chinese)
- Middle Eastern / Central Asian (Arabic, Persian, Azerbaijani, Kazakh, Kyrgyz, Uzbek)
- African (Afrikaans, Amharic, Swahili, Yoruba, Zulu)
- Southeast Asian (Indonesian, Malay, Thai, Vietnamese)
- Other (Mongolian)

---

## 5. Screens (5)

| Screen | Content |
| ---------- | ---------------------------------------------------------------- |
| **Language Picker** (`/`) | Searchable language list; sets global UI language |
| **Record** (`/record`) | Mic, timer, status, language select |
| **Details** (`/details`) | Smart pop-ups: city, dates, passengers, budget |
| **Review** (`/review`) | Editable original transcript, auto-translated English field, contact form (name, email, phone), Send |
| **Confirmation** (`/confirmation`) | Checkmark and localised thank-you text |

---

## 6. Mobile number & contact fields

| Requirement | Detail |
| ----------- | -------------------------------------------------------------- |
| Screen | Review — below trip details, above Send |
| Labels | **Your Name**, **Your Email**, **Your Mobile Number** |
| Layout | Country code dropdown + number field side by side |
| Validation | Name: not empty; Email: valid format; Phone: valid format; inline errors; block submit if invalid |
| Email | Full number with code, e.g. `+91 98765 43210` |

---

## 7. Auto-translation behaviour (Review screen)

- The original transcript field is **editable** — users can correct transcription errors in their own language.
- When the user stops typing (800ms debounce), translation fires automatically to `/api/translate`.
- A **"Translating…" inline spinner** appears during the API call.
- The English translation field updates with the result — no manual button needed.
- Re-translation always uses the **latest edited original text** for accuracy.

---

## 8. Email behaviour

| Email | Recipient | Language |
| --- | --- | --- |
| Customer confirmation | User's email address | User's selected UI language |
| Ops notification | Support team inbox | Always English (server-side translation enforced) |

The ops email template variables (city, budget tier, passenger label) are translated to English before dispatch even if the user's UI language is non-English.

---

## 9. Development notes

- The app posts to the built-in `POST /api/queries` route, which stores accepted submissions in MongoDB Atlas.
- All translation (UI strings and field translation for ops email) goes through the `translateText` server-side helper backed by MyMemory, with English as the target language.
- Language code normalisation: AssemblyAI may return codes like `hi-IN`; these are reduced to the base code (`hi`) before storage and translation.
- Debounce constant `DEBOUNCE_DELAY_MS = 800` is declared at module scope in `review/page.tsx`.
- The `useTranslation` hook wraps `i18n.ts` lookups and is the single source of truth for all client-side UI strings.

---

## 10. Deliverables

- Working web app (deployable to Vercel)
- Documentation in `docs/` kept up to date with all changes

---

## Confidentiality

This project and materials are the property of Ulavi Technologies.
