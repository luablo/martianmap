# MARSWALK · Web app

This folder is the Next.js app. The full project README (in English) is at the repository root: [../../README.md](../../README.md). Spanish version: [../../README.es.md](../../README.es.md).

```bash
npm install
npm run dev          # http://localhost:3000
npm run check-data   # checks public/data/gale against lib/types.ts (also runs before every build)
npm run build
```

- Live app: https://martianmap-rosy.vercel.app (Vercel publishes `main`, Root Directory `Frontend/martianmap`).
- Shared notes: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
- Next.js 16 has breaking changes: read [AGENTS.md](AGENTS.md) before changing framework code.
