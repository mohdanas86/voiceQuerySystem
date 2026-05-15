# Voice-Based Query Submission System

A mobile-first web app for **Ulavi Technologies** that lets visitors submit support queries by voice. Users record up to 60 seconds in their language, review an English translation, enter a validated mobile number, and send a structured email to the support team.

No app install required — runs in the browser on phones and desktops.

---

## What it does

| # | Feature | Implementation |
|---|---------|----------------|
| 1 | **Voice input** | Mic on `/record`, max 60s, auto-stop at limit |
| 2 | **Speech-to-text** | AssemblyAI via `POST /api/aai/transcribe` |
| 3 | **English translation** | AssemblyAI speech understanding (target `en`) |
| 4 | **Mobile number** | Country code dropdown + number field on `/review`, Zod validation |
| 5 | **Email submission** | EmailJS with query, phone, and timestamp |
| 6 | **Confirmation** | Success screen with required thank-you message |

---

## Screens

| Route | Screen | Purpose |
|-------|--------|---------|
| `/record` | Record | Language select, mic, timer, transcript preview |
| `/review` | Review | Edit English transcript, mobile number, Send |
| `/confirmation` | Confirmation | Success message after email is sent |

`/` redirects to `/record`.

---

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, custom dark theme (primary `#E85D22`)
- **State:** Zustand (`store/useQueryStore.ts`)
- **Speech:** Browser `MediaRecorder` + AssemblyAI API
- **Email:** EmailJS (`@emailjs/browser`)
- **Validation:** Zod (phone format on review screen)

---

## Project structure

```
voiceQuerySystem/
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── record/           # Screen 1
│   │   ├── review/           # Screen 2
│   │   ├── confirmation/     # Screen 3
│   │   └── api/
│   │       ├── aai/transcribe/   # AssemblyAI proxy
│   │       └── queries/          # Local submit fallback
│   ├── components/           # UI, forms, speech, feedback
│   ├── services/             # API client
│   └── store/                # Client state
└── docs/                     # Setup, brief, testing
```

---

## Quick start

### Prerequisites

- Node.js 20+
- [AssemblyAI](https://www.assemblyai.com/) API key
- [EmailJS](https://www.emailjs.com/) account (service + template)

### Install and run

```bash
cd frontend
cp .env.example .env.local
# Fill in keys (see docs/SETUP.md)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Microphone access needs **HTTPS** or **localhost**.

### Production build

```bash
cd frontend
npm run build
npm start
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ASSEMBLYAI_API_KEY` | Yes | Server-side transcription and translation |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Yes | EmailJS public key |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Yes | EmailJS service ID |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Yes | EmailJS template ID |
| `NEXT_PUBLIC_API_BASE_URL` | No | Optional external API; falls back to `/api/queries` on localhost |

See **`docs/SETUP.md`** for EmailJS template fields and full configuration.

---

## User flow (end-to-end)

1. User selects spoken language (or Auto-detect) and taps the mic.
2. After recording, audio is transcribed and translated to English.
3. User continues to **Review**, edits the English text if needed.
4. User enters **Your Mobile Number** (`+91` / `+1` / `+44` / `+61` / `+81` + digits).
5. **Send** stays disabled until the transcript is non-empty and the phone passes validation.
6. EmailJS sends the payload; the app shows the confirmation message.

Phone validation rules:

- Country code: `+` followed by 1–4 digits  
- Number: 6–15 digits (spaces allowed)  
- Combined example in email: `+91 98765 43210`

---

## Email template (EmailJS)

Map these template variables in EmailJS:

| Variable | Content |
|----------|---------|
| `translated_query` | English query (editable on review) |
| `original_query` | Original-language transcript |
| `phone` | Full number with country code |
| `submitted_at` | ISO timestamp from client |

Configure the service to deliver to your support inbox (e.g. `support@ulavitech.com`). Subject and body layout are defined in the EmailJS template.

---

## API routes (Next.js)

| Method | Path | Role |
|--------|------|------|
| `POST` | `/api/aai/transcribe` | Upload audio, transcribe, translate to English |
| `POST` | `/api/queries` | Accept and acknowledge submission when no external backend is running |

---

## Testing before demo

Use **`docs/TESTING.md`** for a graded checklist: recording, translation, phone validation, email delivery, and confirmation copy.

---

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md) | Internship requirements (source of truth) |
| [docs/SETUP.md](docs/SETUP.md) | Environment and EmailJS setup |
| [docs/USER_FLOW.md](docs/USER_FLOW.md) | Screen-by-screen behaviour |
| [docs/TESTING.md](docs/TESTING.md) | Manual test and demo checklist |

---

## Confidentiality

This project and all associated materials are the intellectual property of **Ulavi Technologies**. Unauthorised use, reproduction, or distribution is prohibited.

---

## License

Proprietary — Ulavi Technologies internship project. All rights reserved.
