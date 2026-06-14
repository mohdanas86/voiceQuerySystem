# Voice Query System — Free Tools Policy

> **This project uses ONLY free-tier services. No credit card required for any service.**  
> If you are asked to enter payment details, stop and check the free tier options first.

---

## Approved Services (Full List)

| Service | What It Does in This Project | Free Tier Limit | Sign-Up |
|---|---|---|---|
| **AssemblyAI** | Converts voice recordings to text. Detects language (72 languages). Returns English translation when available. | 5 hours audio/month | assemblyai.com |
| **MongoDB Atlas** | Stores all query submissions permanently. | 512MB storage | mongodb.com/atlas |
| **EmailJS** | Sends emails server-side (Node.js SDK). Two templates: customer confirmation + ops notification. | 200 emails/month | emailjs.com |
| **MyMemory** | Translates original transcripts to English and translates ops-email field values (city, budget, passengers) to English. | 5,000 words/day | mymemory.translated.net |
| **Upstash Redis** | Rate-limits API routes across multiple serverless instances. | 10,000 commands/day | upstash.com |
| **Supabase Storage** | Stores voice recording `.webm` files, gives a public URL for ops emails. | 1GB storage + 2GB bandwidth/month | supabase.com |
| **Vercel** | Hosts the Next.js app. Serverless functions. Edge network. | Free hobby tier (no custom domain sleep) | vercel.com |
| **Sentry** | Catches and reports unhandled errors in production. | 5,000 errors/month | sentry.io |

---

## Services Removed From Original Plan (Were Paid)

| Service | Reason Removed | Free Alternative Used |
|---|---|---|
| ~~DeepL API~~ | Paid beyond 500K chars/month on the free tier | MyMemory (free, 5K words/day). Sufficient for MVP. |
| ~~Resend~~ | Free tier is 100 emails/day but requires credit card | EmailJS (200 emails/month, truly free) |

---

## Free Tier Limits — What to Monitor

Watch these in production. If any limit is close to being hit, alert the team:

### AssemblyAI — 5 hours/month
- 5 hours = approximately 300 minutes = ~300 queries/month at 1 min each
- Monitor at: assemblyai.com > Dashboard > Usage
- Action when near limit: Add a banner on the app saying "Service temporarily busy, try again tomorrow"

