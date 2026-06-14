# Contributing to Voice Query System

Thank you for your interest in contributing! This guide outlines everything you need to know before submitting changes.

---

## Maintainer

**[Anas Alam](https://linkedin.com/in/anas86/)** — SDE, Ulavi Technologies  
For questions, reach out via LinkedIn or open a GitHub issue.

---

## Before You Start

1. **Read the Code Standards** — [docs/CODE_STANDARDS.md](./docs/CODE_STANDARDS.md) is mandatory reading. Every PR must comply with all rules listed there without exception.
2. **Read the Setup Guide** — [docs/SETUP.md](./docs/SETUP.md) covers environment setup.
3. **Understand the User Flow** — [docs/USER_FLOW.md](./docs/USER_FLOW.md) explains every screen.
4. **Use only free-tier services** — [docs/FREE_TOOLS.md](./docs/FREE_TOOLS.md) is the approved service list. Do not introduce paid dependencies.

---

## Project Structure

```
voiceQuerySystem/
├── frontend/                   # Next.js app (all runnable code lives here)
│   ├── app/                    # App Router pages and API routes
│   │   ├── (root)/page.tsx     # Language picker (Screen 1)
│   │   ├── record/page.tsx     # Voice recording (Screen 2)
│   │   ├── details/page.tsx    # Trip detail pop-ups (Screen 3)
│   │   ├── review/page.tsx     # Review & submit (Screen 4)
│   │   ├── confirmation/page.tsx  # Success (Screen 5)
│   │   └── api/                # Server-side API routes
│   ├── components/             # Reusable React components
│   ├── lib/                    # Shared server-side utilities (email, translation, rate limit)
│   ├── store/                  # Zustand global state
│   └── scripts/                # One-off admin scripts (e.g. createIndexes.js)
└── docs/                       # All project documentation
```

---

## Development Workflow

### 1. Fork and clone

```bash
git clone <your-fork-url>
cd voiceQuerySystem/frontend
cp .env.example .env.local
# fill in keys — see docs/SETUP.md
npm install
npm run dev
```

### 2. Create a feature branch

```bash
git checkout -b feat/your-feature-name
```

Branch naming convention:
- `feat/` — new feature
- `fix/` — bug fix
- `docs/` — documentation only
- `refactor/` — code cleanup, no functional change
- `chore/` — dependency update, tooling

### 3. Write code to standard

Every file you create or modify must comply with [CODE_STANDARDS.md](./docs/CODE_STANDARDS.md):

- ✅ File header comment (filename + description + `Ulavi Technologies`)
- ✅ JSDoc comment on every function
- ✅ No `any` type — use explicit types
- ✅ Named constants instead of magic values (`DEBOUNCE_DELAY_MS`, not `800`)
- ✅ Server/client boundary comments on all API routes
- ✅ One responsibility per function

### 4. Verify before opening a PR

```bash
npm run lint    # must exit with 0 errors
npm run build   # must complete with 0 TypeScript errors
```

Do not submit a PR that fails either of these commands.

---

## Pull Request Guidelines

- **One concern per PR.** Don't bundle a feature with an unrelated fix.
- **PR title format:** `[scope]: short description` — e.g. `feat: add Nepali language support`, `fix: debounce translation on slow networks`
- **PR description** must include:
  - What changed and why
  - How to test it manually
  - Screenshots or recordings for any UI change
- **Update relevant docs** — if your change affects user flow, setup, or languages, update the appropriate file in `docs/`.

---

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add search to language picker
fix: normalise hi-IN language code from AssemblyAI
docs: update TESTING.md with auto-translation checklist
refactor: extract validateContactForm from review page
chore: bump @upstash/redis to 1.34.0
```

---

## Language Contributions

If you want to add or improve UI translations for a language:

1. Open `frontend/lib/i18n.ts`
2. Find the `strings` object and locate the language code (e.g. `'ta'` for Tamil)
3. Update or add the missing keys — every key in `LangStrings` must have a value
4. Test by selecting the language on the Language Picker screen and checking all 5 screens

> **Note:** The `i18n.ts` dictionary covers static UI strings. Dynamic voice transcript translation is handled server-side by MyMemory and does not require changes here.

---

## Reporting Issues

When filing a bug report, include:

- Steps to reproduce
- Expected vs actual behaviour
- Browser and OS
- Any relevant console errors (open DevTools → Console)

---

## Code of Conduct

Be respectful. This is a professional project maintained by Ulavi Technologies. Constructive feedback is welcome; disrespectful behaviour will not be tolerated.

---

*Built by [Anas Alam](https://linkedin.com/in/anas86/) · Ulavi Technologies*
