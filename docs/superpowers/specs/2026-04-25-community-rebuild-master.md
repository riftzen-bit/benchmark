# Community Benchmark Platform — Master Rebuild Spec

**Date:** 2026-04-25
**Status:** Approved (user authorized autonomous execution)
**Supersedes:** `2026-04-25-llm-benchmark-site-design.md` (its non-goals "no auth, no DB, no backend mutation" are explicitly inverted by this spec).

## 1. Why this exists

The current site is a static, hand-curated comparison of two LLMs. The user feedback:

- The visual identity reads as "AI-slurp": warm-paper-editorial, Inter Tight + Fraunces serif, hairline rules, accent-orange + teal — recognizable as the default aesthetic LLMs reach for unprompted.
- Benchmarks are vendor-published claims, not real-world runs.
- No login, no community contribution, no scale.
- Animations are minimal and feel hand-wavy.
- Backend is non-existent.

**Goal:** turn this into a community benchmark platform where anyone can sign up and post benchmark runs (model + prompt + result + evidence), and others can browse, compare, and discuss.

**Hard constraints from user:**

- Everything must be free at any user scale we can plausibly reach (no paid VPS, no paid storage, no per-call API spend).
- Backend must be clean — no half-finished glue.
- Visual identity must break free of generic AI-tool aesthetic.

## 2. Non-goals (explicit)

- **Autonomous model invocation.** Running Claude/GPT for users would cost money. Out.
- **Multi-tenant SaaS.** This is one community, not a platform per organization.
- **Comparing models we ourselves run.** All evidence is user-submitted (URL to a public chat share, screenshot, transcript text). We are a registry, not a runner.
- **Native mobile apps.** Web only.
- **Real-time collab editing.** Out.
- **Localization beyond Vietnamese + English** in this rebuild.

## 3. Stack (locked)

| Layer | Pick | Free-tier limits |
|---|---|---|
| Framework | Next.js 15 (App Router, RSC, Server Actions) | — |
| Runtime | Bun (matches global rule + existing lockfile) | — |
| DB | Supabase Postgres | 500 MB, 2 free projects, pause-on-7d-idle |
| Auth | Supabase Auth | 50 000 MAU, email + Google OAuth |
| File storage | Supabase Storage | 1 GB, 5 GB egress/mo |
| Hosting | Vercel Hobby | 100 GB bandwidth, 100k SSR, 1 GB image opt |
| ORM / query | `@supabase/supabase-js` v2 + typed Postgres views; **no** Prisma (extra build weight, free-tier-friendly to skip) |
| Validation | Zod (already present) |
| Tests | Vitest (already present) + Playwright for one smoke flow |
| CI | GitHub Actions (free for public repos) |

**Idle-pause mitigation:** Supabase pauses free projects after 7 days of zero traffic. A GitHub Actions cron (free) hits a `/api/health` endpoint daily — solved.

**Why not Cloudflare D1 + Pages instead:** D1 is SQLite, requires more wiring for auth, and we lose Supabase RLS. Worth revisiting if we outgrow the free tier; deliberately not adopted now to keep "one vendor, one dashboard" simple.

## 4. Data model (canonical)

```
profiles
  id          uuid pk references auth.users(id)
  username    citext unique
  display_name text
  avatar_url  text
  bio         text
  created_at  timestamptz

models
  id          text pk         -- 'claude-opus-4-7', 'gpt-5.5', ...
  vendor      text            -- 'anthropic', 'openai', 'google', 'meta', ...
  family      text            -- 'claude', 'gpt', 'gemini', 'llama'
  released_at date
  context_k   int             -- 1000 == 1M tokens
  visible     boolean         -- soft-hide deprecated entries

benchmark_categories
  id          text pk         -- 'coding', 'reasoning', ...
  label       text

benchmark_tasks                 -- canonical reproducible tasks
  id          uuid pk
  slug        text unique
  title       text
  category    text references benchmark_categories(id)
  body_md     text             -- prompt template (markdown)
  rubric_md   text             -- "what to look for"
  author_id   uuid references profiles(id)
  visibility  text             -- 'public' | 'unlisted'
  created_at  timestamptz
  updated_at  timestamptz

benchmark_runs                  -- one user's run of one task on one model
  id          uuid pk
  task_id     uuid references benchmark_tasks(id)
  model_id    text references models(id)
  author_id   uuid references profiles(id)
  score       numeric          -- 0..100, or task-defined unit
  unit        text             -- '%', 'pass/fail', 'tok/s', ...
  evidence_kind text            -- 'url' | 'screenshot' | 'transcript'
  evidence_url text             -- public share link OR storage path
  notes_md    text
  created_at  timestamptz
  -- moderation fields:
  status      text              -- 'live' | 'flagged' | 'removed'

votes
  user_id     uuid references profiles(id)
  run_id      uuid references benchmark_runs(id)
  value       smallint         -- -1 | +1
  primary key (user_id, run_id)

comments
  id          uuid pk
  run_id      uuid references benchmark_runs(id)
  author_id   uuid references profiles(id)
  body_md     text
  created_at  timestamptz
```

