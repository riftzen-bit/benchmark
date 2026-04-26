# External Leaderboards + Page Fills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire three real public leaderboard feeds (LMSYS Arena, HF Open LLM Leaderboard v2, LiveBench) into `/leaderboard`, expand `/compare` and `/benchmarks` to surface external scores, and add a live-ranks widget to the home page. All external data refreshes via Next.js ISR (30 min) with hardcoded fallbacks for offline / API-down cases.

**Architecture:**
- Each external source = own `lib/data/external/<source>.ts` fetcher: Zod-validated, AbortController timeout, hardcoded fallback list — exactly mirrors `openrouter.ts` / `huggingface.ts`.
- One aggregator `lib/data/external/leaderboards.ts` returns a `LeaderboardSnapshot` via `Promise.allSettled` (mirrors `pulse.ts`).
- `/leaderboard` page becomes a tabbed view: Arena · Open LLM · LiveBench · Community. Tab state in URL (`?board=arena`).
- A new `<RelativeTime>` client component shows "fetched X min ago" and updates every 10s — that gives the perceived "live" feel without any actual client polling.
- `/compare` gets a multi-model picker (URL-state, 2–6 models) replacing the hardcoded Opus-vs-GPT layout.
- `/benchmarks` gains an "External scores" panel above the in-house table.
- Home gets a `LiveRanks` widget showing top-3 per external board.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Zod 4, Vitest, Tailwind v4. ISR via `export const revalidate = 1800`. No new dependencies.

---

## File Structure

**New files:**
- `apps/web/lib/data/external/lmarena.ts` — LMSYS Arena fetcher
- `apps/web/lib/data/external/open-llm.ts` — HF Open LLM Leaderboard v2 fetcher
- `apps/web/lib/data/external/livebench.ts` — LiveBench CSV fetcher
- `apps/web/lib/data/external/leaderboards.ts` — Aggregator + snapshot
- `apps/web/components/shared/relative-time.tsx` — Client ticker, updates every 10s
- `apps/web/components/leaderboard/board-tabs.tsx` — URL-state tabs
- `apps/web/components/leaderboard/external-board.tsx` — Sortable table for external boards
- `apps/web/components/leaderboard/community-board.tsx` — Existing community table extracted
- `apps/web/components/compare/compare-picker.tsx` — Client multi-model picker
- `apps/web/components/benchmarks/external-scores-panel.tsx` — Cross-source scores by family
- `apps/web/components/home/live-ranks.tsx` — Top-3 per board widget
- `apps/web/tests/data/external/lmarena.test.ts`
- `apps/web/tests/data/external/open-llm.test.ts`
- `apps/web/tests/data/external/livebench.test.ts`
- `apps/web/tests/data/external/leaderboards.test.ts`

**Modified files:**
- `apps/web/app/leaderboard/page.tsx` — Tabbed layout
- `apps/web/app/compare/page.tsx` — Use multi-model picker output
- `apps/web/app/benchmarks/page.tsx` — Add `<ExternalScoresPanel>`
- `apps/web/app/page.tsx` — Add `<LiveRanks>` section + load aggregate snapshot

---

## Task 1: LMSYS Arena fetcher

**Files:**
- Create: `apps/web/lib/data/external/lmarena.ts`
- Test: `apps/web/tests/data/external/lmarena.test.ts`

**Context:** HF Datasets Server exposes any HF dataset as paginated JSON via `https://datasets-server.huggingface.co/rows?dataset=<owner%2Fname>&config=default&split=train&offset=0&length=100`. The LMSYS Arena leaderboard lives at `lmarena-ai/chatbot-arena-leaderboard`. Each row has columns like `Model`, `Arena Score`, `95% CI`, `Votes`, `Organization`, `License`. Column casing/spacing varies — use a tolerant Zod schema that pulls a `Record<string, unknown>` and narrows.

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/tests/data/external/lmarena.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLmArenaLeaderboard, LMARENA_FALLBACK } from "@/lib/data/external/lmarena";

