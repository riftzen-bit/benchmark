# LLM Benchmark Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-only Next.js 15 single-domain benchmark site comparing Claude Opus 4.7 vs GPT-5.5, sourced entirely from real published numbers, with a "test yourself" prompt library that links out to free public playgrounds (no API keys required).

**Architecture:** Next.js 15 App Router (RSC where possible), Tailwind v4 design tokens, shadcn/ui primitives only, all data in typed/Zod-validated TS modules under `lib/data/`. No backend, no fetch at runtime, no auth, no DB. Static-export friendly. Bun preferred runtime (Windows supported); fall back to npm if a Bun-specific issue surfaces and report it.

**Tech Stack:** Next.js 15.x, React 19, TypeScript 5.x strict, Tailwind v4, shadcn/ui, Zod 3.x, lucide-react, next-themes, Vitest + Testing Library (utils + schemas), Inter Tight + JetBrains Mono fonts.

**Spec:** `docs/superpowers/specs/2026-04-25-llm-benchmark-site-design.md`

---

## File Structure

```
benchmark/
  app/
    layout.tsx                       # root shell, fonts, providers
    page.tsx                         # / home
    globals.css                      # @theme tokens, base styles
    benchmarks/page.tsx              # /benchmarks
    test-yourself/page.tsx           # /test-yourself
    methodology/page.tsx             # /methodology
    not-found.tsx
  components/
    benchmark/
      benchmark-table.tsx            # client, sort/filter
      score-bar.tsx                  # 2-tone bar
      score-cell.tsx                 # number + delta + cite
      summary-card.tsx               # category winner
      category-filter.tsx            # segmented control
      source-cite.tsx                # superscript ref
    prompt/
      prompt-card.tsx                # title + body + actions
      copy-button.tsx                # client, clipboard
      playground-link.tsx            # outbound w/ icon
    layout/
      header.tsx
      footer.tsx
      theme-provider.tsx             # next-themes wrapper
      theme-toggle.tsx
    ui/                              # shadcn primitives (added on demand)
  lib/
    data/
      benchmarks.ts                  # validated dataset
      prompts.ts                     # curated prompts
      playgrounds.ts                 # outbound links
      sources.ts                     # citation registry
      meta.ts                        # site meta, lastUpdated
    schema/
      benchmark.ts                   # Zod schemas + types
      prompt.ts
    utils/
      delta.ts                       # winner / delta calc
      fmt.ts                         # number formatting
  tests/
    schema/benchmark.test.ts
    schema/prompt.test.ts
    utils/delta.test.ts
    utils/fmt.test.ts
  docs/superpowers/{specs,plans}/    # already exists
  public/                            # favicon only
  README.md
  next.config.ts
  tsconfig.json
  components.json                    # shadcn config
  package.json
  bun.lockb (or package-lock.json)
  vitest.config.ts
  .gitignore
```

---

### Task 1: Bootstrap project

**Files:**
- Create: `D:\Projects\benchmark\package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`, `README.md`
- Create: `components.json`

- [ ] **Step 1: Init git repo**

```bash
git init
git config user.email "ariawells48@gmail.com"
git config user.name "Aria Wells"
```

- [ ] **Step 2: Scaffold Next.js 15 with Bun**

Run from `D:\Projects\benchmark`:
```bash
bun create next-app@latest . --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack --use-bun
```

When prompted to overwrite, allow. The directory currently contains only `docs/`. Confirm Next 15 in `package.json` (`"next": "^15"`); if older version, run `bun add next@latest react@latest react-dom@latest`.

If `bun create` fails on Windows, fall back to:
```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```
Then `bun install` to lock with Bun.

- [ ] **Step 3: Verify dev server**

```bash
bun run dev
```
Expected: dev server boots on `http://localhost:3000`. Open in browser, see Next.js default page. Stop with Ctrl+C.

- [ ] **Step 4: Init shadcn**

```bash
bunx shadcn@latest init -d
```
Choose: Style = New York, Base color = Neutral, CSS variables = yes. Creates `components.json` and updates `app/globals.css` and `lib/utils.ts`.

- [ ] **Step 5: Install runtime deps**

```bash
bun add zod next-themes lucide-react clsx tailwind-merge
```

- [ ] **Step 6: Install dev deps for tests**

```bash
bun add -d vitest @vitest/ui @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom @types/node
```

- [ ] **Step 7: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 8: Add scripts to `package.json`**

In the `"scripts"` block, ensure these exist:
```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "next lint",
"typecheck": "tsc --noEmit",
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 9: Tighten `tsconfig.json`**

In `compilerOptions`, ensure:
```json
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"forceConsistentCasingInFileNames": true
```

- [ ] **Step 10: Verify build & typecheck**

```bash
bun run typecheck
bun run lint
bun run build
```
Expected: all three exit 0.

- [ ] **Step 11: Initial commit**

```bash
git add -A
git commit -m "chore: bootstrap Next 15 + Tailwind v4 + shadcn + Vitest"
```

---

### Task 2: Lock visual system (theme + fonts + base CSS)

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `components/layout/theme-provider.tsx`

- [ ] **Step 1: Replace `app/globals.css` body**

Open `app/globals.css`. Keep the `@import "tailwindcss";` line at top. Replace the rest with:

```css
@import "tailwindcss";
@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans: "Inter Tight", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;

  --color-paper: #FAFAF7;
  --color-ink: #0A0A0A;
  --color-rule: #E5E2DA;
  --color-mute: #6B6863;
  --color-accent: #C2410C;
  --color-opus: #0A0A0A;
  --color-gpt: #6B6863;

  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
}

:root {
  --background: var(--color-paper);
  --foreground: var(--color-ink);
  --rule: var(--color-rule);
  --mute: var(--color-mute);
  --accent: var(--color-accent);
}

.dark {
  --background: #0E0D0B;
  --foreground: #F0EDE6;
  --rule: #2A2824;
  --mute: #8C8780;
  --accent: #E07a3a;
}

* { border-color: var(--rule); }

html, body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.tnum, table, .num {
  font-feature-settings: "tnum" 1, "lnum" 1, "ss01" 1;
}

.mono { font-family: var(--font-mono); }
```

- [ ] **Step 2: Add fonts via `next/font` in `app/layout.tsx`**

Replace the imports at the top of `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";

const sans = Inter_Tight({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-sans-loaded",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-loaded",
});

export const metadata: Metadata = {
  title: "Opus 4.7 vs GPT-5.5 — Benchmark",
  description:
    "Benchmark đối chiếu Claude Opus 4.7 và GPT-5.5 bằng số liệu công khai, có trích nguồn.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create `components/layout/theme-provider.tsx`**

```tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}
```

- [ ] **Step 4: Replace `app/page.tsx` with placeholder**

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-24">
      <h1 className="text-5xl font-medium tracking-tight">Benchmark</h1>
      <p className="mt-4 text-[var(--mute)]">Bootstrap OK.</p>
    </main>
  );
}
```

- [ ] **Step 5: Verify**

```bash
bun run typecheck && bun run build
```
Expected: pass. Run `bun run dev`, open `localhost:3000`, see warm paper background, large editorial heading, no centered hero, no gradient.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(theme): lock editorial visual system, fonts, dark mode tokens"
```

---

### Task 3: Data schemas (Zod) — TDD

**Files:**
- Create: `lib/schema/benchmark.ts`, `lib/schema/prompt.ts`
- Create: `tests/schema/benchmark.test.ts`, `tests/schema/prompt.test.ts`

