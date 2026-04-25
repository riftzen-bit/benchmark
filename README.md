# Opus 4.7 vs GPT-5.5 — Benchmark site

Local-only Next.js 15 site comparing Anthropic Claude Opus 4.7 and OpenAI GPT-5.5
using only published, cited numbers.

## Stack

- Next.js 15 (App Router)
- React 19, TypeScript strict
- Tailwind v4 + shadcn/ui
- Zod for build-time data validation
- Bun runtime (npm fallback supported)
- Vitest for utils + schema tests

## Run

```bash
bun install
bun run dev        # http://localhost:3000
bun run typecheck
bun run lint
bun run build
bun run test
```

## Structure

- `app/` — routes (App Router)
- `components/benchmark/` — table + score primitives
- `components/prompt/` — test-yourself prompt cards
- `components/layout/` — header, footer, theme
- `lib/data/` — typed datasets (benchmarks, prompts, sources, playgrounds, meta)
- `lib/schema/` — Zod schemas
- `lib/utils/` — winner / delta / formatting

## Updating data

1. Edit `lib/data/benchmarks.ts` — every row must reference a `sourceId` that
   exists in `lib/data/sources.ts`.
2. Bump `lastUpdated` in `lib/data/meta.ts`.
3. `bun run test` validates schemas; `bun run build` rejects malformed data.

## What this site does NOT do

- It does not call Claude or GPT APIs.
- It does not scrape vendor web UIs.
- It does not store any of your prompts (everything is client-side copy).
- It does not require an account from you.

The "Tự thử" page only links you out to free public playgrounds where the two
models are reachable (LMArena Battle, Duck.ai) or accessible via free vendor tiers.