describe("fetchLmArenaLeaderboard", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the curated fallback when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const out = await fetchLmArenaLeaderboard({ limit: 5 });
    expect(out.length).toBe(5);
    expect(out[0]?.model).toBe(LMARENA_FALLBACK[0]?.model);
  });

  it("parses well-formed rows and normalizes column names", async () => {
    const sample = {
      rows: [
        {
          row_idx: 0,
          row: {
            "Model": "claude-opus-4-7",
            "Arena Score": 1455,
            "95% CI": "+4/-5",
            "Votes": 18234,
            "Organization": "Anthropic",
            "License": "Proprietary",
          },
        },
        {
          row_idx: 1,
          row: {
            "Model": "gpt-5.5",
            "Arena Score": 1438,
            "95% CI": "+3/-4",
            "Votes": 21500,
            "Organization": "OpenAI",
            "License": "Proprietary",
          },
        },
      ],
    };
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => sample } as Response),
    ));
    const out = await fetchLmArenaLeaderboard({ limit: 5 });
    expect(out.length).toBe(2);
    expect(out[0]).toMatchObject({
      rank: 1,
      model: "claude-opus-4-7",
      score: 1455,
      ciLabel: "+4/-5",
      votes: 18234,
      organization: "Anthropic",
    });
    expect(out[1]?.rank).toBe(2);
  });

  it("falls back when the response is not rows-shaped", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({ error: "x" }) } as Response),
    ));
    const out = await fetchLmArenaLeaderboard({ limit: 3 });
    expect(out[0]?.model).toBe(LMARENA_FALLBACK[0]?.model);
  });

  it("falls back on non-ok status", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false, status: 503, json: async () => ({}) } as Response),
    ));
    const out = await fetchLmArenaLeaderboard({ limit: 2 });
    expect(out.length).toBe(2);
    expect(out[0]?.model).toBe(LMARENA_FALLBACK[0]?.model);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun --filter @benchmark/web test -- lmarena`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// apps/web/lib/data/external/lmarena.ts
import { z } from "zod";

const RowSchema = z.object({
  row_idx: z.number().optional(),
  row: z.record(z.string(), z.unknown()),
});

const ResponseSchema = z.object({ rows: z.array(z.unknown()) });

export interface LmArenaEntry {
  rank: number;
  model: string;
  score: number;
  ciLabel: string | null;
  votes: number;
  organization: string;
  license: string | null;
}

const FALLBACK: ReadonlyArray<LmArenaEntry> = Object.freeze([
  fb(1, "claude-opus-4-7", 1462, "+4/-5", 28800, "Anthropic", "Proprietary"),
  fb(2, "gpt-5.5", 1448, "+3/-4", 41200, "OpenAI", "Proprietary"),
  fb(3, "gemini-3-pro", 1431, "+4/-4", 35100, "Google", "Proprietary"),
  fb(4, "claude-opus-4-5", 1419, "+5/-5", 22600, "Anthropic", "Proprietary"),
  fb(5, "deepseek-v4-pro", 1404, "+4/-5", 18400, "DeepSeek", "Custom"),
  fb(6, "gpt-5.5-pro", 1398, "+5/-6", 12300, "OpenAI", "Proprietary"),
  fb(7, "qwen3-next-80b", 1382, "+5/-5", 11050, "Alibaba", "Apache-2.0"),
  fb(8, "llama-4-405b-instruct", 1371, "+5/-6", 9800, "Meta", "Llama-4"),
  fb(9, "mistral-large-2503", 1356, "+6/-7", 7200, "Mistral", "Mistral-AI"),
  fb(10, "grok-4", 1347, "+6/-7", 6500, "xAI", "Proprietary"),
]);

function fb(
  rank: number,
  model: string,
  score: number,
  ci: string,
  votes: number,
  org: string,
  license: string,
): LmArenaEntry {
  return { rank, model, score, ciLabel: ci, votes, organization: org, license };
}

interface FetchOpts {
  limit?: number;
  signal?: AbortSignal;
}

const ENDPOINT =
  "https://datasets-server.huggingface.co/rows?dataset=lmarena-ai%2Fchatbot-arena-leaderboard&config=default&split=train&offset=0&length=200";

export async function fetchLmArenaLeaderboard(
  opts: FetchOpts = {},
): Promise<ReadonlyArray<LmArenaEntry>> {
  const limit = Math.max(1, Math.min(200, opts.limit ?? 50));
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 4500);
    const res = await fetch(ENDPOINT, {
      signal: opts.signal ?? ac.signal,
      headers: { accept: "application/json" },
      next: { revalidate: 1800 },
    });
    clearTimeout(t);
    if (!res.ok) return FALLBACK.slice(0, limit);
    const json = (await res.json()) as unknown;
    const wrapper = ResponseSchema.safeParse(json);
    if (!wrapper.success) return FALLBACK.slice(0, limit);
    const out: LmArenaEntry[] = [];
    let i = 0;
    for (const raw of wrapper.data.rows) {
      const parsed = RowSchema.safeParse(raw);
      if (!parsed.success) continue;
      const entry = toEntry(parsed.data.row, i + 1);
      if (entry) {
        out.push(entry);
        i++;
      }
    }
    if (out.length === 0) return FALLBACK.slice(0, limit);
    return Object.freeze(out.slice(0, limit));
  } catch {
    return FALLBACK.slice(0, limit);
  }
}

function toEntry(row: Record<string, unknown>, rank: number): LmArenaEntry | null {
  const model = pickStr(row, ["Model", "model"]);
  const score = pickNum(row, ["Arena Score", "arena_score", "Score", "elo"]);
  if (!model || score === null) return null;
  return {
    rank,
    model,
    score,
    ciLabel: pickStr(row, ["95% CI", "CI", "ci"]),
    votes: pickNum(row, ["Votes", "votes"]) ?? 0,
    organization: pickStr(row, ["Organization", "organization", "Org"]) ?? "",
    license: pickStr(row, ["License", "license"]),
  };
}

function pickStr(row: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

function pickNum(row: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export const LMARENA_FALLBACK = FALLBACK;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun --filter @benchmark/web test -- lmarena`
Expected: 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/data/external/lmarena.ts apps/web/tests/data/external/lmarena.test.ts
git commit -m "feat(leaderboard): lmsys arena fetcher with fallback"
```

---

## Task 2: HF Open LLM Leaderboard v2 fetcher

**Files:**
- Create: `apps/web/lib/data/external/open-llm.ts`
- Test: `apps/web/tests/data/external/open-llm.test.ts`

**Context:** Open LLM Leaderboard v2 lives at HF dataset `open-llm-leaderboard/contents`. Columns include `fullname` (model id), `Average ⬆️`, `IFEval`, `BBH`, `MATH Lvl 5`, `GPQA`, `MUSR`, `MMLU-PRO`. Same datasets-server endpoint pattern as Task 1. Same defensive parsing.

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/tests/data/external/open-llm.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOpenLlmLeaderboard, OPEN_LLM_FALLBACK } from "@/lib/data/external/open-llm";

describe("fetchOpenLlmLeaderboard", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the curated fallback when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const out = await fetchOpenLlmLeaderboard({ limit: 4 });
    expect(out.length).toBe(4);
    expect(out[0]?.model).toBe(OPEN_LLM_FALLBACK[0]?.model);
  });

  it("parses rows, normalizes column variations, and ranks by Average", async () => {
    const sample = {
      rows: [
        {
          row_idx: 0,
          row: {
            fullname: "meta-llama/Llama-4-405B-Instruct",
            "Average ⬆️": 64.8,
            "IFEval": 88.4,
            "BBH": 70.2,
            "MATH Lvl 5": 51.9,
            "GPQA": 39.5,
            "MUSR": 53.1,
            "MMLU-PRO": 65.6,
          },
        },
        {
          row_idx: 1,
          row: {
            fullname: "Qwen/Qwen3-Next-80B-A3B-Instruct",
            "Average ⬆️": 62.1,
            "IFEval": 85.0,
            "BBH": 68.5,
            "MATH Lvl 5": 49.7,
            "GPQA": 36.2,
            "MUSR": 50.8,
            "MMLU-PRO": 62.5,
          },
        },
      ],
    };
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => sample } as Response),
    ));
    const out = await fetchOpenLlmLeaderboard({ limit: 5 });
    expect(out.length).toBe(2);
    expect(out[0]).toMatchObject({
      rank: 1,
      model: "meta-llama/Llama-4-405B-Instruct",
      average: 64.8,
      scores: { ifeval: 88.4, bbh: 70.2, math: 51.9, gpqa: 39.5, musr: 53.1, mmluPro: 65.6 },
    });
  });

  it("falls back when no row carries a parseable Average", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ rows: [{ row_idx: 0, row: { fullname: "x", note: "skip" } }] }),
      } as Response),
    ));
    const out = await fetchOpenLlmLeaderboard({ limit: 3 });
    expect(out[0]?.model).toBe(OPEN_LLM_FALLBACK[0]?.model);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun --filter @benchmark/web test -- open-llm`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// apps/web/lib/data/external/open-llm.ts
import { z } from "zod";

const ResponseSchema = z.object({ rows: z.array(z.unknown()) });
const RowSchema = z.object({
  row_idx: z.number().optional(),
  row: z.record(z.string(), z.unknown()),
});

export interface OpenLlmEntry {
  rank: number;
  model: string;
  average: number;
  scores: {
    ifeval: number | null;
    bbh: number | null;
    math: number | null;
    gpqa: number | null;
    musr: number | null;
    mmluPro: number | null;
  };
}

const FALLBACK: ReadonlyArray<OpenLlmEntry> = Object.freeze([
  fb(1, "meta-llama/Llama-4-405B-Instruct", 64.8, 88.4, 70.2, 51.9, 39.5, 53.1, 65.6),
  fb(2, "Qwen/Qwen3-Next-80B-A3B-Instruct", 62.1, 85.0, 68.5, 49.7, 36.2, 50.8, 62.5),
  fb(3, "deepseek-ai/DeepSeek-V4-Pro", 61.4, 84.1, 67.9, 48.2, 35.4, 49.5, 63.2),
  fb(4, "mistralai/Mistral-Large-2503", 58.7, 80.6, 65.2, 44.8, 33.1, 47.9, 60.4),
  fb(5, "google/gemma-3-27b-it", 55.2, 76.8, 62.1, 41.7, 30.8, 44.6, 56.3),
  fb(6, "microsoft/Phi-4", 53.8, 75.4, 60.5, 40.1, 29.7, 43.2, 55.1),
  fb(7, "nvidia/Nemotron-Nano-9B-v2", 50.4, 72.1, 57.6, 36.5, 26.9, 39.8, 50.2),
  fb(8, "Qwen/Qwen3-Coder-30B-Instruct", 48.7, 70.0, 55.8, 34.9, 25.6, 38.3, 48.9),
]);

function fb(
  rank: number,
  model: string,
  avg: number,
  ifeval: number,
  bbh: number,
  math: number,
  gpqa: number,
  musr: number,
  mmluPro: number,
): OpenLlmEntry {
  return {
    rank,
    model,
    average: avg,
    scores: { ifeval, bbh, math, gpqa, musr, mmluPro },
  };
}

interface FetchOpts {
  limit?: number;
  signal?: AbortSignal;
}

const ENDPOINT =
  "https://datasets-server.huggingface.co/rows?dataset=open-llm-leaderboard%2Fcontents&config=default&split=train&offset=0&length=200";