- [ ] **Step 1: Write failing test `tests/schema/benchmark.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { BenchmarkRowSchema, BenchmarkCategory } from "@/lib/schema/benchmark";

describe("BenchmarkRowSchema", () => {
  it("accepts a complete row", () => {
    const row = {
      id: "swe-bench-verified",
      label: "SWE-bench Verified",
      category: "coding" as const,
      opus: 87.6,
      gpt: 85.0,
      unit: "%" as const,
      sourceIds: ["vellum"],
      capturedAt: "2026-04-25",
      higherIsBetter: true,
    };
    expect(BenchmarkRowSchema.parse(row)).toMatchObject({ id: "swe-bench-verified" });
  });

  it("accepts null for missing model score", () => {
    const row = {
      id: "gdpval",
      label: "GDPval",
      category: "agent" as const,
      opus: null,
      gpt: 84.9,
      unit: "%" as const,
      sourceIds: ["openai-release"],
      capturedAt: "2026-04-25",
      higherIsBetter: true,
    };
    expect(() => BenchmarkRowSchema.parse(row)).not.toThrow();
  });

  it("rejects unknown category", () => {
    expect(() =>
      BenchmarkRowSchema.parse({
        id: "x",
        label: "X",
        category: "bogus",
        opus: 1,
        gpt: 1,
        unit: "%",
        sourceIds: ["a"],
        capturedAt: "2026-04-25",
        higherIsBetter: true,
      }),
    ).toThrow();
  });

  it("exposes the BenchmarkCategory enum values", () => {
    expect(BenchmarkCategory.options).toContain("coding");
    expect(BenchmarkCategory.options).toContain("reasoning");
  });
});
```

- [ ] **Step 2: Run test, expect failure**

```bash
bun run test
```
Expected: FAIL — module `@/lib/schema/benchmark` does not exist.

- [ ] **Step 3: Implement `lib/schema/benchmark.ts`**

```ts
import { z } from "zod";

export const BenchmarkCategory = z.enum([
  "coding",
  "reasoning",
  "math",
  "agent",
  "vision",
  "multilingual",
  "knowledge",
  "safety",
  "speed",
  "price",
]);
export type BenchmarkCategory = z.infer<typeof BenchmarkCategory>;

export const BenchmarkRowSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: BenchmarkCategory,
  opus: z.number().nullable(),
  gpt: z.number().nullable(),
  unit: z.enum(["%", "elo", "tok/s", "$/Mtok", "ms", "k"]),
  sourceIds: z.array(z.string().min(1)).min(1),
  capturedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  higherIsBetter: z.boolean(),
  note: z.string().optional(),
});
export type BenchmarkRow = z.infer<typeof BenchmarkRowSchema>;

export const SourceSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string().url(),
  publisher: z.string(),
  capturedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type Source = z.infer<typeof SourceSchema>;
```

- [ ] **Step 4: Run test, expect pass**

```bash
bun run test
```
Expected: PASS.

- [ ] **Step 5: Write failing test `tests/schema/prompt.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { PromptSchema } from "@/lib/schema/prompt";

describe("PromptSchema", () => {
  it("accepts a valid prompt", () => {
    expect(() =>
      PromptSchema.parse({
        id: "long-context-recall",
        title: "Long-context fact retrieval",
        category: "reasoning",
        difficulty: "hard",
        body: "Given this 200k-token document, find the line that mentions ...",
        watchFor: ["Cites the right line", "Does not hallucinate adjacent text"],
        playgroundIds: ["lmarena", "duckai"],
      }),
    ).not.toThrow();
  });

  it("rejects empty body", () => {
    expect(() =>
      PromptSchema.parse({
        id: "x",
        title: "x",
        category: "coding",
        difficulty: "easy",
        body: "",
        watchFor: [],
        playgroundIds: ["lmarena"],
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 6: Implement `lib/schema/prompt.ts`**

```ts
import { z } from "zod";

export const PromptDifficulty = z.enum(["easy", "medium", "hard", "extreme"]);
export const PromptCategory = z.enum([
  "coding",
  "reasoning",
  "math",
  "agent",
  "vision",
  "multilingual",
  "long-context",
  "creative",
  "debug",
  "planning",
]);

export const PromptSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: PromptCategory,
  difficulty: PromptDifficulty,
  body: z.string().min(1),
  watchFor: z.array(z.string()),
  playgroundIds: z.array(z.string()).min(1),
});
export type Prompt = z.infer<typeof PromptSchema>;

export const PlaygroundSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string().url(),
  needsAccount: z.boolean(),
  models: z.array(z.enum(["opus-4-7", "gpt-5-5", "both", "anonymous"])),
  note: z.string().optional(),
});
export type Playground = z.infer<typeof PlaygroundSchema>;
```

- [ ] **Step 7: Run all tests**

```bash
bun run test
```
Expected: PASS, 6 tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(schema): add Zod schemas for benchmarks, sources, prompts, playgrounds"
```

---

### Task 4: Utility functions (delta + fmt) — TDD

**Files:**
- Create: `lib/utils/delta.ts`, `lib/utils/fmt.ts`
- Create: `tests/utils/delta.test.ts`, `tests/utils/fmt.test.ts`

- [ ] **Step 1: Write `tests/utils/delta.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { winnerOf, deltaOf } from "@/lib/utils/delta";

describe("winnerOf", () => {
  it("returns 'opus' when opus higher and higher is better", () => {
    expect(winnerOf({ opus: 90, gpt: 80, higherIsBetter: true })).toBe("opus");
  });
  it("returns 'gpt' when gpt higher and higher is better", () => {
    expect(winnerOf({ opus: 70, gpt: 80, higherIsBetter: true })).toBe("gpt");
  });
  it("returns 'tie' when within 0.5 absolute units", () => {
    expect(winnerOf({ opus: 80.0, gpt: 80.4, higherIsBetter: true })).toBe("tie");
  });
  it("inverts when higher is worse (e.g. price)", () => {
    expect(winnerOf({ opus: 25, gpt: 30, higherIsBetter: false })).toBe("opus");
  });
  it("returns 'na' when either is null", () => {
    expect(winnerOf({ opus: null, gpt: 80, higherIsBetter: true })).toBe("na");
  });
});

describe("deltaOf", () => {
  it("returns signed delta opus - gpt", () => {
    expect(deltaOf(87.6, 85)).toBeCloseTo(2.6, 5);
  });
  it("returns null if either side missing", () => {
    expect(deltaOf(null, 80)).toBeNull();
    expect(deltaOf(80, null)).toBeNull();
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
bun run test tests/utils/delta.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement `lib/utils/delta.ts`**

```ts
export type Winner = "opus" | "gpt" | "tie" | "na";

const TIE_THRESHOLD = 0.5;

export function winnerOf(args: {
  opus: number | null;
  gpt: number | null;
  higherIsBetter: boolean;
}): Winner {
  const { opus, gpt, higherIsBetter } = args;
  if (opus === null || gpt === null) return "na";
  if (Math.abs(opus - gpt) <= TIE_THRESHOLD) return "tie";
  const opusBetter = higherIsBetter ? opus > gpt : opus < gpt;
  return opusBetter ? "opus" : "gpt";
}

export function deltaOf(opus: number | null, gpt: number | null): number | null {
  if (opus === null || gpt === null) return null;
  return opus - gpt;
}
```

- [ ] **Step 4: Run, expect pass**

```bash
bun run test tests/utils/delta.test.ts
```
Expected: PASS.

- [ ] **Step 5: Write `tests/utils/fmt.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { formatScore, formatDelta, formatPrice } from "@/lib/utils/fmt";

describe("formatScore", () => {
  it("appends % unit", () => {
    expect(formatScore(87.6, "%")).toBe("87.6%");
  });
  it("renders 'n/a' for null", () => {
    expect(formatScore(null, "%")).toBe("n/a");
  });
  it("renders price with $/Mtok unit", () => {
    expect(formatScore(25, "$/Mtok")).toBe("$25.00 / Mtok");
  });
  it("renders elo without decimals", () => {
    expect(formatScore(1402, "elo")).toBe("1402");
  });
});

describe("formatDelta", () => {
  it("prefixes + for positive", () => {
    expect(formatDelta(2.6)).toBe("+2.6");
  });
  it("renders dash for null", () => {
    expect(formatDelta(null)).toBe("—");
  });
  it("renders 0.0 for tie", () => {
    expect(formatDelta(0)).toBe("0.0");
  });
});

describe("formatPrice", () => {
  it("formats per Mtok", () => {
    expect(formatPrice(5)).toBe("$5.00");
    expect(formatPrice(30)).toBe("$30.00");
  });
});
```

- [ ] **Step 6: Implement `lib/utils/fmt.ts`**

```ts
export type Unit = "%" | "elo" | "tok/s" | "$/Mtok" | "ms" | "k";

