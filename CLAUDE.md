# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server on localhost:3000
npm run build        # Next.js build + copies static assets to standalone output
npm run start        # production: bun .next/standalone/server.js
npm run lint         # ESLint

npm run db:push      # sync Prisma schema to DB (no migration file)
npm run db:generate  # regenerate Prisma client after schema changes
npm run db:migrate   # create and apply a new migration
npm run db:reset     # wipe DB and re-run all migrations
```

No test suite exists.

## Required Environment Variables

```
OPENROUTER_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL   # used as HTTP-Referer for OpenRouter
```

## Architecture

**Tessera** ("Life in Dots 2.0") renders every week of a user's life as an interactive grid (up to ~5,200 dots). Users journal, track mood, and add goals per week; an AI coach analyzes entries via OpenRouter.

### Data Layer

- **Database:** Supabase PostgreSQL. Tables: `user_profiles`, `user_settings`, `life_weeks`, `milestones`.
- **Prisma:** Schema is defined in `prisma/schema.prisma` but the app uses the **direct Supabase client** (`@supabase/supabase-js`) for all queries — Prisma is used only for DB migrations/schema management.
- **Supabase clients:** `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server components / route handlers).

### State Architecture

`src/hooks/use-life-data.ts` is the single source of truth. On mount it:
1. Calls `migrateLocalStorageToSupabase` (one-shot migration for v1 users)
2. Fetches profile, settings, weeks, and milestones from Supabase
3. Subscribes to `life_weeks` real-time changes for multi-tab/device sync
4. Exposes optimistic-update actions (`updateWeek`, `initializeUser`, etc.) that write to Supabase

All week metadata (dates, age, life phase) is **computed client-side** by `src/lib/life-calculations.ts` from just `birthdate` and `lifeExpectancy`. Supabase stores only user-authored data (`journal`, `mood`, `goals`). The two are merged in a `useMemo` inside `use-life-data`.

### Auth

`src/contexts/auth-context.tsx` provides `AuthProvider` + `useAuth`. Auth is Google OAuth via Supabase. The OAuth callback lands at `/auth/callback` (`src/app/auth/callback/route.ts`). `src/components/auth-gate.tsx` guards the entire app — unauthenticated users see a "Continue with Google" screen.

### AI Insights

`POST /api/insights` (`src/app/api/insights/route.ts`) proxies to OpenRouter using the `openai` npm package pointed at `https://openrouter.ai/api/v1`. Model: `meta-llama/llama-3.3-70b-instruct:free`. Forces `response_format: { type: "json_object" }`.

### Key File Map

| File | Role |
|------|------|
| `src/lib/types.ts` | All shared types + `LIFE_PHASES`, `MOOD_CONFIG` constants |
| `src/lib/life-calculations.ts` | Pure functions: `generateLifeWeeks`, `calculateLifeStats`, `getWeekNumberInLife` |
| `src/hooks/use-life-data.ts` | Central state hook — Supabase fetches, optimistic updates, real-time sub |
| `src/contexts/auth-context.tsx` | Google OAuth state via Supabase |
| `src/lib/migrate-local-data.ts` | One-shot localStorage → Supabase migration |
| `src/app/api/insights/route.ts` | OpenRouter AI proxy |
| `src/app/page.tsx` | Main dashboard — sidebar + LifeGrid + tabs |

### Build Notes

- `next.config.ts` sets `output: "standalone"` and `typescript: { ignoreBuildErrors: true }` — TypeScript errors do **not** fail the build.
- `reactStrictMode` is disabled.
- Deployed on Netlify via `@netlify/plugin-nextjs`. Production server runs with Bun.