export async function fetchOpenLlmLeaderboard(
  opts: FetchOpts = {},
): Promise<ReadonlyArray<OpenLlmEntry>> {
  const limit = Math.max(1, Math.min(200, opts.limit ?? 50));
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 4500);
    const res = await fetch(ENDPOINT, {
      signal: opts.signal ?? ac.signal,
      headers: { accept: "application/json" },
      next: { revalidate: 1800 },
    });
    clearTimeout(t);
    if (!res.ok) return FALLBACK.slice(0, limit);
    const json = (await res.json()) as unknown;
    const wrapper = ResponseSchema.safeParse(json);
    if (!wrapper.success) return FALLBACK.slice(0, limit);
    const out: OpenLlmEntry[] = [];
    for (const raw of wrapper.data.rows) {
      const parsed = RowSchema.safeParse(raw);
      if (!parsed.success) continue;
      const entry = toEntry(parsed.data.row);
      if (entry) out.push(entry);
    }
    if (out.length === 0) return FALLBACK.slice(0, limit);
    out.sort((a, b) => b.average - a.average);
    out.forEach((e, i) => {
      e.rank = i + 1;
    });
    return Object.freeze(out.slice(0, limit));
  } catch {
    return FALLBACK.slice(0, limit);
  }
}

function toEntry(row: Record<string, unknown>): OpenLlmEntry | null {
  const model = pickStr(row, ["fullname", "model", "Model"]);
  const average = pickNum(row, ["Average ⬆️", "Average", "average", "avg"]);
  if (!model || average === null) return null;
  return {
    rank: 0,
    model,
    average,
    scores: {
      ifeval: pickNum(row, ["IFEval", "ifeval"]),
      bbh: pickNum(row, ["BBH", "bbh"]),
      math: pickNum(row, ["MATH Lvl 5", "MATH", "math"]),
      gpqa: pickNum(row, ["GPQA", "gpqa"]),
      musr: pickNum(row, ["MUSR", "musr"]),
      mmluPro: pickNum(row, ["MMLU-PRO", "MMLU PRO", "mmlu_pro"]),
    },
  };
}

function pickStr(row: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

function pickNum(row: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export const OPEN_LLM_FALLBACK = FALLBACK;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun --filter @benchmark/web test -- open-llm`
Expected: 3 PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/data/external/open-llm.ts apps/web/tests/data/external/open-llm.test.ts
git commit -m "feat(leaderboard): hf open-llm v2 fetcher with fallback"
```

---

## Task 3: LiveBench fetcher (CSV)

**Files:**
- Create: `apps/web/lib/data/external/livebench.ts`
- Test: `apps/web/tests/data/external/livebench.test.ts`

**Context:** LiveBench publishes leaderboard CSV at `https://raw.githubusercontent.com/livebench/livebench/main/leaderboard_table.csv`. Columns: `model`, `Global Average`, `Coding Average`, `Mathematics Average`, `Data Analysis Average`, `Reasoning Average`, `Language Average`, `IF Average`. Parse a small CSV manually — no library needed.

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/tests/data/external/livebench.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLiveBench, LIVEBENCH_FALLBACK } from "@/lib/data/external/livebench";

describe("fetchLiveBench", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the curated fallback when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const out = await fetchLiveBench({ limit: 4 });
    expect(out.length).toBe(4);
    expect(out[0]?.model).toBe(LIVEBENCH_FALLBACK[0]?.model);
  });

  it("parses CSV with header + rows, sorts by Global Average", async () => {
    const csv = [
      "model,Global Average,Coding Average,Mathematics Average,Reasoning Average,Language Average,Data Analysis Average,IF Average",
      "claude-opus-4-7,72.4,68.5,75.1,80.2,69.8,71.4,73.6",
      "gpt-5.5,69.8,71.2,72.8,76.4,67.5,68.9,71.5",
      "gemini-3-pro,67.5,65.4,70.2,74.1,66.0,67.1,69.8",
    ].join("\n");
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, text: async () => csv } as Response),
    ));
    const out = await fetchLiveBench({ limit: 5 });
    expect(out.length).toBe(3);
    expect(out[0]).toMatchObject({
      rank: 1,
      model: "claude-opus-4-7",
      global: 72.4,
      coding: 68.5,
    });
    expect(out[2]?.model).toBe("gemini-3-pro");
  });

  it("falls back on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false, status: 404, text: async () => "" } as Response),
    ));
    const out = await fetchLiveBench({ limit: 2 });
    expect(out[0]?.model).toBe(LIVEBENCH_FALLBACK[0]?.model);
  });

  it("falls back when no parseable rows", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, text: async () => "garbage" } as Response),
    ));
    const out = await fetchLiveBench({ limit: 2 });
    expect(out[0]?.model).toBe(LIVEBENCH_FALLBACK[0]?.model);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun --filter @benchmark/web test -- livebench`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// apps/web/lib/data/external/livebench.ts
export interface LiveBenchEntry {
  rank: number;
  model: string;
  global: number;
  coding: number | null;
  math: number | null;
  reasoning: number | null;
  language: number | null;
  dataAnalysis: number | null;
  ifAvg: number | null;
}

const FALLBACK: ReadonlyArray<LiveBenchEntry> = Object.freeze([
  fb(1, "claude-opus-4-7", 73.1, 68.5, 75.1, 80.2, 69.8, 71.4, 73.6),
  fb(2, "gpt-5.5", 70.2, 71.2, 72.8, 76.4, 67.5, 68.9, 71.5),
  fb(3, "gemini-3-pro", 68.1, 65.4, 70.2, 74.1, 66.0, 67.1, 69.8),
  fb(4, "deepseek-v4-pro", 65.4, 69.1, 67.5, 71.8, 60.2, 64.3, 65.5),
  fb(5, "claude-opus-4-5", 64.2, 60.1, 66.4, 71.2, 63.5, 62.8, 64.8),
  fb(6, "qwen3-next-80b", 60.5, 58.7, 62.4, 65.9, 57.3, 58.1, 61.2),
  fb(7, "llama-4-405b", 58.4, 55.2, 60.1, 63.5, 56.8, 56.3, 59.4),
  fb(8, "mistral-large-2503", 55.7, 52.4, 57.0, 60.8, 53.6, 53.9, 56.5),
]);

function fb(
  rank: number,
  model: string,
  global: number,
  coding: number,
  math: number,
  reasoning: number,
  language: number,
  data: number,
  ifAvg: number,
): LiveBenchEntry {
  return {
    rank,
    model,
    global,
    coding,
    math,
    reasoning,
    language,
    dataAnalysis: data,
    ifAvg,
  };
}

interface FetchOpts {
  limit?: number;
  signal?: AbortSignal;
}

const ENDPOINT =
  "https://raw.githubusercontent.com/livebench/livebench/main/leaderboard_table.csv";

export async function fetchLiveBench(
  opts: FetchOpts = {},
): Promise<ReadonlyArray<LiveBenchEntry>> {
  const limit = Math.max(1, Math.min(200, opts.limit ?? 50));
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 4500);
    const res = await fetch(ENDPOINT, {
      signal: opts.signal ?? ac.signal,
      headers: { accept: "text/csv,text/plain" },
      next: { revalidate: 1800 },
    });
    clearTimeout(t);
    if (!res.ok) return FALLBACK.slice(0, limit);
    const text = await res.text();
    const parsed = parseCsv(text);
    if (parsed.length === 0) return FALLBACK.slice(0, limit);
    parsed.sort((a, b) => b.global - a.global);
    parsed.forEach((e, i) => {
      e.rank = i + 1;
    });
    return Object.freeze(parsed.slice(0, limit));
  } catch {
    return FALLBACK.slice(0, limit);
  }
}

function parseCsv(text: string): LiveBenchEntry[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = lines[0]!.split(",").map((s) => s.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name.toLowerCase());
  const iModel = idx("model");
  const iGlobal = idx("global average");
  if (iModel < 0 || iGlobal < 0) return [];
  const iCoding = idx("coding average");
  const iMath = idx("mathematics average");
  const iReason = idx("reasoning average");
  const iLang = idx("language average");
  const iData = idx("data analysis average");
  const iIf = idx("if average");
  const out: LiveBenchEntry[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cols = lines[r]!.split(",").map((s) => s.trim());
    const model = cols[iModel];
    const global = num(cols[iGlobal]);
    if (!model || global === null) continue;
    out.push({
      rank: 0,
      model,
      global,
      coding: iCoding >= 0 ? num(cols[iCoding]) : null,
      math: iMath >= 0 ? num(cols[iMath]) : null,
      reasoning: iReason >= 0 ? num(cols[iReason]) : null,
      language: iLang >= 0 ? num(cols[iLang]) : null,
      dataAnalysis: iData >= 0 ? num(cols[iData]) : null,
      ifAvg: iIf >= 0 ? num(cols[iIf]) : null,
    });
  }
  return out;
}

function num(s: string | undefined): number | null {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export const LIVEBENCH_FALLBACK = FALLBACK;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun --filter @benchmark/web test -- livebench`
Expected: 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/data/external/livebench.ts apps/web/tests/data/external/livebench.test.ts
git commit -m "feat(leaderboard): livebench csv fetcher with fallback"
```

---

## Task 4: Aggregator snapshot

**Files:**
- Create: `apps/web/lib/data/external/leaderboards.ts`
- Test: `apps/web/tests/data/external/leaderboards.test.ts`

**Context:** Mirrors `pulse.ts`. `Promise.allSettled` over the three fetchers; mark each source `live` or `fallback`; expose `updatedAt` ISO string.

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/tests/data/external/leaderboards.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadLeaderboardSnapshot } from "@/lib/data/external/leaderboards";
import * as lmarena from "@/lib/data/external/lmarena";
import * as openllm from "@/lib/data/external/open-llm";
import * as livebench from "@/lib/data/external/livebench";

describe("loadLeaderboardSnapshot", () => {
  afterEach(() => vi.restoreAllMocks());

  it("merges live results across all three sources", async () => {
    vi.spyOn(lmarena, "fetchLmArenaLeaderboard").mockResolvedValue([
      { rank: 1, model: "x", score: 1400, ciLabel: null, votes: 0, organization: "X", license: null },
    ] as never);
    vi.spyOn(openllm, "fetchOpenLlmLeaderboard").mockResolvedValue([
      { rank: 1, model: "y", average: 60, scores: { ifeval: null, bbh: null, math: null, gpqa: null, musr: null, mmluPro: null } },
    ] as never);
    vi.spyOn(livebench, "fetchLiveBench").mockResolvedValue([
      { rank: 1, model: "z", global: 70, coding: null, math: null, reasoning: null, language: null, dataAnalysis: null, ifAvg: null },
    ] as never);

    const snap = await loadLeaderboardSnapshot();
    expect(snap.arena.length).toBe(1);
    expect(snap.openLlm.length).toBe(1);
    expect(snap.liveBench.length).toBe(1);
    expect(snap.sources).toEqual({ arena: "live", openLlm: "live", liveBench: "live" });
    expect(snap.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("marks individual sources as fallback when their fetcher rejects", async () => {
    vi.spyOn(lmarena, "fetchLmArenaLeaderboard").mockRejectedValue(new Error("x"));
    vi.spyOn(openllm, "fetchOpenLlmLeaderboard").mockResolvedValue([
      { rank: 1, model: "y", average: 60, scores: { ifeval: null, bbh: null, math: null, gpqa: null, musr: null, mmluPro: null } },
    ] as never);
    vi.spyOn(livebench, "fetchLiveBench").mockRejectedValue(new Error("x"));

    const snap = await loadLeaderboardSnapshot();
    expect(snap.sources.arena).toBe("fallback");
    expect(snap.sources.openLlm).toBe("live");
    expect(snap.sources.liveBench).toBe("fallback");
    expect(snap.arena.length).toBeGreaterThan(0);
    expect(snap.liveBench.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun --filter @benchmark/web test -- leaderboards.test`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// apps/web/lib/data/external/leaderboards.ts
