# Pulse page + thin-page fills, implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/pulse` page that compares LLMs side-by-side using free public APIs (Hugging Face Hub + OpenRouter), and fill three visually-thin pages (`/tasks/new`, `/tasks` empty state, `/tasks/[slug]` empty-runs).

**Architecture:** Next.js 15 App Router, Server Components for data loading, ISR-style `revalidate`, Zod-validated fetchers with hard-coded fallback arrays so an outage cannot break a render. One client component for table sorting + URL-state chip filters. Reuses existing `Container`, `Eyebrow`, `Rule`, `TrendingModels`, `vendorLabel` primitives.

**Tech Stack:** Next.js 15, React 19, TypeScript strict, Tailwind v4, Zod 4, Vitest. Bun runtime.

**Spec:** `docs/superpowers/specs/2026-04-25-pulse-and-thin-pages-design.md`

---

## File map

**Create:**
- `apps/web/lib/data/external/openrouter.ts`
- `apps/web/tests/data/external/openrouter.test.ts`
- `apps/web/lib/data/external/pulse.ts`
- `apps/web/tests/data/external/pulse.test.ts`
- `apps/web/lib/data/task-templates.ts`
- `apps/web/components/pulse/pulse-stats.tsx`
- `apps/web/components/pulse/pulse-table.tsx`
- `apps/web/components/pulse/pulse-filters.tsx`
- `apps/web/app/pulse/page.tsx`

**Modify:**
- `apps/web/lib/config/site.ts` (add Pulse to NAV)
- `apps/web/app/tasks/new/page.tsx` (wide layout + sidebar)
- `apps/web/app/tasks/new/new-task-form.tsx` (read defaults from props)
- `apps/web/app/tasks/page.tsx` (stats + chips + templates empty state)
- `apps/web/app/tasks/[slug]/page.tsx` (3-step empty-runs sidecar)

**No changes to:** `/`, `/compare`, `/benchmarks`, `/leaderboard`, `/models`, `/vendors`, `/methodology`, `/test-yourself`, `/profile`, auth, supabase migrations.

---

## Task 1: OpenRouter fetcher (TDD)

**Files:**
- Create: `apps/web/lib/data/external/openrouter.ts`
- Test: `apps/web/tests/data/external/openrouter.test.ts`

**Background.** OpenRouter `GET https://openrouter.ai/api/v1/models` returns a JSON object `{ data: ModelEntry[] }` (NOT a bare array). Each entry shape (relevant fields only):

```jsonc
{
  "id": "openai/gpt-5.5",
  "name": "OpenAI: GPT-5.5",
  "context_length": 1050000,
  "created": 1777051893,
  "architecture": {
    "modality": "text+image+file->text",
    "input_modalities": ["file", "image", "text"],
    "output_modalities": ["text"]
  },
  "pricing": {
    "prompt": "0.000005",
    "completion": "0.00003"
  }
}
```

`pricing.prompt` and `pricing.completion` are stringified per-token USD. Multiply by 1_000_000 for `$/Mtok`.

- [ ] **Step 1: Write the failing test file**

Create `apps/web/tests/data/external/openrouter.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchOpenRouterModels,
  OPENROUTER_FALLBACK,
} from "@/lib/data/external/openrouter";

describe("fetchOpenRouterModels", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the curated fallback when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const out = await fetchOpenRouterModels({ limit: 4 });
    expect(out.length).toBe(4);
    expect(out[0]?.id).toBe(OPENROUTER_FALLBACK[0]?.id);
  });

  it("returns the fallback when the response is not data-array shaped", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ error: "rate-limited" }),
        } as Response),
      ),
    );
    const out = await fetchOpenRouterModels({ limit: 3 });
    expect(out.length).toBe(3);
    expect(out[0]?.id).toBe(OPENROUTER_FALLBACK[0]?.id);
  });

  it("parses well-formed entries and converts pricing to USD per Mtok", async () => {
    const sample = {
      data: [
        {
          id: "openai/gpt-5.5",
          name: "OpenAI: GPT-5.5",
          context_length: 1050000,
          created: 1777051893,
          architecture: {
            modality: "text+image->text",
            input_modalities: ["image", "text"],
            output_modalities: ["text"],
          },
          pricing: { prompt: "0.000005", completion: "0.00003" },
        },
        {
          id: "deepseek/deepseek-v4-flash",
          name: "DeepSeek: DeepSeek V4 Flash",
          context_length: 131072,
          created: 1777000666,
          architecture: {
            modality: "text->text",
            input_modalities: ["text"],
            output_modalities: ["text"],
          },
          pricing: { prompt: "0.0000001", completion: "0.0000003" },
        },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({ ok: true, json: async () => sample } as Response),
      ),
    );
    const out = await fetchOpenRouterModels({ limit: 5 });
    expect(out.length).toBe(2);
    expect(out[0]).toMatchObject({
      id: "openai/gpt-5.5",
      vendor: "openai",
      contextK: 1050,
      promptUSDPerMtok: 5,
      completionUSDPerMtok: 30,
      modality: "multimodal",
    });
    expect(out[1]).toMatchObject({
      id: "deepseek/deepseek-v4-flash",
      vendor: "deepseek",
      contextK: 131,
      promptUSDPerMtok: 0.1,
      completionUSDPerMtok: 0.3,
      modality: "text",
    });
  });

  it("falls back when every entry fails Zod validation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ data: [{ no_id: true }, { also_bogus: 1 }] }),
        } as Response),
      ),
    );
    const out = await fetchOpenRouterModels({ limit: 2 });
    expect(out[0]?.id).toBe(OPENROUTER_FALLBACK[0]?.id);
  });

  it("clamps the limit to [1, 500]", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const tiny = await fetchOpenRouterModels({ limit: 0 });
    const big = await fetchOpenRouterModels({ limit: 9999 });
    expect(tiny.length).toBe(1);
    expect(big.length).toBe(OPENROUTER_FALLBACK.length);
  });
});
```

- [ ] **Step 2: Run test, expect failure**

