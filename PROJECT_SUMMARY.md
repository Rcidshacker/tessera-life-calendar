# Tessera (Life in Dots 2.0)

## What It Does
Tessera is a personal life-calendar web app that renders every week of a user's life — up to 4,680 dots for an 80-year lifespan — as an interactive grid. Each dot is clickable and lets the user attach a journal entry, mood rating, and weekly goals to that specific week. Alongside the grid, the app provides life-phase analytics (childhood through senior), mood trend tracking, a world events timeline that overlays historical events against the user's age at the time, and an AI life coach that analyzes recent journal entries via OpenRouter (Llama 3.3 70B) and returns personalized patterns, suggestions, and encouragement. Authentication is handled by Supabase Google OAuth, and all data syncs across devices via Supabase PostgreSQL with real-time change subscriptions.

## Technical Architecture
The app is a Next.js 16 App Router single-page application with a thin serverless backend. The central `useLifeData` hook owns all state: it fetches the user profile, week entries, and milestones from Supabase on mount, merges them with client-computed week metadata, and exposes optimistic-update actions that write back to Supabase via upsert. The life grid itself is generated entirely client-side by `life-calculations.ts`, which walks from week 0 to `lifeExpectancy * 52`, annotating each week with age, date range, and life phase. A one-time `migrateLocalStorageToSupabase` function handles users who had data from an earlier localStorage-only version. The AI endpoint (`/api/insights`) proxies to OpenRouter using the OpenAI-compatible SDK with `response_format: json_object` forced to keep parsing reliable. Supabase real-time channels subscribe to `life_weeks` row changes and patch the in-memory state, enabling multi-tab or multi-device sync. Auth state is managed by a React Context (`AuthProvider`) wrapping the entire app, and an `AuthGate` component guards the main view behind Google OAuth.

## Stack
- **Language:** TypeScript
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS 4, Shadcn/UI (Radix primitives), Framer Motion
- **State:** React hooks + Zustand (installed, partially used), TanStack React Query
- **Database:** Supabase (PostgreSQL) — tables: `user_profiles`, `user_settings`, `life_weeks`, `milestones`
- **ORM:** Prisma 6 (schema defined, used in DB scripts; direct Supabase client used in app)
- **Auth:** Supabase Auth with Google OAuth via `next-auth` and `@supabase/auth-helpers-nextjs`
- **AI:** OpenRouter API (meta-llama/llama-3.3-70b-instruct:free) via the `openai` SDK package
- **Forms:** React Hook Form + Zod validation
- **Deployment:** Netlify (`@netlify/plugin-nextjs`)
- **Runtime:** Bun (production server), Node/npm (dev)

## Most Impressive Parts
1. **Computed life-grid architecture:** The entire 4,000+ week grid is generated as pure derived state from just two inputs — birthdate and life expectancy. `generateLifeWeeks` computes every week's start/end dates, age, and life-phase membership in a single O(n) pass, and the result is merged with Supabase-stored journal/mood data using a `useMemo` that only reruns when those inputs change. No server-side computation is needed for the visualization.
2. **Seamless local-to-cloud migration:** The app shipped a v1 with localStorage-only persistence, then added Supabase sync without breaking existing users. On first login, `migrateLocalStorageToSupabase` reads the old `life-in-dots-data` key, bulk-upserts all historical weeks and milestones into Supabase, then clears the key — a clean one-shot migration that runs transparently before any data is displayed.
3. **Merged world events + personal milestones timeline:** The `WorldEventsTimeline` component unions a hardcoded dataset of 15 curated historical events (significance-scored 1–10) with user-created milestones, deduplicates by date+title, and sorts the combined list chronologically — each entry enriched with the user's exact age at that moment. This gives users a contextualized view of their life alongside world history without any backend logic.

## Results / Metrics / Outputs
- Grid capacity: up to 5,200 weeks (100-year life expectancy cap) rendered as interactive dots
- AI model: Llama 3.3 70B (free tier via OpenRouter), up to 1,500 tokens per insight response
- Life score formula: 20 pts journaling frequency + 30 pts avg mood + 20 pts streak + 30 pts phase diversity
- Deployed live at: https://tessera-life-calendar.netlify.app
- No benchmark data or user counts documented

## Status
Working demo

## Estimated Timeline
Built over approximately 2 days: scaffolding and core components from 2026-02-14, main feature implementation on 2026-02-15, final route/type refinements on 2026-02-16. The worklog confirms the entire v2 was built in a single focused sprint.
