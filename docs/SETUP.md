# Setup Guide

## 1. Clone and install

```bash
git clone <repository-url>
cd voiceQuerySystem/frontend
npm install
```

## 2. Environment file

Copy the example file and edit `.env.local`:

```bash
cp .env.example .env.local
```

### Required variables

```env
ASSEMBLYAI_API_KEY=your_assemblyai_key

NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
```

### Optional

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

If unset or unreachable on localhost, submissions are posted to the built-in route `POST /api/queries`, which validates the payload and returns an acceptance response.

---

## 3. AssemblyAI

1. Create an account at [assemblyai.com](https://www.assemblyai.com/).
2. Copy an API key into `ASSEMBLYAI_API_KEY` in `.env.local`.
3. Restart the dev server after changing env vars.

The transcribe route uploads recorded audio, runs transcription, and requests English translation in one pipeline.

---

## 4. EmailJS

1. Create a service connected to your email provider.
2. Create a template with at least these fields (names must match):

| Template variable | Source |
|-------------------|--------|
| `{{translated_query}}` | English query |
| `{{original_query}}` | Original transcript |
| `{{phone}}` | e.g. `+91 98765 43210` |
| `{{submitted_at}}` | Client ISO timestamp |

3. Copy **Public Key**, **Service ID**, and **Template ID** into `.env.local`.

### Suggested email layout

**Subject:** `New Query from {{phone}}`

**Body:**

```
Query (English): {{translated_query}}

Mobile Number: {{phone}}

Submitted at: {{submitted_at}}
```

Point the service “To” address at your support inbox (e.g. `support@ulavitech.com`).

---

## 5. Run locally

```bash
npm run dev
```

- URL: `http://localhost:3000`
- Allow microphone permission when prompted.
- Use Chrome or Edge for reliable `MediaRecorder` support.

### HTTPS note

Recording requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#privacy_and_security). Localhost is treated as secure; deployed sites must use HTTPS.

---

## 6. Deploy (e.g. Vercel)

1. Import the `frontend` folder as the project root (or set root directory to `frontend`).
2. Add the same environment variables in the hosting dashboard.
3. Deploy; test mic + email on a real device over HTTPS.

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| “AssemblyAI key missing” | `ASSEMBLYAI_API_KEY` set and server restarted |
| Transcription fails | API key valid, audio under 60s, network open |
| “EmailJS is not configured” | All three `NEXT_PUBLIC_EMAILJS_*` vars set |
| Send fails silently | Browser console; EmailJS template variable names |
| Mic blocked | Permissions, HTTPS, not embedded in blocked iframe |
| No audio on iOS | Safari on HTTPS; user gesture before record |