```bash
cd D:/Projects/benchmark && bun --filter @benchmark/web test -- tests/data/external/openrouter.test.ts
```

Expected: import error (module not found). That is a valid failure.

- [ ] **Step 3: Implement the fetcher**

Create `apps/web/lib/data/external/openrouter.ts`:

```ts
import { z } from "zod";

const PricingSchema = z.object({
  prompt: z.string().optional(),
  completion: z.string().optional(),
});

const ArchitectureSchema = z.object({
  modality: z.string().optional(),
  input_modalities: z.array(z.string()).optional(),
  output_modalities: z.array(z.string()).optional(),
});

const RawModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  context_length: z.number().nullable().optional(),
  created: z.number().nullable().optional(),
  architecture: ArchitectureSchema.optional(),
  pricing: PricingSchema.optional(),
});

const ResponseSchema = z.object({ data: z.array(z.unknown()) });

export type Modality = "text" | "multimodal";

export interface OpenRouterModel {
  id: string;
  vendor: string;
  family: string;
  displayName: string;
  contextK: number | null;
  promptUSDPerMtok: number | null;
  completionUSDPerMtok: number | null;
  modality: Modality;
  createdAt: string | null;
}

const FALLBACK: ReadonlyArray<OpenRouterModel> = Object.freeze([
  fb("anthropic/claude-opus-4-7", "Claude Opus 4.7", 1000, 15, 75, "multimodal", "2026-04-16"),
  fb("openai/gpt-5.5", "GPT-5.5", 1050, 5, 30, "multimodal", "2026-04-23"),
  fb("openai/gpt-5.5-pro", "GPT-5.5 Pro", 1050, 30, 180, "multimodal", "2026-04-23"),
  fb("google/gemini-3-pro", "Gemini 3 Pro", 2000, 1.25, 5, "multimodal", "2026-02-01"),
  fb("meta-llama/llama-4-405b-instruct", "Llama 4 405B Instruct", 256, 0.9, 0.9, "text", "2025-12-01"),
  fb("deepseek/deepseek-v4-pro", "DeepSeek V4 Pro", 1024, 0.435, 0.87, "text", "2026-04-23"),
  fb("deepseek/deepseek-v4-flash", "DeepSeek V4 Flash", 131, 0.1, 0.3, "text", "2026-04-23"),
  fb("qwen/qwen3-next-80b-a3b-instruct", "Qwen3 Next 80B Instruct", 256, 0.4, 0.6, "text", "2026-04-19"),
  fb("mistralai/mistral-large-2503", "Mistral Large", 128, 2, 6, "text", "2026-03-01"),
  fb("xai/grok-4", "Grok 4", 256, 5, 15, "multimodal", "2026-02-15"),
  fb("cohere/command-r-plus", "Command R+", 128, 2.5, 10, "text", "2025-08-01"),
  fb("microsoft/phi-4-mini", "Phi-4 Mini", 128, 0.07, 0.14, "text", "2026-04-08"),
]);

function fb(
  id: string,
  displayName: string,
  contextK: number,
  prompt: number,
  completion: number,
  modality: Modality,
  createdAt: string,
): OpenRouterModel {
  const [vendor, family] = id.includes("/") ? id.split("/") : ["", id];
  return {
    id,
    vendor: vendor ?? "",
    family: family ?? id,
    displayName,
    contextK,
    promptUSDPerMtok: prompt,
    completionUSDPerMtok: completion,
    modality,
    createdAt,
  };
}

interface FetchOpts {
  limit?: number;
  signal?: AbortSignal;
}

export async function fetchOpenRouterModels(
  opts: FetchOpts = {},
): Promise<ReadonlyArray<OpenRouterModel>> {
  const limit = Math.max(1, Math.min(500, opts.limit ?? 200));
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 4500);
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      signal: opts.signal ?? ac.signal,
      headers: { accept: "application/json" },
      next: { revalidate: 3600 },
    });
    clearTimeout(t);
    if (!res.ok) return FALLBACK.slice(0, limit);
    const json = (await res.json()) as unknown;
    const wrapper = ResponseSchema.safeParse(json);
    if (!wrapper.success) return FALLBACK.slice(0, limit);
    const out: OpenRouterModel[] = [];
    for (const raw of wrapper.data.data) {
      const parsed = RawModelSchema.safeParse(raw);
      if (!parsed.success) continue;
      const m = toModel(parsed.data);
      if (m) out.push(m);
    }
    if (out.length === 0) return FALLBACK.slice(0, limit);
    return Object.freeze(out.slice(0, limit));
  } catch {
    return FALLBACK.slice(0, limit);
  }
}

function toModel(r: z.infer<typeof RawModelSchema>): OpenRouterModel | null {
  const id = r.id;
  const [vendor, family] = id.includes("/") ? id.split("/") : ["", id];
  const ctx = r.context_length ?? null;
  const contextK = ctx ? Math.round(ctx / 1000) : null;
  const prompt = parsePerTokenPrice(r.pricing?.prompt);
  const completion = parsePerTokenPrice(r.pricing?.completion);
  const modality = inferModality(r.architecture);
  const createdAt = r.created ? new Date(r.created * 1000).toISOString().slice(0, 10) : null;
  return {
    id,
    vendor: vendor ?? "",
    family: family ?? id,
    displayName: r.name ?? id,
    contextK,
    promptUSDPerMtok: prompt,
    completionUSDPerMtok: completion,
    modality,
    createdAt,
  };
}

function parsePerTokenPrice(s: string | undefined): number | null {
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 1_000_000 * 1000) / 1000;
}

function inferModality(a: z.infer<typeof ArchitectureSchema> | undefined): Modality {
  const inputs = a?.input_modalities ?? [];
  const hasNonText = inputs.some((m) => m !== "text");
  if (hasNonText) return "multimodal";
  const mod = a?.modality ?? "";
  if (/image|audio|file|video/i.test(mod)) return "multimodal";
  return "text";
}

export const OPENROUTER_FALLBACK = FALLBACK;
```

