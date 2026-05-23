# Voice-Based Query Submission System

Notes and maintainer details (Anas Alam — SDE)

This is a mobile-first web app that lets visitors submit support queries by voice. Users record up to 60 seconds, review an English translation, enter a validated mobile number, and send a structured email to support.

---

## What it does

1. Voice input on `/record` (60s limit)
2. Speech-to-text via AssemblyAI (`POST /api/aai/transcribe`) with server-side polling
3. English translation: prefer AssemblyAI's `translated_texts.en`, fallback to `/api/translate` (MyMemory)
4. Mobile number input on `/review` with country code dropdown
5. Email submission via EmailJS from the client (template variables below)
6. Confirmation screen with required thank-you message

---

## Screens

- `/record` — language select, mic, timer, transcript preview
- `/review` — edit English transcript, mobile number, Send
- `/confirmation` — success message after send

The root route redirects to `/record`.

---

## Tech stack

- Framework: Next.js 16 (App Router), React, TypeScript
- Styling: Tailwind CSS
- State: Zustand (`store/useQueryStore.ts`)
- Speech: Browser `MediaRecorder` + AssemblyAI
- Email: EmailJS (`@emailjs/browser`)
- Translation fallback: MyMemory via `/api/translate`

---

## Quick start

Prerequisites: Node.js 20+, AssemblyAI key, EmailJS account.

Install and run:

```bash
cd frontend
cp .env.example .env.local
# fill in keys
npm install
npm run dev
```

Open http://localhost:3000 — allow microphone permissions.

---

## Environment variables

Required:

- `ASSEMBLYAI_API_KEY` — AssemblyAI server-side key
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` — EmailJS public key
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID` — EmailJS service ID
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` — EmailJS template ID

Optional:

- `NEXT_PUBLIC_API_BASE_URL` — external API base; client falls back to `/api/queries` for local development if unreachable

See `docs/SETUP.md` for details.

---

## Email template (EmailJS)

Include these variables in your EmailJS template:

- `translated_query` — English query (editable on review)
- `original_query` — Original-language transcript
- `phone` — Full phone with country code
- `submitted_at` — ISO timestamp from client

---

## API routes (Next.js)

- `POST /api/aai/transcribe` — uploads audio to AssemblyAI, returns transcript + translations when ready
- `POST /api/queries` — local fallback endpoint that accepts and acknowledges submissions

---

## Documentation

- [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md)
- [docs/SETUP.md](docs/SETUP.md)
- [docs/USER_FLOW.md](docs/USER_FLOW.md)
- [docs/TESTING.md](docs/TESTING.md)

---

If you want, I can also run a quick local sanity check (start dev server and test mic/upload flow). Ask and I will run it.

