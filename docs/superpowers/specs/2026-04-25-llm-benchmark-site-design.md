# LLM Benchmark Site — Claude Opus 4.7 vs GPT-5.5

**Date:** 2026-04-25
**Status:** Draft for review
**Author:** Pair-design with Claude

## 1. Goal

Public single-page-app benchmark dashboard comparing Anthropic **Claude Opus 4.7** (released 2026-04-16) and OpenAI **GPT-5.5** "Spud" (released 2026-04-23). Every datapoint must be sourced from the vendor model card, vendor release post, or a reputable third-party leaderboard with a citation.

User has no API account for either model. Site provides published benchmark numbers + curated reproducible prompts users can run themselves in free public playgrounds.

## 2. Non-goals

- No live API calls to either model.
- No scraping ChatGPT/Claude.ai web UI (ToS).
- No login, auth, DB, or backend mutation.
- No fabricated numbers. If a benchmark is reported by only one vendor, mark the other cell `n/a` with explanation.

## 3. Verified data sources

Confirmed via WebSearch + WebFetch on 2026-04-25:

| Source | URL | What |
|---|---|---|
| Anthropic news | anthropic.com/news/claude-opus-4-7 | Opus 4.7 release post |
| Anthropic API docs | platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7 | Specs, context, pricing |
| OpenAI release | openai.com/index/introducing-gpt-5-5/ | GPT-5.5 release post |
| OpenAI safety hub | deploymentsafety.openai.com/gpt-5-5 | System card |
| Vellum | vellum.ai/blog/claude-opus-4-7-benchmarks-explained | Side-by-side Opus 4.7 vs GPT-5.4 vs Opus 4.6 |
| MindwiredAI | mindwiredai.com/2026/04/24/gpt-5-5-is-here-... | GPT-5.5 vs Opus 4.7 side-by-side |
| Lushbinary | lushbinary.com/blog/gpt-5-5-vs-claude-opus-4-7-... | Side-by-side w/ pricing |
| Apiyi | help.apiyi.com/en/claude-opus-4-7-benchmark-review-2026-en.html | Opus 4.7 7-leaderboard view |

## 4. Confirmed numbers (initial dataset)

### Specs

| Spec | Opus 4.7 | GPT-5.5 |
|---|---|---|
| Release | 2026-04-16 | 2026-04-23 |
| Context window | 1M tokens | 1M tokens (API) |
| Max output | 128k | not stated |
| Input price ($/M tok) | $5.00 | $5.00 |
| Output price ($/M tok) | $25.00 | $30.00 |
| API ID | `claude-opus-4-7` | `gpt-5.5` |

### Benchmarks (% unless noted)

| Benchmark | Opus 4.7 | GPT-5.5 | Source |
|---|---|---|---|
| SWE-bench Verified | 87.6 | ~85† | Vellum / Lushbinary |
| SWE-bench Pro | 64.3 | 58.6 | Vellum, MindwiredAI |
| SWE-bench Multilingual | 80.5 | n/a | Apiyi |
| Terminal-Bench 2.0 | 69.4 | 82.7 | Vellum, MindwiredAI |
| OSWorld-Verified | 78.0 | 78.7 | Vellum, MindwiredAI |
| MCP-Atlas | 77.3 | 75.3 | Vellum, MindwiredAI |
| BrowseComp | 79.3 | 84.4 | Vellum, MindwiredAI |
| GPQA Diamond | 94.2 | 93.6 | Vellum, MindwiredAI |
| MMMLU (multilingual) | 91.5 | 83.2 | Vellum, MindwiredAI |
| HLE (no tools) | 46.9 | 41.4 | MindwiredAI |
| HLE (with tools) | 54.7 | n/a | Vellum |
| Finance Agent v1.1 | 64.4 | 61.5 | Vellum, MindwiredAI |
| CharXiv (no tools) | 82.1 | n/a | Vellum |
| CyberGym | 73.1 | 81.8 | MindwiredAI |
| GDPval | n/a | 84.9 | OpenAI |
| Tau2-bench Telecom | n/a | 98.0 | OpenAI |
| OfficeQA Pro | n/a | 54.1 | OpenAI |
| FinanceAgent | n/a | 60.0 | OpenAI |
| Cyber Range pass rate | n/a | 93.33 | OpenAI safety hub |

