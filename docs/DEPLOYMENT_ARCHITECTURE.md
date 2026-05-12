# Deployment Architecture

## Vercel (Frontend)
- Build command: next build
- Output: Next.js app
- Env vars: NEXT_PUBLIC_API_BASE_URL

## Render (Backend)
- Build: pip install -r requirements.txt
- Start: uvicorn app.main:app
- Env vars: DATABASE_URL, RESEND_API_KEY, SUPPORT_EMAIL

## MongoDB Atlas
- Free tier M0
- IP allowlist set to Render
- Connection string stored in backend env

## CI/CD Future Plan
- GitHub Actions for lint and tests
- Auto deploy to Vercel and Render
- Secrets in GitHub Actions
