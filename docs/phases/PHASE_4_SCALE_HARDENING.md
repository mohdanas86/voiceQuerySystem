# Phase 4 — Scale Hardening + Production Polish

**Goal:** Make the application production-ready for 100K+ concurrent users. Replace the in-memory rate limiter with Upstash Redis, set up MongoDB collection indexes, upgrade the translation API with DeepL as the primary engine and MyMemory as a fallback, configure Sentry for error monitoring, and establish the final production environment variables.

**Duration:** 3–5 days  
**Depends on:** Phase 3 complete and verified.  

**Must read before starting:**
- [CODE_STANDARDS.md](../CODE_STANDARDS.md)
- [FREE_TOOLS.md](../FREE_TOOLS.md)

---

## What You Are Changing in This Phase

| File | Action | Why |
|---|---|---|
| `frontend/package.json` | MODIFY | Add `@upstash/redis`, `@upstash/ratelimit`, and `@sentry/nextjs` dependencies |
| `frontend/lib/rateLimitRedis.ts` | CREATE | Set up Upstash Redis rate limiters for query submissions and audio transcriptions |
| `frontend/lib/rateLimit.ts` | MODIFY | Mark the in-memory rate limiter as deprecated with a comment |
| `frontend/app/api/queries/route.ts` | MODIFY | Replace the in-memory rate limiter with the Redis-based sliding window rate limiter |
| `frontend/app/api/aai/transcribe/route.ts` | MODIFY | Add transcription rate limiting using Upstash Redis |
| `frontend/app/api/translate/route.ts` | MODIFY | Implement DeepL API as primary translation engine with MyMemory fallback |
| `frontend/.env.example` | MODIFY | Add keys for Supabase, Redis, DeepL, and Sentry to environmental templates |

---

## Step 4.0 — Install New Packages

Phase 4 requires Upstash Redis packages and Sentry. Run the following command in the `frontend` directory:

```bash
cd frontend
npm install @upstash/redis @upstash/ratelimit @sentry/nextjs
```

Verify that the project compiles with no errors after installing these dependencies:

```bash
npm run build
```

---

## Step 4.1 — Create `frontend/lib/rateLimitRedis.ts`

This helper configures Upstash Redis as a shared database for tracking IP request rates. This is necessary because serverless deployments on platforms like Vercel spin up isolated function instances, making in-memory Maps ineffective for global rate limiting.

**Full file content:**

```ts
/**
 * rateLimitRedis.ts — Redis-based sliding window rate limiter using Upstash.
 * VoiceBerry | Ulavi Technologies
 */

// ── SERVER ONLY ───────────────────────────────────────────────────────────────
// This file runs on the server (Upstash Redis API client). Rules:
// 1. Do NOT import browser APIs.
// 2. UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must NOT have NEXT_PUBLIC_ prefix.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize the Upstash Redis client.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limiter for query submissions.
 * Limits: 5 requests per IP address per 10 minutes.
 * Uses sliding window strategy.
 */
export const queryRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  analytics: true,
  prefix: 'vb:queries',
});

/**
 * Rate limiter for transcription requests.
 * Limits: 10 requests per IP address per 10 minutes.
 * Prevents expensive AssemblyAI abuse.
 */
export const transcribeRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 m'),
  analytics: true,
  prefix: 'vb:transcribe',
});
```

Mark `frontend/lib/rateLimit.ts` as deprecated by adding a comment at the top of the file:

```ts
/**
 * @deprecated Simple in-memory sliding-window rate limiter.
 * Swapped out in Phase 4 for Redis-based rate limiting (rateLimitRedis.ts) to support serverless scale.
 */
```

---

## Step 4.2 — Update API Routes to Use Redis Rate Limiting

### 1. Update `frontend/app/api/queries/route.ts`

Modify the API handler to use `queryRateLimiter` instead of the in-memory `checkRateLimit`.

**Code modification block:**