† Reported approximately by third party; flagged in UI.

Numbers stored in `lib/data/benchmarks.ts`, validated at build time via Zod schema. Each row carries `{ id, label, opus, gpt, source, date, note }`. UI surfaces source + date on hover/click.

## 5. Architecture

### Stack

- Next.js 15 (App Router, RSC, Turbopack)
- React 19
- TypeScript strict (`"strict": true`, `"noUncheckedIndexedAccess": true`)
- Tailwind v4
- shadcn/ui (button, table, tabs, badge, separator, tooltip, dialog, sheet, scroll-area, card)
- Zod (data validation)
- Bun (per global rules — install, run, test)
- No DB, no auth, no env secrets at runtime
- Static export-friendly (`output: "export"` optional later)

### Routes (App Router)

```
app/
  layout.tsx                 # global shell, fonts, theme
  page.tsx                   # / — hero, headline summary, top 5 benchmarks
  benchmarks/page.tsx        # /benchmarks — full sortable filterable table
  test-yourself/page.tsx     # /test-yourself — prompt library + free-playground links
  methodology/page.tsx       # /methodology — sources, dates, caveats
  not-found.tsx
```

No dynamic routes. No params. All static.

### Component map

```
components/
  benchmark/
    benchmark-table.tsx      # sortable table
    score-bar.tsx            # 2-tone horizontal bar (no gradient)
    score-cell.tsx           # number + delta + source popover
    category-filter.tsx      # segmented control
    summary-card.tsx         # "winner" card per category
    source-cite.tsx          # superscript ref → footer
  prompt/
    prompt-card.tsx          # code block + copy + open-in-X buttons
    playground-link.tsx      # outbound link w/ icon
  ui/                        # shadcn primitives
  layout/
    header.tsx               # nav, theme toggle
    footer.tsx               # citations, last-updated
lib/
  data/
    benchmarks.ts            # typed dataset (Zod-validated)
    prompts.ts               # curated test prompts
    playgrounds.ts           # outbound destinations
  utils/
    delta.ts                 # winner/loser calc
    fmt.ts                   # tabular figure formatting
```

### Data flow

1. `lib/data/benchmarks.ts` exports a frozen typed array. Zod schema asserts shape at module load (build-time error if invalid).
2. Server components import directly. No fetch, no client state for data.
3. Filtering/sorting on `/benchmarks` runs client-side via `"use client"` table component (small dataset, ~20 rows).
4. Theme toggle uses `next-themes` (client-side, localStorage).

## 6. Visual system (anti-AI-slop)

**Banned**: gradient meshes, glass cards, purple/blue duotone hero, blob backgrounds, emoji UI icons, centered hero with floating shapes, "✨ AI ✨" copy, generic Lottie loaders, neon accent on dark gray, default shadcn purple primary.

**Required**:

- **Type**: Inter Tight (UI), JetBrains Mono (numbers, code, IDs), Fraunces (display headlines only).
- **Color tokens** (Tailwind v4 `@theme`):
  - `--ink: #0A0A0A`
  - `--paper: #FAFAF7`
  - `--rule: #E5E2DA`
  - `--mute: #6B6863`
  - `--accent: #C2410C` (used only for: winner highlight, key delta, primary CTA)
  - Dark: `--paper: #0E0D0B`, `--ink: #F0EDE6`, accent unchanged