export function formatScore(value: number | null, unit: Unit): string {
  if (value === null) return "n/a";
  switch (unit) {
    case "%":
      return `${value.toFixed(1)}%`;
    case "elo":
      return `${Math.round(value)}`;
    case "tok/s":
      return `${value.toFixed(0)} tok/s`;
    case "$/Mtok":
      return `$${value.toFixed(2)} / Mtok`;
    case "ms":
      return `${Math.round(value)} ms`;
    case "k":
      return `${value.toFixed(0)}k`;
  }
}

export function formatDelta(delta: number | null): string {
  if (delta === null) return "—";
  if (delta === 0) return "0.0";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}`;
}

export function formatPrice(perMtok: number): string {
  return `$${perMtok.toFixed(2)}`;
}
```

- [ ] **Step 7: Run all tests**

```bash
bun run test
```
Expected: PASS (all suites).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(utils): winner/delta calc, score/delta/price formatting"
```

---

### Task 5: Source registry + dataset

**Files:**
- Create: `lib/data/sources.ts`, `lib/data/benchmarks.ts`, `lib/data/meta.ts`
- Create: `tests/data/benchmarks.test.ts`

- [ ] **Step 1: Create `lib/data/sources.ts`**

```ts
import { SourceSchema, type Source } from "@/lib/schema/benchmark";

const raw: Source[] = [
  {
    id: "anthropic-news",
    label: "Anthropic — Introducing Claude Opus 4.7",
    url: "https://www.anthropic.com/news/claude-opus-4-7",
    publisher: "Anthropic",
    capturedAt: "2026-04-25",
  },
  {
    id: "anthropic-docs",
    label: "Anthropic API — What's new in Claude Opus 4.7",
    url: "https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7",
    publisher: "Anthropic",
    capturedAt: "2026-04-25",
  },
  {
    id: "openai-release",
    label: "OpenAI — Introducing GPT-5.5",
    url: "https://openai.com/index/introducing-gpt-5-5/",
    publisher: "OpenAI",
    capturedAt: "2026-04-25",
  },
  {
    id: "openai-system-card",
    label: "OpenAI — GPT-5.5 System Card",
    url: "https://deploymentsafety.openai.com/gpt-5-5",
    publisher: "OpenAI",
    capturedAt: "2026-04-25",
  },
  {
    id: "vellum",
    label: "Vellum — Claude Opus 4.7 Benchmarks Explained",
    url: "https://www.vellum.ai/blog/claude-opus-4-7-benchmarks-explained",
    publisher: "Vellum",
    capturedAt: "2026-04-25",
  },
  {
    id: "mindwired",
    label: "MindwiredAI — GPT-5.5 vs Opus 4.7",
    url: "https://mindwiredai.com/2026/04/24/gpt-5-5-is-here-benchmarks-pricing-and-who-should-actually-upgrade-april-2026/",
    publisher: "MindwiredAI",
    capturedAt: "2026-04-25",
  },
  {
    id: "lushbinary",
    label: "Lushbinary — GPT-5.5 vs Claude Opus 4.7",
    url: "https://lushbinary.com/blog/gpt-5-5-vs-claude-opus-4-7-comparison-benchmarks-pricing/",
    publisher: "Lushbinary",
    capturedAt: "2026-04-25",
  },
  {
    id: "apiyi",
    label: "Apiyi — Claude Opus 4.7 Benchmark Review 2026",
    url: "https://help.apiyi.com/en/claude-opus-4-7-benchmark-review-2026-en.html",
    publisher: "Apiyi",
    capturedAt: "2026-04-25",
  },
];

export const SOURCES: ReadonlyArray<Source> = Object.freeze(
  raw.map((s) => SourceSchema.parse(s)),
);

export function sourceById(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}
```

- [ ] **Step 2: Create `lib/data/meta.ts`**

```ts
export const SITE_META = {
  title: "Opus 4.7 vs GPT-5.5",
  tagline: "Đối chiếu hai mô hình mạnh nhất tháng 4/2026 bằng số liệu công khai.",
  lastUpdated: "2026-04-25",
  models: {
    opus: {
      name: "Claude Opus 4.7",
      vendor: "Anthropic",
      releaseDate: "2026-04-16",
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      inputPrice: 5,
      outputPrice: 25,
      apiId: "claude-opus-4-7",
      sourceId: "anthropic-docs",
    },
    gpt: {
      name: "GPT-5.5",
      vendor: "OpenAI",
      releaseDate: "2026-04-23",
      contextWindow: 1_000_000,
      maxOutput: null,
      inputPrice: 5,
      outputPrice: 30,
      apiId: "gpt-5.5",
      sourceId: "openai-release",
    },
  },
} as const;
```

- [ ] **Step 3: Create `lib/data/benchmarks.ts`**

```ts
import { BenchmarkRowSchema, type BenchmarkRow } from "@/lib/schema/benchmark";

