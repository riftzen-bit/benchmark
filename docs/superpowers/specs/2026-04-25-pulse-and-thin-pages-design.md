# Pulse page + thin-page fills, design

Date: 2026-04-25
Scope: Add a live multi-model comparison page (`/pulse`) and fill the
visually-thin pages (`/tasks/new`, `/tasks`, `/tasks/[slug]`) with
useful structure. No marketing copy, no AI-slop prose.

## Goals

1. Density without word-count. Use stat strips, chips, and tables, not
   paragraphs.
2. Live data from free public APIs that need no auth, with fail-soft
   fallbacks so an outage cannot break the page.
3. Zero regressions on already-populated pages
   (`/`, `/compare`, `/benchmarks`, `/leaderboard`, `/models`, `/vendors`,
   `/test-yourself`, `/methodology`, `/profile`).

## Non-goals

- Replacing the existing static `/compare` (Opus 4.7 vs GPT-5.5).
- Adding any paid or keyed external API.
- Server-side scraping. Only public JSON endpoints.

---

## 1. New page: `/pulse`

### Data sources (free, no key)

| Source | Endpoint | Provides | TTL |
|---|---|---|---|
| HuggingFace Hub | `https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=50&filter=text-generation` | trending open-weights, downloads, likes, lastModified | 1800s |
| OpenRouter | `https://openrouter.ai/api/v1/models` | id, name, context_length, pricing.prompt, pricing.completion, modality | 3600s |

Both endpoints already permit anonymous GET. HF endpoint already used
in `lib/data/external/huggingface.ts`. Copy that pattern.

### Files

- `lib/data/external/openrouter.ts` (new):
  - Zod schema for the OpenRouter `/models` response.
  - `fetchOpenRouterModels({ limit, signal })` returning
    `ReadonlyArray<OpenRouterModel>`.
  - Hard-coded fallback list of ~12 frozen entries (current frontier
    set: Opus 4.7, GPT-5.5, Gemini 3 Pro, Llama 4 405B, DeepSeek V3.5,
    Qwen3-Next-80B, Mistral Large 3, Grok 4, Command R+, Phi-4, etc).
  - 4500ms `AbortController` timeout. `next: { revalidate: 3600 }`.
  - Returns fallback on any error or zero parsed rows.

- `lib/data/external/pulse.ts` (new):
  - `loadPulseSnapshot()` runs both fetches in parallel.
  - Returns `{ models, hf, updatedAt, sources: { hf: 'live'|'fallback', or: 'live'|'fallback' } }`.
  - `PulseModel` shape:
    ```ts
    {
      id: string;        // openrouter slug, e.g. "anthropic/claude-opus-4-7"
      vendor: string;    // first slash segment
      family: string;    // last slash segment, normalized
      contextK: number | null;
      promptUSDPerMtok: number | null;
      completionUSDPerMtok: number | null;
      modality: 'text' | 'multimodal';
      lastSeen: string;  // ISO date
    }
    ```
  - Vendor extraction: lowercase first path segment, mapped via
    existing `vendorLabel()` where possible, falls through to raw.

- `app/pulse/page.tsx` (new), server component:
  - `export const revalidate = 1800` (page-level fallback).
  - Calls `loadPulseSnapshot()`.
  - Layout, top to bottom:
    1. **Header**: `Eyebrow: "Live pulse, issue 04.25"`. Display H1
       (one line, max 9 words).
    2. **Status strip** (4 stats, one row of `<Stat>`):
       `Models tracked` / `Vendors` / `Cheapest input $/Mtok` /
       `Largest context`.
       Each stat shows source freshness (`live` / `cached`) under it.
    3. **Filter row** (client): vendor select, modality
       toggle (all/text/multimodal), price-tier chips
       (free / under $1 / under $5 / under $20 / over $20), context
       chips (>=32k / >=128k / >=1M). Filters URL-state via search
       params so reload preserves view.
    4. **Comparison table**: `Model · Vendor · Context · In $/Mtok ·
       Out $/Mtok · Modality · Updated`. Sortable by header click.
       `tabular-nums`. Empty cells render as a dash glyph.
    5. **Right rail (hidden < md)**: `Trending on HF`, reuses
       `<TrendingModels>` with `models={hf}` slice 6.
    6. **Footer note**: source URLs + last-updated timestamp,
       methodology link.

