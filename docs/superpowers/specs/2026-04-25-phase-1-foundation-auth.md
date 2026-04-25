# Phase 1 — Foundation + Auth

**Date:** 2026-04-25
**Parent spec:** `2026-04-25-community-rebuild-master.md`
**Status:** Approved (autonomous execution)

## 1. Goal

Wire Supabase to the existing Next.js 15 app, install the canonical schema, and ship working email + Google sign-in / sign-out / profile flow. Nothing user-visible breaks during this phase: existing pages keep working with the static dataset until Phase 2 begins consuming the DB.

## 2. Outputs

- `lib/supabase/` — server, browser, middleware clients (typed).
- `middleware.ts` — refreshes Supabase session cookie on every request.
- `app/(auth)/sign-in/page.tsx`, `app/(auth)/sign-up/page.tsx`, `app/(auth)/callback/route.ts`, `app/(auth)/sign-out/route.ts`.
- `app/profile/page.tsx` — own profile editor (display name, bio, avatar URL).
- `supabase/migrations/0001_init.sql` — schema from master spec section 4.
- `supabase/migrations/0002_rls.sql` — RLS policies.
- `supabase/seed.sql` — seed `models` and `benchmark_categories` tables.
- `lib/db/types.ts` — generated DB types (`supabase gen types`).
- `lib/data/migration.ts` — one-time importer that pushes existing static `benchmarks.ts`, `prompts.ts`, `playgrounds.ts` data into the DB so Phase 2 has content to display.
- `app/api/health/route.ts` — pings DB, used by idle-ping cron.
- `.github/workflows/health-ping.yml` — daily cron hitting `/api/health`.
- `tests/auth/` — Vitest unit tests for session helpers; one Playwright e2e covering sign-up → confirm → sign-in → profile edit → sign-out.

## 3. File-level layout

```
lib/supabase/
  server.ts        # cookies()-based server client (Server Components, Route Handlers, Server Actions)
  browser.ts       # createBrowserClient for "use client" components
  middleware.ts    # createServerClient bound to req/res cookies
  admin.ts         # service-role client; ONLY imported by scripts and route handlers explicitly opted in
lib/auth/
  session.ts       # getSession(), getUser(), requireUser()
  actions.ts       # signInWithPassword, signUp, signOut, sendMagicLink server actions
  schema.ts        # Zod schemas for all auth forms
lib/db/
  types.ts         # generated; checked in
  queries/profiles.ts
middleware.ts      # at repo root, calls lib/supabase/middleware.ts
app/(auth)/
  layout.tsx
  sign-in/page.tsx
  sign-up/page.tsx
  callback/route.ts
  sign-out/route.ts
app/profile/
  page.tsx
  profile-form.tsx
```

## 4. Auth flows

### Email + password

1. User submits sign-up form → server action calls `supabase.auth.signUp({ email, password })`.
2. Supabase emails confirmation link → user clicks → `/auth/callback?code=...` exchanges for session.
3. On first session, a database trigger inserts a `profiles` row keyed to `auth.users.id`.
4. Sign-in page calls `signInWithPassword`. On success, redirect to `/` (or `?next=...`).
5. Sign-out is a `POST /auth/sign-out` route that calls `supabase.auth.signOut()` then redirects.

### Google OAuth

1. Sign-in page exposes a "Continue with Google" button that calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: ${origin}/auth/callback } })`.
2. Callback route is shared with email confirmation.

### Session refresh

`middleware.ts` runs on every request, calls `supabase.auth.getUser()` (which refreshes the cookie if needed). Match all routes except static assets.

## 5. Schema migrations

`supabase/migrations/0001_init.sql` creates every table from master spec section 4, plus:

- `citext` extension for case-insensitive `username`.
- A trigger on `auth.users` insert: insert into `profiles(id, username)` with a generated handle (`user_<6-char-rand>`); user can edit later.
- A `set_updated_at` trigger applied to every table that has `updated_at`.

`supabase/migrations/0002_rls.sql` enables RLS on every user-facing table and writes the policies stated in master spec section 4.

## 6. Type safety

- Run `bunx supabase gen types typescript --linked` in CI; commit the result to `lib/db/types.ts`.
- Every `supabase.from('table')` call uses generated types — no string-typed access without cast.
- Zod schemas in `lib/auth/schema.ts` mirror DB constraints (length, regex for username, email format).

## 7. Environment

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # never imported by client modules; lint rule enforces
SUPABASE_DB_URL               # for migrations only, in CI
```

`.env.local.example` checked in. `.env.local` gitignored (already covered by current `.gitignore`).

## 8. Tests

- Unit (Vitest): `lib/auth/schema.ts` validates good and bad inputs; `lib/auth/session.ts` `requireUser()` throws when no session.
- Integration (Vitest + Supabase test container or hosted dev project): sign-up trigger creates profile row.
- E2E (Playwright, one flow): sign-up → email-confirm-stub → sign-in → edit profile → sign-out. Use a Supabase "preview" project for CI.

## 9. Deployment

- Vercel project linked, env vars set in dashboard.
- Supabase project created; CLI linked via `supabase link --project-ref ...`.
- GitHub Actions: `supabase db push` runs on merge to `main` to apply migrations.
- Health-ping workflow runs at 09:00 UTC daily, hits `https://<domain>/api/health`.

## 10. Definition of done — Phase 1

- `bun run typecheck`, `bun run lint`, `bun run build`, `bun run test` all green.
- Manual: sign up new user, receive confirmation email (or magic link), confirm, sign in, edit profile, sign out. Verify `profiles` row exists in DB.
- RLS verified: an unauthenticated `select * from benchmark_runs` returns `live` only; `update` from a non-author session is rejected.
- Health endpoint returns 200 and writes a row to a `pings` table (so we can tell the cron is alive).
- No service-role key reachable from any client bundle (CI grep check).

## 11. Out of scope for Phase 1

- Posting tasks (Phase 2).
- Submitting runs (Phase 2).
- Visual rebuild (Phase 4) — Phase 1 ships in current visual style; auth pages match it.
- Email template branding (Phase 4).
- Admin tooling beyond the bootstrap allowlist (later phase).