- [ ] **Step 4: Run test, expect pass**

```bash
cd D:/Projects/benchmark && bun --filter @benchmark/web test -- tests/data/external/openrouter.test.ts
```

Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
cd D:/Projects/benchmark && git add apps/web/lib/data/external/openrouter.ts apps/web/tests/data/external/openrouter.test.ts && git commit -m "feat(pulse): openrouter fetcher with fallback"
```

---

## Task 2: Pulse snapshot loader (TDD)

**Files:**
- Create: `apps/web/lib/data/external/pulse.ts`
- Test: `apps/web/tests/data/external/pulse.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/tests/data/external/pulse.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadPulseSnapshot } from "@/lib/data/external/pulse";
import * as openrouter from "@/lib/data/external/openrouter";
import * as huggingface from "@/lib/data/external/huggingface";

describe("loadPulseSnapshot", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("merges live HF and OR results, marking both as live", async () => {
    vi.spyOn(openrouter, "fetchOpenRouterModels").mockResolvedValue([
      {
        id: "openai/gpt-5.5",
        vendor: "openai",
        family: "gpt-5.5",
        displayName: "GPT-5.5",
        contextK: 1050,
        promptUSDPerMtok: 5,
        completionUSDPerMtok: 30,
        modality: "multimodal",
        createdAt: "2026-04-23",
      },
    ]);
    vi.spyOn(huggingface, "fetchTrendingHFModels").mockResolvedValue([
      {
        id: "Qwen/Qwen3-Next-80B-A3B-Instruct",
        org: "Qwen",
        name: "Qwen3-Next-80B-A3B-Instruct",
        pipeline: "text-generation",
        tags: [],
        downloads: 1,
        likes: 1,
        trendingScore: 1,
        lastModified: null,
        url: "https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct",
      },
    ]);

    const snap = await loadPulseSnapshot();
    expect(snap.models.length).toBe(1);
    expect(snap.hf.length).toBe(1);
    expect(snap.sources.or).toBe("live");
    expect(snap.sources.hf).toBe("live");
    expect(typeof snap.updatedAt).toBe("string");
  });

  it("marks OR fallback when fetchOpenRouterModels rejects", async () => {
    vi.spyOn(openrouter, "fetchOpenRouterModels").mockRejectedValue(new Error("boom"));
    vi.spyOn(huggingface, "fetchTrendingHFModels").mockResolvedValue([]);
    const snap = await loadPulseSnapshot();
    expect(snap.sources.or).toBe("fallback");
    expect(snap.models.length).toBe(openrouter.OPENROUTER_FALLBACK.length);
  });

  it("marks HF fallback when fetchTrendingHFModels rejects", async () => {
    vi.spyOn(openrouter, "fetchOpenRouterModels").mockResolvedValue([]);
    vi.spyOn(huggingface, "fetchTrendingHFModels").mockRejectedValue(new Error("boom"));
    const snap = await loadPulseSnapshot();
    expect(snap.sources.hf).toBe("fallback");
    expect(snap.hf.length).toBe(huggingface.TRENDING_FALLBACK.length);
  });
});
```

- [ ] **Step 2: Run test, expect failure**

```bash
cd D:/Projects/benchmark && bun --filter @benchmark/web test -- tests/data/external/pulse.test.ts
```

Expected: module not found.

- [ ] **Step 3: Implement the loader**

Create `apps/web/lib/data/external/pulse.ts`:

```ts
import {
  fetchOpenRouterModels,
  OPENROUTER_FALLBACK,
  type OpenRouterModel,
} from "./openrouter";
import {
  fetchTrendingHFModels,
  TRENDING_FALLBACK,
  type TrendingHFModel,
} from "./huggingface";

export interface PulseSnapshot {
  models: ReadonlyArray<OpenRouterModel>;
  hf: ReadonlyArray<TrendingHFModel>;
  updatedAt: string;
  sources: { or: "live" | "fallback"; hf: "live" | "fallback" };
}