- `components/pulse/pulse-stats.tsx` (server): renders the 4-stat row.
- `components/pulse/pulse-table.tsx` (client): table + sort + chip
  filters. URL-state via `useSearchParams` + `router.replace`.
- `components/pulse/pulse-filters.tsx` (client): chip group.
- `lib/config/site.ts`: add `{ href: "/pulse", label: "Pulse" }` to
  `NAV` between `Compare` and `Tape`. Add to `NAV_PRIMARY_HREFS`.

### Resilience contract

- Page must render in under 5s even if both APIs are down.
- Both fetchers wrap in `try/catch` and return fallback on any throw.
- Zod `safeParse` per row. Bad rows dropped, not fatal.
- No environment variable required. Works on a fresh clone with zero
  secrets.
- Source-status badge (`live` vs `cached`) visible so the page does
  not lie about freshness.

### Tests

- `lib/data/external/openrouter.test.ts`:
  - Parses a frozen sample response.
  - Returns fallback when `fetch` rejects.
  - Returns fallback when response is non-array JSON.
  - Returns fallback when every row fails Zod.
- `lib/data/external/pulse.test.ts`:
  - Merges both sources.
  - Sets `sources.or = 'fallback'` when OR throws.
  - Sets `sources.hf = 'fallback'` when HF throws.

---

## 2. Fills for thin pages

### `/tasks/new`, sidebar layout

- Change `Container width="narrow"` to `width="wide"`.
- Two-column grid: `md:grid-cols-[1.4fr_1fr]`.
- Left column: existing `<NewTaskForm>` (no field changes).
- Right column, three small cards (border, p-5, mono captions):
  1. **Slug rules**: 4 bullets, lowercase, dash-separated, 3 to 64 chars,
     unique. (10pt mono.)
  2. **Rubric tips**: 3 bullets, what counts as evidence, why a
     rubric matters, link to an example task.
  3. **Recently posted**: top 3 from `listPublicTasks({ limit: 3 })`
     for inspiration, each linked.

No new server actions. No copy beyond bullet text.

### `/tasks`, populated empty state

- Header gains a 3-stat row (`<Stat>` reused from leaderboard):
  `Tasks` / `Categories` / `Public`. All zero is fine.
- Below header: category filter chips (links to `?category=...`),
  reading from `listCategories()`. Active chip from `searchParams`.
- When `tasks.length === 0`:
  - Keep "No tasks yet. Be the first." line.
  - Below it: 3 ghost rows with title + `Use as template` link
    that deep-links to `/tasks/new?slug=long-context-needle&...`.
  - Templates hardcoded in `lib/data/task-templates.ts` (new),
    just `{ slug, title, category, body, rubric }`.
- `/tasks/new` reads `slug`, `title`, `category` from `searchParams`
  and prefills the `defaultValue` of each input.

### `/tasks/[slug]`, empty-runs sidecar

- When `runs.length === 0`, replace the single-line "No runs yet."
  with:
  - One-line eyebrow: `How to submit`.
  - 3 numbered short steps (pick model, paste output, score).
  - One link to `/test-yourself` for picking a playground.
- No additional state, no server work.

---

## 3. Resilience checklist (applies everywhere)

- All external fetches: `AbortController` 4500ms timeout, Zod parse,
  fallback array, `next: { revalidate: N }` not `cache: 'no-store'`.
- All page-level data uses
  `Promise.all([...].map(p => p.catch(() => fallback)))` so a single
  source cannot break the page.
- `dynamic = 'force-dynamic'` only where session is read. `/pulse`
  uses ISR-style `revalidate` because it has no per-user data.

## 4. Verification

Before claim done:

- `bun run typecheck`, 0 errors.
- `bun run lint`, 0 errors.
- `bun run test`, all pass.
- `bun run build`, success.
- `bun run dev`, manually open `/pulse`, `/tasks/new`, `/tasks`
  (logged in + logged out), `/tasks/[slug]` (with 0 runs).
- Disable network, reload `/pulse`. Page must still render the
  fallback table with `cached` badges.

## 5. Out-of-scope (do not touch)

- `/compare` page logic.
- `/benchmarks`, `/leaderboard`, `/models`, `/vendors`,
  `/methodology`, `/test-yourself`, `/profile`, `/`.
- Auth flows.
- Supabase migrations.
- Visual rebuild (Phase 4).
