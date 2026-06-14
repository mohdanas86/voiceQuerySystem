# Voice-Based Query Submission System

> A mobile-first web app by **[Anas Alam](https://linkedin.com/in/anas86/)** — speak your travel query in any of **72 languages**, get it transcribed and translated to English, and submit it to a support team in seconds.

[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Free Tier Only](https://img.shields.io/badge/services-free%20tier%20only-green)](./docs/FREE_TOOLS.md)
[![Ulavi Technologies](https://img.shields.io/badge/Ulavi-Technologies-orange)](https://ulavitech.com)

---

## ✨ What It Does

Users who struggle to type long queries — especially in their own language — get a simple 5-step flow:

1. 🌍 **Select language** from 72 supported languages (searchable picker)
2. 🎙️ **Record** up to 60 seconds in their language
3. 🤖 **AI transcribes** speech to text via AssemblyAI
4. 🔁 **Auto-translates** to English with 800ms debounce (no manual button)
5. ✅ **Reviews & sends** — support team gets a clean English email; customer gets a confirmation in their language

**Example:** A user in Tamil Nadu opens the app in Tamil, speaks for 30 seconds. The app transcribes, translates to English, and the ops team receives a structured English email. The customer sees the thank-you message in Tamil.

---

## 🖥️ Screens

| Screen | Route | Description |
|---|---|---|
| Language Picker | `/` | Searchable list of 72 languages |
| Record | `/record` | Mic button, 60s timer, transcript preview |
| Details | `/details` | Smart pop-ups for city, dates, passengers, budget |
| Review | `/review` | Editable transcript, auto-translate, contact form |
| Confirmation | `/confirmation` | Localised thank-you message |

---

## 🌐 Language Support

**72 languages** — all AssemblyAI-supported languages, with a searchable picker:

- **Indian:** Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Assamese, Urdu, Nepali, Sinhala
- **European:** Spanish, French, German, Italian, Portuguese, Dutch, Polish, Swedish, Danish, Finnish, Norwegian, Czech, Greek, Ukrainian, Romanian, Hungarian, Slovak, Bulgarian, Croatian, Serbian, Slovenian, Estonian, Latvian, Lithuanian, Russian, Turkish, Albanian, Armenian, Georgian, Basque, Belarusian, Bosnian, Catalan, Galician, Icelandic, Macedonian, Welsh, Hebrew
- **East Asian:** Japanese, Korean, Chinese
- **Middle Eastern / Central Asian:** Arabic, Persian, Azerbaijani, Kazakh, Kyrgyz, Uzbek
- **African:** Afrikaans, Amharic, Swahili, Yoruba, Zulu
- **Southeast Asian:** Indonesian, Malay, Thai, Vietnamese
- **Other:** Mongolian + auto-detect

---

## 🛠️ Tech Stack (All Free Tier)

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| State | Zustand 5 + persist |
| Speech-to-text | AssemblyAI |
| Translation | MyMemory API |
| Database | MongoDB Atlas |
| Email | EmailJS (server-side Node SDK) |
| Audio storage | Supabase Storage |
| Rate limiting | Upstash Redis |
| Error monitoring | Sentry |
| Hosting | Vercel |

> **Zero paid services.** All services run on free tiers. See [docs/FREE_TOOLS.md](./docs/FREE_TOOLS.md) for limits.

---

## 🚀 Quick Start

**Prerequisites:** Node.js 20+, AssemblyAI key, EmailJS account, MongoDB Atlas cluster.

```bash
git clone <repository-url>
cd voiceQuerySystem/frontend
cp .env.example .env.local
# fill in your keys (see docs/SETUP.md)
npm install
npm run dev
```

Open **http://localhost:3000** — allow microphone permission when prompted.

> Recording requires a secure context. `localhost` is treated as secure for development. Production deployments must use HTTPS.

---

## 🔑 Environment Variables

```env
# AssemblyAI (server-side)
ASSEMBLYAI_API_KEY=

# EmailJS (server-side — never use NEXT_PUBLIC_ prefix)
EMAILJS_SERVICE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
EMAILJS_CUSTOMER_TEMPLATE_ID=customer_confirmation
EMAILJS_OPS_TEMPLATE_ID=ops_notification

# MongoDB Atlas
MONGODB_URI=
MONGODB_DB=

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Sentry (error tracking)
NEXT_PUBLIC_SENTRY_DSN=
```

Full setup instructions: [docs/SETUP.md](./docs/SETUP.md)

---

## 📡 API Routes

| Route | Method | Description |
|---|---|---|
| `/api/aai/transcribe` | POST | Uploads audio to AssemblyAI, polls until done, returns transcript + translation |
| `/api/translate` | GET | Proxies MyMemory translation API |
| `/api/queries` | POST | Saves submission to MongoDB Atlas, sends dual EmailJS notifications |
| `/api/audio/upload` | POST | Fire-and-forget upload to Supabase Storage |

---

## 📧 Dual Email System

| Email | Recipient | Language |
|---|---|---|
| Customer confirmation | User's email | User's selected UI language |
| Ops notification | Support team inbox | Always English (fields translated server-side) |

---

## 📖 Documentation

| Document | Description |
|---|---|
| [docs/SETUP.md](./docs/SETUP.md) | Full environment and service setup guide |
| [docs/USER_FLOW.md](./docs/USER_FLOW.md) | Detailed screen-by-screen user flow |
| [docs/TESTING.md](./docs/TESTING.md) | Demo checklist and regression tests |
| [docs/PROJECT_BRIEF.md](./docs/PROJECT_BRIEF.md) | Project requirements and feature spec |
| [docs/FREE_TOOLS.md](./docs/FREE_TOOLS.md) | Approved services and free tier limits |
| [docs/CODE_STANDARDS.md](./docs/CODE_STANDARDS.md) | Mandatory coding standards for all contributors |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute to this project |

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on submitting issues and pull requests.

---

## 📄 License

See [LICENSE](./LICENSE.md) for details.

---

**Built by [Anas Alam](https://linkedin.com/in/anas86/) · Ulavi Technologies**
