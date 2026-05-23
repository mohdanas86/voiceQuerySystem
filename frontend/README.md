# Frontend

Next.js app for the Voice-Based Query Submission System.

**Setup, environment variables, and full project documentation:** see the [root README](../README.md) and [docs/SETUP.md](../docs/SETUP.md).

The review flow now collects the user's name and the local submit route writes successful submissions to MongoDB Atlas.

```bash
npm install
cp .env.example .env.local
npm run dev
```

| Script | Command |
|--------|---------|
| Development | `npm run dev` |
| Production build | `npm run build` |
| Start production | `npm start` |
| Lint | `npm run lint` |
