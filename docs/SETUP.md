# Setup Guide (Notes by Anas Alam — SDE)

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
2. The server route at `/api/aai/transcribe` uploads recorded audio and submits a transcription request to AssemblyAI. It polls the transcript endpoint until the job completes (I set a ~90s poll window).
3. Recording in the UI is limited to 60 seconds; keep uploads within that limit.

If you change env vars, restart the dev server.

---

## 4. EmailJS

I configured the app to send email via EmailJS on the client. Make a template that includes these variables (names must match):

| Template variable      | Source                                                |
| ---------------------- | ----------------------------------------------------- |
| `{{name}}`             | User name                                             |
| `{{translated_query}}` | English (editable) transcript                         |
| `{{original_query}}`   | Original-language transcript                          |
| `{{phone}}`            | Full phone with country code (e.g. `+91 98765 43210`) |
| `{{submitted_at}}`     | Client ISO timestamp                                  |

Copy the public key, service ID, and template ID into your `.env.local`.

Suggested subject and body:

**Subject:** `New Query from {{phone}}`

**Body:**

```
Name: {{name}}

Query (English): {{translated_query}}

Mobile Number: {{phone}}

Submitted at: {{submitted_at}}
```

Set the template destination to your support inbox (e.g. support@ulavitech.com).

If you want the subject/body to match the app data exactly, keep the `name`, `translated_query`, `phone`, and `submitted_at` variables in your template.

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

| Issue                       | What I check                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| "AssemblyAI key missing"    | `ASSEMBLYAI_API_KEY` present and server restarted                                                         |
| Transcription fails         | API key, audio length (<=60s), network access                                                             |
| "EmailJS is not configured" | `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`, `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` set |
| Send fails silently         | Browser console; EmailJS template variables and quota                                                     |
| Mic blocked                 | Browser permissions, HTTPS, not in blocked iframe                                                         |
| No audio on iOS             | Use Safari on HTTPS; require user gesture before recording                                                |

