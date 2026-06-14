# Setup Guide (Notes by Anas Alam — SDE)

> **Last updated:** Reflects 72-language support, debounced auto-translation, server-side EmailJS, and dual email templates.

## 1. Clone and install

```bash
git clone <repository-url>
cd voiceQuerySystem/frontend
npm install
```

## 2. Environment file

Create a working local environment by copying the example file:

```bash
cp .env.example .env.local
```

### Required variables

```env
ASSEMBLYAI_API_KEY=your_assemblyai_key

NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id

MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB=voiceQuerySystem
```

### Optional

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Note: the current submit flow posts directly to the built-in `POST /api/queries` route, which stores each submission in MongoDB Atlas. Keep `NEXT_PUBLIC_API_BASE_URL` only if you still use it elsewhere in the app.

---

## 3. AssemblyAI

1. Create an account at https://www.assemblyai.com/ and copy the API key into `ASSEMBLYAI_API_KEY`.
2. The server route at `/api/aai/transcribe` uploads recorded audio and submits a transcription request to AssemblyAI. It polls the transcript endpoint until the job completes (~90s window, 30 polls at 3s intervals).
3. Recording in the UI is limited to 60 seconds; keep uploads within that limit.
4. AssemblyAI supports **72 languages**. The app normalises the detected language code to a two-letter base code (e.g. `hi-IN` → `hi`) before storing it in Zustand.
5. If AssemblyAI returns a `translated_texts.en` value, that is used directly. Otherwise the app falls back to `/api/translate` (MyMemory).

If you change env vars, restart the dev server.

---

## 4. EmailJS

Email is sent **server-side** via the `emailjs` Node.js SDK (not from the browser). Two separate templates are required:

### Template A — Customer Confirmation (`EMAILJS_CUSTOMER_TEMPLATE_ID`)

Sent to the user who submitted the query, translated into their selected UI language.

| Template variable | Source |
| ---------------------- | ----------------------------------------------------- |
| `{{name}}` | User name |
| `{{translated_query}}` | English transcript |
| `{{original_query}}` | Original-language transcript |
| `{{phone}}` | Full phone with country code (e.g. `+91 98765 43210`) |
| `{{submitted_at}}` | ISO timestamp |
| `{{to_email}}` | User's email address |

### Template B — Ops Notification (`EMAILJS_OPS_TEMPLATE_ID`)

Sent to the support team inbox. **Always in English** — all field values (city, budget, passengers) are translated server-side before dispatch.

| Template variable | Source |
| ---------------------- | --------------------------------------------------------------- |
| `{{name}}` | User name |
| `{{translated_query}}` | English transcript |
| `{{original_query}}` | Original-language transcript |
| `{{trip_city}}` | Destination city (translated to English) |
| `{{trip_passengers}}` | Passenger summary (translated to English) |
| `{{trip_budget}}` | Budget tier label (translated to English) |
| `{{trip_dates}}` | Travel dates |
| `{{phone}}` | Full phone with country code |
| `{{submitted_at}}` | ISO timestamp |

Add all five EmailJS keys to `.env.local` (server-side — no `NEXT_PUBLIC_` prefix):

```env
EMAILJS_SERVICE_ID=service_xxxxxx
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
EMAILJS_CUSTOMER_TEMPLATE_ID=customer_confirmation
EMAILJS_OPS_TEMPLATE_ID=ops_notification
```

Set the destination for Template B to your support inbox (e.g. support@ulavitech.com).

---

## 5. MongoDB Atlas

The built-in `POST /api/queries` route now writes each accepted submission to MongoDB Atlas.

1. Create a cluster in Atlas and copy the connection string into `MONGODB_URI`.
2. Set `MONGODB_DB` to the database name you want to use.
3. Restart the dev server after changing either variable.

The app stores submissions in a `query_submissions` collection.

If writes are failing, verify the Atlas user has insert permissions on the target database and the IP allowlist includes your current network.

---

## 6. Run locally

```bash
npm run dev
```

- URL: `http://localhost:3000`
- Allow microphone permission when prompted.
- I recommend Chrome or Edge for reliable `MediaRecorder` behavior.

### HTTPS note

Recording requires a secure context. `localhost` is treated as secure for development; production deployments must use HTTPS.

---

## 7. Deploy (example: Vercel)

1. Use `frontend` as the project root when importing to Vercel.
2. Add the same environment variables in the hosting dashboard.
3. Deploy and test on a real device over HTTPS (microphone + EmailJS).

---

## Troubleshooting (quick)

| Issue | What I check |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| "AssemblyAI key missing" | `ASSEMBLYAI_API_KEY` present and server restarted |
| Transcription fails | API key, audio length (≤60s), network access |
| "EmailJS is not configured" | `EMAILJS_SERVICE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_CUSTOMER_TEMPLATE_ID`, `EMAILJS_OPS_TEMPLATE_ID` set |
| Send fails silently | Server logs; EmailJS template variable names and quota |
| Ops email contains non-English text | Check `translateToEnglish` helper in `email.ts`; verify MyMemory quota |
| Auto-translation not firing | Check browser console for `/api/translate` errors; verify MyMemory quota |
| Language not detected correctly | Inspect `detected_language` in AssemblyAI response; normalisation strips suffixes like `-IN` |
| Mic blocked | Browser permissions, HTTPS, not in blocked iframe |
| No audio on iOS | Use Safari on HTTPS; require user gesture before recording |