### MyMemory — 5,000 words/day
- An average voice query = ~50 words. Limit = ~100 translations/day
- MyMemory is used in TWO places:
  1. Translating the original voice transcript to English (primary path when AssemblyAI doesn't provide `translated_texts.en`)
  2. Translating ops-email field values (city, budget tier, passenger counts) to English before sending the support team notification
- Monitor at: mymemory.translated.net (no dashboard — watch for 429 responses in server logs)
- Action when limit hit: Translation step returns original text. Ops team reads in original language.

### EmailJS — 200 emails/month
- 200 emails = 100 submissions (customer email + ops email per submission)
- Email is sent **server-side** via the Node.js `emailjs` SDK — not from the browser
- Two templates are required: `customer_confirmation` (user's language) and `ops_notification` (always English)
- At scale: switch to Brevo (formerly Sendinblue — 300 free emails/day, no card needed)
- Monitor at: emailjs.com > Dashboard > Statistics

### Supabase Storage — 1GB storage, 2GB bandwidth/month
- 1 minute of `.webm` audio ≈ 500KB–2MB
- 1GB = approximately 500–2000 recordings
- Monitor at: supabase.com > Project > Storage > Usage
- Action when near limit: Add a cleanup job (delete recordings older than 90 days)

### Upstash Redis — 10,000 commands/day
- Each API call to `/api/queries` uses 1 Redis command (rate limit check)
- Each API call to `/api/aai/transcribe` uses 1 Redis command
- 10,000 = 5,000 submissions + 5,000 transcriptions per day (more than enough for MVP)
- Monitor at: console.upstash.com > Database > Analytics

### MongoDB Atlas — 512MB storage
- One query submission document ≈ 2–5KB
- 512MB = approximately 100,000–250,000 documents
- Monitor at: MongoDB Atlas > Project > Data Storage
- Action when near limit: Archive old records to a file and delete them

---

## Account Setup Instructions (One-Time)

Follow this order. Each service takes 5–10 minutes to set up.

### Step 1 — AssemblyAI
1. Go to assemblyai.com, click "Get Started Free"
2. Sign up with Google or email
3. Dashboard > API Keys > Copy your key
4. Add to `.env.local`: `ASSEMBLYAI_API_KEY=your_key_here`

### Step 2 — MongoDB Atlas
1. Go to mongodb.com/atlas, click "Try Free"
2. Create an account, then create a new project named `voice-query-system`
3. Create a free cluster (M0 tier — always free)
4. Database Access > Add a database user (username + password)
5. Network Access > Allow access from anywhere (for Vercel: `0.0.0.0/0`)
   - NOTE: Restrict to Vercel IPs in production for better security
6. Clusters > Connect > Connect your application > Copy the connection string
7. Add to `.env.local`: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/`
8. Add to `.env.local`: `MONGODB_DB=voice_query_system`

### Step 3 — EmailJS
1. Go to emailjs.com, click "Sign Up Free"
2. Email Services > Add Service > Choose Gmail or Outlook
3. Follow the OAuth flow to connect your email account
4. Email Templates > Create New Template
   - Create TWO templates (see Phase 3 docs for exact template bodies):
     - Template A ID: `customer_confirmation`
     - Template B ID: `ops_notification`
5. Account > API Keys > Copy Public Key
6. Add to `.env.local`:
   ```
   EMAILJS_SERVICE_ID=service_xxxxxx
   EMAILJS_PUBLIC_KEY=your_public_key
   EMAILJS_PRIVATE_KEY=your_private_key (optional)
   EMAILJS_CUSTOMER_TEMPLATE_ID=customer_confirmation
   EMAILJS_OPS_TEMPLATE_ID=ops_notification
   ```

### Step 4 — Supabase
1. Go to supabase.com, click "Start your project"
2. Sign up with GitHub
3. New project > Name: `voice-query-system` > Region: choose nearest to your users
4. Wait for project to provision (~2 minutes)
5. Storage > Create a new bucket:
   - Name: `voice-recordings`
   - Public bucket: **YES** (toggle on)
6. Project Settings > API > Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
7. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   ```

### Step 5 — Upstash Redis
1. Go to upstash.com, click "Get Started"
2. Sign up with GitHub or Google
3. Create Database > Name: `voice-query-ratelimit` > Region: nearest
4. REST API tab > Copy URL and Token
5. Add to `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXxx...
   ```

### Step 6 — Sentry
1. Go to sentry.io, click "Get Started"
2. Create an account, create a new project → Platform: Next.js
3. Copy the DSN from the setup screen
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456
   ```

---

## Final `.env.local` Template

Copy this to `frontend/.env.local` and fill in all values:

```bash
# ── AssemblyAI ────────────────────────────────────────────────────────────────
ASSEMBLYAI_API_KEY=

# ── EmailJS ───────────────────────────────────────────────────────────────────
# These are SERVER-SIDE ONLY. Never use NEXT_PUBLIC_ prefix on these.
EMAILJS_SERVICE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
EMAILJS_CUSTOMER_TEMPLATE_ID=customer_confirmation
EMAILJS_OPS_TEMPLATE_ID=ops_notification

# ── MongoDB Atlas ─────────────────────────────────────────────────────────────
MONGODB_URI=
MONGODB_DB=voice_query_system

# ── Supabase Storage ──────────────────────────────────────────────────────────
# Project URL is safe to expose to the browser (it's the API endpoint, not a secret).
NEXT_PUBLIC_SUPABASE_URL=
# Service role key — SERVER-SIDE ONLY. Never prefix with NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY=

# ── Upstash Redis ─────────────────────────────────────────────────────────────
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ── Sentry ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=
```

> **Security rule:** If a key value is a secret (API key, password, token), it must NEVER have the `NEXT_PUBLIC_` prefix. `NEXT_PUBLIC_` variables are bundled into the browser JavaScript and are visible to anyone who opens DevTools.

---

*Ulavi Technologies — Confidential*