**Row-level security:**

- `profiles`: own row writable by owner; everyone reads.
- `benchmark_tasks`: author writable; everyone reads public; unlisted readable only via slug.
- `benchmark_runs`: author writable; everyone reads `status='live'`. Soft-delete only.
- `votes`, `comments`: author writable; everyone reads.

## 5. Phases

Each phase is its own spec + plan + merge checkpoint.

| Phase | Spec file | Outcome |
|---|---|---|
| 1. Foundation + auth | `2026-04-25-phase-1-foundation-auth.md` | Supabase wired, schema migrated, sign-up / sign-in / sign-out, profile page |
| 2. Tasks & runs CRUD | `2026-04-25-phase-2-tasks-runs.md` | Authenticated users post tasks and submit runs; list views |
| 3. Discovery + voting | `2026-04-25-phase-3-discovery-voting.md` | Leaderboard, filtering, voting, comments |
| 4. Visual rebuild | `2026-04-25-phase-4-visual-rebuild.md` | New design language; current "AI-slurp" aesthetic replaced |
| 5. Motion polish | `2026-04-25-phase-5-motion.md` | Considered animation across the platform |

Phase 1 spec is written next. Subsequent phases get specs written when their predecessor is in code review.

## 6. Visual direction (Phase 4 preview)

What reads as "AI default" today and will be replaced:

- Warm paper palette + serif display + hairline rules — every AI tool ships this.
- 9xl Fraunces numerals — too "premium magazine".
- Centered editorial layout with kicker paragraph.
- Lucide outline icons everywhere.
- Subtle hover-only motion.

Direction we'll explore in Phase 4: **technical / utilitarian / dense.** Think: trading terminal × academic preprint × old-school sports stat board. Specific moves:

- **Type system flip:** drop the serif display. Single grotesque (e.g., `Inter`, `Geist`, or `IBM Plex Sans`) for everything except a strict mono (`Berkeley Mono` / `JetBrains Mono`) for numbers, IDs, code, timestamps.
- **Numbers are the design.** Big tabular figures, baselines aligned, deltas in colored mono — Bloomberg-style.
- **Density.** Show more per screen. Fewer hero sections, more leaderboard rows visible at once.
- **Color:** drop the warm-paper-orange-teal cliché. One restrained accent, plus model-vendor swatches that aren't cliché brand colors.
- **Iconography:** replace lucide outlines with bespoke glyphs OR a sharper set (e.g., `radix-icons`, `phosphor-fill`) — break the pattern.
- **Motion:** spec'd in Phase 5; will not be the current "fade-in on load + ticker tape" defaults.

Phase 4 will produce 2–3 concrete style mocks before code, then implement.

## 7. Definition of done — overall platform

- Anonymous user can browse all public tasks, runs, leaderboards.
- Authenticated user can: edit profile, create tasks, submit runs, vote, comment, soft-delete own content.
- Admin (one bootstrap account) can flag/remove content.
- All forms validated with Zod on both client and server (server action).
- All DB access via RLS — no service-role key in client bundles.
- TypeScript strict, no `any`, lint clean, Vitest + Playwright smoke green.
- Lighthouse mobile ≥ 90 across home, leaderboard, task detail.
- Idle-ping cron live so DB never auto-pauses.
- Visual identity demonstrably distinct from the pre-rebuild static site.

## 8. Risks + mitigations

| Risk | Mitigation |
|---|---|
| Spam / abuse from open signup | Email verification on; per-user rate limits via Supabase row counts; admin flag/remove |
| Free tier exhaustion (storage egress) | Cap evidence uploads at 2 MB; prefer external URLs (chat share links) over screenshots |
| Supabase project pause on inactivity | GH Actions daily ping cron |
| Vercel function exhaustion | All listing pages SSG/ISR where possible; only mutations hit functions |
| User loses auth migration | Supabase Auth users live in `auth.users`; `profiles` mirrors. Export script kept in `scripts/` |
| Visual rebuild churn | Phase 4 is gated by 2–3 concrete mocks + user sign-off; not free-form |

## 9. Open items (non-blocking)

- Domain. Default to Vercel-issued `*.vercel.app` until user picks one.
- Admin bootstrap: first user with email matching `lib/config/admin.ts` allowlist gets admin role on insert.
- i18n: Phase 1 ships English-only chrome; Vietnamese strings re-introduced in Phase 4.
- Email branding: keep Supabase default templates in Phase 1; customize in Phase 4.
