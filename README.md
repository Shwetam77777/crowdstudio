# CrowdJam

A real-time collaborative music jamming platform — built from scratch, combining
the working ideas from two earlier prototypes (CrowdStudio's social/backend
model + Present Mind Sound's generative audio engine) while fixing every bug
found in both during audit.

## Stack

- **Frontend**: Vite + React + TypeScript + Tailwind, `zustand` for state, `tone.js` for live audio
- **Backend**: Express + TypeScript + Prisma + PostgreSQL, `socket.io` for real-time
- **Auth**: JWT, bcrypt password hashing

## Features (all real, no fakes)

| Feature | Status |
|---|---|
| Auth (register/login) | Real, with specific error messages (not generic "failed") |
| Live Jam Studio | Real Tone.js synthesis — tempo, filter, reverb, scale, all audible |
| Save jam as track | Real DB write, shows up in global feed |
| Global feed | Real, paginated, DB-backed |
| Likes / comments | Real, DB-backed, per-user |
| Leaderboard | Real, DB-backed ranking by likes — **not** localStorage (old bug) |
| Online presence ("X jamming now") | Real WebSocket count — **not** a hardcoded random number (old bug) |
| Live param sync between users | Real, via socket.io broadcast |
| AI export | Calls a real configured provider API, or returns a clear "not configured" error — never fakes a result |

## Local setup

### Backend
```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev    # creates tables
npm run dev                # http://localhost:4000
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                # http://localhost:5173
```

You need a running Postgres instance for `DATABASE_URL` — easiest local option:
```bash
docker run --name crowdjam-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crowdjam"
```

## Deploying

`render.yaml` at the repo root deploys **both** the backend and frontend as
separate services plus a managed Postgres database. (The old CrowdStudio
`render.yaml` only defined the backend — the frontend was never actually
deployed by that config.)

After first deploy, set `CORS_ORIGIN` on the backend to the real frontend URL,
and `VITE_API_BASE` on the frontend to the real backend URL — the placeholders
in `render.yaml` are intentionally left blank (`sync: false`) so you set them
explicitly rather than accidentally deploying with `CORS_ORIGIN: "*"`.

## Enabling real AI export (optional)

By default, AI export is disabled and the API returns a clear `501` error if
you try to use it. To enable it, set on the backend:

- `AI_EXPORT_PROVIDER` — e.g. `suno`, `elevenlabs`
- `AI_EXPORT_API_KEY` — your provider's API key
- `AI_EXPORT_ENDPOINT` — the provider's actual API endpoint

The request/response shape in `src/routes/aiExport.ts` is written generically
(`{ audioUrl }` response) — you'll need to adjust the request payload to match
whichever provider you pick, since each has a different API contract.

## What was fixed vs. the two source projects

**From CrowdStudio (Next.js + Express):**
- `typescript.ignoreBuildErrors` / `eslint.ignoreDuringBuilds` were silently
  hiding real type errors — removed; this codebase is built with strict TS on.
- Login/register showed a generic "failed" message because the frontend read
  `err.message` on an Axios error, which is always `undefined` — fixed to
  read the actual backend error body.
- Dashboard redirected logged-in users to `/login` on refresh due to a race
  between the auth-hydration effect and the redirect effect — fixed with an
  explicit `isLoading` state that gates the redirect.
- `render.yaml` only deployed the backend — frontend service was missing.
- SQLite on ephemeral disk risked data loss on redeploy — moved to managed
  Postgres.
- "AI generation" returned a random stock MP3 regardless of input — replaced
  with a real Tone.js engine, plus an optional real external API hook that
  fails loudly instead of faking a result.

**From Present Mind Sound (Vite + React, no backend):**
- No backend at all — "connected users" and "leaderboard" were fully fake
  (`Math.random()` counters, `localStorage`-only data invisible to other
  users). Replaced with a real Postgres-backed leaderboard and a real
  Socket.io presence system.
- `@import` for Google Fonts was placed after `@tailwind utilities` in the
  CSS, which is invalid per spec — browsers silently drop it in production,
  so the Orbitron display font never actually loaded. Fixed by placing
  `@import` first.
- Single 1.4MB JS bundle with no code splitting — Vite config now splits
  `tone.js` and vendor code into separate chunks.
- The generative audio engine itself (Tone.js synthesis) was legitimately
  good — kept and hardened (proper cleanup/disposal on stop, no
  autoplay-before-gesture issues).