Replace:
```ts
import { checkRateLimit } from "@/lib/rateLimit";
```
With:
```ts
import { queryRateLimiter } from "@/lib/rateLimitRedis";
```

Update the POST method handler rate limit check:
```ts
    // 1. Rate-limit check (per IP)
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const rl = await queryRateLimiter.limit(ip);

    if (!rl.success) {
        const retryAfterSec = Math.ceil((rl.reset - Date.now()) / 1000);
        console.warn(`[api/queries] rate-limited IP=${ip}`);
        return NextResponse.json(
            { error: "Too many submissions. Please wait and try again.", code: "RATE_LIMITED" },
            {
                status: 429,
                headers: {
                    "Retry-After": String(retryAfterSec),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(Math.ceil(rl.reset / 1000)),
                },
            }
        );
    }
```

Update the headers returned in the successful response at the end of the file:
```ts
    // 5. Respond success
    return NextResponse.json(
        {
            id: insertedId,
            status: "accepted",
            submitted_at: payload.client_timestamp,
        },
        {
            status: 200,
            headers: {
                "X-RateLimit-Remaining": String(rl.remaining),
                "X-RateLimit-Reset": String(Math.ceil(rl.reset / 1000)),
            },
        }
    );
```

### 2. Update `frontend/app/api/aai/transcribe/route.ts`

Add transcription rate limiting to prevent high AssemblyAI processing costs from potential abuse.

**Code modification block:**

Add imports at the top:
```ts
import { headers } from "next/headers";
import { transcribeRateLimiter } from "@/lib/rateLimitRedis";
```

Add the IP helper function at the module scope if not already present:
```ts
/**
 * Extracts the client IP address from the request headers list.
 * 
 * @param headersList - Next.js headers helper object
 * @returns The resolved client IP address string
 */
function getClientIp(headersList: Headers): string {
    return (
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown"
    );
}
```

Add the rate limiting check at the beginning of the `POST` route handler:
```ts
export async function POST(request: Request) {
    // 0. Rate-limit check (per IP)
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const rl = await transcribeRateLimiter.limit(ip);

    if (!rl.success) {
        const retryAfterSec = Math.ceil((rl.reset - Date.now()) / 1000);
        console.warn(`[api/aai/transcribe] rate-limited IP=${ip}`);
        return NextResponse.json(
            { error: "Too many transcription requests. Please wait and try again.", code: "RATE_LIMITED" },
            {
                status: 429,
                headers: {
                    "Retry-After": String(retryAfterSec),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(Math.ceil(rl.reset / 1000)),
                },
            }
        );
    }

    // 1. Parse content-type (existing logic continues here...)
```

---

## Step 4.3 — MongoDB Collection Indexes

To ensure fast query responses under load (especially as the collection grows past 10,000+ entries), create indexes on key query patterns.

### Setup Instructions

1. Log in to your **MongoDB Atlas** dashboard.
2. Select your Database Cluster → click **Browse Collections**.
3. Go to the `query_submissions` collection.
4. Click the **Indexes** tab and then click **Create Index**.
5. Create the following indexes:

| Name (Optional) | Fields Definition (JSON) | Sort Order | Use Case |
|---|---|---|---|
| `created_at_desc` | `{ "created_at": -1 }` | Descending | Sorting submissions by date |
| `source_lang_created_at` | `{ "source_language": 1, "created_at": -1 }` | Compound | Language statistics / filtering |
| `ip_created_at` | `{ "ip": 1, "created_at": -1 }` | Compound | Tracking submissions per client IP |
| `status_idx` | `{ "status": 1 }` | Single field | Filtering active/unresolved tickets |
| `user_email_idx` | `{ "user_email": 1 }` | Single field | Customer history lookup |

Alternatively, if running via database shell, execute these commands:
```javascript
db.query_submissions.createIndex({ created_at: -1 });
db.query_submissions.createIndex({ source_language: 1, created_at: -1 });
db.query_submissions.createIndex({ ip: 1, created_at: -1 });
db.query_submissions.createIndex({ status: 1 });
db.query_submissions.createIndex({ user_email: 1 });
```

