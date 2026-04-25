# Frontier Tape — Community LLM Benchmark Platform

Next.js 15 + Supabase platform where the community submits real benchmark runs
(model + prompt + score + evidence) and compares them side-by-side. Mid-rebuild
from a static-data comparison into an authenticated platform — see
`docs/superpowers/specs/2026-04-25-community-rebuild-master.md`.

## Stack

- Next.js 15 (App Router, Server Actions, RSC)
- React 19, TypeScript strict
- Tailwind v4
- Supabase (Postgres + Auth + Storage) — free tier
- Zod validation
- Vitest tests
- Bun runtime

## Backend setup (one-time, you run this)

1. Create a free Supabase project at https://supabase.com.
2. Locally:

   ```bash
   bunx supabase login
   bunx supabase init                     # if not already
   bunx supabase link --project-ref <ref>
   bunx supabase db push                  # applies supabase/migrations/*
   bunx supabase db seed                  # seeds models + categories
   bunx supabase gen types typescript --linked > lib/db/types.ts
   ```

3. Copy `.env.local.example` → `.env.local` and fill the four `SUPABASE_*` vars
   from your project's API settings.
4. Optional: enable Google OAuth in Supabase → Auth → Providers, and add a
   redirect URL `http://localhost:3000/auth/callback` (plus your prod URL).

## Run

```bash
bun install
bun run dev          # http://localhost:3000
bun run typecheck
bun run lint
bun run test
bun run guard        # forbids SUPABASE_SERVICE_ROLE_KEY outside server-only allowlist
bun run build
```

## Layout

```
app/
  (auth)/             # sign-in, sign-up pages (route group)
  auth/callback/      # OAuth + email confirmation handler
  auth/sign-out/      # POST sign-out
  api/health/         # ping endpoint (writes to public.pings)
  profile/            # authenticated profile editor
  benchmarks/         # static-data view (Phase 2 swaps to DB)
  test-yourself/
  methodology/
components/
  benchmark/          # board + score primitives
  layout/             # header, footer, nav, theme
  shared/             # eyebrow, container, rule, …
lib/
  auth/               # session helpers, server actions, schemas
  supabase/           # server / browser / middleware / admin clients
  db/                 # generated types + queries
  data/               # legacy static datasets (Phase 2 retires)
supabase/
  migrations/         # 0001_init / 0002_triggers / 0003_rls
  seed.sql
docs/superpowers/     # specs + plans
```

## Phase status

- **Phase 1 — Foundation + Auth** (this rebuild): Supabase wired, schema +
  RLS migrations checked in, sign-up / sign-in / sign-out, profile editor,
  health-ping cron. **In progress.**
- Phase 2 — Tasks & runs CRUD. *Pending.*
- Phase 3 — Discovery + voting. *Pending.*
- Phase 4 — Visual rebuild (replace AI-default aesthetic). *Pending.*
- Phase 5 — Motion polish. *Pending.*

See `docs/superpowers/specs/` for full specs and `docs/superpowers/plans/`
for implementation plans.

## Free-tier ops

- Supabase free tier pauses projects after 7 days of zero traffic. The daily
  GitHub Action `health-ping.yml` hits `/api/health` to prevent that. Set the
  repo secret `HEALTH_URL` to your deployed URL once Phase 1 lands.
- Service-role key is server-only. The `bun run guard` check fails CI if it
  ever leaks into a client module.