import { fetchLmArenaLeaderboard, LMARENA_FALLBACK, type LmArenaEntry } from "./lmarena";
import { fetchOpenLlmLeaderboard, OPEN_LLM_FALLBACK, type OpenLlmEntry } from "./open-llm";
import { fetchLiveBench, LIVEBENCH_FALLBACK, type LiveBenchEntry } from "./livebench";

export type SourceStatus = "live" | "fallback";

export interface LeaderboardSnapshot {
  arena: ReadonlyArray<LmArenaEntry>;
  openLlm: ReadonlyArray<OpenLlmEntry>;
  liveBench: ReadonlyArray<LiveBenchEntry>;
  updatedAt: string;
  sources: { arena: SourceStatus; openLlm: SourceStatus; liveBench: SourceStatus };
}

export async function loadLeaderboardSnapshot(): Promise<LeaderboardSnapshot> {
  const [arenaR, openLlmR, liveBenchR] = await Promise.allSettled([
    fetchLmArenaLeaderboard({ limit: 60 }),
    fetchOpenLlmLeaderboard({ limit: 60 }),
    fetchLiveBench({ limit: 60 }),
  ]);

  const arena = pick(arenaR, LMARENA_FALLBACK);
  const openLlm = pick(openLlmR, OPEN_LLM_FALLBACK);
  const liveBench = pick(liveBenchR, LIVEBENCH_FALLBACK);

  return {
    arena: arena.entries,
    openLlm: openLlm.entries,
    liveBench: liveBench.entries,
    updatedAt: new Date().toISOString(),
    sources: {
      arena: arena.status,
      openLlm: openLlm.status,
      liveBench: liveBench.status,
    },
  };
}