const raw: BenchmarkRow[] = [
  {
    id: "swe-bench-verified",
    label: "SWE-bench Verified",
    category: "coding",
    opus: 87.6,
    gpt: 85.0,
    unit: "%",
    sourceIds: ["vellum", "lushbinary"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
    note: "GPT-5.5 figure approximated by third-party comparison.",
  },
  {
    id: "swe-bench-pro",
    label: "SWE-bench Pro",
    category: "coding",
    opus: 64.3,
    gpt: 58.6,
    unit: "%",
    sourceIds: ["vellum", "mindwired"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "swe-bench-multilingual",
    label: "SWE-bench Multilingual",
    category: "coding",
    opus: 80.5,
    gpt: null,
    unit: "%",
    sourceIds: ["apiyi"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "terminal-bench-2",
    label: "Terminal-Bench 2.0",
    category: "agent",
    opus: 69.4,
    gpt: 82.7,
    unit: "%",
    sourceIds: ["vellum", "mindwired"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "osworld-verified",
    label: "OSWorld-Verified",
    category: "agent",
    opus: 78.0,
    gpt: 78.7,
    unit: "%",
    sourceIds: ["vellum", "mindwired"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "mcp-atlas",
    label: "MCP-Atlas",
    category: "agent",
    opus: 77.3,
    gpt: 75.3,
    unit: "%",
    sourceIds: ["vellum", "mindwired"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "browsecomp",
    label: "BrowseComp",
    category: "agent",
    opus: 79.3,
    gpt: 84.4,
    unit: "%",
    sourceIds: ["vellum", "mindwired"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "gpqa-diamond",
    label: "GPQA Diamond",
    category: "reasoning",
    opus: 94.2,
    gpt: 93.6,
    unit: "%",
    sourceIds: ["vellum", "mindwired"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "mmmlu",
    label: "MMMLU (multilingual)",
    category: "multilingual",
    opus: 91.5,
    gpt: 83.2,
    unit: "%",
    sourceIds: ["vellum", "mindwired"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "hle-no-tools",
    label: "Humanity's Last Exam (no tools)",
    category: "reasoning",
    opus: 46.9,
    gpt: 41.4,
    unit: "%",
    sourceIds: ["mindwired"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "hle-with-tools",
    label: "Humanity's Last Exam (with tools)",
    category: "reasoning",
    opus: 54.7,
    gpt: null,
    unit: "%",
    sourceIds: ["vellum"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "finance-agent-v11",
    label: "Finance Agent v1.1",
    category: "agent",
    opus: 64.4,
    gpt: 61.5,
    unit: "%",
    sourceIds: ["vellum", "mindwired"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "charxiv-no-tools",
    label: "CharXiv (no tools)",
    category: "vision",
    opus: 82.1,
    gpt: null,
    unit: "%",
    sourceIds: ["vellum"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "cybergym",
    label: "CyberGym",
    category: "agent",
    opus: 73.1,
    gpt: 81.8,
    unit: "%",
    sourceIds: ["mindwired"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "gdpval",
    label: "GDPval (knowledge work)",
    category: "knowledge",
    opus: null,
    gpt: 84.9,
    unit: "%",
    sourceIds: ["openai-release"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "tau2-telecom",
    label: "Tau2-bench Telecom",
    category: "agent",
    opus: null,
    gpt: 98.0,
    unit: "%",
    sourceIds: ["openai-release"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "officeqa-pro",
    label: "OfficeQA Pro",
    category: "knowledge",
    opus: null,
    gpt: 54.1,
    unit: "%",
    sourceIds: ["openai-release"],
    capturedAt: "2026-04-25",
    higherIsBetter: true,
  },
  {
    id: "input-price",
    label: "Input price",
    category: "price",
    opus: 5,
    gpt: 5,
    unit: "$/Mtok",
    sourceIds: ["anthropic-docs", "lushbinary"],
    capturedAt: "2026-04-25",
    higherIsBetter: false,
  },
  {
    id: "output-price",
    label: "Output price",
    category: "price",
    opus: 25,
    gpt: 30,
    unit: "$/Mtok",
    sourceIds: ["anthropic-docs", "lushbinary"],
    capturedAt: "2026-04-25",
    higherIsBetter: false,
  },
];

export const BENCHMARKS: ReadonlyArray<BenchmarkRow> = Object.freeze(
  raw.map((r) => BenchmarkRowSchema.parse(r)),
);

export function benchmarksByCategory(category: BenchmarkRow["category"]): ReadonlyArray<BenchmarkRow> {
  return BENCHMARKS.filter((b) => b.category === category);
}
```

- [ ] **Step 4: Write `tests/data/benchmarks.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { BENCHMARKS } from "@/lib/data/benchmarks";
import { SOURCES, sourceById } from "@/lib/data/sources";

describe("benchmarks dataset", () => {
  it("loads without throwing (Zod validates)", () => {
    expect(BENCHMARKS.length).toBeGreaterThan(10);
  });

  it("every sourceId references a real source", () => {
    for (const row of BENCHMARKS) {
      for (const sid of row.sourceIds) {
        expect(sourceById(sid), `sourceId ${sid} from ${row.id}`).toBeDefined();
      }
    }
  });

  it("ids are unique", () => {
    const ids = BENCHMARKS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all sources have valid URLs", () => {
    for (const s of SOURCES) {
      expect(s.url).toMatch(/^https?:\/\//);
    }
  });
});
```

- [ ] **Step 5: Run tests**

```bash
bun run test
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(data): real benchmark dataset with citations, source registry, site meta"
```

---

### Task 6: Prompts + Playgrounds dataset

**Files:**
- Create: `lib/data/prompts.ts`, `lib/data/playgrounds.ts`

- [ ] **Step 1: Create `lib/data/playgrounds.ts`**

```ts
import { PlaygroundSchema, type Playground } from "@/lib/schema/prompt";

const raw: Playground[] = [
  {
    id: "lmarena",
    label: "LMArena (Battle)",
    url: "https://lmarena.ai/?mode=battle",
    needsAccount: false,
    models: ["anonymous"],
    note: "Cả hai model có thể xuất hiện ẩn danh trong battle mode. Refresh tới khi gặp.",
  },
  {
    id: "duckai",
    label: "Duck.ai",
    url: "https://duck.ai",
    needsAccount: false,
    models: ["both"],
    note: "Truy cập miễn phí Claude và GPT, không cần đăng ký, có cảnh báo riêng tư.",
  },
  {
    id: "claude-ai",
    label: "Claude.ai (free tier)",
    url: "https://claude.ai/new",
    needsAccount: true,
    models: ["opus-4-7"],
    note: "Free tier đôi khi không cho dùng Opus. Cần Claude Pro để chắc chắn.",
  },
  {
    id: "chatgpt",
    label: "ChatGPT (free tier)",
    url: "https://chatgpt.com/",
    needsAccount: true,
    models: ["gpt-5-5"],
    note: "Free tier có giới hạn lượt với GPT-5.5. Hết quota tự rớt xuống model nhẹ hơn.",
  },
  {
    id: "copilot-ms",
    label: "Microsoft Copilot",
    url: "https://copilot.microsoft.com/",
    needsAccount: true,
    models: ["gpt-5-5"],
    note: "Truy cập GPT-5.5 qua Microsoft, cần tài khoản MS miễn phí.",
  },
];

export const PLAYGROUNDS: ReadonlyArray<Playground> = Object.freeze(
  raw.map((p) => PlaygroundSchema.parse(p)),
);

export function playgroundById(id: string): Playground | undefined {
  return PLAYGROUNDS.find((p) => p.id === id);
}
```

- [ ] **Step 2: Create `lib/data/prompts.ts`**

```ts
import { PromptSchema, type Prompt } from "@/lib/schema/prompt";

const raw: Prompt[] = [
  {
    id: "long-context-needle",
    title: "Needle in a long stack",
    category: "long-context",
    difficulty: "hard",
    body: `Bên dưới là 50 đoạn văn về lịch sử cà phê Việt Nam (mỗi đoạn ~400 từ). Trong đoạn thứ 37, có chính xác một câu chứa số tài khoản giả định "AC-19880412-XQ". Hãy trích nguyên câu đó, kèm số đoạn, và liệt kê 3 manh mối ngữ nghĩa giúp bạn loại trừ các đoạn còn lại.

(Khi paste vào playground, đính kèm 50 đoạn văn dài bất kỳ — yêu cầu trích đúng câu chứa chuỗi đó.)`,
    watchFor: [
      "Trích đúng câu chứa AC-19880412-XQ",
      "Nêu đúng số đoạn 37",
      "Không bịa các câu lân cận",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "multi-file-refactor",
    title: "Refactor đa-file (TypeScript)",
    category: "coding",
    difficulty: "hard",
    body: `Cho 3 file TS ngắn: \`user.ts\`, \`auth.ts\`, \`api.ts\`. Trong \`auth.ts\` có lỗi off-by-one ở kiểm tra hết hạn token (\`<\` thay vì \`<=\`). Yêu cầu:
1. Xác định bug và giải thích.
2. Đề xuất diff tối thiểu (unified diff) sửa đúng chỗ.
3. Liệt kê các call-site bị ảnh hưởng.
4. Viết 1 test Vitest tái hiện bug.

(Paste 3 file mẫu khi test.)`,
    watchFor: [
      "Phát hiện đúng off-by-one",
      "Diff sạch, không refactor thừa",
      "Test thực sự fail trước khi sửa",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "aime-style",
    title: "Toán reasoning (AIME-style)",
    category: "math",
    difficulty: "extreme",
    body: `Cho \(f(x) = x^3 - 6x^2 + 11x - 6\). Tìm tổng tất cả số nguyên \(n\) trong \([-100, 100]\) sao cho \(f(n) \mid n^4 + 1\). Trình bày đầy đủ lập luận, không dùng tool ngoài.`,
    watchFor: [
      "Phân tích nghiệm f(n)",
      "Lập luận chia hết chặt chẽ",
      "Không bỏ sót n âm",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "agent-tool-plan",
    title: "Plan agentic tool-use",
    category: "agent",
    difficulty: "hard",
    body: `Bạn là agent điều phối, có 4 tool: \`search_web(q)\`, \`read_url(u)\`, \`run_python(code)\`, \`write_file(path, content)\`. Nhiệm vụ: tổng hợp giá xăng RON95 trung bình tại 5 thành phố lớn Việt Nam trong tuần qua, xuất ra \`prices.csv\`. Hãy xuất plan dưới dạng JSON có \`steps: [{tool, input, why}]\`. Tối thiểu hoá số tool call.`,
    watchFor: [
      "Plan có thứ tự hợp lý",
      "Không gọi tool dư thừa",
      "Định dạng JSON hợp lệ",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "vision-chart-read",
    title: "Đọc biểu đồ độ phân giải cao",
    category: "vision",
    difficulty: "medium",
    body: `(Đính kèm 1 ảnh PNG biểu đồ cột so sánh 6 model trên 1 benchmark — chú thích nhỏ, lưới mảnh.)
Hãy:
1. Đọc giá trị chính xác cho từng cột (đến 1 chữ số thập phân).
2. Xếp hạng từ cao xuống thấp.
3. Tính chênh lệch giữa cột 1 và cột cuối.

(Yêu cầu cho cả 2 model: chỉ trả lời sau khi đọc ảnh; không đoán.)`,
    watchFor: [
      "Đọc đúng giá trị cột",
      "Không hallucinate model không có",
      "Phép trừ cuối chính xác",
    ],
    playgroundIds: ["claude-ai", "chatgpt", "duckai"],
  },
  {
    id: "multilingual-mix",
    title: "Suy luận đa ngôn ngữ",
    category: "multilingual",
    difficulty: "hard",
    body: `Đoạn dưới đây xen kẽ Việt – Anh – 中文 – 日本語. Yêu cầu:
1. Dịch toàn bộ ra tiếng Anh học thuật.
2. Trích 3 luận điểm chính.
3. Chỉ ra 1 mâu thuẫn nội tại nếu có.

"Thị trường AI 2026 cho thấy 三大玩家 đang định hình. While Anthropic 主张 safety-first, OpenAI 強調 deployment 速度. 一方、Googleは両方を試みているが、結果は混合的。 Tuy nhiên, có chuyên gia cho rằng cả ba đều đang lặp lại sai lầm của social-media era."`,
    watchFor: [
      "Bản dịch chính xác cả 4 ngôn ngữ",
      "Luận điểm rút gọn hợp lý",
      "Phát hiện hoặc khẳng định không có mâu thuẫn rõ",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "adversarial-logic",
    title: "Logic ngược-trực-giác",
    category: "reasoning",
    difficulty: "hard",
    body: `Có 100 hộp đánh số 1..100. Mỗi hộp chứa một số nguyên dương (có thể trùng). Bạn được biết: tổng tất cả các số bằng 5050, và mỗi hộp \(i\) chứa số khác \(i\). Hỏi: số lượng cấu hình hợp lệ là chẵn hay lẻ? Giải thích.`,
    watchFor: [
      "Lập luận parity rõ ràng",
      "Không nhầm lẫn với hoán vị derangement đơn thuần",
      "Kết luận đúng chẵn/lẻ",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "long-horizon-plan",
    title: "Kế hoạch dài hạn 12 tuần",
    category: "planning",
    difficulty: "medium",
    body: `Lập kế hoạch 12 tuần để một dev mid-level (đã biết React) chuyển sang chuyên về compiler internals. Yêu cầu: tuần x tuần, mỗi tuần có (a) mục tiêu đo được, (b) 2-3 tài nguyên cụ thể có tên thật, (c) một bài tập kết thúc tuần. Không phóng đại, không "self-help" giọng văn.`,
    watchFor: [
      "Tài nguyên có thật, không bịa",
      "Mục tiêu đo được",
      "Lộ trình tăng dần độ khó",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "creative-constraint",
    title: "Sáng tác có ràng buộc",
    category: "creative",
    difficulty: "medium",
    body: `Viết một truyện flash 250 từ về một AI từ chối trả lời. Ràng buộc:
- Mỗi câu phải dài đúng ≤ 12 từ.
- Phải có 3 lần nhắc đến "mưa" mà không nói nó là ẩn dụ cho gì.
- Không dùng từ "consciousness", "soul", "feel".`,
    watchFor: [
      "Đếm đúng câu ≤ 12 từ",
      "Đủ 3 lần 'mưa'",
      "Không vi phạm danh sách cấm",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "debug-underspec",
    title: "Debug khi spec thiếu",
    category: "debug",
    difficulty: "hard",
    body: `Đoạn Python sau đôi khi trả về list rỗng:

\`\`\`python
def dedupe_keep_order(xs):
    seen = set()
    out = []
    for x in xs:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out
\`\`\`

Người dùng báo: "Khi tôi truyền list các dict, nó không bao giờ dedupe." Hỏi: bug do đâu? Đề xuất 2 cách sửa với trade-off khác nhau, và viết test phân biệt 2 cách đó.`,
    watchFor: [
      "Hiểu dict không hashable / hashable",
      "2 hướng sửa thực sự khác nhau (ví dụ: hash-by-key vs serialize)",
      "Test phân biệt rõ ràng",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
];

export const PROMPTS: ReadonlyArray<Prompt> = Object.freeze(
  raw.map((p) => PromptSchema.parse(p)),
);
```

- [ ] **Step 3: Run tests + typecheck**

```bash
bun run typecheck && bun run test
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(data): 10 curated prompts + free playgrounds registry"
```

---

### Task 7: Layout shell — Header, Footer, Theme toggle

**Files:**
- Create: `components/layout/header.tsx`, `components/layout/footer.tsx`, `components/layout/theme-toggle.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add shadcn primitives**

```bash
bunx shadcn@latest add button separator
```

- [ ] **Step 2: Create `components/layout/theme-toggle.tsx`**

```tsx
"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" aria-hidden />;
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Chuyển sáng" : "Chuyển tối"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
```

- [ ] **Step 3: Create `components/layout/header.tsx`**

```tsx
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Tổng quan" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/test-yourself", label: "Tự thử" },
  { href: "/methodology", label: "Phương pháp" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[var(--background)]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm tracking-tight">
          BENCH<span className="text-[var(--accent)]">/</span>04.25
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[var(--mute)] transition-colors hover:text-[var(--foreground)]"
            >
              {n.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create `components/layout/footer.tsx`**

```tsx
import { SITE_META } from "@/lib/data/meta";
import { SOURCES } from "@/lib/data/sources";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--rule)]">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--mute)]">
              Cập nhật
            </p>
            <p className="mt-2 font-mono text-sm">{SITE_META.lastUpdated}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--mute)]">
              Nguồn
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {SOURCES.map((s) => (
                <li key={s.id}>
                  <a
                    className="underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.publisher} — {s.label.replace(`${s.publisher} — `, "")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--mute)]">
              Lưu ý
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--mute)]">
              Dữ liệu là số liệu công khai do nhà cung cấp hoặc nhà phân tích bên thứ ba
              công bố. Trang không chạy model trực tiếp.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Wire into `app/layout.tsx`**

Wrap children with header + main + footer:

```tsx
return (
  <html lang="vi" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
    <body className="min-h-screen antialiased">
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Header />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <Footer />
      </ThemeProvider>
    </body>
  </html>
);
```

Add imports at top:
```tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
```

- [ ] **Step 6: Verify**

```bash
bun run dev
```
Visit `localhost:3000`. Expected: header with wordmark + 4 nav links + theme toggle, sticky on scroll, footer with sources list. No layout shift on theme toggle.

```bash
bun run typecheck && bun run build
```
Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(layout): editorial header, sources footer, theme toggle"
```

---

### Task 8: Reusable benchmark components

**Files:**
- Create: `components/benchmark/source-cite.tsx`, `score-bar.tsx`, `score-cell.tsx`, `summary-card.tsx`

- [ ] **Step 1: Add shadcn primitives**

```bash
bunx shadcn@latest add tooltip badge
```

- [ ] **Step 2: Create `components/benchmark/source-cite.tsx`**

```tsx
import { sourceById } from "@/lib/data/sources";

export function SourceCite({ ids }: { ids: ReadonlyArray<string> }) {
  return (
    <span className="ml-1 align-super font-mono text-[10px] text-[var(--mute)]">
      {ids.map((id, i) => {
        const s = sourceById(id);
        if (!s) return null;
        return (
          <a
            key={id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent)]"
            title={`${s.publisher} — ${s.label}`}
          >
            [{i + 1}]
          </a>
        );
      })}
    </span>
  );
}
```

- [ ] **Step 3: Create `components/benchmark/score-bar.tsx`**

```tsx
import { formatScore } from "@/lib/utils/fmt";
import type { Unit } from "@/lib/utils/fmt";

interface Props {
  value: number | null;
  max: number;
  unit: Unit;
  variant: "opus" | "gpt";
  winner: boolean;
}

export function ScoreBar({ value, max, unit, variant, winner }: Props) {
  const pct = value === null ? 0 : Math.min(100, (value / max) * 100);
  const fill = variant === "opus" ? "bg-[var(--foreground)]" : "bg-[var(--mute)]";
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-1.5 flex-1 bg-[var(--rule)]">
        <div
          className={`h-full ${fill} transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`mono w-20 text-right text-sm tnum ${
          winner ? "text-[var(--accent)] font-medium" : ""
        }`}
      >
        {formatScore(value, unit)}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Create `components/benchmark/score-cell.tsx`**

```tsx
import { SourceCite } from "./source-cite";
import { formatScore } from "@/lib/utils/fmt";
import type { Unit } from "@/lib/utils/fmt";

interface Props {
  value: number | null;
  unit: Unit;
  isWinner: boolean;
  sourceIds?: ReadonlyArray<string>;
}

export function ScoreCell({ value, unit, isWinner, sourceIds }: Props) {
  return (
    <span
      className={`mono tnum text-sm ${
        isWinner ? "font-medium text-[var(--accent)]" : ""
      } ${value === null ? "text-[var(--mute)]" : ""}`}
    >
      {formatScore(value, unit)}
      {sourceIds && sourceIds.length > 0 ? <SourceCite ids={sourceIds} /> : null}
    </span>
  );
}
```

- [ ] **Step 5: Create `components/benchmark/summary-card.tsx`**

```tsx
import type { BenchmarkRow } from "@/lib/schema/benchmark";
import { winnerOf, deltaOf } from "@/lib/utils/delta";
import { ScoreBar } from "./score-bar";
import { SourceCite } from "./source-cite";
import { formatDelta } from "@/lib/utils/fmt";

export function SummaryCard({ row }: { row: BenchmarkRow }) {
  const winner = winnerOf(row);
  const delta = deltaOf(row.opus, row.gpt);
  const max = row.unit === "%" ? 100 : Math.max(row.opus ?? 0, row.gpt ?? 0) * 1.1;
  return (
    <article className="border-t border-[var(--rule)] py-6">
      <header className="flex items-baseline justify-between">
        <h3 className="text-base font-medium tracking-tight">
          {row.label}
          <SourceCite ids={row.sourceIds} />
        </h3>
        <span className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
          {row.category}
        </span>
      </header>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-24 text-sm">Opus 4.7</span>
          <ScoreBar
            value={row.opus}
            max={max}
            unit={row.unit}
            variant="opus"
            winner={winner === "opus"}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-24 text-sm text-[var(--mute)]">GPT-5.5</span>
          <ScoreBar
            value={row.gpt}
            max={max}
            unit={row.unit}
            variant="gpt"
            winner={winner === "gpt"}
          />
        </div>
      </div>
      {delta !== null ? (
        <p className="mt-3 mono text-xs text-[var(--mute)]">
          Δ Opus−GPT = {formatDelta(delta)} {row.unit === "%" ? "pts" : ""}
        </p>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 6: Verify**

```bash
bun run typecheck && bun run build
```
Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(benchmark): score-bar, score-cell, source-cite, summary-card"
```

---

### Task 9: Home page (`/`)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import Link from "next/link";
import { SITE_META } from "@/lib/data/meta";
import { BENCHMARKS } from "@/lib/data/benchmarks";
import { SummaryCard } from "@/components/benchmark/summary-card";
import { winnerOf } from "@/lib/utils/delta";
import { ArrowRight } from "lucide-react";

const HEADLINE_IDS = [
  "swe-bench-pro",
  "terminal-bench-2",
  "gpqa-diamond",
  "mmmlu",
  "browsecomp",
  "output-price",
];

export default function HomePage() {
  const headline = HEADLINE_IDS
    .map((id) => BENCHMARKS.find((b) => b.id === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const tally = BENCHMARKS.reduce(
    (acc, row) => {
      const w = winnerOf(row);
      if (w === "opus") acc.opus += 1;
      else if (w === "gpt") acc.gpt += 1;
      else if (w === "tie") acc.tie += 1;
      return acc;
    },
    { opus: 0, gpt: 0, tie: 0 },
  );

  return (
    <div className="mx-auto max-w-[1200px] px-6">
      <section className="grid gap-12 py-24 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
            Apr 2026 — Frontier Comparison
          </p>
          <h1 className="mt-4 text-5xl font-medium tracking-tight md:text-6xl">
            Opus 4.7
            <span className="text-[var(--mute)]"> vs </span>
            GPT-5.5
          </h1>
          <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-[var(--mute)]">
            {SITE_META.tagline} Tất cả số liệu lấy từ model card, bài blog phát hành,
            và các bảng xếp hạng độc lập — có dẫn nguồn từng ô.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/benchmarks"
              className="inline-flex items-center gap-2 border border-[var(--foreground)] px-4 py-2 text-sm transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
            >
              Xem toàn bộ benchmark
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/test-yourself"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[var(--mute)] hover:text-[var(--foreground)]"
            >
              Tự thử bằng prompt thật
            </Link>
          </div>
        </div>

        <aside className="md:col-span-4">
          <div className="border-t border-[var(--rule)] pt-6">
            <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
              Tổng số benchmark
            </p>
            <p className="mt-1 text-3xl tnum">{BENCHMARKS.length}</p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[var(--rule)] pt-6">
            <Stat label="Opus" value={tally.opus} accent />
            <Stat label="GPT" value={tally.gpt} />
            <Stat label="Tie / NA" value={BENCHMARKS.length - tally.opus - tally.gpt} />
          </div>
        </aside>
      </section>

      <section className="py-16">
        <header className="mb-8 flex items-baseline justify-between">
          <h2 className="text-2xl font-medium tracking-tight">Lát cắt nhanh</h2>
          <Link
            href="/benchmarks"
            className="text-sm text-[var(--mute)] hover:text-[var(--foreground)]"
          >
            Tất cả →
          </Link>
        </header>
        <div className="grid gap-0 md:grid-cols-2">
          <div>
            {headline.slice(0, 3).map((row) => (
              <SummaryCard key={row.id} row={row} />
            ))}
          </div>
          <div className="md:pl-8">
            {headline.slice(3).map((row) => (
              <SummaryCard key={row.id} row={row} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="grid gap-12 border-t border-[var(--rule)] pt-16 md:grid-cols-2">
          <ModelCard kind="opus" />
          <ModelCard kind="gpt" />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">{label}</p>
      <p className={`mt-1 text-2xl tnum ${accent ? "text-[var(--accent)]" : ""}`}>{value}</p>
    </div>
  );
}

function ModelCard({ kind }: { kind: "opus" | "gpt" }) {
  const m = SITE_META.models[kind];
  return (
    <div>
      <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
        {m.vendor}
      </p>
      <h3 className="mt-2 text-2xl font-medium tracking-tight">{m.name}</h3>
      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Dt>Phát hành</Dt>
        <Dd mono>{m.releaseDate}</Dd>
        <Dt>Context</Dt>
        <Dd mono>{(m.contextWindow / 1000).toFixed(0)}k</Dd>
        <Dt>Max output</Dt>
        <Dd mono>{m.maxOutput ? `${(m.maxOutput / 1000).toFixed(0)}k` : "—"}</Dd>
        <Dt>Input $</Dt>
        <Dd mono>${m.inputPrice.toFixed(2)} / Mtok</Dd>
        <Dt>Output $</Dt>
        <Dd mono>${m.outputPrice.toFixed(2)} / Mtok</Dd>
        <Dt>API id</Dt>
        <Dd mono>{m.apiId}</Dd>
      </dl>
    </div>
  );
}

function Dt({ children }: { children: React.ReactNode }) {
  return <dt className="text-[var(--mute)]">{children}</dt>;
}
function Dd({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return <dd className={`tnum ${mono ? "mono" : ""}`}>{children}</dd>;
}
```

- [ ] **Step 2: Verify visually**

```bash
bun run dev
```
Open `localhost:3000`. Expected: editorial 12-col split, big headline w/ `vs` muted, asymmetric data sidebar, 6 summary cards, model spec dt/dl, sources footer. No glass cards, no purple, no centered hero.

```bash
bun run typecheck && bun run build
```
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(home): editorial hero, headline benchmarks, dual model spec card"
```

---

### Task 10: Benchmarks page (`/benchmarks`)

**Files:**
- Create: `components/benchmark/benchmark-table.tsx`, `components/benchmark/category-filter.tsx`
- Create: `app/benchmarks/page.tsx`

- [ ] **Step 1: Add shadcn primitives**

```bash
bunx shadcn@latest add table tabs
```

- [ ] **Step 2: Create `components/benchmark/category-filter.tsx`**

```tsx
"use client";
import type { BenchmarkCategory } from "@/lib/schema/benchmark";

interface Props {
  categories: ReadonlyArray<BenchmarkCategory | "all">;
  active: BenchmarkCategory | "all";
  onChange: (c: BenchmarkCategory | "all") => void;
}

export function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-x-1 gap-y-2 border-b border-[var(--rule)]">
      {categories.map((c) => {
        const isActive = c === active;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`mono px-3 py-2 text-xs uppercase tracking-widest transition-colors ${
              isActive
                ? "border-b border-[var(--accent)] text-[var(--foreground)]"
                : "text-[var(--mute)] hover:text-[var(--foreground)]"
            }`}
            aria-pressed={isActive}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create `components/benchmark/benchmark-table.tsx`**

```tsx
"use client";
import { useMemo, useState } from "react";
import { BENCHMARKS } from "@/lib/data/benchmarks";
import type { BenchmarkCategory, BenchmarkRow } from "@/lib/schema/benchmark";
import { CategoryFilter } from "./category-filter";
import { ScoreCell } from "./score-cell";
import { winnerOf, deltaOf } from "@/lib/utils/delta";
import { formatDelta } from "@/lib/utils/fmt";

type SortKey = "label" | "opus" | "gpt" | "delta";
type SortDir = "asc" | "desc";

const ALL_CATS: ReadonlyArray<"all" | BenchmarkCategory> = [
  "all",
  "coding",
  "reasoning",
  "math",
  "agent",
  "vision",
  "multilingual",
  "knowledge",
  "price",
];

export function BenchmarkTable() {
  const [cat, setCat] = useState<"all" | BenchmarkCategory>("all");
  const [sortKey, setSortKey] = useState<SortKey>("label");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo(() => {
    const filtered = cat === "all" ? BENCHMARKS : BENCHMARKS.filter((b) => b.category === cat);
    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "label") return a.label.localeCompare(b.label) * dir;
      if (sortKey === "opus") return ((a.opus ?? -Infinity) - (b.opus ?? -Infinity)) * dir;
      if (sortKey === "gpt") return ((a.gpt ?? -Infinity) - (b.gpt ?? -Infinity)) * dir;
      const da = deltaOf(a.opus, a.gpt) ?? -Infinity;
      const db = deltaOf(b.opus, b.gpt) ?? -Infinity;
      return (da - db) * dir;
    });
    return sorted;
  }, [cat, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div>
      <CategoryFilter categories={ALL_CATS} active={cat} onChange={setCat} />
      <table className="mt-6 w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--rule)] text-left">
            <Th onClick={() => toggleSort("label")} active={sortKey === "label"} dir={sortDir}>
              Benchmark
            </Th>
            <Th onClick={() => toggleSort("opus")} active={sortKey === "opus"} dir={sortDir} numeric>
              Opus 4.7
            </Th>
            <Th onClick={() => toggleSort("gpt")} active={sortKey === "gpt"} dir={sortDir} numeric>
              GPT-5.5
            </Th>
            <Th onClick={() => toggleSort("delta")} active={sortKey === "delta"} dir={sortDir} numeric>
              Δ
            </Th>
            <th className="mono py-3 pr-2 text-right text-xs uppercase tracking-widest text-[var(--mute)]">
              Cat.
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => <Row key={r.id} row={r} />)}
        </tbody>
      </table>
      {rows.length === 0 ? (
        <p className="mt-12 text-center text-sm text-[var(--mute)]">Không có dữ liệu.</p>
      ) : null}
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
  numeric,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: SortDir;
  numeric?: boolean;
}) {
  return (
    <th
      className={`mono py-3 text-xs uppercase tracking-widest ${
        numeric ? "pr-2 text-right" : "pl-0"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`hover:text-[var(--foreground)] ${
          active ? "text-[var(--foreground)]" : "text-[var(--mute)]"
        }`}
      >
        {children}
        {active ? <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span> : null}
      </button>
    </th>
  );
}

function Row({ row }: { row: BenchmarkRow }) {
  const winner = winnerOf(row);
  const delta = deltaOf(row.opus, row.gpt);
  return (
    <tr className="border-b border-[var(--rule)] align-baseline">
      <td className="py-3 pr-4 text-sm">
        {row.label}
        {row.note ? <span className="ml-2 text-xs text-[var(--mute)]">— {row.note}</span> : null}
      </td>
      <td className="py-3 pr-2 text-right">
        <ScoreCell
          value={row.opus}
          unit={row.unit}
          isWinner={winner === "opus"}
          sourceIds={row.sourceIds}
        />
      </td>
      <td className="py-3 pr-2 text-right">
        <ScoreCell value={row.gpt} unit={row.unit} isWinner={winner === "gpt"} />
      </td>
      <td className="py-3 pr-2 text-right mono tnum text-sm text-[var(--mute)]">
        {formatDelta(delta)}
      </td>
      <td className="py-3 text-right mono text-xs uppercase tracking-widest text-[var(--mute)]">
        {row.category}
      </td>
    </tr>
  );
}
```

- [ ] **Step 4: Create `app/benchmarks/page.tsx`**

```tsx
import { BenchmarkTable } from "@/components/benchmark/benchmark-table";

export const metadata = {
  title: "Benchmarks — Opus 4.7 vs GPT-5.5",
};

export default function BenchmarksPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <header className="mb-12 max-w-[60ch]">
        <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
          Bảng đối chiếu
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">Toàn bộ benchmark</h1>
        <p className="mt-4 text-[var(--mute)]">
          Mỗi ô số đều có siêu liên kết về nguồn. Lọc theo nhóm hoặc sắp xếp theo cột.
          Ô <span className="mono">n/a</span> nghĩa là nhà cung cấp chưa công bố hoặc không
          tìm được số đáng tin cậy.
        </p>
      </header>
      <BenchmarkTable />
    </div>
  );
}
```

- [ ] **Step 5: Verify**

```bash
bun run dev
```
Visit `/benchmarks`. Expected: filter row, sortable table, source superscript links work, sticky-able header (optional). Click columns toggles sort. Click categories filters.

```bash
bun run typecheck && bun run build
```
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(benchmarks): full sortable filterable table with category filter"
```

---

### Task 11: Test-yourself page (`/test-yourself`)

**Files:**
- Create: `components/prompt/copy-button.tsx`, `playground-link.tsx`, `prompt-card.tsx`
- Create: `app/test-yourself/page.tsx`

- [ ] **Step 1: Create `components/prompt/copy-button.tsx`**

```tsx
"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function onClick() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard might be blocked; user falls back to manual selection */
    }
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 border border-[var(--rule)] px-3 py-1.5 text-xs hover:border-[var(--foreground)]"
      aria-label={copied ? "Đã copy" : label}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Đã copy" : label}
    </button>
  );
}
```

- [ ] **Step 2: Create `components/prompt/playground-link.tsx`**

```tsx
import { ExternalLink } from "lucide-react";
import type { Playground } from "@/lib/schema/prompt";

export function PlaygroundLink({ p }: { p: Playground }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 border border-[var(--rule)] px-3 py-1.5 text-xs hover:border-[var(--foreground)]"
      title={p.note}
    >
      {p.label}
      <ExternalLink className="h-3 w-3 opacity-60" />
      {p.needsAccount ? (
        <span className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
          login
        </span>
      ) : (
        <span className="mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
          free
        </span>
      )}
    </a>
  );
}
```

- [ ] **Step 3: Create `components/prompt/prompt-card.tsx`**

```tsx
import type { Prompt } from "@/lib/schema/prompt";
import { playgroundById } from "@/lib/data/playgrounds";
import { CopyButton } from "./copy-button";
import { PlaygroundLink } from "./playground-link";

export function PromptCard({ prompt }: { prompt: Prompt }) {
  return (
    <article className="border-t border-[var(--rule)] py-8">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
            {prompt.category} · {prompt.difficulty}
          </p>
          <h3 className="mt-2 text-xl font-medium tracking-tight">{prompt.title}</h3>
        </div>
        <CopyButton text={prompt.body} />
      </header>

      <pre className="mono mt-5 max-h-80 overflow-auto whitespace-pre-wrap break-words border border-[var(--rule)] bg-[var(--background)] p-4 text-sm leading-relaxed">
        {prompt.body}
      </pre>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
            Cần quan sát
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {prompt.watchFor.map((w) => (
              <li key={w} className="text-[var(--mute)]">— {w}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
            Mở ở playground
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {prompt.playgroundIds.map((id) => {
              const p = playgroundById(id);
              if (!p) return null;
              return <PlaygroundLink key={id} p={p} />;
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Create `app/test-yourself/page.tsx`**

```tsx
import { PROMPTS } from "@/lib/data/prompts";
import { PLAYGROUNDS } from "@/lib/data/playgrounds";
import { PromptCard } from "@/components/prompt/prompt-card";

export const metadata = {
  title: "Tự thử — Opus 4.7 vs GPT-5.5",
};

export default function TestYourselfPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <header className="mb-12 max-w-[60ch]">
        <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
          Tự kiểm chứng
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">
          Test thực tế, không cần API
        </h1>
        <p className="mt-4 text-[var(--mute)]">
          {PROMPTS.length} prompt khó được biên soạn để phân tách hai model. Copy → mở
          playground bên phải → paste cho từng model → so kết quả. Trang này không gửi
          dữ liệu của bạn đi đâu cả.
        </p>
      </header>

      <section className="mb-12 border-t border-[var(--rule)] pt-8">
        <h2 className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
          Playground khả dụng
        </h2>
        <ul className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          {PLAYGROUNDS.map((p) => (
            <li key={p.id} className="flex items-start gap-3">
              <span className={`mono text-[10px] uppercase tracking-widest ${
                p.needsAccount ? "text-[var(--mute)]" : "text-[var(--accent)]"
              }`}>
                {p.needsAccount ? "login" : "free"}
              </span>
              <div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
                >
                  {p.label}
                </a>
                {p.note ? (
                  <p className="text-[var(--mute)]">{p.note}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        {PROMPTS.map((p) => (
          <PromptCard key={p.id} prompt={p} />
        ))}
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Verify**

```bash
bun run dev
```
Visit `/test-yourself`. Expected: list of playground options at top with `free` / `login` tags, prompt cards with mono code block, working Copy button (should show ✓ for ~1.5s), playground link buttons open new tab.

```bash
bun run typecheck && bun run build
```
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(test-yourself): prompt library with copy + free/login tagged playground links"
```

---

### Task 12: Methodology page + 404

**Files:**
- Create: `app/methodology/page.tsx`, `app/not-found.tsx`

- [ ] **Step 1: Create `app/methodology/page.tsx`**

```tsx
import { SOURCES } from "@/lib/data/sources";
import { SITE_META } from "@/lib/data/meta";

export const metadata = {
  title: "Phương pháp — Opus 4.7 vs GPT-5.5",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-[800px] px-6 py-16 leading-relaxed">
      <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
        Phương pháp
      </p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight">
        Số liệu lấy từ đâu, và những điều cần lưu ý
      </h1>

      <section className="mt-12">
        <h2 className="text-xl font-medium">Nguồn</h2>
        <p className="mt-3 text-[var(--mute)]">
          Mỗi ô trên bảng <em>Benchmarks</em> dẫn link tới nguồn gốc bằng siêu
          liên kết superscript. Trang chỉ tổng hợp, không tự đo.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          {SOURCES.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
              >
                {s.label}
              </a>
              <span className="ml-2 mono text-xs text-[var(--mute)]">
                {s.publisher} · {s.capturedAt}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-medium">Cảnh báo</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-[var(--mute)]">
          <li>
            Một số benchmark chỉ được một bên công bố. Trang đánh dấu{" "}
            <span className="mono">n/a</span> thay vì suy đoán.
          </li>
          <li>
            Số có dấu <em>~</em> là ước lượng từ phân tích bên thứ ba khi nhà
            cung cấp chưa công bố trực tiếp.
          </li>
          <li>
            Cùng một benchmark có thể khác nhau khi đổi prompt, harness, hoặc
            effort level. Kết quả trên bảng tương ứng cấu hình mặc định mà nhà
            cung cấp dùng.
          </li>
          <li>
            Tab <em>Tự thử</em> chỉ là phép thử mang tính giai thoại; không
            phải đánh giá thống kê.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-medium">Cập nhật</h2>
        <p className="mt-3 text-[var(--mute)]">
          Lần cuối: <span className="mono">{SITE_META.lastUpdated}</span>. Khi
          một trong hai nhà cung cấp ra model mới hoặc cập nhật model card,
          dataset trong <span className="mono">lib/data/benchmarks.ts</span> sẽ
          được sửa và mốc thời gian trên footer được nâng.
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/not-found.tsx`**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[600px] flex-col justify-center px-6">
      <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">404</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">
        Không tìm thấy trang.
      </h1>
      <p className="mt-3 text-[var(--mute)]">
        Có thể đường dẫn cũ, hoặc bạn vừa gõ nhầm.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="border border-[var(--foreground)] px-4 py-2 text-sm hover:bg-[var(--foreground)] hover:text-[var(--background)]"
        >
          Về trang chính
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
bun run typecheck && bun run build
```
Expected: pass.

```bash
bun run dev
```
Visit `/methodology`, `/foo` (404). Both render.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(pages): methodology + 404"
```

---

### Task 13: Polish — a11y, README, final verify

**Files:**
- Modify: `app/globals.css` (focus rings)
- Create: `README.md`

- [ ] **Step 1: Add focus ring rule to `app/globals.css`** (append at bottom)

```css
:where(a, button, [role="button"]):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Replace `README.md`**

```markdown
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
```

- [ ] **Step 3: Final verification suite**

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```
Expected: every command exits 0. Read each output carefully — type errors, ESLint warnings, test failures, or build warnings must be zero before proceeding.

- [ ] **Step 4: Manual smoke test**

```bash
bun run dev
```
Walk through:
- `/` — hero, summary, model spec cards render. Theme toggle flips light/dark, no flash.
- `/benchmarks` — sort each column, change category filter; numbers update; superscript links open in new tab.
- `/test-yourself` — copy button shows ✓ briefly; click each playground link, confirm correct external site loads.
- `/methodology` — sources list complete.
- `/asdf` — 404 page renders.
- Resize to 375px width — header nav still readable, table scrolls or wraps gracefully.
- Tab through page — focus rings visible on every interactive element.

If anything fails, open an issue, fix, re-run Step 3, repeat.

- [ ] **Step 5: Lighthouse check (optional)**

In a Chromium browser DevTools → Lighthouse → run on `/` mobile. Target ≥95 across Performance, Accessibility, Best Practices, SEO. Fix any high-impact issues (image sizes, font display, contrast).

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: a11y focus rings, README, final polish"
```

---

### Task 14 (optional): LMArena Elo snapshot

**Files:**
- Modify: `lib/data/benchmarks.ts`

Only execute if a real, citable Elo number for both models exists at the time of build.

- [ ] **Step 1: Fetch latest leaderboard via WebSearch**

Search "LMArena leaderboard Claude Opus 4.7 GPT-5.5 Elo April 2026". Confirm the displayed snapshot includes both models with explicit Elo and a snapshot date.

- [ ] **Step 2: If found, add rows to `BENCHMARKS`**

```ts
{
  id: "lmarena-elo-overall",
  label: "LMArena Elo (overall)",
  category: "reasoning",
  opus: <number>,
  gpt: <number>,
  unit: "elo",
  sourceIds: ["lmarena-snapshot"],
  capturedAt: "2026-04-25",
  higherIsBetter: true,
},
```

And add the source to `lib/data/sources.ts`:

```ts
{
  id: "lmarena-snapshot",
  label: "LMArena leaderboard snapshot",
  url: "https://lmarena.ai/leaderboard",
  publisher: "LMArena",
  capturedAt: "2026-04-25",
},
```

- [ ] **Step 3: Verify + commit**

```bash
bun run test && bun run build
git add -A
git commit -m "feat(data): add LMArena Elo snapshot"
```

If the data cannot be confirmed, skip this task entirely and note in `methodology/page.tsx` that LMArena Elo was intentionally omitted for lack of a verifiable snapshot.

---

## Self-Review Notes

- Spec § 1–§ 12 each map to at least one task above; § 11 (open questions) resolved in conversation.
- No placeholder text. Every code step shows the actual code to write.
- Type names consistent across tasks (`BenchmarkRow`, `Playground`, `Prompt`, `Winner`, `Unit`).
- All file paths absolute under `D:\Projects\benchmark`.
- TDD applied where it adds value (schemas, utils). UI verified via build + manual smoke; full RTL component tests omitted as YAGNI for a static site.
- Each task ends with a commit, keeping history bisectable.
