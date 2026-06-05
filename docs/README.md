# VoiceBerry — Developer Documentation

**Project:** Voice-Based Travel Query Submission System  
**Company:** Ulavi Technologies  
**Author:** Anas Alam — SDE  
**Target:** 100,000+ concurrent users | Zero paid services (free tiers only)

---

## Quick Start — Read in This Order

Before touching any code, read these two documents:

1. **[CODE_STANDARDS.md](./CODE_STANDARDS.md)** — Mandatory rules for every file you write
2. **[FREE_TOOLS.md](./FREE_TOOLS.md)** — Approved service list (free tiers only)

Then implement phase by phase — **do not skip ahead**:

| Phase | Document | Goal | Duration |
|---|---|---|---|
| 1 | [PHASE_1_LANGUAGE_FOUNDATION.md](./phases/PHASE_1_LANGUAGE_FOUNDATION.md) | Language picker + i18n + Zustand store | 2–3 days |
| 2 | [PHASE_2_TRIP_DETAILS_POPUPS.md](./phases/PHASE_2_TRIP_DETAILS_POPUPS.md) | Smart pop-ups + star budget selector | 3–4 days |
| 3 | [PHASE_3_AUDIO_REVIEW_EMAIL.md](./phases/PHASE_3_AUDIO_REVIEW_EMAIL.md) | Audio upload + review screen + dual email | 4–5 days |
| 4 | [PHASE_4_SCALE_HARDENING.md](./phases/PHASE_4_SCALE_HARDENING.md) | Redis rate limiting + DB indexes + monitoring | 3–5 days |

---

## System Architecture (Final State)

```
User Opens App
     |
     v
[Screen 1: /]  Language Picker
     |  Stores language in Zustand + localStorage
     v
[Screen 2: /record]  Record Voice Query (max 60s)
     |  MediaRecorder -> POST /api/aai/transcribe
     |  Returns: original transcript + English translation
     |  Also: POST /api/audio/upload (fire-and-forget -> Supabase)
     v
[Screen 3: /details]  Smart Pop-ups (1 at a time)
     |  extractTripDetails() runs client-side (zero API cost)
     |  Shows pop-ups for: city, dates, passengers, budget (star selector)
     |  All stored in Zustand
     v
[Screen 4: /review]  Review + Contact Details
     |  Shows editable: transcript, all 4 trip fields, budget stars
     |  Collects: name, email (Zod validated), phone
     |  POST /api/queries
     v
     |-- MongoDB Atlas: Full document saved
     |-- EmailJS Template A: Customer email (in user's language, with query copy)
     +-- EmailJS Template B: Ops email (English, with audio link)
     v
[Screen 5: /confirmation]  Success (in user's language)
```

---

## Technology Stack (All Free Tier)

| Layer | Technology | Free Limit |
|---|---|---|
| Framework | Next.js 16 (App Router) | Vercel free hosting |
| State | Zustand 5 + persist | Client-only |
| Database | MongoDB Atlas | 512MB |
| Speech-to-text | AssemblyAI | 5 hours/month |
| Translation | MyMemory API | 5,000 words/day |
| Audio storage | Supabase Storage | 1GB + 2GB bandwidth |
| Email | EmailJS REST | 200 emails/month |
| Rate limiting | Upstash Redis | 10,000 commands/day |
| Error monitoring | Sentry | 5,000 errors/month |
| Hosting | Vercel | Free hobby tier |

---

## Ground Rules

> **Rule 1** — Add, don't delete. Every existing feature must keep working after each phase.  
> **Rule 2** — One phase = one working deployable app. After each phase, `npm run build` must pass.  
> **Rule 3** — Test before moving on. Never skip a phase verification checklist.  
> **Rule 4** — Scale first. All architectural decisions are made for 100K+ users from day one.

---

*Ulavi Technologies — Confidential*  
*Questions: Anas Alam — SDE*