function pick<T>(
  r: PromiseSettledResult<ReadonlyArray<T>>,
  fallback: ReadonlyArray<T>,
): { entries: ReadonlyArray<T>; status: SourceStatus } {
  if (r.status === "fulfilled" && r.value.length > 0) {
    return { entries: r.value, status: "live" };
  }
  return { entries: fallback, status: "fallback" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun --filter @benchmark/web test -- leaderboards.test`
Expected: 2 PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/data/external/leaderboards.ts apps/web/tests/data/external/leaderboards.test.ts
git commit -m "feat(leaderboard): aggregate snapshot loader"
```

---

## Task 5: Relative-time client component

**Files:**
- Create: `apps/web/components/shared/relative-time.tsx`

**Context:** Display "fetched X min ago" / "X sec ago" and re-render every 10s. Keeps the perceived "live" feel without any client polling. Pure UI — no test required (covered visually).

- [ ] **Step 1: Write the implementation**

```tsx
// apps/web/components/shared/relative-time.tsx
"use client";
import { useEffect, useState } from "react";

interface Props {
  iso: string;
  className?: string;
}

export function RelativeTime({ iso, className }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return <span className={className}>—</span>;
  const diff = Math.max(0, Math.floor((now - t) / 1000));
  return (
    <time dateTime={iso} className={className}>
      {format(diff)}
    </time>
  );
}

function format(sec: number): string {
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} d ago`;
}
```

- [ ] **Step 2: Verify it builds**

Run: `bun --filter @benchmark/web build 2>&1 | tail -20`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/shared/relative-time.tsx
git commit -m "feat(shared): RelativeTime ticker that updates every 10s"
```

---

## Task 6: External board table component

**Files:**
- Create: `apps/web/components/leaderboard/external-board.tsx`

**Context:** One table component used by all three external tabs. Generic over a `BoardRow` shape: `{ rank, label, score, secondaryCols }`. Sortable on score column. Uses URL state via `?sort=&dir=` (mirrors `PulseTable`).

- [ ] **Step 1: Write the implementation**

```tsx
// apps/web/components/leaderboard/external-board.tsx
"use client";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface BoardRow {
  rank: number;
  label: string;
  modelId: string;
  primary: number;
  secondary: ReadonlyArray<{ key: string; label: string; value: number | string | null }>;
  meta?: string | null;
}

interface Props {
  rows: ReadonlyArray<BoardRow>;
  primaryLabel: string;
  primaryFormat?: (n: number) => string;
  basePath: string;
}

export function ExternalBoard({ rows, primaryLabel, primaryFormat, basePath }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const sort = sp.get("sort") ?? "primary";
  const dir = sp.get("dir") === "asc" ? "asc" : "desc";

  const sorted = useMemo(() => {
    const arr = rows.slice();
    arr.sort((a, b) => {
      const av = sort === "primary" ? a.primary : findSecondary(a, sort);
      const bv = sort === "primary" ? b.primary : findSecondary(b, sort);
      return compare(av, bv) * (dir === "asc" ? 1 : -1);
    });
    return arr;
  }, [rows, sort, dir]);

  const onSort = (key: string) => {
    const nextDir = sort === key ? (dir === "asc" ? "desc" : "asc") : "desc";
    const next = new URLSearchParams(sp.toString());
    next.set("sort", key);
    next.set("dir", nextDir);
    router.replace(`${basePath}?${next.toString()}`, { scroll: false });
  };

  const cols = sorted[0]?.secondary ?? [];
  const fmt = primaryFormat ?? ((n: number) => n.toFixed(1));

  return (
    <div className="overflow-x-auto border-y border-[var(--rule)]">
      <table className="tnum w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--rule)] text-left">
            <th className="mono py-2 pl-3 pr-4 text-xs uppercase tracking-widest text-[var(--mute)] w-12 text-right">
              #
            </th>
            <th className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
              Model
            </th>
            <th className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)] text-right">
              <button
                type="button"
                onClick={() => onSort("primary")}
                className={cn(
                  "inline-flex items-center gap-1 hover:text-[var(--foreground)]",
                  sort === "primary" && "text-[var(--foreground)]",
                )}
              >
                {primaryLabel}
                {sort === "primary" && <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>}
              </button>
            </th>
            {cols.map((c) => (
              <th
                key={c.key}
                className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)] text-right"
              >
                <button
                  type="button"
                  onClick={() => onSort(c.key)}
                  className={cn(
                    "inline-flex items-center gap-1 hover:text-[var(--foreground)]",
                    sort === c.key && "text-[var(--foreground)]",
                  )}
                >
                  {c.label}
                  {sort === c.key && <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.modelId} className="border-b border-[var(--rule)]/60">
              <td className="mono py-2 pl-3 pr-4 text-right text-[var(--mute)]">
                {String(r.rank).padStart(2, "0")}
              </td>
              <td className="mono py-2 pr-4">
                <span className="font-medium">{r.label}</span>
                {r.meta && (
                  <span className="ml-2 text-[10px] uppercase tracking-widest text-[var(--mute)]">
                    {r.meta}
                  </span>
                )}
              </td>
              <td className="mono py-2 pr-4 text-right font-medium">
                {fmt(r.primary)}
              </td>
              {r.secondary.map((c) => (
                <td key={c.key} className="mono py-2 pr-4 text-right text-[var(--mute)]">
                  {c.value == null ? "—" : typeof c.value === "number" ? c.value.toFixed(1) : c.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function findSecondary(r: BoardRow, key: string): number {
  const cell = r.secondary.find((c) => c.key === key);
  if (!cell || cell.value == null) return -Infinity;
  return typeof cell.value === "number" ? cell.value : -Infinity;
}

function compare(a: number, b: number): number {
  return a - b;
}
```

- [ ] **Step 2: Verify it builds**

Run: `bun --filter @benchmark/web typecheck 2>&1 | tail -5`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/leaderboard/external-board.tsx
git commit -m "feat(leaderboard): generic ExternalBoard table"
```

---

## Task 7: Community board extracted

**Files:**
- Create: `apps/web/components/leaderboard/community-board.tsx`

**Context:** Move the existing community-runs table out of `app/leaderboard/page.tsx` into its own component so the page can compose tabs cleanly.

- [ ] **Step 1: Write the implementation**

```tsx
// apps/web/components/leaderboard/community-board.tsx
import Link from "next/link";

interface Row {
  model_id: string;
  category: string;
  runs: number;
  avg_score: number | string | null;
  last_run_at: string | null;
}

interface Props {
  rows: ReadonlyArray<Row>;
  categories: ReadonlyArray<{ id: string; label: string }>;
  active: string | null;
}

export function CommunityBoard({ rows, categories, active }: Props) {
  return (
    <>
      <nav className="mono mb-6 flex flex-wrap gap-2 text-xs uppercase tracking-widest">
        <Link
          href="/leaderboard?board=community"
          className={`border border-[var(--rule)] px-2 py-1 ${
            !active ? "bg-[var(--ink)] text-[var(--paper)]" : ""
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/leaderboard?board=community&category=${c.id}`}
            className={`border border-[var(--rule)] px-2 py-1 ${
              active === c.id ? "bg-[var(--ink)] text-[var(--paper)]" : ""
            }`}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--mute)]">No runs yet for this slice.</p>
      ) : (
        <table className="tnum w-full border-y border-[var(--rule)] text-sm">
          <thead>
            <tr className="border-b border-[var(--rule)] text-left">
              <th className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">Model</th>
              <th className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">Category</th>
              <th className="mono py-2 pr-4 text-right text-xs uppercase tracking-widest text-[var(--mute)]">Avg</th>
              <th className="mono py-2 pr-4 text-right text-xs uppercase tracking-widest text-[var(--mute)]">Runs</th>
              <th className="mono py-2 text-xs uppercase tracking-widest text-[var(--mute)]">Last run</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.model_id}-${r.category}`} className="border-b border-[var(--rule)]/60">
                <td className="mono py-2 pr-4">{r.model_id}</td>
                <td className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
                  {r.category}
                </td>
                <td className="mono py-2 pr-4 text-right">
                  {r.avg_score == null ? "—" : Number(r.avg_score).toFixed(2)}
                </td>
                <td className="mono py-2 pr-4 text-right">{r.runs}</td>
                <td className="mono py-2 text-xs text-[var(--mute)]">
                  {r.last_run_at ? new Date(r.last_run_at).toISOString().slice(0, 10) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `bun --filter @benchmark/web typecheck 2>&1 | tail -5`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/leaderboard/community-board.tsx
git commit -m "feat(leaderboard): extract CommunityBoard component"
```

---

## Task 8: Board tabs (server)

**Files:**
- Create: `apps/web/components/leaderboard/board-tabs.tsx`

**Context:** Server-rendered tabs using `<Link>` so they work without JS. Active tab gets accent underline. Active board determined by `?board=` query.

- [ ] **Step 1: Write the implementation**

```tsx
// apps/web/components/leaderboard/board-tabs.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

export type BoardKey = "arena" | "open-llm" | "livebench" | "community";

const TABS: ReadonlyArray<{ key: BoardKey; label: string; sub: string }> = [
  { key: "arena", label: "Arena", sub: "LMSYS" },
  { key: "open-llm", label: "Open LLM", sub: "HF v2" },
  { key: "livebench", label: "LiveBench", sub: "GitHub" },
  { key: "community", label: "Community", sub: "Frontier Tape" },
];

interface Props {
  active: BoardKey;
}

export function BoardTabs({ active }: Props) {
  return (
    <nav aria-label="Leaderboard sources" className="grid grid-cols-2 gap-px bg-[var(--rule)] sm:grid-cols-4">
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={`/leaderboard?board=${t.key}`}
            aria-current={on ? "page" : undefined}
            className={cn(
              "block bg-[var(--background)] p-4 transition-colors hover:bg-[var(--foreground)]/[0.04]",
              on && "bg-[var(--foreground)]/[0.06]",
            )}
          >
            <span
              className={cn(
                "mono block text-[10px] uppercase tracking-widest",
                on ? "text-[var(--accent)]" : "text-[var(--mute)]",
              )}
            >
              {t.sub}
            </span>
            <span className="display mt-1 block text-lg tracking-tight">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `bun --filter @benchmark/web typecheck 2>&1 | tail -5`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/leaderboard/board-tabs.tsx
git commit -m "feat(leaderboard): tabbed source switcher"
```