---

## Step 4.4 — Upgrade Translation Endpoint with DeepL

Rewrite the `/api/translate` endpoint to prioritize the DeepL Free API (500K free characters per month) and fall back to the MyMemory API if DeepL limits are reached or if no API key is supplied.

**Full file content (`frontend/app/api/translate/route.ts`):**

```ts
/**
 * route.ts — GET /api/translate
 * Translates queries to English. Prioritises DeepL Free API and falls back to MyMemory.
 * VoiceBerry | Ulavi Technologies
 */

// ── SERVER ONLY ───────────────────────────────────────────────────────────────
// This file runs on the server (Next.js API route). Do NOT import browser APIs.

import { NextResponse } from "next/server";

interface DeepLTranslation {
  detected_source_language: string;
  text: string;
}

interface DeepLResponse {
  translations?: DeepLTranslation[];
}

interface MyMemoryResponse {
  responseData?: {
    translatedText?: string;
  };
  responseStatus?: number;
  responseDetails?: string;
  matches?: Array<{
    translation?: string;
  }>;
}

/**
 * Translates text using the DeepL Free API.
 *
 * @param text - The text content to translate
 * @param targetLang - Target language code (e.g. 'EN')
 * @returns Translated text, or null if the request fails
 */
async function translateWithDeepL(text: string, targetLang: string): Promise<string | null> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang.toUpperCase(),
      }),
    });

    if (!res.ok) {
      console.warn(`[api/translate] DeepL responded with non-OK status: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as DeepLResponse;
    return data.translations?.[0]?.text?.trim() ?? null;
  } catch (err: unknown) {
    console.error("[api/translate] DeepL translation failed:", err);
    return null;
  }
}

/**
 * Translates text using the free MyMemory translation proxy fallback.
 *
 * @param text - The text content to translate
 * @param source - Source language code (e.g. 'ta', 'hi')
 * @param target - Target language code (e.g. 'en')
 * @returns Localized translation or original text on network error
 */