- **Tabular figures** everywhere: `font-feature-settings: "tnum" 1, "lnum" 1`.
- **Layout**: left-aligned editorial. 12-col grid, max content width 1200px, gutters generous (≥80px on desktop). No centered hero.
- **Rules**: hairline 1px `var(--rule)` separators, no card shadows except subtle 1px ring on dark mode.
- **Score bars**: 2-tone solid fills (Opus = ink, GPT = mute). No gradient, no animation on load (only on hover).
- **Motion**: only on user intent (hover, click). No autoplay, no parallax, no scroll-jacking.
- **Iconography**: Lucide outline only, 1.5px stroke. No filled colorful icons.
- **Citations**: superscript number → footer reference list (academic style).

Inspiration anchors: Stripe Press, Linear changelog, Pudding visual essays, FT Alphaville, vendor model cards.

## 7. `/test-yourself` (the "real test, no account" feature)

10 curated hard prompts across categories. Each card:

- Title + category tag
- Difficulty badge
- Prompt body in mono code block, with `Copy` button
- Row of outbound buttons: **LMArena** (battle mode), **duck.ai** (Claude+GPT, no account), **claude.ai** (free tier), **chatgpt.com** (free tier), **copilot.microsoft.com** (GPT-5.5 free via MS).
- Per-prompt notes: what to look for, common failure modes.

User flow: click `Copy`, click playground button (opens new tab), paste, observe both models. No data sent through our site. Pure facilitator.

Categories (representative, not exhaustive):
1. Long-context retrieval (1M-token stress)
2. Codebase refactor (multi-file diff)
3. Math reasoning (AIME-style)
4. Agentic tool-use simulation
5. Vision OCR (high-res chart)
6. Multilingual reasoning (VI/EN/ZH mix)
7. Adversarial logic puzzle
8. Long-horizon planning
9. Creative writing constraint
10. Code debug under-spec

Prompts written to be:
- Hard enough to differentiate
- Short enough to paste
- Free of copyrighted material
- Reproducible (deterministic-ish judging criteria in the "what to look for" section)

## 8. Methodology page

Plain-language explanation:
- Where each number came from (linked).
- When captured (`lastUpdated` constant, displayed in footer).
- Caveats: prompting differences across vendors, contamination risk, self-reported vs third-party harness.
- Note that user-side prompts in `/test-yourself` are anecdotal, not statistically valid.
- Refresh policy: dataset re-checked when a new model card drops; site bumps `lastUpdated`.

## 9. Quality bar

- TypeScript strict, no `any`.
- Lighthouse mobile ≥95 across all categories.
- All interactive elements keyboard-reachable, visible focus rings.
- WCAG AA contrast on both themes.
- No client-side fonts blocking; `font-display: swap`.
- Bundle: target <120KB gzip JS for `/`.
- No tracking, no third-party scripts (no GA, no Vercel Analytics unless user adds).

## 10. Out of scope (explicit)

- Auth, comments, voting.
- Server-side analytics.
- Comparing more than 2 models.
- Localization beyond a single language. (Default: English UI; copy may include Vietnamese where author preference indicates. To confirm with user.)
- Embedding LMArena directly via iframe (their CSP blocks it; we link out instead).
- Live model invocation of any kind.

## 11. Open questions for user

1. UI language: English-only, Vietnamese-only, or bilingual toggle?
2. Should `/test-yourself` show example outputs from each model (paraphrased, with citation), or strictly user-runs-it-themselves?
3. Deploy target: Vercel, Cloudflare Pages, GitHub Pages, none (local only)?
4. Brand mark/logo or pure typographic wordmark?
5. Add LMArena Elo card on home if a recent leaderboard snapshot can be cited?

## 12. Definition of done

- All routes render w/ real, cited data.
- Every benchmark cell links to its source.
- `pnpm build` / `bun run build` succeeds, type-check clean, lint clean.
- Lighthouse ≥95 mobile.
- Manual smoke test: copy button works, all outbound links open in new tab w/ `rel="noopener"`.
- README documents data-update workflow.