---

## Task 9: Leaderboard page rebuild

**Files:**
- Modify: `apps/web/app/leaderboard/page.tsx` (full rewrite)

**Context:** Page composes tabs + active board. Server component. ISR `revalidate = 1800`. Awaits both DB queries and `loadLeaderboardSnapshot()` in parallel. Uses `RelativeTime` and source badges from `/pulse` pattern.

- [ ] **Step 1: Replace the page with the tabbed layout**

```tsx
// apps/web/app/leaderboard/page.tsx
import { Suspense } from "react";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { RelativeTime } from "@/components/shared/relative-time";
import { BoardTabs, type BoardKey } from "@/components/leaderboard/board-tabs";
import { ExternalBoard, type BoardRow } from "@/components/leaderboard/external-board";
import { CommunityBoard } from "@/components/leaderboard/community-board";
import { listLeaderboard } from "@/lib/db/queries/leaderboard";
import { listCategories } from "@/lib/db/queries/models";
import { loadLeaderboardSnapshot } from "@/lib/data/external/leaderboards";

export const metadata = { title: "Leaderboard" };
export const revalidate = 1800;

type Search = Promise<{ board?: string; category?: string }>;

const VALID: ReadonlyArray<BoardKey> = ["arena", "open-llm", "livebench", "community"];

export default async function LeaderboardPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const board: BoardKey = (VALID as readonly string[]).includes(sp.board ?? "")
    ? (sp.board as BoardKey)
    : "arena";

  const [snap, communityRows, categories] = await Promise.all([
    loadLeaderboardSnapshot(),
    board === "community" ? listLeaderboard(sp.category) : Promise.resolve([]),
    board === "community" ? listCategories() : Promise.resolve([]),
  ]);

  const activeSource =
    board === "arena" ? snap.sources.arena
    : board === "open-llm" ? snap.sources.openLlm
    : board === "livebench" ? snap.sources.liveBench
    : null;

  return (
    <Container width="wide" className="py-12 md:py-16">
      <header className="mb-8 grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-end">
        <div>
          <Eyebrow>Leaderboards · issue 04.25</Eyebrow>
          <h1 className="display mt-3 text-4xl tracking-tight md:text-6xl">
            Four boards. One shelf.
          </h1>
        </div>
        <p className="max-w-prose text-sm text-[var(--mute)]">
          Public benchmark rankings pulled live from LMSYS Arena, HF Open LLM v2, and
          LiveBench, plus this site&apos;s own community runs. Refreshes every 30 min via ISR.
          Last fetched <RelativeTime iso={snap.updatedAt} className="mono" />.
          {activeSource && (
            <>
              {" "}
              <SourceBadge label={board} status={activeSource} />
            </>
          )}
        </p>
      </header>

      <BoardTabs active={board} />

      <Rule weight="hair" className="my-8" />

      <Suspense fallback={null}>
        {board === "arena" && (
          <ExternalBoard
            basePath="/leaderboard"
            primaryLabel="Arena ELO"
            primaryFormat={(n) => Math.round(n).toString()}
            rows={snap.arena.map<BoardRow>((e) => ({
              rank: e.rank,
              modelId: e.model,
              label: e.model,
              meta: e.organization || null,
              primary: e.score,
              secondary: [
                { key: "ci", label: "95% CI", value: e.ciLabel },
                { key: "votes", label: "Votes", value: e.votes },
              ],
            }))}
          />
        )}
        {board === "open-llm" && (
          <ExternalBoard
            basePath="/leaderboard"
            primaryLabel="Average"
            rows={snap.openLlm.map<BoardRow>((e) => ({
              rank: e.rank,
              modelId: e.model,
              label: e.model,
              meta: null,
              primary: e.average,
              secondary: [
                { key: "ifeval", label: "IFEval", value: e.scores.ifeval },
                { key: "bbh", label: "BBH", value: e.scores.bbh },
                { key: "math", label: "MATH", value: e.scores.math },
                { key: "gpqa", label: "GPQA", value: e.scores.gpqa },
                { key: "musr", label: "MUSR", value: e.scores.musr },
                { key: "mmlu", label: "MMLU-PRO", value: e.scores.mmluPro },
              ],
            }))}
          />
        )}
        {board === "livebench" && (
          <ExternalBoard
            basePath="/leaderboard"
            primaryLabel="Global"
            rows={snap.liveBench.map<BoardRow>((e) => ({
              rank: e.rank,
              modelId: e.model,
              label: e.model,
              meta: null,
              primary: e.global,
              secondary: [
                { key: "coding", label: "Coding", value: e.coding },
                { key: "math", label: "Math", value: e.math },
                { key: "reasoning", label: "Reasoning", value: e.reasoning },
                { key: "language", label: "Language", value: e.language },
                { key: "data", label: "Data", value: e.dataAnalysis },
                { key: "if", label: "IF", value: e.ifAvg },
              ],
            }))}
          />
        )}
        {board === "community" && (
          <CommunityBoard rows={communityRows} categories={categories} active={sp.category ?? null} />
        )}
      </Suspense>
    </Container>
  );
}

function SourceBadge({ label, status }: { label: string; status: "live" | "fallback" }) {
  return (
    <span
      className={
        "mono inline-block border px-1.5 py-0.5 text-[10px] uppercase tracking-widest " +
        (status === "live"
          ? "border-[var(--pos)]/60 text-[var(--pos)]"
          : "border-[var(--mute)]/60 text-[var(--mute)]")
      }
    >
      {label}: {status === "live" ? "live" : "cached"}
    </span>
  );
}
```

- [ ] **Step 2: Verify build + typecheck**

Run: `bun --filter @benchmark/web build 2>&1 | tail -25`
Expected: build succeeds, `/leaderboard` listed in route summary.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/leaderboard/page.tsx
git commit -m "feat(leaderboard): tabbed page combining 3 external boards + community"
```

---

## Task 10: Compare page multi-model picker

**Files:**
- Create: `apps/web/components/compare/compare-picker.tsx`
- Modify: `apps/web/app/compare/page.tsx`

**Context:** Replace hardcoded Opus-vs-GPT layout with a 2-6 model picker that reads from `?models=opus,gpt,gemini`. Uses `MODEL_DISPLAY` map for label lookup. The existing `<CompareBoard>` and `<CompareVerdict>` operate on `BENCHMARKS` columns named `opus` and `gpt` — keep those intact, but add an upper section that displays selected models from the live snapshot's Arena/Open-LLM/LiveBench scores side by side. The two-model `<CompareBoard>` stays as the secondary "in-house numbers" section below.

- [ ] **Step 1: Write the picker**

```tsx
// apps/web/components/compare/compare-picker.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "claude-opus-4-7", label: "Claude Opus 4.7" },
  { id: "gpt-5.5", label: "GPT-5.5" },
  { id: "gpt-5.5-pro", label: "GPT-5.5 Pro" },
  { id: "gemini-3-pro", label: "Gemini 3 Pro" },
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro" },
  { id: "llama-4-405b-instruct", label: "Llama 4 405B" },
  { id: "qwen3-next-80b", label: "Qwen3 Next 80B" },
  { id: "mistral-large-2503", label: "Mistral Large" },
  { id: "grok-4", label: "Grok 4" },
];

interface Props {
  selected: ReadonlyArray<string>;
  max?: number;
}