async function translateWithMyMemory(text: string, source: string, target: string): Promise<string> {
  const langPair = source === "auto" ? `autodetect|${target}` : `${source}|${target}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return text;
    }
    const data = (await response.json()) as MyMemoryResponse;
    return (
      data.responseData?.translatedText?.trim() ||
      data.matches?.[0]?.translation?.trim() ||
      text
    );
  } catch {
    return text;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = (searchParams.get("text") ?? "").trim();
  const source = (searchParams.get("source") ?? "auto").trim();
  const target = (searchParams.get("target") ?? "en").trim();

  if (!text) {
    return NextResponse.json({ translatedText: "" }, { status: 200 });
  }

  // 1. Try DeepL API if a key is configured
  if (process.env.DEEPL_API_KEY) {
    const deepLResult = await translateWithDeepL(text, target);
    if (deepLResult) {
      return NextResponse.json({
        translatedText: deepLResult,
        engine: "deepl",
        responseStatus: 200,
        responseDetails: "OK",
      });
    }
  }

  // 2. Fallback to MyMemory if DeepL fails or is not configured
  const myMemoryResult = await translateWithMyMemory(text, source, target);
  return NextResponse.json({
    translatedText: myMemoryResult,
    engine: "mymemory",
    responseStatus: 200,
    responseDetails: "Fallback engine",
  });
}
```

---

## Step 4.5 — Error Monitoring with Sentry

Sentry tracks runtime crashes and slow queries, providing visibility into failing requests in production.

### Automatic Initialization

Run Sentry's automated installation wizard inside the `frontend` folder:

```bash
npx @sentry/wizard@latest -i nextjs
```

The wizard will:
1. Prompt you to log in to Sentry or create a free account.
2. Guide you to select your Next.js project.
3. Automatically create/modify configuration files:
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`
   - `next.config.ts` (modifies with wrapper `withSentryConfig`)
4. Add the Sentry DSN key to your `.env.local` file:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
   ```

Verify that production build passes after Sentry is configured:
```bash
npm run build
```

---

## Step 4.6 — Production Environment Variables

Update `frontend/.env.example` to provide a complete list of keys required for production hosting.

**Full file content (`frontend/.env.example`):**

```bash
# ── AssemblyAI — server-side transcription ──────────────────────────────────
ASSEMBLYAI_API_KEY=

# ── EmailJS — server-side ONLY (never use NEXT_PUBLIC_ prefix here) ─────────
EMAILJS_PUBLIC_KEY=
EMAILJS_SERVICE_ID=
EMAILJS_CUSTOMER_TEMPLATE_ID=
EMAILJS_OPS_TEMPLATE_ID=
EMAILJS_PRIVATE_KEY=

# ── MongoDB Atlas — database storage ────────────────────────────────────────
MONGODB_URI=
MONGODB_DB=voiceberry

# ── Supabase Storage — voice recording uploads ──────────────────────────────
# (NEXT_PUBLIC_ is allowed here as project URLs are public)
NEXT_PUBLIC_SUPABASE_URL=
# Service role key — server-side ONLY (never expose this to the browser)
SUPABASE_SERVICE_ROLE_KEY=

# ── Upstash Redis — rate limiting ───────────────────────────────────────────
# REST keys are used for compatibility with serverless environments
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ── DeepL API — high quality translations ──────────────────────────────────
DEEPL_API_KEY=

# ── Sentry — error tracking ─────────────────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Phase 4 — Verification Checklist

Execute these verification checks before marking the implementation project as complete.

### Build and Code Quality
- [ ] `npm run build` completes with 0 errors.
- [ ] `npm run lint` completes with 0 errors.
- [ ] No `any` type overrides remain in any updated file.
- [ ] Updated endpoints (`queries/route.ts`, `transcribe/route.ts`, `translate/route.ts`) contain appropriate server boundary headers and JSDoc comments.

### Upstash Redis Rate Limiting
- [ ] Setup Redis DB in Upstash and copy the REST URL and Token to `.env.local`.
- [ ] Make 6 query submissions within 10 minutes. The 6th request must fail with a `429 Too Many Requests` status, and the `Retry-After` header must be populated.
- [ ] Trigger transcription requests consecutively. The 11th request must return a rate limit error.
- [ ] Check the Upstash dashboard and verify that commands are registered in the analytics timeline.

### Translation Quality & DeepL Fallback
- [ ] Test the translation endpoint (`/api/translate`) without `DEEPL_API_KEY` set. Verify it falls back to MyMemory and returns `engine: "mymemory"`.
- [ ] Configure a free `DEEPL_API_KEY` in `.env.local` and send a test translate request. Verify the result returns `engine: "deepl"` and provides high-quality translations.

### MongoDB Indexes
- [ ] Verify inside the MongoDB Atlas UI that the five indexes specified in Step 4.3 show as `Active` on the `query_submissions` collection.

### Error Tracking
- [ ] Verify that a mock runtime crash is successfully captured in the Sentry issues stream dashboard.

---

## Common Mistakes to Avoid in Phase 4

| Mistake | Correct Approach |
|---|---|
| Prefixing `UPSTASH_REDIS_REST_TOKEN` with `NEXT_PUBLIC_` | Keep the Redis tokens confidential. Next.js environment keys used inside API routes must remain private. |
| Forgetting to await `.limit()` call | The Upstash rate limiter is asynchronous. `await queryRateLimiter.limit(ip)` must be awaited. |
| Creating indexes on wrong collection | Ensure you are on the `query_submissions` collection in Atlas before registering indexes. |
| Leaking the DeepL API key | Keep `DEEPL_API_KEY` restricted to server-side environments. |

---

*This document is the property of Ulavi Technologies. Confidential.*  
*Questions? Contact Anas Alam — SDE.*