export async function loadPulseSnapshot(): Promise<PulseSnapshot> {
  const [orResult, hfResult] = await Promise.allSettled([
    fetchOpenRouterModels({ limit: 300 }),
    fetchTrendingHFModels({ limit: 12 }),
  ]);

  const or =
    orResult.status === "fulfilled" && orResult.value.length > 0
      ? { models: orResult.value, status: "live" as const }
      : { models: OPENROUTER_FALLBACK, status: "fallback" as const };

  const hf =
    hfResult.status === "fulfilled" && hfResult.value.length > 0
      ? { models: hfResult.value, status: "live" as const }
      : { models: TRENDING_FALLBACK, status: "fallback" as const };

  return {
    models: or.models,
    hf: hf.models,
    updatedAt: new Date().toISOString(),
    sources: { or: or.status, hf: hf.status },
  };
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
cd D:/Projects/benchmark && bun --filter @benchmark/web test -- tests/data/external/pulse.test.ts
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
cd D:/Projects/benchmark && git add apps/web/lib/data/external/pulse.ts apps/web/tests/data/external/pulse.test.ts && git commit -m "feat(pulse): snapshot loader merging HF + OR"
```

---

## Task 3: Pulse stats component

**Files:**
- Create: `apps/web/components/pulse/pulse-stats.tsx`

- [ ] **Step 1: Implement the stats strip (server component)**

Create `apps/web/components/pulse/pulse-stats.tsx`:

```tsx
import type { PulseSnapshot } from "@/lib/data/external/pulse";

interface Props {
  snap: PulseSnapshot;
}

export function PulseStats({ snap }: Props) {
  const vendors = new Set(snap.models.map((m) => m.vendor)).size;
  const cheapest = snap.models
    .map((m) => m.promptUSDPerMtok)
    .filter((n): n is number => n != null && n >= 0)
    .sort((a, b) => a - b)[0];
  const largestK = snap.models
    .map((m) => m.contextK ?? 0)
    .reduce((a, b) => Math.max(a, b), 0);
  return (
    <section
      aria-label="Pulse stats"
      className="grid grid-cols-2 gap-px bg-[var(--rule)] border border-[var(--rule)] md:grid-cols-4"
    >
      <Cell label="Models" value={snap.models.length.toString()} hint={snap.sources.or} />
      <Cell label="Vendors" value={vendors.toString()} hint={snap.sources.or} />
      <Cell
        label="Cheapest in $/Mtok"
        value={cheapest != null ? cheapest.toFixed(2) : "n/a"}
        hint="prompt"
      />
      <Cell
        label="Largest context"
        value={largestK > 0 ? `${formatK(largestK)}` : "n/a"}
        hint="tokens"
      />
    </section>
  );
}

function Cell({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-[var(--background)] p-4">
      <p className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
        {label}
      </p>
      <p className="figure mt-2 text-3xl tabular-nums">{value}</p>
      <p className="mono mt-0.5 text-[10px] uppercase tracking-widest text-[var(--mute)]">
        {hint}
      </p>
    </div>
  );
}

function formatK(k: number): string {
  if (k >= 1000) return `${(k / 1000).toFixed(1)}M`;
  return `${k}k`;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd D:/Projects/benchmark && bun run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
cd D:/Projects/benchmark && git add apps/web/components/pulse/pulse-stats.tsx && git commit -m "feat(pulse): stats strip component"
```

---

## Task 4: Pulse table + filters (client)

**Files:**
- Create: `apps/web/components/pulse/pulse-table.tsx`
- Create: `apps/web/components/pulse/pulse-filters.tsx`

The table reads filters from `?vendor=&modality=&priceMax=&minContext=&sort=&dir=` and re-applies them client-side. Filters update `router.replace` so reload preserves view. We hydrate filters from `searchParams` on mount.

- [ ] **Step 1: Implement filters component**

Create `apps/web/components/pulse/pulse-filters.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { vendorLabel } from "@/lib/data/vendors";
import { cn } from "@/lib/utils";

interface Props {
  vendors: ReadonlyArray<string>;
}

const PRICE_TIERS: Array<{ id: string; label: string; max: number }> = [
  { id: "free", label: "free", max: 0 },
  { id: "1", label: "<$1", max: 1 },
  { id: "5", label: "<$5", max: 5 },
  { id: "20", label: "<$20", max: 20 },
];

const CTX_TIERS: Array<{ id: string; label: string; min: number }> = [
  { id: "32", label: "32k+", min: 32 },
  { id: "128", label: "128k+", min: 128 },
  { id: "1m", label: "1M+", min: 1000 },
];

export function PulseFilters({ vendors }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(sp.toString());
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
      router.replace(`/pulse?${next.toString()}`, { scroll: false });
    },
    [router, sp],
  );

  const vendor = sp.get("vendor") ?? "";
  const modality = sp.get("modality") ?? "";
  const priceMax = sp.get("priceMax") ?? "";
  const minContext = sp.get("minContext") ?? "";

  return (
    <div className="grid gap-4 border border-[var(--rule)] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Label>Vendor</Label>
        <select
          value={vendor}
          onChange={(e) => setParam("vendor", e.target.value || null)}
          className="mono border border-[var(--rule)] bg-transparent px-2 py-1 text-xs"
        >
          <option value="">all ({vendors.length})</option>
          {vendors.map((v) => (
            <option key={v} value={v}>
              {vendorLabel(v)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Label>Modality</Label>
        <ChipGroup
          value={modality}
          options={[
            { id: "", label: "all" },
            { id: "text", label: "text" },
            { id: "multimodal", label: "multimodal" },
          ]}
          onChange={(v) => setParam("modality", v || null)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Label>Prompt $/Mtok</Label>
        <ChipGroup
          value={priceMax}
          options={[{ id: "", label: "any" }, ...PRICE_TIERS.map((t) => ({ id: t.id, label: t.label }))]}
          onChange={(v) => setParam("priceMax", v || null)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Label>Context</Label>
        <ChipGroup
          value={minContext}
          options={[{ id: "", label: "any" }, ...CTX_TIERS.map((t) => ({ id: t.id, label: t.label }))]}
          onChange={(v) => setParam("minContext", v || null)}
        />
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono w-28 text-[10px] uppercase tracking-widest text-[var(--mute)]">
      {children}
    </span>
  );
}

function ChipGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: ReadonlyArray<{ id: string; label: string }>;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id || "all"}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "mono border px-2 py-1 text-[11px] uppercase tracking-widest transition-colors",
              active
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                : "border-[var(--rule)] text-[var(--mute)] hover:text-[var(--foreground)]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Implement table component**

Create `apps/web/components/pulse/pulse-table.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { OpenRouterModel } from "@/lib/data/external/openrouter";
import { vendorLabel } from "@/lib/data/vendors";
import { cn } from "@/lib/utils";

interface Props {
  models: ReadonlyArray<OpenRouterModel>;
}

type SortKey = "vendor" | "context" | "prompt" | "completion" | "modality" | "updated";

const SORT_HEADERS: Array<{ id: SortKey; label: string; align?: "right" }> = [
  { id: "vendor", label: "Vendor" },
  { id: "context", label: "Context", align: "right" },
  { id: "prompt", label: "In $/Mtok", align: "right" },
  { id: "completion", label: "Out $/Mtok", align: "right" },
  { id: "modality", label: "Modality" },
  { id: "updated", label: "Updated" },
];

const PRICE_MAX: Record<string, number> = { free: 0, "1": 1, "5": 5, "20": 20 };
const CTX_MIN: Record<string, number> = { "32": 32, "128": 128, "1m": 1000 };

export function PulseTable({ models }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const vendor = sp.get("vendor") ?? "";
  const modality = sp.get("modality") ?? "";
  const priceMax = sp.get("priceMax") ?? "";
  const minContext = sp.get("minContext") ?? "";
  const sort = (sp.get("sort") as SortKey | null) ?? "prompt";
  const dir = (sp.get("dir") as "asc" | "desc" | null) ?? "asc";

  const filtered = useMemo(() => {
    return models.filter((m) => {
      if (vendor && m.vendor !== vendor) return false;
      if (modality && m.modality !== modality) return false;
      if (priceMax) {
        const cap = PRICE_MAX[priceMax];
        if (cap === 0) {
          if ((m.promptUSDPerMtok ?? 1) > 0) return false;
        } else if ((m.promptUSDPerMtok ?? Infinity) >= cap) return false;
      }
      if (minContext) {
        const min = CTX_MIN[minContext] ?? 0;
        if ((m.contextK ?? 0) < min) return false;
      }
      return true;
    });
  }, [models, vendor, modality, priceMax, minContext]);

  const sorted = useMemo(() => {
    const arr = filtered.slice();
    arr.sort((a, b) => compareBy(a, b, sort) * (dir === "asc" ? 1 : -1));
    return arr;
  }, [filtered, sort, dir]);

  const onHeaderClick = (key: SortKey) => {
    const nextDir = sort === key ? (dir === "asc" ? "desc" : "asc") : "asc";
    const next = new URLSearchParams(sp.toString());
    next.set("sort", key);
    next.set("dir", nextDir);
    router.replace(`/pulse?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="overflow-x-auto border-y border-[var(--rule)]">
      <table className="tnum w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--rule)] text-left">
            <th className="mono py-2 pl-3 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
              Model
            </th>
            {SORT_HEADERS.map((h) => (
              <th
                key={h.id}
                className={cn(
                  "mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]",
                  h.align === "right" && "text-right",
                )}
              >
                <button
                  type="button"
                  onClick={() => onHeaderClick(h.id)}
                  className={cn(
                    "inline-flex items-center gap-1 hover:text-[var(--foreground)]",
                    sort === h.id && "text-[var(--foreground)]",
                  )}
                >
                  {h.label}
                  {sort === h.id && <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-sm text-[var(--mute)]">
                No models match those filters.
              </td>
            </tr>
          ) : (
            sorted.map((m) => (
              <tr key={m.id} className="border-b border-[var(--rule)]/60">
                <td className="mono py-2 pl-3 pr-4">
                  <span className="font-medium">{m.displayName}</span>
                  <span className="ml-2 text-[10px] uppercase tracking-widest text-[var(--mute)]">
                    {m.id}
                  </span>
                </td>
                <td className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
                  {vendorLabel(m.vendor)}
                </td>
                <td className="mono py-2 pr-4 text-right">
                  {m.contextK ? formatK(m.contextK) : "—"}
                </td>
                <td className="mono py-2 pr-4 text-right">
                  {fmtPrice(m.promptUSDPerMtok)}
                </td>
                <td className="mono py-2 pr-4 text-right">
                  {fmtPrice(m.completionUSDPerMtok)}
                </td>
                <td className="mono py-2 pr-4 text-xs uppercase tracking-widest">
                  {m.modality}
                </td>
                <td className="mono py-2 pr-3 text-xs text-[var(--mute)]">
                  {m.createdAt ?? "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function compareBy(a: OpenRouterModel, b: OpenRouterModel, key: SortKey): number {
  switch (key) {
    case "vendor":
      return a.vendor.localeCompare(b.vendor);
    case "context":
      return (a.contextK ?? -1) - (b.contextK ?? -1);
    case "prompt":
      return (a.promptUSDPerMtok ?? Infinity) - (b.promptUSDPerMtok ?? Infinity);
    case "completion":
      return (a.completionUSDPerMtok ?? Infinity) - (b.completionUSDPerMtok ?? Infinity);
    case "modality":
      return a.modality.localeCompare(b.modality);
    case "updated":
      return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
  }
}

function fmtPrice(n: number | null): string {
  if (n == null) return "—";
  if (n === 0) return "free";
  if (n < 1) return n.toFixed(2);
  return n.toFixed(2);
}

function formatK(k: number): string {
  if (k >= 1000) return `${(k / 1000).toFixed(1)}M`;
  return `${k}k`;
}
```

- [ ] **Step 3: Typecheck**

```bash
cd D:/Projects/benchmark && bun run typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
cd D:/Projects/benchmark && git add apps/web/components/pulse && git commit -m "feat(pulse): table + filters with URL state"
```

---

## Task 5: `/pulse` page (server) + nav entry

**Files:**
- Create: `apps/web/app/pulse/page.tsx`
- Modify: `apps/web/lib/config/site.ts`

- [ ] **Step 1: Implement the page**

Create `apps/web/app/pulse/page.tsx`:

```tsx
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { TrendingModels } from "@/components/home/trending-models";
import { PulseStats } from "@/components/pulse/pulse-stats";
import { PulseFilters } from "@/components/pulse/pulse-filters";
import { PulseTable } from "@/components/pulse/pulse-table";
import { loadPulseSnapshot } from "@/lib/data/external/pulse";

export const metadata = { title: "Live pulse" };
export const revalidate = 1800;

export default async function PulsePage() {
  const snap = await loadPulseSnapshot();
  const vendors = Array.from(new Set(snap.models.map((m) => m.vendor)))
    .filter(Boolean)
    .sort();

  return (
    <Container width="wide" className="py-12 md:py-16">
      <header className="mb-8 grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-end">
        <div>
          <Eyebrow>Live pulse, issue 04.25</Eyebrow>
          <h1 className="display mt-3 text-4xl tracking-tight md:text-6xl">
            Every model, one shelf.
          </h1>
        </div>
        <p className="max-w-prose text-sm text-[var(--mute)]">
          Live snapshot of {snap.models.length} models from OpenRouter and the
          Hugging Face Hub. Updated{" "}
          <time dateTime={snap.updatedAt} className="mono">
            {snap.updatedAt.slice(0, 16).replace("T", " ")}
          </time>
          {" "}UTC. Sources:{" "}
          <SourceBadge label="openrouter" status={snap.sources.or} />{" "}
          <SourceBadge label="huggingface" status={snap.sources.hf} />.
        </p>
      </header>

      <PulseStats snap={snap} />

      <Rule weight="hair" className="my-8" />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="grid gap-4">
          <PulseFilters vendors={vendors} />
          <PulseTable models={snap.models} />
        </section>

        <aside className="grid gap-4">
          <header>
            <Eyebrow>Trending on HF</Eyebrow>
          </header>
          <TrendingModels models={snap.hf.slice(0, 6)} />
        </aside>
      </div>

      <Rule weight="hair" className="my-10" />

      <footer className="grid gap-3 text-xs text-[var(--mute)]">
        <p className="mono uppercase tracking-widest">Sources</p>
        <ul className="grid gap-1">
          <li>
            <a
              href="https://openrouter.ai/api/v1/models"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[var(--rule)] underline-offset-2"
            >
              openrouter.ai/api/v1/models
            </a>
            {" — context, pricing, modality."}
          </li>
          <li>
            <a
              href="https://huggingface.co/models?sort=trending"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[var(--rule)] underline-offset-2"
            >
              huggingface.co/api/models
            </a>
            {" — trending open-weights."}
          </li>
        </ul>
        <p>
          See{" "}
          <Link href="/methodology" className="underline">
            methodology
          </Link>{" "}
          for caveats. Numbers refresh every 30 min via Next.js ISR.
        </p>
      </footer>
    </Container>
  );
}

function SourceBadge({
  label,
  status,
}: {
  label: string;
  status: "live" | "fallback";
}) {
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

- [ ] **Step 2: Add Pulse to NAV**

Modify `apps/web/lib/config/site.ts`. Replace the `NAV` and `NAV_PRIMARY_HREFS` blocks with:

```ts
export const NAV = [
  { href: "/", label: "Overview" },
  { href: "/pulse", label: "Pulse" },
  { href: "/compare", label: "Compare" },
  { href: "/benchmarks", label: "Tape" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/models", label: "Models" },
  { href: "/vendors", label: "Vendors" },
  { href: "/test-yourself", label: "Run it" },
  { href: "/methodology", label: "Methodology" },
] as const;

export const NAV_PRIMARY_HREFS = [
  "/pulse",
  "/compare",
  "/benchmarks",
  "/leaderboard",
  "/tasks",
  "/test-yourself",
] as const;
```

- [ ] **Step 3: Typecheck + lint**

```bash
cd D:/Projects/benchmark && bun run typecheck && bun run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Commit**

```bash
cd D:/Projects/benchmark && git add apps/web/app/pulse apps/web/lib/config/site.ts && git commit -m "feat(pulse): /pulse page + nav entry"
```

---

## Task 6: Task templates data

**Files:**
- Create: `apps/web/lib/data/task-templates.ts`

- [ ] **Step 1: Create template data**

Create `apps/web/lib/data/task-templates.ts`:

```ts
export interface TaskTemplate {
  slug: string;
  title: string;
  category: string;
  body: string;
  rubric: string;
}

export const TASK_TEMPLATES: ReadonlyArray<TaskTemplate> = Object.freeze([
  {
    slug: "long-context-needle",
    title: "Long-context needle in haystack",
    category: "long-context",
    body:
      "You are given the following 80k-token document. Answer one factual question " +
      "that depends on a single sentence buried in the middle. Cite the page number.\n\n" +
      "[paste your document here]\n\n" +
      "Question: [your needle question]",
    rubric:
      "- Correct fact recovered (yes/no).\n" +
      "- Page citation accurate.\n" +
      "- No hallucinated quote.",
  },
  {
    slug: "code-review-rubric",
    title: "PR review on a real diff",
    category: "code",
    body:
      "Review the following diff. List bugs, security issues, and suggested " +
      "improvements. Quote line numbers.\n\n" +
      "[paste diff here]",
    rubric:
      "- All real bugs flagged.\n" +
      "- No false positives that block valid code.\n" +
      "- Severity tagging present.",
  },
  {
    slug: "math-multistep",
    title: "Multi-step math word problem",
    category: "math",
    body:
      "Solve step by step. Show working. Final numeric answer on the last line.\n\n" +
      "[paste problem]",
    rubric:
      "- Final answer matches key.\n" +
      "- All intermediate steps justified.\n" +
      "- No arithmetic slips.",
  },
]);
```

- [ ] **Step 2: Commit**

```bash
cd D:/Projects/benchmark && git add apps/web/lib/data/task-templates.ts && git commit -m "feat(tasks): starter task templates"
```

---

## Task 7: Fill `/tasks/new` (sidebar + prefill)

**Files:**
- Modify: `apps/web/app/tasks/new/page.tsx`
- Modify: `apps/web/app/tasks/new/new-task-form.tsx`

- [ ] **Step 1: Update form to accept defaults**

Replace the entire content of `apps/web/app/tasks/new/new-task-form.tsx` with:

```tsx
"use client";
import { useActionState } from "react";
import { createTaskAction } from "../actions";

type Cat = { id: string; label: string };

export interface NewTaskDefaults {
  slug?: string;
  title?: string;
  category?: string;
  body?: string;
  rubric?: string;
}

export function NewTaskForm({
  categories,
  defaults = {},
}: {
  categories: Cat[];
  defaults?: NewTaskDefaults;
}) {
  const [state, action, pending] = useActionState(createTaskAction, null);
  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        Slug
        <input
          name="slug"
          required
          minLength={3}
          maxLength={64}
          pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
          placeholder="long-context-needle"
          defaultValue={defaults.slug ?? ""}
          className="mono border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Title
        <input
          name="title"
          required
          minLength={3}
          maxLength={120}
          defaultValue={defaults.title ?? ""}
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Category
        <select
          name="category"
          required
          defaultValue={defaults.category ?? ""}
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Visibility
        <select
          name="visibility"
          defaultValue="public"
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted (only people with the link)</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Prompt body (markdown)
        <textarea
          name="body_md"
          required
          minLength={10}
          maxLength={20000}
          rows={10}
          defaultValue={defaults.body ?? ""}
          className="mono border border-[var(--rule)] bg-transparent px-2 py-1.5 text-sm"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Rubric / what to look for (markdown, optional)
        <textarea
          name="rubric_md"
          maxLength={10000}
          rows={5}
          defaultValue={defaults.rubric ?? ""}
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5 text-sm"
        />
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="justify-self-start border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-[var(--paper)] disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create task"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Update page with sidebar + searchParams prefill**

Replace `apps/web/app/tasks/new/page.tsx` with:

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { getUser } from "@/lib/auth/session";
import { listCategories } from "@/lib/db/queries/models";
import { listPublicTasks } from "@/lib/db/queries/tasks";
import { TASK_TEMPLATES } from "@/lib/data/task-templates";
import { NewTaskForm } from "./new-task-form";

export const metadata = { title: "New task" };

type Search = Promise<{
  slug?: string;
  title?: string;
  category?: string;
  template?: string;
}>;

export default async function NewTaskPage({ searchParams }: { searchParams: Search }) {
  const user = await getUser();
  if (!user) redirect("/sign-in?next=/tasks/new");
  const sp = await searchParams;
  const [categories, recent] = await Promise.all([
    listCategories(),
    listPublicTasks({ limit: 3 }).catch(() => []),
  ]);

  const tpl = sp.template
    ? TASK_TEMPLATES.find((t) => t.slug === sp.template)
    : undefined;

  const defaults = {
    slug: sp.slug ?? tpl?.slug,
    title: sp.title ?? tpl?.title,
    category: sp.category ?? tpl?.category,
    body: tpl?.body,
    rubric: tpl?.rubric,
  };

  return (
    <Container width="wide" className="py-12">
      <header className="mb-8">
        <Eyebrow>New benchmark task</Eyebrow>
        <h1 className="display mt-3 text-3xl tracking-tight md:text-4xl">
          Post a prompt the community can run.
        </h1>
      </header>

      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <NewTaskForm categories={categories} defaults={defaults} />

        <aside className="grid gap-6">
          <Card title="Slug rules">
            <ul className="mono grid gap-1 text-[11px] uppercase tracking-widest text-[var(--mute)]">
              <li>lowercase letters, digits, dashes</li>
              <li>3 to 64 characters</li>
              <li>cannot start or end with a dash</li>
              <li>must be unique site-wide</li>
            </ul>
          </Card>

          <Card title="Rubric tips">
            <ul className="grid gap-1 text-sm text-[var(--mute)]">
              <li>Name what counts as evidence (URL, screenshot, log).</li>
              <li>List 3 to 5 yes/no checks instead of a paragraph.</li>
              <li>Be explicit about partial credit.</li>
            </ul>
          </Card>

          <Card title="Templates">
            <ul className="grid gap-2">
              {TASK_TEMPLATES.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/tasks/new?template=${t.slug}`}
                    className="mono text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {recent.length > 0 && (
            <Card title="Recently posted">
              <ul className="grid gap-2">
                {recent.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/tasks/${r.slug}`}
                      className="mono text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </Container>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-[var(--rule)] p-5">
      <p className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
cd D:/Projects/benchmark && bun run typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
cd D:/Projects/benchmark && git add apps/web/app/tasks/new && git commit -m "feat(tasks): /tasks/new sidebar with tips, templates, recent"
```

---

## Task 8: Fill `/tasks` empty state + filter chips

**Files:**
- Modify: `apps/web/app/tasks/page.tsx`

- [ ] **Step 1: Replace tasks page**

Replace `apps/web/app/tasks/page.tsx` with:

```tsx
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { listPublicTasks } from "@/lib/db/queries/tasks";
import { listCategories } from "@/lib/db/queries/models";
import { getUser } from "@/lib/auth/session";
import { TASK_TEMPLATES } from "@/lib/data/task-templates";
import { cn } from "@/lib/utils";

export const metadata = { title: "Tasks" };
export const dynamic = "force-dynamic";

type Search = Promise<{ category?: string }>;

export default async function TasksPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const activeCategory = sp.category?.trim() || undefined;

  const [allTasks, user, categories] = await Promise.all([
    listPublicTasks({ limit: 200 }),
    getUser(),
    listCategories().catch(() => []),
  ]);

  const tasks = activeCategory
    ? allTasks.filter((t) => t.category === activeCategory)
    : allTasks;

  const categoryCount = new Set(allTasks.map((t) => t.category)).size;

  return (
    <Container width="wide" className="py-12">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <Eyebrow>Community tasks</Eyebrow>
          <h1 className="display mt-3 text-3xl tracking-tight md:text-4xl">
            Prompts anyone can run.
          </h1>
        </div>
        {user && (
          <Link
            href="/tasks/new"
            className="mono border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--paper)]"
          >
            New task
          </Link>
        )}
      </header>

      <section className="mb-6 grid grid-cols-3 gap-px border border-[var(--rule)] bg-[var(--rule)]">
        <Stat label="Tasks" value={allTasks.length} />
        <Stat label="Categories" value={categoryCount} />
        <Stat label="Showing" value={tasks.length} hint={activeCategory ?? "all"} />
      </section>

      {categories.length > 0 && (
        <nav aria-label="Filter by category" className="mb-6 flex flex-wrap gap-1">
          <CategoryChip href="/tasks" label="all" active={!activeCategory} />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              href={`/tasks?category=${encodeURIComponent(c.id)}`}
              label={c.label}
              active={activeCategory === c.id}
            />
          ))}
        </nav>
      )}

      {tasks.length === 0 ? (
        <EmptyState user={!!user} />
      ) : (
        <ul className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 py-3"
            >
              <Link href={`/tasks/${t.slug}`} className="hover:text-[var(--accent)]">
                <div className="font-medium">{t.title}</div>
                <div className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
                  {t.slug}
                </div>
              </Link>
              <span className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
                {t.category}
              </span>
              <time
                className="mono text-xs text-[var(--mute)]"
                dateTime={t.created_at}
              >
                {new Date(t.created_at).toISOString().slice(0, 10)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="bg-[var(--background)] p-4">
      <p className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">{label}</p>
      <p className="figure mt-2 text-3xl tabular-nums">{value}</p>
      {hint && (
        <p className="mono mt-0.5 text-[10px] uppercase tracking-widest text-[var(--mute)]">
          {hint}
        </p>
      )}
    </div>
  );
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "mono border px-2 py-1 text-[11px] uppercase tracking-widest transition-colors",
        active
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
          : "border-[var(--rule)] text-[var(--mute)] hover:text-[var(--foreground)]",
      )}
    >
      {label}
    </Link>
  );
}

function EmptyState({ user }: { user: boolean }) {
  return (
    <div className="grid gap-6">
      <p className="text-sm text-[var(--mute)]">
        No tasks yet. Start with one of these templates, or write your own.
      </p>
      <Rule weight="hair" />
      <ul className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
        {TASK_TEMPLATES.map((t) => (
          <li
            key={t.slug}
            className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 py-3 text-[var(--mute)]"
          >
            <div>
              <div className="font-medium">{t.title}</div>
              <div className="mono text-xs uppercase tracking-widest">{t.slug}</div>
            </div>
            <span className="mono text-xs uppercase tracking-widest">{t.category}</span>
            {user ? (
              <Link
                href={`/tasks/new?template=${t.slug}`}
                className="mono text-xs uppercase tracking-widest underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
              >
                Use as template →
              </Link>
            ) : (
              <Link
                href={`/sign-in?next=/tasks/new?template=${t.slug}`}
                className="mono text-xs uppercase tracking-widest underline decoration-[var(--rule)] underline-offset-4"
              >
                Sign in →
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd D:/Projects/benchmark && bun run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
cd D:/Projects/benchmark && git add apps/web/app/tasks/page.tsx && git commit -m "feat(tasks): stats, category chips, template empty state"
```

---

## Task 9: Fill `/tasks/[slug]` empty-runs sidecar

**Files:**
- Modify: `apps/web/app/tasks/[slug]/page.tsx`

- [ ] **Step 1: Update empty-runs block**

In `apps/web/app/tasks/[slug]/page.tsx`, find the block:

```tsx
        {runs.length === 0 ? (
          <p className="text-sm text-[var(--mute)]">No runs yet.</p>
        ) : (
```

Replace it with:

```tsx
        {runs.length === 0 ? (
          <div className="grid gap-4 border border-[var(--rule)] p-5">
            <p className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
              How to submit
            </p>
            <ol className="grid gap-2 text-sm">
              <li>
                <span className="mono text-[var(--accent)]">01</span>{" "}
                Pick a model from the local registry on the right.
              </li>
              <li>
                <span className="mono text-[var(--accent)]">02</span>{" "}
                Run the prompt on{" "}
                <Link href="/test-yourself" className="underline">a public playground</Link>{" "}
                and paste the output URL or screenshot.
              </li>
              <li>
                <span className="mono text-[var(--accent)]">03</span>{" "}
                Score the run against the rubric and submit.
              </li>
            </ol>
          </div>
        ) : (
```

- [ ] **Step 2: Typecheck + lint**

```bash
cd D:/Projects/benchmark && bun run typecheck && bun run lint
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
cd D:/Projects/benchmark && git add apps/web/app/tasks/[slug]/page.tsx && git commit -m "feat(tasks): how-to-submit sidecar on empty task"
```

---

## Task 10: Final verification

- [ ] **Step 1: Full verification sweep**

```bash
cd D:/Projects/benchmark && bun run typecheck && bun run lint && bun run test && bun run build
```

Expected: every command exit 0, all tests pass, build succeeds.

- [ ] **Step 2: Manual smoke test**

```bash
cd D:/Projects/benchmark && bun run dev
```

Open in browser:
1. `http://localhost:3000/pulse` — verify table populates, filters update URL, sort arrows work, source badges show `live` (or `cached` if APIs unreachable).
2. `http://localhost:3000/tasks/new` (signed-in) — verify two-column layout, sidebar shows slug rules, rubric tips, templates, recent.
3. `http://localhost:3000/tasks/new?template=long-context-needle` — verify form prefilled.
4. `http://localhost:3000/tasks` — verify stat row, category chips, empty-state templates render.
5. `http://localhost:3000/tasks/<existing-slug>` for a task with no runs — verify 3-step sidecar shows.
6. `http://localhost:3000/` — confirm header nav now lists Pulse and existing pages still render.

- [ ] **Step 3: Offline-resilience check for `/pulse`**

In dev tools, set network to `Offline`. Hard-reload `/pulse`. Verify:
- Page still renders the fallback table.
- Source badges show `cached` for both `openrouter` and `huggingface`.
- No client-side error overlays.

- [ ] **Step 4: Commit any final fixes**

If smoke tests revealed issues, fix them and commit:

```bash
cd D:/Projects/benchmark && git add -A && git commit -m "fix(pulse): smoke-test corrections"
```

If clean, push:

```bash
cd D:/Projects/benchmark && git push
```

---

## Self-review notes

- All spec sections covered: pulse fetcher (Task 1), pulse loader (Task 2), pulse stats (Task 3), pulse table + filters (Task 4), pulse page + nav (Task 5), task templates (Task 6), `/tasks/new` sidebar + prefill (Task 7), `/tasks` chips + empty state (Task 8), `/tasks/[slug]` empty-runs sidecar (Task 9), full verification (Task 10).
- Type names are consistent across tasks: `OpenRouterModel`, `PulseSnapshot`, `TaskTemplate`, `NewTaskDefaults`.
- Function names are consistent: `fetchOpenRouterModels`, `loadPulseSnapshot`.
- No placeholders. Every code step contains complete code.
- Resilience contract enforced: Zod parse + try/catch + fallback in fetcher (Task 1) and `Promise.allSettled` in loader (Task 2).
- No env vars required.
- No regressions: only thin pages and nav are modified. Other routes untouched.