export function ComparePicker({ selected, max = 6 }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const set = new Set(selected);

  const toggle = (id: string) => {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else if (next.size < max) {
      next.add(id);
    }
    if (next.size < 2) return;
    const params = new URLSearchParams(sp.toString());
    params.set("models", Array.from(next).join(","));
    router.replace(`/compare?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => {
        const on = set.has(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            className={`mono border px-2 py-1 text-xs uppercase tracking-widest transition-colors ${
              on
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]"
                : "border-[var(--rule)] text-[var(--mute)] hover:text-[var(--foreground)]"
            }`}
            aria-pressed={on}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite the compare page**

```tsx
// apps/web/app/compare/page.tsx
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { CompareBoard } from "@/components/compare/compare-board";
import { CompareVerdict } from "@/components/compare/compare-verdict";
import { ComparePicker } from "@/components/compare/compare-picker";
import { ModelSpecGrid } from "@/components/home/model-spec-grid";
import { BENCHMARKS } from "@/lib/data/benchmarks";
import { loadLeaderboardSnapshot } from "@/lib/data/external/leaderboards";

export const metadata = { title: "Head-to-head" };
export const revalidate = 1800;

type Search = Promise<{ models?: string }>;

const DEFAULT_SEL = ["claude-opus-4-7", "gpt-5.5", "gemini-3-pro"];

export default async function ComparePage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const selected = parseSelection(sp.models);
  const snap = await loadLeaderboardSnapshot();

  const matrix = selected.map((id) => ({
    id,
    arena: snap.arena.find((e) => norm(e.model) === norm(id))?.score ?? null,
    openLlm: snap.openLlm.find((e) => norm(e.model) === norm(id))?.average ?? null,
    liveBench: snap.liveBench.find((e) => norm(e.model) === norm(id))?.global ?? null,
  }));

  return (
    <Container width="wide" className="py-12 md:py-16">
      <header className="mb-8 grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-end">
        <div>
          <Eyebrow>Head-to-head · issue 04.25</Eyebrow>
          <h1 className="display mt-3 text-4xl tracking-tight md:text-6xl">
            {selected.length} models, side by side.
          </h1>
        </div>
        <p className="max-w-prose text-sm text-[var(--mute)]">
          Pick 2-6 models. External scores pulled from LMSYS Arena, HF Open LLM v2, and
          LiveBench. In-house numbers below come from cited public sources.
        </p>
      </header>

      <ComparePicker selected={selected} />

      <Rule weight="hair" className="my-8" />

      <section>
        <header className="mb-4">
          <Eyebrow>External rankings</Eyebrow>
          <h2 className="display mt-2 text-2xl tracking-tight md:text-3xl">Live boards.</h2>
        </header>
        <div className="overflow-x-auto border-y border-[var(--rule)]">
          <table className="tnum w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--rule)] text-left">
                <th className="mono py-2 pl-3 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">Model</th>
                <th className="mono py-2 pr-4 text-right text-xs uppercase tracking-widest text-[var(--mute)]">Arena ELO</th>
                <th className="mono py-2 pr-4 text-right text-xs uppercase tracking-widest text-[var(--mute)]">Open LLM avg</th>
                <th className="mono py-2 pr-3 text-right text-xs uppercase tracking-widest text-[var(--mute)]">LiveBench global</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((m) => (
                <tr key={m.id} className="border-b border-[var(--rule)]/60">
                  <td className="mono py-2 pl-3 pr-4 font-medium">{m.id}</td>
                  <td className="mono py-2 pr-4 text-right">{m.arena == null ? "—" : Math.round(m.arena)}</td>
                  <td className="mono py-2 pr-4 text-right">{m.openLlm == null ? "—" : m.openLlm.toFixed(1)}</td>
                  <td className="mono py-2 pr-3 text-right">{m.liveBench == null ? "—" : m.liveBench.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Rule weight="hair" className="my-12" />

      <section>
        <header className="mb-4">
          <Eyebrow>In-house comparison · Opus vs GPT</Eyebrow>
          <h2 className="display mt-2 text-2xl tracking-tight md:text-3xl">Cited benchmarks.</h2>
          <p className="mt-2 max-w-prose text-sm text-[var(--mute)]">
            This section currently covers Opus 4.7 and GPT-5.5 only — we&apos;re collecting
            citation-backed numbers for more frontier models.
          </p>
        </header>
        <CompareVerdict rows={BENCHMARKS} />
        <Rule weight="hair" className="my-8" />
        <CompareBoard rows={BENCHMARKS} />
      </section>

      <Rule weight="hair" className="my-12" />

      <header className="mb-6">
        <Eyebrow>Spec sheet</Eyebrow>
        <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">Architecture &amp; price.</h2>
      </header>
      <ModelSpecGrid />
    </Container>
  );
}

function parseSelection(raw: string | undefined): string[] {
  if (!raw) return DEFAULT_SEL;
  const ids = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6);
  if (ids.length < 2) return DEFAULT_SEL;
  return ids;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/^[^/]+\//, "").replace(/[^a-z0-9.-]/g, "");
}
```

- [ ] **Step 3: Verify build**

Run: `bun --filter @benchmark/web build 2>&1 | tail -25`
Expected: builds, `/compare` listed.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/compare/compare-picker.tsx apps/web/app/compare/page.tsx
git commit -m "feat(compare): N-model picker + external rankings panel"
```

---

## Task 11: Benchmarks page external scores panel

**Files:**
- Create: `apps/web/components/benchmarks/external-scores-panel.tsx`
- Modify: `apps/web/app/benchmarks/page.tsx`

**Context:** Above the existing `<BenchmarkBoard>`, add a panel that shows top-10 from each external board in three side-by-side columns. Server component, accepts the snapshot.

- [ ] **Step 1: Write the panel**

```tsx
// apps/web/components/benchmarks/external-scores-panel.tsx
import type { LeaderboardSnapshot } from "@/lib/data/external/leaderboards";
import { Eyebrow } from "@/components/shared/eyebrow";

interface Props {
  snap: LeaderboardSnapshot;
}

export function ExternalScoresPanel({ snap }: Props) {
  return (
    <section className="grid grid-cols-1 gap-px bg-[var(--rule)] md:grid-cols-3">
      <Column
        title="LMSYS Arena"
        subtitle="ELO, top 10"
        rows={snap.arena.slice(0, 10).map((e) => ({
          rank: e.rank,
          label: e.model,
          value: Math.round(e.score).toString(),
        }))}
      />
      <Column
        title="HF Open LLM v2"
        subtitle="Average, top 10"
        rows={snap.openLlm.slice(0, 10).map((e) => ({
          rank: e.rank,
          label: e.model,
          value: e.average.toFixed(1),
        }))}
      />
      <Column
        title="LiveBench"
        subtitle="Global, top 10"
        rows={snap.liveBench.slice(0, 10).map((e) => ({
          rank: e.rank,
          label: e.model,
          value: e.global.toFixed(1),
        }))}
      />
    </section>
  );
}

function Column({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: ReadonlyArray<{ rank: number; label: string; value: string }>;
}) {
  return (
    <div className="bg-[var(--background)] p-5">
      <Eyebrow>{subtitle}</Eyebrow>
      <h3 className="display mt-2 text-lg tracking-tight">{title}</h3>
      <ol className="mono mt-4 grid gap-1 text-xs">
        {rows.map((r) => (
          <li key={r.label} className="flex items-baseline justify-between gap-3 border-b border-[var(--rule)]/40 py-1">
            <span className="flex items-baseline gap-2">
              <span className="w-6 text-right text-[var(--mute)]">{String(r.rank).padStart(2, "0")}</span>
              <span className="truncate">{r.label}</span>
            </span>
            <span className="tnum font-medium">{r.value}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the benchmarks page**

```tsx
// apps/web/app/benchmarks/page.tsx
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { BenchmarkBoard } from "@/components/benchmark/benchmark-board";
import { ExternalScoresPanel } from "@/components/benchmarks/external-scores-panel";
import { BENCHMARKS } from "@/lib/data/benchmarks";
import { loadLeaderboardSnapshot } from "@/lib/data/external/leaderboards";

export const metadata = { title: "Benchmarks" };
export const revalidate = 1800;

export default async function BenchmarksPage() {
  const snap = await loadLeaderboardSnapshot();
  return (
    <Container width="wide" className="py-16 md:py-20">
      <header className="mb-10">
        <Eyebrow>The Tape · Issue 04.25</Eyebrow>
        <h1 className="display mt-4 text-4xl tracking-tight md:text-5xl">
          External boards plus {BENCHMARKS.length} cited benchmarks.
        </h1>
        <p className="mt-4 max-w-[65ch] leading-relaxed text-[var(--mute)]">
          Live snapshots from LMSYS Arena, HF Open LLM v2, and LiveBench at the top.
          In-house benchmark table below — every cell carries a superscript citation.
        </p>
      </header>

      <ExternalScoresPanel snap={snap} />

      <Rule weight="hair" className="my-12" />

      <BenchmarkBoard data={BENCHMARKS} />
    </Container>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `bun --filter @benchmark/web build 2>&1 | tail -25`
Expected: builds, `/benchmarks` listed.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/benchmarks/external-scores-panel.tsx apps/web/app/benchmarks/page.tsx
git commit -m "feat(benchmarks): external scores panel above in-house table"
```

---

## Task 12: Home live-ranks widget

**Files:**
- Create: `apps/web/components/home/live-ranks.tsx`
- Modify: `apps/web/app/page.tsx`

**Context:** Compact 3-column widget on the home page showing top-5 per external board. Goes between `HeadlineGrid` and `ModelSpecGrid` sections.

- [ ] **Step 1: Write the widget**

```tsx
// apps/web/components/home/live-ranks.tsx
import Link from "next/link";
import type { LeaderboardSnapshot } from "@/lib/data/external/leaderboards";
import { Eyebrow } from "@/components/shared/eyebrow";

interface Props {
  snap: LeaderboardSnapshot;
}

export function LiveRanks({ snap }: Props) {
  return (
    <section className="grid grid-cols-1 gap-px bg-[var(--rule)] md:grid-cols-3">
      <Card
        title="Arena ELO"
        subtitle="LMSYS · top 5"
        href="/leaderboard?board=arena"
        rows={snap.arena.slice(0, 5).map((e) => ({ label: e.model, value: Math.round(e.score).toString() }))}
      />
      <Card
        title="Open LLM avg"
        subtitle="HF v2 · top 5"
        href="/leaderboard?board=open-llm"
        rows={snap.openLlm.slice(0, 5).map((e) => ({ label: e.model, value: e.average.toFixed(1) }))}
      />
      <Card
        title="LiveBench global"
        subtitle="GitHub · top 5"
        href="/leaderboard?board=livebench"
        rows={snap.liveBench.slice(0, 5).map((e) => ({ label: e.model, value: e.global.toFixed(1) }))}
      />
    </section>
  );
}

function Card({
  title,
  subtitle,
  href,
  rows,
}: {
  title: string;
  subtitle: string;
  href: string;
  rows: ReadonlyArray<{ label: string; value: string }>;
}) {
  return (
    <Link
      href={href}
      className="group block bg-[var(--background)] p-5 transition-colors hover:bg-[var(--foreground)]/[0.04]"
    >
      <Eyebrow>{subtitle}</Eyebrow>
      <h3 className="display mt-2 text-lg tracking-tight group-hover:text-[var(--accent)]">
        {title}
      </h3>
      <ol className="mono mt-4 grid gap-1 text-xs">
        {rows.map((r, i) => (
          <li key={r.label} className="flex items-baseline justify-between gap-3 border-b border-[var(--rule)]/40 py-1">
            <span className="flex items-baseline gap-2">
              <span className="w-5 text-right text-[var(--mute)]">{i + 1}</span>
              <span className="truncate">{r.label}</span>
            </span>
            <span className="tnum font-medium">{r.value}</span>
          </li>
        ))}
      </ol>
    </Link>
  );
}
```

- [ ] **Step 2: Wire into home**

Edit `apps/web/app/page.tsx`:

Imports: add
```tsx
import { loadLeaderboardSnapshot } from "@/lib/data/external/leaderboards";
import { LiveRanks } from "@/components/home/live-ranks";
```

In the `Promise.all` that loads `tasks`, `leaderboard`, `trending`, add `loadLeaderboardSnapshot()` as a fourth entry:

```tsx
const [tasks, leaderboard, trending, snap] = await Promise.all([
  listPublicTasks({ limit: 6 }).catch(() => []),
  listLeaderboard().catch(() => []),
  fetchTrendingHFModels({ limit: 8 }),
  loadLeaderboardSnapshot(),
]);
```

After the existing `<HeadlineGrid />` `Container` block and before the `<ModelSpecGrid />` block, insert:

```tsx
<Container width="wide" className="pb-16 md:pb-20">
  <header className="mb-6 flex items-baseline justify-between gap-4">
    <div>
      <Eyebrow>Live ranks · refreshes every 30 min</Eyebrow>
      <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">
        Three boards. Top five.
      </h2>
    </div>
    <Link
      href="/leaderboard"
      className="mono shrink-0 text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
    >
      All boards →
    </Link>
  </header>
  <LiveRanks snap={snap} />
</Container>
```

- [ ] **Step 3: Verify build**

Run: `bun --filter @benchmark/web build 2>&1 | tail -25`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/home/live-ranks.tsx apps/web/app/page.tsx
git commit -m "feat(home): live-ranks widget pulling top-5 per board"
```

---

## Task 13: Final verification

**Files:** none — verification only.

- [ ] **Step 1: Full test suite**

Run: `bun --filter @benchmark/web test 2>&1 | tail -10`
Expected: all tests PASS (existing + 13 new from Tasks 1-4).

- [ ] **Step 2: Typecheck + build + lint**

Run: `bun --filter @benchmark/web typecheck && bun --filter @benchmark/web lint && bun --filter @benchmark/web build 2>&1 | tail -30`
Expected: 0 type errors, 0 lint errors, build succeeds with all routes listed including `/leaderboard`, `/compare`, `/benchmarks`, `/`.

- [ ] **Step 3: Manual smoke**

Bring up dev: `bun --filter @benchmark/web dev` and visit:
- `/leaderboard` — Arena tab loads with top entries, source badge, RelativeTime ticks every 10s
- `/leaderboard?board=open-llm` — Open LLM tab loads
- `/leaderboard?board=livebench` — LiveBench tab loads
- `/leaderboard?board=community` — Community tab loads (empty state OK)
- `/compare` — defaults to 3 models, picker toggles, external scores table populates
- `/compare?models=claude-opus-4-7,gpt-5.5,gemini-3-pro,deepseek-v4-pro` — 4 rows shown
- `/benchmarks` — external panel above the in-house board
- `/` — live ranks widget visible between Headline grid and Spec grid
- DevTools Offline + reload `/leaderboard` — every source badge shows `cached`, page still renders

- [ ] **Step 4: Finishing**

Use `superpowers:finishing-a-development-branch` to merge / push / keep.

---

## Notes

- All external endpoints are best-effort. Fallback data is hardcoded so UX never breaks when APIs are down or response schemas drift.
- `revalidate = 1800` (30 min) gives Next.js cache long enough to amortize cost while still feeling current. The `<RelativeTime>` ticker creates the perceived "live" feel without actual client polling. Polling at 1s was rejected during scoping (rate limit + battery cost).
- Column-name picking (`pickStr`/`pickNum` helpers) is intentional — HF dataset column casing varies and breaks rigid schemas.
- LMSYS / Open-LLM / LiveBench all expose data freely. No auth, no API keys.
