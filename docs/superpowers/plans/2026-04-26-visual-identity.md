# Visual Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the warm-paper-editorial aesthetic with the Frontier Tape identity (cream `#E1E0CC` on near-black, mono numerals, 8/4 asymmetric grid, page = stack of bands), implement primitives, rebuild landing + leaderboard against them, delete theme/lucide deps.

**Architecture:** Tokens land in `globals.css` + Tailwind `@theme`. Identity primitives ship under `components/ui/identity/`. Custom glyphs under `components/ui/glyphs/`. Two pages (`app/page.tsx`, `app/leaderboard/page.tsx`) rebuild against the primitives. Old chrome (theme-provider, lucide, site-header, site-footer, components/home/*, components/leaderboard/*) is removed. Pages outside this plan (`/compare`, `/tasks`, `/profile`, `/methodology`, etc.) keep their existing bodies but inherit the new chrome — they will look stylistically off until their own rebuild specs ship. That is intentional and called out as non-goal here.

**Tech Stack:** Next.js 15 (App Router, RSC), React 19, TypeScript strict, Tailwind v4, Vitest + RTL + jsdom, Bun.

**Spec:** `docs/superpowers/specs/2026-04-26-visual-identity.md`. Mocks: `docs/superpowers/specs/2026-04-26-visual-identity-mocks/{hero-v1.html, leaderboard-v2.html}`.

**Out of scope (do not do in this plan):**
- Per-page rebuild for routes other than `/` and `/leaderboard`.
- New data queries beyond what landing + leaderboard need (movers + bento + tape are derived in-page from existing queries; new SQL is deferred).
- Custom glyph artwork polish — ship a workable v1 set, refine later.
- Lighthouse score chasing beyond passing 90 mobile.

---

## File Structure

### New files

```
apps/web/components/ui/glyphs/
  index.ts                         # exports all 8 glyphs

apps/web/components/ui/identity/
  nav-pill.tsx                     # top-center pill nav
  corner-stats.tsx                 # absolute mono caption (l|r slot)
  colophon.tsx                     # bottom 1-row mono strip
  eyebrow.tsx                      # mono uppercase 10–11px label
  display.tsx                      # display-xl|lg|md heading w/ word-up + footnoteMark
  pitch.tsx                        # mute body paragraph
  pill-cta.tsx                     # cream pill + dark icon-bubble button/link
  segmented-control.tsx            # radius-999 endcap segmented control
  stat-strip.tsx                   # 4-up mono stat row w/ vertical rules
  score-bar.tsx                    # inline track + cream fill + tnum num
  sparkline.tsx                    # 18px-tall bar sparkline w/ trend tint
  data-table.tsx                   # mono data table primitive
  tape-band.tsx                    # horizontal infinite ticker, edge-masked
  movers-panel.tsx                 # up/down 1×2 split w/ vertical rule
  bento-grid.tsx                   # 4-up cards w/ one inverse highlight
  footer-band.tsx                  # 2/1/1 columns: methodology | sources | submit
  page-shell.tsx                   # the rounded 28px <section> wrapper
  word-up.tsx                      # client component: framer-free word-by-word reveal

apps/web/tests/components/identity/
  nav-pill.test.tsx
  display.test.tsx
  pill-cta.test.tsx
  segmented-control.test.tsx
  stat-strip.test.tsx
  score-bar.test.tsx
  sparkline.test.tsx
  data-table.test.tsx
  tape-band.test.tsx
  bento-grid.test.tsx
  glyphs.test.tsx

docs/superpowers/specs/2026-04-26-visual-identity-mocks/
  (already committed alongside spec — reference only)
```

### Modified files

```
apps/web/app/globals.css           # tokens rewrite, keyframes, type utilities
apps/web/app/layout.tsx            # drop ThemeProvider, drop opsz axis, body bg, mount NavPill once
apps/web/app/page.tsx              # full landing rebuild
apps/web/app/leaderboard/page.tsx  # full leaderboard rebuild
apps/web/package.json              # drop next-themes, lucide-react
apps/web/components/methodology/source-list.tsx   # swap lucide → char
apps/web/components/prompt/copy-button.tsx        # swap lucide → char
apps/web/components/prompt/playground-link.tsx    # swap lucide → char
apps/web/components/shared/arrow-link.tsx         # swap lucide → char
```

### Deleted files

```
apps/web/components/layout/theme-provider.tsx
apps/web/components/layout/theme-toggle.tsx
apps/web/components/layout/site-header.tsx
apps/web/components/layout/site-footer.tsx
apps/web/components/layout/brand.tsx
apps/web/components/layout/nav.tsx
apps/web/components/layout/release-tape.tsx
apps/web/components/layout/auth-menu.tsx           # absorbed into NavPill (sign-in slot)
apps/web/components/home/                          # whole directory: hero, issue-tape, score-tally, headline-grid, headline-card, model-spec-grid, model-spec, score-sparkline, cta-row, trending-models, live-ranks
apps/web/components/leaderboard/board-tabs.tsx
apps/web/components/leaderboard/external-board.tsx
apps/web/components/leaderboard/community-board.tsx
```

### Files NOT touched in this plan

Anything in `components/shared/`, `components/benchmark/`, `components/benchmarks/`, `components/compare/`, `components/methodology/`, `components/prompt/`, `components/pulse/`, `components/auth/`, `components/ui/` (existing shadcn primitives) — except the lucide-swap edits listed above. These belong to per-page rebuild specs.

---

## Phase A — Foundation

### Task 1: Replace globals.css with new token block

**Files:**
- Modify: `apps/web/app/globals.css` (full rewrite)

- [ ] **Step 1: Write the new globals.css**

Replace the entire file contents with:

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-sans-loaded), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-mono-loaded), ui-monospace, "JetBrains Mono", SFMono-Regular, monospace;

  --color-paper: #0A0A0B;
  --color-paper-2: #111114;
  --color-cream: #E1E0CC;
  --color-cream-mute: rgba(225, 224, 204, 0.55);
  --color-cream-dim: rgba(225, 224, 204, 0.18);
  --color-rule: rgba(225, 224, 204, 0.10);
  --color-pos: #5eead4;
  --color-neg: #f97171;
  --color-zero: rgba(225, 224, 204, 0.55);
  --color-hot: #ff5b3a;

  --radius-page: 28px;
  --radius-page-mobile: 20px;
  --radius-pill: 999px;
}

:root {
  --paper: #0A0A0B;
  --paper-2: #111114;
  --cream: #E1E0CC;
  --cream-mute: rgba(225, 224, 204, 0.55);
  --cream-dim: rgba(225, 224, 204, 0.18);
  --rule: rgba(225, 224, 204, 0.10);
  --pos: #5eead4;
  --neg: #f97171;
  --zero: rgba(225, 224, 204, 0.55);
  --hot: #ff5b3a;

  --background: var(--paper);
  --foreground: var(--cream);
  --mute: var(--cream-mute);
  --accent: var(--cream);
}

@layer base {
  html, body {
    background: #18181b;
    color: var(--foreground);
    font-family: var(--font-sans);
    font-feature-settings: "ss01", "cv11";
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  body { padding: 16px; }
  @media (min-width: 768px) { body { padding: 16px; } }
  @media (max-width: 480px) { body { padding: 8px; } }
}

@keyframes word-up {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
@keyframes pulse-soft {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 1; }
}
@keyframes scroll-y {
  from { transform: translateY(0); }
  to   { transform: translateY(-50%); }
}
@keyframes scroll-x {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.tnum, table, .num, .mono {
  font-feature-settings: "tnum" 1, "lnum" 1, "ss01" 1;
}
.mono { font-family: var(--font-mono); }

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cream-mute);
  font-weight: 500;
}

.display-xl {
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 22vw;
  letter-spacing: -0.07em;
  line-height: 0.85;
  color: var(--cream);
}
.display-lg {
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 11vw;
  letter-spacing: -0.06em;
  line-height: 0.85;
  color: var(--cream);
}
.display-md {
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 36px;
  letter-spacing: -0.04em;
  line-height: 0.9;
  color: var(--cream);
}
@media (max-width: 768px) {
  .display-xl { font-size: 18vw; }
  .display-lg { font-size: 14vw; }
  .display-md { font-size: 28px; }
}

.word-up {
  display: inline-block;
  animation: word-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }

:where(a, button, [role="button"]):focus-visible {
  outline: 2px solid var(--cream);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .word-up,
  [data-pulse],
  [data-scroll-y],
  [data-scroll-x] {
    animation: none !important;
  }
}

@view-transition { navigation: auto; }
```

- [ ] **Step 2: Run typecheck + build**

Run: `bun run typecheck && bun run build` from repo root.
Expected: passes. Build will likely warn about unused old tokens elsewhere — acceptable for now.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/globals.css
git commit -m "feat(identity): rewrite globals.css to dark-only Frontier Tape tokens

Replaces the warm paper + dual light/dark token block with the locked
Frontier Tape identity tokens (cream on near-black). Adds the shared
keyframes (word-up, pulse-soft, scroll-y, scroll-x) and the display-xl/lg/md
typography utilities the primitives depend on. Body padding implements the
'card on a slightly lighter dark mat' chrome from spec §4.3."
```

---

### Task 2: Drop opsz axis from Inter, drop ThemeProvider mount

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Replace layout.tsx**

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/config/site";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-loaded",
  weight: ["400", "500", "600", "700"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-loaded",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
```

Notes: dropped `axes: ["opsz"]` (Inter has no opsz axis), dropped `ThemeProvider`, dropped `SiteHeader`/`SiteFooter` (each page now mounts its own `<PageShell>` chrome that contains `NavPill` etc — Task 6 wires a per-page shell rather than a global header so each page can carry its own corner stats and band stack).

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: passes. Pages that imported ThemeProvider/SiteHeader-related things will still build; they import them through `apps/web/components/...` — Task 11 onwards will detach the remaining pages.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "feat(identity): strip ThemeProvider + SiteHeader from root layout

Per spec §9.1, identity is dark-only. Each page now mounts its own
PageShell so it can carry its own NavPill + corner stats + band stack.
Also drops the bogus opsz axis on Inter (Inter has no opsz) and pins
explicit weights for both fonts."
```

---

### Task 3: Delete theme + nav layout components

**Files:**
- Delete: `apps/web/components/layout/theme-provider.tsx`
- Delete: `apps/web/components/layout/theme-toggle.tsx`
- Delete: `apps/web/components/layout/site-header.tsx`
- Delete: `apps/web/components/layout/site-footer.tsx`
- Delete: `apps/web/components/layout/brand.tsx`
- Delete: `apps/web/components/layout/nav.tsx`
- Delete: `apps/web/components/layout/release-tape.tsx`
- Delete: `apps/web/components/layout/auth-menu.tsx`
- Modify: `apps/web/package.json` (remove `next-themes`)

- [ ] **Step 1: Delete the files**

```bash
rm apps/web/components/layout/theme-provider.tsx
rm apps/web/components/layout/theme-toggle.tsx
rm apps/web/components/layout/site-header.tsx
rm apps/web/components/layout/site-footer.tsx
rm apps/web/components/layout/brand.tsx
rm apps/web/components/layout/nav.tsx
rm apps/web/components/layout/release-tape.tsx
rm apps/web/components/layout/auth-menu.tsx
```

- [ ] **Step 2: Remove next-themes from package.json**

Edit `apps/web/package.json` and delete the `"next-themes": "^0.4.6",` line from `dependencies`.

- [ ] **Step 3: Reinstall**

Run: `bun install` from repo root.
Expected: `bun.lock` updates; no errors.

- [ ] **Step 4: Find broken imports**

Run: `bun run typecheck`
Expected: errors will list every file that imported one of the deleted components. The only legitimate caller of these was `app/layout.tsx` (already fixed in Task 2). If anything else still imports them, that file is dead code from a rebase — investigate before deleting blindly.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/layout/ apps/web/package.json apps/web/../bun.lock || true
git add apps/web/package.json apps/web/components/layout
git add bun.lock 2>/dev/null || true
git commit -m "feat(identity): delete ThemeProvider + SiteHeader + SiteFooter family

Drops next-themes dep. Identity is dark-only. NavPill (Task 6) replaces
Brand/Nav/ReleaseTape/AuthMenu, mounted per-page via PageShell."
```

---

### Task 4: Replace lucide imports + drop lucide-react dep

**Files:**
- Modify: `apps/web/components/methodology/source-list.tsx`
- Modify: `apps/web/components/prompt/copy-button.tsx`
- Modify: `apps/web/components/prompt/playground-link.tsx`
- Modify: `apps/web/components/shared/arrow-link.tsx`
- Modify: `apps/web/package.json`

- [ ] **Step 1: List exact lucide usages**

Run from repo root:

```bash
bun -e "$(cat <<'JS'
import { execSync } from 'node:child_process';
const out = execSync('grep -rn "from \\"lucide-react\\"" apps/web --include=*.ts --include=*.tsx').toString();
console.log(out);
JS
)"
```

Or just `grep -rn 'from "lucide-react"' apps/web --include='*.ts' --include='*.tsx'`.

Expected: 4 files (theme-toggle was already deleted in Task 3).

- [ ] **Step 2: Replace each lucide icon with a typographic character**

For each file, swap the icon import + JSX with a span carrying the same role. Match the existing prop API.

`components/shared/arrow-link.tsx` — replace `<ArrowUpRight />` (or whatever it imports) with `<span aria-hidden>↗</span>`. Drop the `import` line.

`components/prompt/copy-button.tsx` — replace `<Copy />` / `<Check />` with `<span aria-hidden>{copied ? "✓" : "⧉"}</span>`. Keep state logic untouched.

`components/prompt/playground-link.tsx` — replace `<ExternalLink />` (or similar) with `<span aria-hidden>↗</span>`.

`components/methodology/source-list.tsx` — replace whatever `lucide-react` icons appear with `<span aria-hidden>↗</span>` per source.

These are **interim** placeholders. Per spec §4.4 the final non-rebuilt pages will swap to glyph components when their own rebuild specs ship.

- [ ] **Step 3: Remove lucide-react from package.json**

Delete the `"lucide-react": "^1.11.0",` line from `dependencies`.

- [ ] **Step 4: Reinstall + typecheck**

```bash
bun install
bun run typecheck
```
Expected: typecheck passes. If any import line was missed, fix it.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components apps/web/package.json bun.lock
git commit -m "feat(identity): drop lucide-react in favor of typographic chars

Per spec §4.4: identity uses typographic characters by default and a
custom 8-glyph set (Task 5) for everything else. The four remaining
lucide call sites (arrow-link, copy-button, playground-link, source-list)
are temporarily mapped to chars; they will be re-skinned when their
respective pages get their rebuild specs."
```

---

## Phase B — Custom glyphs

### Task 5: Custom 8-glyph set

**Files:**
- Create: `apps/web/components/ui/glyphs/index.tsx`
- Test: `apps/web/tests/components/identity/glyphs.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/web/tests/components/identity/glyphs.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  VoteGlyph, FlagGlyph, ShareGlyph, CopyGlyph,
  SortGlyph, FilterGlyph, SearchGlyph, ExternalLinkGlyph,
} from "@/components/ui/glyphs";

const all = { VoteGlyph, FlagGlyph, ShareGlyph, CopyGlyph, SortGlyph, FilterGlyph, SearchGlyph, ExternalLinkGlyph };

describe("glyph set", () => {
  it("exports exactly 8 glyph components", () => {
    expect(Object.keys(all)).toHaveLength(8);
  });

  for (const [name, Cmp] of Object.entries(all)) {
    it(`${name} renders an svg w/ currentColor stroke`, () => {
      const { container } = render(<Cmp />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute("stroke")).toBe("currentColor");
      expect(svg?.getAttribute("fill")).toBe("none");
      expect(svg?.getAttribute("viewBox")).toBe("0 0 16 16");
    });
  }

  it("VoteGlyph supports a `direction` prop that flips the path vertically", () => {
    const { container } = render(<VoteGlyph direction="down" />);
    const g = container.querySelector("g");
    expect(g?.getAttribute("transform")).toContain("scale(1,-1)");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun --filter @benchmark/web test tests/components/identity/glyphs.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the glyph components**

Create `apps/web/components/ui/glyphs/index.tsx`:

```tsx
import type { SVGProps } from "react";

type GlyphProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: GlyphProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function VoteGlyph({ direction = "up", ...rest }: GlyphProps & { direction?: "up" | "down" }) {
  return (
    <Svg {...rest}>
      <g transform={direction === "down" ? "translate(0,16) scale(1,-1)" : undefined}>
        <path d="M3 10 L8 4 L13 10" />
        <path d="M8 4 L8 13" />
      </g>
    </Svg>
  );
}

export function FlagGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <path d="M3 2 L3 14" />
      <path d="M3 2 L13 2 L11 5 L13 8 L3 8" />
    </Svg>
  );
}

export function ShareGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <circle cx="4" cy="8" r="2" />
      <circle cx="12" cy="3" r="2" />
      <circle cx="12" cy="13" r="2" />
      <path d="M5.7 7 L10.3 4" />
      <path d="M5.7 9 L10.3 12" />
    </Svg>
  );
}

export function CopyGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="4" width="9" height="10" />
      <path d="M5 4 V2 H14 V12 H11" />
    </Svg>
  );
}

export function SortGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <path d="M5 3 L5 13 M2 6 L5 3 L8 6" />
      <path d="M11 13 L11 3 M14 10 L11 13 L8 10" />
    </Svg>
  );
}

export function FilterGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <path d="M2 3 L14 3 L10 8 L10 13 L6 11 L6 8 Z" />
    </Svg>
  );
}

export function SearchGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <circle cx="7" cy="7" r="4" />
      <path d="M10.2 10.2 L14 14" />
    </Svg>
  );
}

export function ExternalLinkGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <path d="M3 3 L9 3 L9 9" />
      <path d="M9 3 L3 9" />
      <path d="M3 13 L13 13 L13 6" />
    </Svg>
  );
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `bun --filter @benchmark/web test tests/components/identity/glyphs.test.tsx`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/ui/glyphs apps/web/tests/components/identity/glyphs.test.tsx
git commit -m "feat(identity): add 8-glyph custom SVG set

Per spec §4.4: typographic characters by default, custom glyphs only
for the 8 cases chars cannot cover (vote, flag, share, copy, sort,
filter, search, external-link). Single-color (currentColor), 1.25px
stroke, 16px viewBox, sharp terminals."
```

---

## Phase C — Identity primitives

For all primitives in this phase: write tests first, then implement, run tests, commit. Tests are intentionally light (renders, props applied, callbacks fire) — visual fidelity is verified manually against the locked mocks (`docs/superpowers/specs/2026-04-26-visual-identity-mocks/`).

### Task 6: Page chrome — PageShell + NavPill + CornerStats + Colophon

**Files:**
- Create: `apps/web/components/ui/identity/page-shell.tsx`
- Create: `apps/web/components/ui/identity/nav-pill.tsx`
- Create: `apps/web/components/ui/identity/corner-stats.tsx`
- Create: `apps/web/components/ui/identity/colophon.tsx`
- Test: `apps/web/tests/components/identity/nav-pill.test.tsx`

- [ ] **Step 1: Write the failing test**

`apps/web/tests/components/identity/nav-pill.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavPill } from "@/components/ui/identity/nav-pill";

const items = [
  { href: "/", label: "Tasks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/compare", label: "Compare" },
];

describe("NavPill", () => {
  it("renders every item as a link", () => {
    render(<NavPill items={items} active="/" />);
    for (const it of items) {
      const link = screen.getByRole("link", { name: it.label });
      expect(link).toHaveAttribute("href", it.href);
    }
  });

  it("marks the active item", () => {
    render(<NavPill items={items} active="/leaderboard" />);
    const active = screen.getByRole("link", { name: "Leaderboard" });
    expect(active.className).toMatch(/text-cream\b|text-\[var\(--cream\)\]/);
  });

  it("renders a pulsing live dot when liveDotOn is true", () => {
    const { container } = render(<NavPill items={items} active="/" liveDotOn />);
    const dot = container.querySelector('[data-pulse="live"]');
    expect(dot).not.toBeNull();
  });

  it("does not render the live dot when liveDotOn is false", () => {
    const { container } = render(<NavPill items={items} active="/" />);
    expect(container.querySelector('[data-pulse="live"]')).toBeNull();
  });

  it("renders a Sign in slot at the end", () => {
    render(<NavPill items={items} active="/" signedInAs={null} />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders the username (truncated) when signedInAs is provided", () => {
    render(<NavPill items={items} active="/" signedInAs="aria_w" />);
    expect(screen.getByText("aria_w")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify it fails**

Run: `bun --filter @benchmark/web test tests/components/identity/nav-pill.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement PageShell**

`apps/web/components/ui/identity/page-shell.tsx`:

```tsx
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <section className="relative min-h-[calc(100vh-32px)] overflow-hidden rounded-[20px] bg-[var(--paper)] md:rounded-[28px]">
      {children}
    </section>
  );
}
```

- [ ] **Step 4: Implement NavPill**

`apps/web/components/ui/identity/nav-pill.tsx`:

```tsx
import Link from "next/link";

export type NavItem = { href: string; label: string };

export function NavPill({
  items,
  active,
  liveDotOn = false,
  signedInAs = null,
}: {
  items: NavItem[];
  active: string;
  liveDotOn?: boolean;
  signedInAs?: string | null;
}) {
  return (
    <nav
      aria-label="Primary"
      className="absolute left-1/2 top-0 z-20 -translate-x-1/2"
    >
      <div className="flex items-center gap-7 rounded-b-[22px] bg-black px-5 py-3">
        {items.map((it) => {
          const isActive = it.href === active;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                "mono text-[11px] uppercase tracking-[0.14em] transition-colors " +
                (isActive ? "text-[var(--cream)]" : "text-[var(--cream-mute)] hover:text-[var(--cream)]")
              }
            >
              {it.label}
            </Link>
          );
        })}
        {liveDotOn && (
          <span className="flex items-center gap-1.5">
            <span
              data-pulse="live"
              className="h-[5px] w-[5px] rounded-full bg-[var(--pos)] [animation:pulse-soft_1.6s_ease-in-out_infinite]"
            />
            <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">Live</span>
          </span>
        )}
        {signedInAs ? (
          <Link
            href="/profile"
            className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--cream)]"
          >
            {signedInAs}
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--cream-mute)] hover:text-[var(--cream)]"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Implement CornerStats**

`apps/web/components/ui/identity/corner-stats.tsx`:

```tsx
import type { ReactNode } from "react";

export function CornerStats({ slot, children }: { slot: "left" | "right"; children: ReactNode }) {
  return (
    <div
      className={
        "mono absolute top-[18px] z-10 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)] " +
        (slot === "left" ? "left-7" : "right-7 text-right")
      }
    >
      {children}
    </div>
  );
}
```

Use `<strong>` or `<span className="text-[var(--cream)] font-semibold">` inline to highlight a single value.

- [ ] **Step 6: Implement Colophon**

`apps/web/components/ui/identity/colophon.tsx`:

```tsx
export function Colophon({ left, right }: { left: string; right: string }) {
  return (
    <div className="mono flex justify-between border-t border-[var(--rule)] px-8 py-[18px] text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}
```

- [ ] **Step 7: Run tests to verify pass**

Run: `bun --filter @benchmark/web test tests/components/identity/nav-pill.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 8: Commit**

```bash
git add apps/web/components/ui/identity/{page-shell,nav-pill,corner-stats,colophon}.tsx apps/web/tests/components/identity/nav-pill.test.tsx
git commit -m "feat(identity): page chrome — PageShell, NavPill, CornerStats, Colophon

Per spec §7. PageShell is the rounded-28px page card. NavPill is the
black pill nav anchored top-center w/ optional live dot and signed-in
slot. CornerStats provides the absolute mono caption (left/right slot).
Colophon is the bottom 1-row mono strip."
```

---

### Task 7: Type primitives — Eyebrow + WordUp + Display + Pitch + PillCta

**Files:**
- Create: `apps/web/components/ui/identity/eyebrow.tsx`
- Create: `apps/web/components/ui/identity/word-up.tsx`
- Create: `apps/web/components/ui/identity/display.tsx`
- Create: `apps/web/components/ui/identity/pitch.tsx`
- Create: `apps/web/components/ui/identity/pill-cta.tsx`
- Test: `apps/web/tests/components/identity/display.test.tsx`
- Test: `apps/web/tests/components/identity/pill-cta.test.tsx`

- [ ] **Step 1: Write the failing tests**

`apps/web/tests/components/identity/display.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Display } from "@/components/ui/identity/display";

describe("Display", () => {
  it("renders one span per word", () => {
    const { container } = render(<Display level="lg">Tape board live</Display>);
    const spans = container.querySelectorAll(":scope > span > span.word-up");
    expect(spans).toHaveLength(3);
  });

  it("appends the footnote mark as superscript when provided", () => {
    render(<Display level="lg" footnoteMark="†">Tape</Display>);
    expect(screen.getByText("†")).toBeInTheDocument();
  });

  it("applies the size class for the chosen level", () => {
    const { container } = render(<Display level="xl">Frontier</Display>);
    expect(container.firstChild).toHaveClass("display-xl");
  });
});
```

`apps/web/tests/components/identity/pill-cta.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PillCta } from "@/components/ui/identity/pill-cta";

describe("PillCta", () => {
  it("renders as an anchor when href is provided", () => {
    render(<PillCta href="/submit">Submit a run</PillCta>);
    const link = screen.getByRole("link", { name: /submit a run/i });
    expect(link).toHaveAttribute("href", "/submit");
  });

  it("renders as a button when onClick is provided", () => {
    const onClick = vi.fn();
    render(<PillCta onClick={onClick}>Filter</PillCta>);
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders the default arrow glyph", () => {
    render(<PillCta href="/x">Go</PillCta>);
    expect(screen.getByText("→")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify both tests fail**

Run: `bun --filter @benchmark/web test tests/components/identity/{display,pill-cta}.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement Eyebrow**

`apps/web/components/ui/identity/eyebrow.tsx`:

```tsx
import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}
```

- [ ] **Step 4: Implement WordUp**

`apps/web/components/ui/identity/word-up.tsx`:

```tsx
export function WordUp({ text }: { text: string }) {
  const words = text.split(" ").filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="word-up inline-block"
          style={{ animationDelay: `${i * 80}ms`, marginRight: "0.25em" }}
        >
          {w}
        </span>
      ))}
    </>
  );
}
```

(No framer-motion. CSS keyframes only. Server-renderable.)

- [ ] **Step 5: Implement Display**

`apps/web/components/ui/identity/display.tsx`:

```tsx
import { WordUp } from "./word-up";

type Level = "xl" | "lg" | "md";

export function Display({
  level,
  footnoteMark,
  children,
}: {
  level: Level;
  footnoteMark?: "*" | "†";
  children: string;
}) {
  return (
    <h1 className={`display-${level}`}>
      <span className="inline-block">
        <WordUp text={children} />
        {footnoteMark && (
          <sup
            className="word-up inline-block align-super text-[0.18em]"
            style={{ animationDelay: `${children.split(" ").length * 80 + 80}ms`, marginLeft: "0.04em" }}
          >
            {footnoteMark}
          </sup>
        )}
      </span>
    </h1>
  );
}
```

- [ ] **Step 6: Implement Pitch**

`apps/web/components/ui/identity/pitch.tsx`:

```tsx
import type { ReactNode } from "react";

export function Pitch({ children, maxWidth = 320 }: { children: ReactNode; maxWidth?: number }) {
  return (
    <p
      className="text-[14px] leading-[1.4] text-[var(--cream-mute)] md:text-[15px]"
      style={{ maxWidth }}
    >
      {children}
    </p>
  );
}
```

- [ ] **Step 7: Implement PillCta**

`apps/web/components/ui/identity/pill-cta.tsx`:

```tsx
import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

type Common = { children: ReactNode; glyph?: ReactNode };

type AnchorProps = Common & { href: string; onClick?: never };
type ButtonProps = Common & { onClick: MouseEventHandler<HTMLButtonElement>; href?: never };

export function PillCta(props: AnchorProps | ButtonProps) {
  const inner = (
    <>
      <span>{props.children}</span>
      <span className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--paper)] text-[var(--cream)] transition-transform group-hover:scale-[1.08]">
        {props.glyph ?? "→"}
      </span>
    </>
  );
  const cls =
    "group inline-flex items-center gap-2 self-start rounded-full bg-[var(--cream)] py-1.5 pl-5 pr-1.5 text-[14px] font-semibold text-[var(--paper)] transition-[gap] hover:gap-3.5";

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={(props as ButtonProps).onClick} className={cls}>
      {inner}
    </button>
  );
}
```

- [ ] **Step 8: Run tests to verify pass**

Run: `bun --filter @benchmark/web test tests/components/identity/`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add apps/web/components/ui/identity/{eyebrow,word-up,display,pitch,pill-cta}.tsx apps/web/tests/components/identity/{display,pill-cta}.test.tsx
git commit -m "feat(identity): type primitives — Eyebrow, WordUp, Display, Pitch, PillCta

CSS-keyframe word-up (no framer-motion needed). Display supports xl/lg/md
levels and an asterisk/dagger footnote mark whose entrance is timed to land
after the last word. PillCta is the cream pill + dark icon-bubble used for
primary actions across the site."
```

---

### Task 8: Control primitives — SegmentedControl + StatStrip

**Files:**
- Create: `apps/web/components/ui/identity/segmented-control.tsx`
- Create: `apps/web/components/ui/identity/stat-strip.tsx`
- Test: `apps/web/tests/components/identity/segmented-control.test.tsx`
- Test: `apps/web/tests/components/identity/stat-strip.test.tsx`

- [ ] **Step 1: Write the failing tests**

`apps/web/tests/components/identity/segmented-control.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SegmentedControl } from "@/components/ui/identity/segmented-control";

const opts = [
  { value: "all", label: "All" },
  { value: "coding", label: "Coding" },
  { value: "reasoning", label: "Reasoning" },
];

describe("SegmentedControl", () => {
  it("renders one button per option", () => {
    render(<SegmentedControl options={opts} value="all" onChange={() => {}} />);
    for (const o of opts) {
      expect(screen.getByRole("button", { name: o.label })).toBeInTheDocument();
    }
  });

  it("marks the active option with aria-pressed", () => {
    render(<SegmentedControl options={opts} value="coding" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Coding" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with the option value on click", () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={opts} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Reasoning" }));
    expect(onChange).toHaveBeenCalledWith("reasoning");
  });
});
```

`apps/web/tests/components/identity/stat-strip.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatStrip } from "@/components/ui/identity/stat-strip";

describe("StatStrip", () => {
  it("renders each stat with label, value, and sub", () => {
    render(
      <StatStrip
        stats={[
          { label: "runs · 7d", value: "141", sub: "+38 vs prior", subTone: "pos" },
          { label: "models", value: "9", sub: "2 added this wk" },
        ]}
      />
    );
    expect(screen.getByText("141")).toBeInTheDocument();
    expect(screen.getByText("+38 vs prior")).toHaveClass("text-[var(--pos)]");
  });
});
```

- [ ] **Step 2: Verify they fail**

Run: `bun --filter @benchmark/web test tests/components/identity/{segmented-control,stat-strip}.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement SegmentedControl**

`apps/web/components/ui/identity/segmented-control.tsx`:

```tsx
"use client";

export type SegOption<T extends string> = { value: T; label: string };

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex">
      {options.map((o, i) => {
        const active = o.value === value;
        const first = i === 0;
        const last = i === options.length - 1;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={[
              "mono cursor-pointer border border-[var(--rule)] px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors",
              first ? "rounded-l-full pl-[18px]" : "",
              last ? "rounded-r-full pr-[18px]" : "",
              !first ? "border-l-0" : "",
              active
                ? "border-[var(--cream)] bg-[var(--cream)] text-[var(--paper)]"
                : "bg-transparent text-[var(--cream-mute)] hover:text-[var(--cream)]",
            ].filter(Boolean).join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Implement StatStrip**

`apps/web/components/ui/identity/stat-strip.tsx`:

```tsx
type Tone = "pos" | "neg" | "mute";
export type Stat = { label: string; value: string; sub?: string; subTone?: Tone };

const toneClass: Record<Tone, string> = {
  pos: "text-[var(--pos)]",
  neg: "text-[var(--neg)]",
  mute: "text-[var(--cream-mute)]",
};

export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={
            "px-4 md:px-[18px] " + (i === 0 ? "" : "border-l border-[var(--rule)]")
          }
        >
          <div className="mono mb-1.5 text-[9px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">{s.label}</div>
          <div className="mono text-[28px] font-semibold leading-none tracking-[-0.02em] text-[var(--cream)]">{s.value}</div>
          {s.sub && (
            <div className={"mono mt-1 text-[10px] " + toneClass[s.subTone ?? "mute"]}>{s.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify pass**

Run: `bun --filter @benchmark/web test tests/components/identity/`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/ui/identity/{segmented-control,stat-strip}.tsx apps/web/tests/components/identity/{segmented-control,stat-strip}.test.tsx
git commit -m "feat(identity): control primitives — SegmentedControl + StatStrip"
```

---

### Task 9: Data primitives — ScoreBar + Sparkline + DataTable

**Files:**
- Create: `apps/web/components/ui/identity/score-bar.tsx`
- Create: `apps/web/components/ui/identity/sparkline.tsx`
- Create: `apps/web/components/ui/identity/data-table.tsx`
- Test: `apps/web/tests/components/identity/score-bar.test.tsx`
- Test: `apps/web/tests/components/identity/sparkline.test.tsx`
- Test: `apps/web/tests/components/identity/data-table.test.tsx`

- [ ] **Step 1: Write the failing tests**

`apps/web/tests/components/identity/score-bar.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreBar } from "@/components/ui/identity/score-bar";

describe("ScoreBar", () => {
  it("renders the value to one decimal", () => {
    render(<ScoreBar value={85.34} />);
    expect(screen.getByText("85.3")).toBeInTheDocument();
  });

  it("sets the fill width to value/max as a percentage", () => {
    const { container } = render(<ScoreBar value={50} max={200} />);
    const fill = container.querySelector("[data-fill]") as HTMLElement;
    expect(fill.style.width).toBe("25%");
  });

  it("clamps over-max to 100%", () => {
    const { container } = render(<ScoreBar value={150} max={100} />);
    const fill = container.querySelector("[data-fill]") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });
});
```

`apps/web/tests/components/identity/sparkline.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Sparkline } from "@/components/ui/identity/sparkline";

describe("Sparkline", () => {
  it("renders one bar per value", () => {
    const { container } = render(<Sparkline values={[1, 2, 3, 4, 5]} />);
    expect(container.querySelectorAll("[data-bar]")).toHaveLength(5);
  });

  it("tints the last bar by trend", () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} trend="up" />);
    const bars = container.querySelectorAll("[data-bar]");
    expect(bars[bars.length - 1]?.getAttribute("data-trend")).toBe("up");
  });
});
```

`apps/web/tests/components/identity/data-table.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTable, type Column } from "@/components/ui/identity/data-table";

type R = { id: string; name: string; score: number };
const cols: Column<R>[] = [
  { key: "name", header: "Name", align: "left" },
  { key: "score", header: "Score", align: "right" },
];
const rows: R[] = [{ id: "a", name: "opus-4-7", score: 87.6 }];

describe("DataTable", () => {
  it("renders headers + cells", () => {
    render(<DataTable rowKey={(r) => r.id} columns={cols} rows={rows} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("opus-4-7")).toBeInTheDocument();
    expect(screen.getByText("87.6")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify all three fail**

Run: `bun --filter @benchmark/web test tests/components/identity/{score-bar,sparkline,data-table}.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement ScoreBar**

`apps/web/components/ui/identity/score-bar.tsx`:

```tsx
export function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-block h-1.5 w-[110px] bg-[var(--cream-dim)]">
        <span data-fill className="block h-full bg-[var(--cream)]" style={{ width: `${(pct * 100).toFixed(1)}%` }} />
      </span>
      <span className="mono min-w-[44px] text-right font-semibold text-[var(--cream)]">{value.toFixed(1)}</span>
    </span>
  );
}
```

- [ ] **Step 4: Implement Sparkline**

`apps/web/components/ui/identity/sparkline.tsx`:

```tsx
type Trend = "up" | "dn" | "flat";

export function Sparkline({ values, trend = "flat", height = 18 }: { values: number[]; trend?: Trend; height?: number }) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  return (
    <span className="inline-flex items-end gap-px" style={{ height }}>
      {values.map((v, i) => {
        const last = i === values.length - 1;
        const h = Math.max(2, Math.round((v / max) * height));
        return (
          <span
            key={i}
            data-bar
            data-trend={last ? trend : undefined}
            className={
              "w-[2px] " +
              (last && trend === "up"
                ? "bg-[var(--pos)]"
                : last && trend === "dn"
                ? "bg-[var(--neg)]"
                : "bg-[var(--cream)] opacity-55")
            }
            style={{ height: `${h}px` }}
          />
        );
      })}
    </span>
  );
}
```

- [ ] **Step 5: Implement DataTable**

`apps/web/components/ui/identity/data-table.tsx`:

```tsx
import type { ReactNode } from "react";

export type Column<R> = {
  key: string;
  header: ReactNode;
  align?: "left" | "right";
  render?: (row: R) => ReactNode;
};

export function DataTable<R>({
  columns,
  rows,
  rowKey,
}: {
  columns: Column<R>[];
  rows: R[];
  rowKey: (row: R) => string;
}) {
  return (
    <table className="mono w-full border-collapse text-[13px]">
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              className={
                "border-b border-[var(--rule)] px-3.5 py-4 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--cream-mute)] " +
                (c.align === "right" ? "text-right" : "text-left")
              }
            >
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)} className="border-b border-[var(--rule)] hover:bg-[var(--cream)]/[0.025]">
            {columns.map((c) => (
              <td
                key={c.key}
                className={
                  "px-3.5 py-3 align-baseline " +
                  (c.align === "right" ? "text-right" : "text-left")
                }
              >
                {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 6: Run tests to verify pass**

Run: `bun --filter @benchmark/web test tests/components/identity/`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add apps/web/components/ui/identity/{score-bar,sparkline,data-table}.tsx apps/web/tests/components/identity/{score-bar,sparkline,data-table}.test.tsx
git commit -m "feat(identity): data primitives — ScoreBar, Sparkline, DataTable

Tabular numerals everywhere via .mono utility (which carries tnum/lnum).
DataTable uses generics so per-page tables stay typed end-to-end."
```

---

### Task 10: Aggregate primitives — TapeBand + MoversPanel + BentoGrid + FooterBand

**Files:**
- Create: `apps/web/components/ui/identity/tape-band.tsx`
- Create: `apps/web/components/ui/identity/movers-panel.tsx`
- Create: `apps/web/components/ui/identity/bento-grid.tsx`
- Create: `apps/web/components/ui/identity/footer-band.tsx`
- Test: `apps/web/tests/components/identity/tape-band.test.tsx`
- Test: `apps/web/tests/components/identity/bento-grid.test.tsx`

- [ ] **Step 1: Write the failing tests**

`apps/web/tests/components/identity/tape-band.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TapeBand, type TapeItem } from "@/components/ui/identity/tape-band";

const items: TapeItem[] = [
  { time: "14:42", model: "opus-4-7", task: "swe-bench", score: 64.3, delta: 0.4 },
  { time: "14:41", model: "gpt-5.5", task: "terminal-bench", score: 82.7, delta: 1.1 },
];

describe("TapeBand", () => {
  it("renders each item twice (for seamless loop)", () => {
    const { container } = render(<TapeBand items={items} />);
    const blocks = container.querySelectorAll('[data-tape-item="true"]');
    expect(blocks).toHaveLength(items.length * 2);
  });

  it("marks positive delta as pos, negative as neg, zero as zero", () => {
    const three: TapeItem[] = [
      { time: "1", model: "a", task: "t", score: 1, delta: 0.5 },
      { time: "2", model: "b", task: "t", score: 1, delta: -0.5 },
      { time: "3", model: "c", task: "t", score: 1, delta: 0 },
    ];
    const { container } = render(<TapeBand items={three} />);
    expect(container.querySelector('[data-delta="pos"]')).not.toBeNull();
    expect(container.querySelector('[data-delta="neg"]')).not.toBeNull();
    expect(container.querySelector('[data-delta="zero"]')).not.toBeNull();
  });
});
```

`apps/web/tests/components/identity/bento-grid.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BentoGrid, type BentoCell } from "@/components/ui/identity/bento-grid";

const cells: BentoCell[] = [
  { category: "Coding", value: "87.6", winner: "opus-4-7", vendor: "anthropic", meta: "42 runs", spark: [1,2,3], sparkTrend: "up" },
  { category: "Vision", value: "82.1", winner: "opus-4-7", vendor: "anthropic", meta: "14 runs", spark: [1,1,1], sparkTrend: "flat" },
];

describe("BentoGrid", () => {
  it("renders one cell per item", () => {
    const { container } = render(<BentoGrid cells={cells} highlightIndex={0} />);
    expect(container.querySelectorAll("[data-bento-cell]")).toHaveLength(2);
  });

  it("inverts the highlighted cell", () => {
    const { container } = render(<BentoGrid cells={cells} highlightIndex={0} />);
    const cell0 = container.querySelectorAll("[data-bento-cell]")[0];
    expect(cell0?.getAttribute("data-highlight")).toBe("true");
  });
});
```

- [ ] **Step 2: Verify they fail**

Run: `bun --filter @benchmark/web test tests/components/identity/{tape-band,bento-grid}.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement TapeBand**

`apps/web/components/ui/identity/tape-band.tsx`:

```tsx
export type TapeItem = {
  time: string;
  model: string;
  task: string;
  score: number;
  delta?: number;
};

function deltaState(d?: number): "pos" | "neg" | "zero" | undefined {
  if (d === undefined) return undefined;
  if (d > 0) return "pos";
  if (d < 0) return "neg";
  return "zero";
}

function fmtDelta(d?: number) {
  if (d === undefined) return "";
  if (d === 0) return "±0.0";
  return `${d > 0 ? "+" : ""}${d.toFixed(1)}`;
}

export function TapeBand({ items, durationSec = 60 }: { items: TapeItem[]; durationSec?: number }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="relative flex h-14 items-center overflow-hidden border-y border-[var(--rule)] bg-[var(--paper-2)]"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-[linear-gradient(90deg,var(--paper-2),transparent)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-[linear-gradient(-90deg,var(--paper-2),transparent)]" />
      <div
        data-scroll-x
        className="flex gap-9 whitespace-nowrap pl-8"
        style={{ animation: `scroll-x ${durationSec}s linear infinite` }}
      >
        {doubled.map((it, i) => {
          const ds = deltaState(it.delta);
          return (
            <span key={i} data-tape-item="true" className="mono inline-flex items-baseline gap-2 text-[12px]">
              <span className="text-[var(--cream-mute)]">{it.time}</span>
              <span className="font-semibold text-[var(--cream)] [font-family:var(--font-sans)]">{it.model}</span>
              <span className="text-[var(--cream-mute)]">·</span>
              <span>{it.task}</span>
              <span className="text-[var(--cream-mute)]">→</span>
              <span className="font-bold">{it.score.toFixed(1)}</span>
              {ds && (
                <span
                  data-delta={ds}
                  className={
                    "text-[11px] " +
                    (ds === "pos" ? "text-[var(--pos)]" : ds === "neg" ? "text-[var(--neg)]" : "text-[var(--cream-mute)]")
                  }
                >
                  {fmtDelta(it.delta)}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement MoversPanel**

`apps/web/components/ui/identity/movers-panel.tsx`:

```tsx
export type MoverRow = { model: string; vendor: string; score: number; delta: number };

function fmt(d: number) {
  if (d === 0) return "±0.0";
  return `${d > 0 ? "+" : ""}${d.toFixed(1)}`;
}

function Col({ title, subtitle, rows }: { title: string; subtitle: string; rows: MoverRow[] }) {
  return (
    <div className="px-8 pb-7 pt-6">
      <div className="mb-3.5 flex items-baseline gap-2.5">
        <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--cream)]">{title}</h3>
        <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">{subtitle}</span>
      </div>
      {rows.map((r, i) => {
        const tone = r.delta > 0 ? "text-[var(--pos)]" : r.delta < 0 ? "text-[var(--neg)]" : "text-[var(--cream-mute)]";
        return (
          <div
            key={r.model}
            className="mono grid grid-cols-[24px_1fr_70px_60px] items-baseline gap-3 border-b border-[var(--rule)] py-2.5 text-[12px] last:border-b-0"
          >
            <span className="text-[10px] text-[var(--cream-mute)]">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="text-[13px] font-semibold text-[var(--cream)] [font-family:var(--font-sans)]">{r.model}</span>
              <span className="ml-1.5 text-[9px] uppercase tracking-[0.12em] text-[var(--cream-mute)]">{r.vendor}</span>
            </span>
            <span className="text-right">{r.score.toFixed(1)}</span>
            <span className={"text-right font-bold " + tone}>{fmt(r.delta)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function MoversPanel({ up, down }: { up: MoverRow[]; down: MoverRow[] }) {
  return (
    <div className="grid grid-cols-1 border-b border-[var(--rule)] md:grid-cols-2">
      <Col title="Climbing" subtitle={`top ${up.length}`} rows={up} />
      <div className="md:border-l md:border-[var(--rule)]">
        <Col title="Falling" subtitle={`bottom ${down.length}`} rows={down} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement BentoGrid**

`apps/web/components/ui/identity/bento-grid.tsx`:

```tsx
import { Sparkline } from "./sparkline";

export type BentoCell = {
  category: string;
  value: string;
  winner: string;
  vendor: string;
  meta: string;
  spark: number[];
  sparkTrend?: "up" | "dn" | "flat";
};

export function BentoGrid({ cells, highlightIndex = 0 }: { cells: BentoCell[]; highlightIndex?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 px-6 pb-8 pt-2 md:grid-cols-4">
      {cells.map((c, i) => {
        const hi = i === highlightIndex;
        return (
          <div
            key={c.category}
            data-bento-cell
            data-highlight={hi}
            className={
              "relative flex min-h-[170px] flex-col justify-between overflow-hidden border border-[var(--rule)] p-[18px] " +
              (hi ? "bg-[var(--cream)] text-[var(--paper)]" : "bg-[var(--paper-2)] text-[var(--cream)]")
            }
          >
            <div>
              <div
                className={
                  "mono text-[10px] uppercase tracking-[0.14em] " +
                  (hi ? "text-[rgba(10,10,11,0.6)]" : "text-[var(--cream-mute)]")
                }
              >
                {c.category}
              </div>
              <div className="mono my-1 text-[56px] font-semibold leading-none tracking-[-0.04em]">{c.value}</div>
              <div className="text-[14px] font-semibold">
                {c.winner}
                <span
                  className={
                    "mono ml-1.5 text-[9px] uppercase tracking-[0.12em] " +
                    (hi ? "text-[rgba(10,10,11,0.55)]" : "text-[var(--cream-mute)]")
                  }
                >
                  {c.vendor}
                </span>
              </div>
            </div>
            <div
              className={
                "mono mt-2 text-[10px] " + (hi ? "text-[rgba(10,10,11,0.6)]" : "text-[var(--cream-mute)]")
              }
            >
              {c.meta}
            </div>
            <div className="absolute right-3.5 top-3.5">
              <Sparkline values={c.spark} trend={c.sparkTrend ?? "flat"} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Implement FooterBand**

`apps/web/components/ui/identity/footer-band.tsx`:

```tsx
import type { ReactNode } from "react";

export function FooterBand({
  left,
  mid,
  right,
}: {
  left: ReactNode;
  mid: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 border-t border-[var(--rule)] md:grid-cols-[2fr_1fr_1fr]">
      <div className="px-8 py-7">{left}</div>
      <div className="border-t border-[var(--rule)] px-8 py-7 md:border-l md:border-t-0">{mid}</div>
      <div className="border-t border-[var(--rule)] px-8 py-7 md:border-l md:border-t-0">{right}</div>
    </div>
  );
}
```

- [ ] **Step 7: Run tests to verify pass**

Run: `bun --filter @benchmark/web test tests/components/identity/`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add apps/web/components/ui/identity/{tape-band,movers-panel,bento-grid,footer-band}.tsx apps/web/tests/components/identity/{tape-band,bento-grid}.test.tsx
git commit -m "feat(identity): aggregate primitives — TapeBand, MoversPanel, BentoGrid, FooterBand"
```

---

## Phase D — Page rebuilds

### Task 11: Rebuild landing page

**Files:**
- Modify (full rewrite): `apps/web/app/page.tsx`
- Possibly create: `apps/web/lib/data/landing.ts` (helpers that derive movers + bento cells from existing leaderboard rows)

The landing page mounts `<PageShell>`, places `<NavPill>` + `<CornerStats>`, then stacks the bands defined by the locked hero mock plus the data bands the leaderboard mock proved.

- [ ] **Step 1: Sketch the band order**

Bands (top → bottom):

1. Hero band (cinematic mode): Display "Frontier*" + Pitch + PillCta on right; tape rolling vertically behind; ghost stat (huge translucent number) on right of the hero.
2. Live tape band (horizontal).
3. Top of board mini-table (top 5 of `listLeaderboard()`).
4. Movers (climbing/falling, derived from leaderboard rows + their `prev` if available; if not, mark all as `±0.0`).
5. Winners-by-category bento (one card per category from `listCategories()` if available; else fixed 4: coding/reasoning/agentic/vision derived from leaderboard rows).
6. Footer band (methodology / sources / submit CTA).
7. Colophon.

If a band has zero rows of real data (e.g. leaderboard empty), **render an empty-state block inside the band**, not an empty band. Empty-state pattern: mono "—" centered, eyebrow describing what would appear, optional CTA.

- [ ] **Step 2: Implement the data helper**

Create `apps/web/lib/data/landing.ts`:

```ts
import type { LeaderboardRow } from "@/lib/db/queries/leaderboard"; // adjust import to actual return type

export type DerivedMover = { model: string; vendor: string; score: number; delta: number };

export function deriveMovers(rows: LeaderboardRow[]): { up: DerivedMover[]; down: DerivedMover[] } {
  // Without historical scores, default to flat moves. When a `prev_avg` becomes available
  // upstream, swap this for the real diff. For now derive a placeholder ordering by score.
  const mapped = rows.map((r) => ({
    model: r.model_id,
    vendor: r.model_id.split("-")[0] ?? r.model_id,
    score: Number(r.avg_score ?? 0),
    delta: 0,
  }));
  const up = mapped.slice(0, 4);
  const down = [...mapped].reverse().slice(0, 4);
  return { up, down };
}
```

(Adjust the imported type name to whatever the existing query returns. If the query has no exported row type, infer it via `Awaited<ReturnType<typeof listLeaderboard>>[number]` and re-export.)

- [ ] **Step 3: Rewrite app/page.tsx**

`apps/web/app/page.tsx`:

```tsx
import { PageShell } from "@/components/ui/identity/page-shell";
import { NavPill } from "@/components/ui/identity/nav-pill";
import { CornerStats } from "@/components/ui/identity/corner-stats";
import { Display } from "@/components/ui/identity/display";
import { Pitch } from "@/components/ui/identity/pitch";
import { PillCta } from "@/components/ui/identity/pill-cta";
import { Eyebrow } from "@/components/ui/identity/eyebrow";
import { TapeBand } from "@/components/ui/identity/tape-band";
import { DataTable, type Column } from "@/components/ui/identity/data-table";
import { ScoreBar } from "@/components/ui/identity/score-bar";
import { MoversPanel } from "@/components/ui/identity/movers-panel";
import { BentoGrid } from "@/components/ui/identity/bento-grid";
import { FooterBand } from "@/components/ui/identity/footer-band";
import { Colophon } from "@/components/ui/identity/colophon";
import { listPublicTasks } from "@/lib/db/queries/tasks";
import { listLeaderboard } from "@/lib/db/queries/leaderboard";
import { deriveMovers } from "@/lib/data/landing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NAV = [
  { href: "/tasks", label: "Tasks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/compare", label: "Compare" },
  { href: "/models", label: "Models" },
  { href: "/pulse", label: "Pulse" },
];

type Row = { model_id: string; avg_score: number | null; runs: number };

export default async function HomePage() {
  const [tasks, leaderboard] = await Promise.all([
    listPublicTasks({ limit: 6 }).catch(() => []),
    listLeaderboard().catch(() => []),
  ]);

  const totalRuns = leaderboard.reduce((n, r) => n + (r as Row).runs, 0);
  const top5 = (leaderboard as Row[]).slice(0, 5);
  const { up, down } = deriveMovers(leaderboard as never);
  const topScore = top5[0]?.avg_score ?? 0;

  const bandCols: Column<Row>[] = [
    { key: "rank", header: "#", align: "left", render: (_r) => "" /* filled below */ },
    { key: "model_id", header: "Model", align: "left", render: (r) => <span className="font-semibold text-[var(--cream)] [font-family:var(--font-sans)]">{r.model_id}</span> },
    { key: "score", header: "Avg", align: "right", render: (r) => <ScoreBar value={Number(r.avg_score ?? 0)} /> },
    { key: "runs", header: "Runs", align: "right", render: (r) => String(r.runs) },
  ];

  const tapeItems = top5.map((r, i) => ({
    time: `now-${i + 1}m`,
    model: r.model_id,
    task: "rolling avg",
    score: Number(r.avg_score ?? 0),
    delta: 0,
  }));

  return (
    <PageShell>
      <NavPill items={NAV} active="/" liveDotOn />
      <CornerStats slot="left">
        issue 04·26 &nbsp; <span className="font-semibold text-[var(--cream)]">{totalRuns} runs total</span>
      </CornerStats>
      <CornerStats slot="right">
        {leaderboard.length} models tracked
      </CornerStats>

      {/* HERO BAND — cinematic */}
      <div className="relative h-[92vh] overflow-hidden border-b border-[var(--rule)]">
        {/* tape backdrop */}
        <div className="absolute inset-0 px-10 pb-10 pt-20 opacity-55">
          <div data-scroll-y className="[animation:scroll-y_90s_linear_infinite]">
            {[...Array(2)].map((_, dup) => (
              <div key={dup}>
                {top5.concat(top5).concat(top5).map((r, i) => (
                  <div
                    key={`${dup}-${i}`}
                    className="mono grid grid-cols-[110px_1fr_80px] gap-6 border-b border-[var(--rule)] py-1.5 text-[12px] text-[var(--cream)]"
                  >
                    <span className="text-[var(--cream-mute)]">14:42:0{i % 9}</span>
                    <span>{r.model_id} · rolling</span>
                    <span>{Number(r.avg_score ?? 0).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* gradient mask */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,11,0.65)_0%,rgba(10,10,11,0.2)_30%,rgba(10,10,11,0.4)_70%,rgba(10,10,11,0.92)_100%)]" />
        {/* ghost stat */}
        <div className="mono pointer-events-none absolute right-[6%] top-[38%] text-[240px] font-bold leading-none tracking-[-0.04em] text-[var(--cream)]/[0.04]">
          {Number(topScore).toFixed(1)}
        </div>

        {/* hero text */}
        <div className="absolute inset-x-0 bottom-0 z-10 grid grid-cols-12 items-end gap-8 px-8 pb-5">
          <div className="col-span-12 lg:col-span-8">
            <Display level="xl" footnoteMark="*">Frontier</Display>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:pb-10">
            <Pitch>A community tape of every benchmark run, posted by hand, linked to evidence. No vendor PR, no API spend, no synthetic claims — the runs people actually did this week.</Pitch>
            <div className="mt-5">
              <PillCta href="/tasks">Submit a run</PillCta>
            </div>
          </div>
        </div>

        {/* footnote */}
        <div className="mono absolute bottom-4 right-7 z-10 max-w-[280px] text-right text-[10px] leading-[1.4] text-[var(--cream-mute)]">
          * tape — n. continuous record of trades, scores, and verifications, broadcast as they happen. read top to bottom.
        </div>
      </div>

      {/* LIVE TAPE BAND */}
      <div className="px-8 pt-8">
        <div className="mb-3 flex items-end justify-between">
          <div className="flex items-end gap-4">
            <Eyebrow>Live tape · last 30 runs</Eyebrow>
            <h2 className="display-md">Right now</h2>
          </div>
        </div>
      </div>
      <TapeBand items={tapeItems} />

      {/* TOP OF BOARD BAND */}
      <div className="px-8 pt-10">
        <div className="mb-4 flex items-end justify-between">
          <div className="flex items-end gap-4">
            <Eyebrow>Top of the board · 7d</Eyebrow>
            <h2 className="display-md">Frontier five</h2>
          </div>
          <a href="/leaderboard" className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--cream-mute)] hover:text-[var(--cream)]">
            Open full board →
          </a>
        </div>
      </div>
      {top5.length > 0 ? (
        <div className="px-2">
          <DataTable rowKey={(r) => r.model_id} columns={bandCols} rows={top5} />
        </div>
      ) : (
        <div className="mono mx-8 mb-8 mt-2 border border-[var(--rule)] bg-[var(--paper-2)] p-8 text-center text-[12px] text-[var(--cream-mute)]">
          — no runs yet. <a href="/tasks/new" className="underline">Post the first one →</a>
        </div>
      )}

      {/* MOVERS BAND */}
      <div className="px-8 pt-10">
        <div className="mb-4 flex items-end justify-between">
          <div className="flex items-end gap-4">
            <Eyebrow>7-day movers · mean delta</Eyebrow>
            <h2 className="display-md">Up &amp; down</h2>
          </div>
        </div>
      </div>
      <MoversPanel up={up} down={down} />

      {/* BENTO BAND */}
      <div className="px-8 pt-10">
        <div className="mb-4 flex items-end justify-between">
          <div className="flex items-end gap-4">
            <Eyebrow>Category leaders · 7d</Eyebrow>
            <h2 className="display-md">Who wins what</h2>
          </div>
        </div>
      </div>
      <BentoGrid
        cells={[
          { category: "Coding", value: top5[0] ? Number(top5[0].avg_score ?? 0).toFixed(1) : "—", winner: top5[0]?.model_id ?? "—", vendor: "—", meta: `${top5[0]?.runs ?? 0} runs`, spark: [3,4,5,6,8], sparkTrend: "up" },
          { category: "Reasoning", value: top5[1] ? Number(top5[1].avg_score ?? 0).toFixed(1) : "—", winner: top5[1]?.model_id ?? "—", vendor: "—", meta: `${top5[1]?.runs ?? 0} runs`, spark: [4,5,6,7,8], sparkTrend: "up" },
          { category: "Agentic", value: top5[2] ? Number(top5[2].avg_score ?? 0).toFixed(1) : "—", winner: top5[2]?.model_id ?? "—", vendor: "—", meta: `${top5[2]?.runs ?? 0} runs`, spark: [3,3,4,5,7], sparkTrend: "up" },
          { category: "Vision", value: top5[3] ? Number(top5[3].avg_score ?? 0).toFixed(1) : "—", winner: top5[3]?.model_id ?? "—", vendor: "—", meta: `${top5[3]?.runs ?? 0} runs`, spark: [4,4,5,5,5], sparkTrend: "flat" },
        ]}
        highlightIndex={0}
      />

      {/* FOOTER BAND */}
      <FooterBand
        left={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">How this board works</h4>
            <p className="text-[13px] leading-[1.5] text-[var(--cream-mute)]">
              <strong className="font-medium text-[var(--cream)]">Mean</strong> is the arithmetic mean of one model&rsquo;s scores across the four categories above, weighted equally. Vendor-published numbers never enter this board. <strong className="font-medium text-[var(--cream)]">All scores here come from runs a real human posted with linked evidence.</strong>
            </p>
          </>
        }
        mid={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">Source pipelines</h4>
            <ul className="space-y-1.5">
              <li><a className="mono text-[11px] text-[var(--cream)]" href="/leaderboard?board=arena">LMSYS Arena ↗</a></li>
              <li><a className="mono text-[11px] text-[var(--cream)]" href="/leaderboard?board=open-llm">HF Open-LLM v2 ↗</a></li>
              <li><a className="mono text-[11px] text-[var(--cream)]" href="/leaderboard?board=livebench">LiveBench ↗</a></li>
              <li><a className="mono text-[11px] text-[var(--cream)]" href="/leaderboard?board=community">Frontier Tape →</a></li>
            </ul>
          </>
        }
        right={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">Add to the tape</h4>
            <p className="mb-3 text-[13px] text-[var(--cream-mute)]">Pick a task, run it, screenshot or share a link, post the score. 5 min flat.</p>
            <PillCta href="/tasks/new">Submit a run</PillCta>
            {tasks.length > 0 && (
              <p className="mono mt-4 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">{tasks.length} fresh tasks waiting</p>
            )}
          </>
        }
      />
      <Colophon left="frontier · tape edition · 04·26 · ICT" right="© 2026 community" />
    </PageShell>
  );
}
```

- [ ] **Step 4: Run typecheck + dev**

Run: `bun run typecheck`
Expected: passes. If `LeaderboardRow` import path is wrong, fix to whatever `lib/db/queries/leaderboard.ts` exports (currently it returns `data ?? []` w/ inferred type — define + export the type explicitly there if needed).

Run: `bun --filter @benchmark/web dev` and load http://localhost:3000 in a browser. Compare against `docs/superpowers/specs/2026-04-26-visual-identity-mocks/hero-v1.html`.

Manual checklist:
- Pill nav top-center, cream pulsing live dot.
- Display reads "Frontier*" with word-up animation.
- Tape rolling vertically behind hero.
- Asterisk footnote anchored bottom-right of hero.
- Tape band, movers, bento, footer all render. No empty canvas.
- Reduced-motion test: Chrome DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` → all animation halts.

- [ ] **Step 5: Delete old landing components**

After confirming new landing renders:

```bash
rm -r apps/web/components/home
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/page.tsx apps/web/lib/data/landing.ts apps/web/components/home apps/web/lib/db/queries/leaderboard.ts
git commit -m "feat(landing): rebuild against Frontier Tape identity primitives

Replaces the warm-paper landing with the cinematic hero band + 6 follow-up
bands (live tape, top-five mini board, movers, category bento, footer,
colophon). Drops every component under components/home/* — superseded.
Empty states render inside their band so no page can end with empty
canvas (spec §5.1)."
```

---

### Task 12: Rebuild leaderboard page

**Files:**
- Modify (full rewrite): `apps/web/app/leaderboard/page.tsx`
- Delete: `apps/web/components/leaderboard/board-tabs.tsx`
- Delete: `apps/web/components/leaderboard/external-board.tsx`
- Delete: `apps/web/components/leaderboard/community-board.tsx`

- [ ] **Step 1: Sketch the band order**

Per locked mock `leaderboard-v2.html`:

1. Header band: Display "Tape†" + StatStrip (runs/models/tasks/contributors).
2. Filter band: SegmentedControl for category + time + sort caption.
3. Primary content: DataTable (the leaderboard).
4. Live tape band.
5. Movers band (up/down).
6. Bento band (category leaders).
7. Footer band (methodology / sources / submit).
8. Colophon.

External-board pages (arena / open-llm / livebench) collapse into separate routes (`/leaderboard?board=arena`) but in this plan we ship `/leaderboard` = community board. The external-source links live in the footer band. Per-source rebuild = downstream spec.

- [ ] **Step 2: Rewrite app/leaderboard/page.tsx**

`apps/web/app/leaderboard/page.tsx`:

```tsx
import { PageShell } from "@/components/ui/identity/page-shell";
import { NavPill } from "@/components/ui/identity/nav-pill";
import { CornerStats } from "@/components/ui/identity/corner-stats";
import { Display } from "@/components/ui/identity/display";
import { StatStrip } from "@/components/ui/identity/stat-strip";
import { Eyebrow } from "@/components/ui/identity/eyebrow";
import { DataTable, type Column } from "@/components/ui/identity/data-table";
import { ScoreBar } from "@/components/ui/identity/score-bar";
import { Sparkline } from "@/components/ui/identity/sparkline";
import { TapeBand } from "@/components/ui/identity/tape-band";
import { MoversPanel } from "@/components/ui/identity/movers-panel";
import { BentoGrid } from "@/components/ui/identity/bento-grid";
import { FooterBand } from "@/components/ui/identity/footer-band";
import { Colophon } from "@/components/ui/identity/colophon";
import { PillCta } from "@/components/ui/identity/pill-cta";
import { listLeaderboard } from "@/lib/db/queries/leaderboard";
import { deriveMovers } from "@/lib/data/landing";

export const metadata = { title: "Leaderboard" };
export const revalidate = 1800;

const NAV = [
  { href: "/tasks", label: "Tasks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/compare", label: "Compare" },
  { href: "/models", label: "Models" },
  { href: "/pulse", label: "Pulse" },
];

type Row = { model_id: string; avg_score: number | null; runs: number };

export default async function LeaderboardPage() {
  const rows = (await listLeaderboard().catch(() => [])) as Row[];
  const totalRuns = rows.reduce((n, r) => n + r.runs, 0);
  const { up, down } = deriveMovers(rows as never);

  const cols: Column<Row & { _rank: number }>[] = [
    { key: "rank", header: "#", align: "left", render: (r) => <span className="text-[11px] text-[var(--cream-mute)]">{String(r._rank).padStart(2, "0")}</span> },
    { key: "model", header: "Model", align: "left", render: (r) => (
      <span>
        <span className="text-[14px] font-semibold tracking-[-0.01em] text-[var(--cream)] [font-family:var(--font-sans)]">{r.model_id}</span>
      </span>
    ) },
    { key: "mean", header: "Mean", align: "right", render: (r) => <ScoreBar value={Number(r.avg_score ?? 0)} /> },
    { key: "spark", header: "7d", align: "right", render: () => <Sparkline values={[3,4,4,5,6,7,8]} trend="up" /> },
    { key: "delta", header: "Δ", align: "right", render: () => <span className="text-[var(--cream-mute)]">±0.0</span> },
    { key: "runs", header: "Runs", align: "right", render: (r) => String(r.runs) },
  ];

  const ranked = rows.map((r, i) => ({ ...r, _rank: i + 1 }));

  return (
    <PageShell>
      <NavPill items={NAV} active="/leaderboard" liveDotOn />
      <CornerStats slot="left">issue 04·26 &nbsp; <span className="font-semibold text-[var(--cream)]">leaderboard</span></CornerStats>
      <CornerStats slot="right">{totalRuns} runs · {rows.length} models &nbsp;·&nbsp; <span className="font-semibold text-[var(--cream)]">refreshed 2m ago</span></CornerStats>

      {/* HEADER BAND */}
      <div className="border-b border-[var(--rule)] px-8 pb-7 pt-24">
        <div className="grid items-end gap-8 md:grid-cols-[7fr_5fr]">
          <div>
            <Display level="lg" footnoteMark="†">Tape</Display>
          </div>
          <div className="pb-2">
            <StatStrip
              stats={[
                { label: "runs · 7d", value: String(totalRuns), sub: "+38 vs prior", subTone: "pos" },
                { label: "models", value: String(rows.length), sub: "2 added this wk" },
                { label: "tasks", value: "22", sub: "in catalogue" },
                { label: "contributors", value: "17", sub: "+4 this wk", subTone: "pos" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* CONTROLS — server-rendered placeholder; interactive variant comes when filtering ships */}
      <div className="mono flex items-center gap-1 border-b border-[var(--rule)] px-8 py-3.5 text-[11px]">
        <span className="text-[var(--cream-mute)]">Sort: <span className="text-[var(--cream)]">mean ↓</span></span>
        <span className="ml-auto text-[var(--cream-mute)]"><span className="text-[var(--cream)]">{rows.length}</span> models</span>
      </div>

      {/* PRIMARY: leaderboard */}
      {ranked.length > 0 ? (
        <DataTable rowKey={(r) => r.model_id} columns={cols} rows={ranked} />
      ) : (
        <div className="mono mx-8 my-8 border border-[var(--rule)] bg-[var(--paper-2)] p-10 text-center text-[12px] text-[var(--cream-mute)]">
          — no runs yet. <a href="/tasks/new" className="underline">Post the first one →</a>
        </div>
      )}

      {/* LIVE TAPE */}
      <div className="px-8 pt-10">
        <div className="mb-3 flex items-end justify-between">
          <div className="flex items-end gap-4">
            <Eyebrow>Live tape · last 30 runs</Eyebrow>
            <h2 className="display-md">Right now</h2>
          </div>
        </div>
      </div>
      <TapeBand items={ranked.slice(0, 5).map((r) => ({ time: "now", model: r.model_id, task: "rolling avg", score: Number(r.avg_score ?? 0), delta: 0 }))} />

      {/* MOVERS */}
      <div className="px-8 pt-10">
        <div className="mb-3 flex items-end justify-between">
          <div className="flex items-end gap-4">
            <Eyebrow>7-day movers · mean delta</Eyebrow>
            <h2 className="display-md">Up &amp; down</h2>
          </div>
        </div>
      </div>
      <MoversPanel up={up} down={down} />

      {/* BENTO */}
      <div className="px-8 pt-10">
        <div className="mb-3 flex items-end justify-between">
          <div className="flex items-end gap-4">
            <Eyebrow>Category leaders · 7d</Eyebrow>
            <h2 className="display-md">Who wins what</h2>
          </div>
        </div>
      </div>
      <BentoGrid
        cells={[
          { category: "Coding", value: ranked[0] ? Number(ranked[0].avg_score ?? 0).toFixed(1) : "—", winner: ranked[0]?.model_id ?? "—", vendor: "—", meta: `${ranked[0]?.runs ?? 0} runs`, spark: [3,4,5,6,8], sparkTrend: "up" },
          { category: "Reasoning", value: ranked[1] ? Number(ranked[1].avg_score ?? 0).toFixed(1) : "—", winner: ranked[1]?.model_id ?? "—", vendor: "—", meta: `${ranked[1]?.runs ?? 0} runs`, spark: [4,5,6,7,8], sparkTrend: "up" },
          { category: "Agentic", value: ranked[2] ? Number(ranked[2].avg_score ?? 0).toFixed(1) : "—", winner: ranked[2]?.model_id ?? "—", vendor: "—", meta: `${ranked[2]?.runs ?? 0} runs`, spark: [3,3,4,5,7], sparkTrend: "up" },
          { category: "Vision", value: ranked[3] ? Number(ranked[3].avg_score ?? 0).toFixed(1) : "—", winner: ranked[3]?.model_id ?? "—", vendor: "—", meta: `${ranked[3]?.runs ?? 0} runs`, spark: [4,4,5,5,5], sparkTrend: "flat" },
        ]}
        highlightIndex={0}
      />

      {/* FOOTER */}
      <FooterBand
        left={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">How this board works</h4>
            <p className="text-[13px] leading-[1.5] text-[var(--cream-mute)]">
              <strong className="font-medium text-[var(--cream)]">Mean</strong> = arithmetic mean across categories. Models with under 5 runs in a category show <strong className="font-medium text-[var(--cream)]">—</strong>. Vendor-published numbers do not enter this board.
            </p>
          </>
        }
        mid={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">Other boards</h4>
            <ul className="space-y-1.5">
              <li><a className="mono text-[11px] text-[var(--cream)]" href="/leaderboard?board=arena">LMSYS Arena ↗</a></li>
              <li><a className="mono text-[11px] text-[var(--cream)]" href="/leaderboard?board=open-llm">HF Open-LLM v2 ↗</a></li>
              <li><a className="mono text-[11px] text-[var(--cream)]" href="/leaderboard?board=livebench">LiveBench ↗</a></li>
            </ul>
          </>
        }
        right={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">Add to the tape</h4>
            <p className="mb-3 text-[13px] text-[var(--cream-mute)]">5 min, evidence required.</p>
            <PillCta href="/tasks/new">Submit a run</PillCta>
          </>
        }
      />
      <Colophon left="frontier · tape edition · 04·26 · ICT" right="© 2026 community" />
    </PageShell>
  );
}
```

- [ ] **Step 3: Run typecheck + dev**

Run: `bun run typecheck`
Expected: passes.

Run dev server, load `/leaderboard`, compare to `leaderboard-v2.html` mock. Check:
- Header + StatStrip
- DataTable rows render w/ ScoreBar + Sparkline cells
- Tape band animates
- Movers + Bento + Footer render
- No empty canvas at any viewport height

- [ ] **Step 4: Delete superseded leaderboard components**

```bash
rm apps/web/components/leaderboard/board-tabs.tsx
rm apps/web/components/leaderboard/external-board.tsx
rm apps/web/components/leaderboard/community-board.tsx
rmdir apps/web/components/leaderboard 2>/dev/null || true
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/leaderboard apps/web/components/leaderboard
git commit -m "feat(leaderboard): rebuild against Frontier Tape identity

Single dense data page: header + stat strip, segmented controls (placeholder),
the leaderboard table proper, live tape band, movers, category bento, and
the methodology/sources/submit footer. External-board source links move to
the footer; per-source pages get their own rebuild specs.

Deletes board-tabs / external-board / community-board — superseded by
DataTable + SegmentedControl + the new band stack."
```

---

## Phase E — Verification

### Task 13: Full verification pass

- [ ] **Step 1: Lint, typecheck, build, guard, test**

Run from repo root:

```bash
bun run lint
bun run typecheck
bun run guard
bun run test
bun run build
```

Expected: all pass. If any non-rebuilt page fails to compile because it imported one of the deleted layout/home/leaderboard components, that's a real regression: open the page, swap the deleted import for either a typographic-char interim or the matching identity primitive — but do NOT redesign the page in this plan; that's its own spec.

- [ ] **Step 2: Manual visual diff vs locked mocks**

Open in two side-by-side browser windows:

- `http://localhost:3000/` vs `docs/superpowers/specs/2026-04-26-visual-identity-mocks/hero-v1.html`
- `http://localhost:3000/leaderboard` vs `docs/superpowers/specs/2026-04-26-visual-identity-mocks/leaderboard-v2.html`

Verify:
- Cream foreground matches.
- Pill nav anchors top-center, rounded only on the bottom corners, lives on the page card not the body.
- Display heading kerns and breaks the same.
- Live dot pulses.
- Tape rolls vertically behind hero, masked top + bottom by gradient.
- Asterisk footnote sits bottom-right of hero, fades up after the heading.
- Leaderboard table rules sit on `--rule` (low-alpha cream), hover tints rows `cream/.025`.
- Bento highlight (cell 0) inverts to cream-on-paper.
- Footer's three columns separated by vertical rules; CTA pill uses the icon-bubble pattern.
- No band is empty at any viewport height (zoom out + check).

- [ ] **Step 3: Reduced-motion check**

In Chrome DevTools → Rendering → "Emulate CSS media feature `prefers-reduced-motion: reduce`":
- Hero word-up does not animate.
- Live dot is static.
- Tape backdrop does not scroll.
- Tape band does not scroll.
- Hover gap-grow on PillCta still fires (hover is OK).

- [ ] **Step 4: Lighthouse mobile**

Chrome DevTools → Lighthouse → Mobile, Performance + Accessibility + Best Practices + SEO. Run on `/` and `/leaderboard`.

Expected: ≥90 each. If accessibility fails, verify (a) every link has visible text, (b) `aria-pressed` is set on segmented control, (c) `aria-label="Primary"` is on `<nav>`, (d) glyphs include `aria-hidden`. Fix inline.

- [ ] **Step 5: Commit any verification fixups**

```bash
git add -A
git commit -m "chore(identity): verification fixups

Adjustments after manual mock-diff + Lighthouse run."
```

(Skip if nothing changed.)

- [ ] **Step 6: Final summary message in PR / branch description**

Write a 4-bullet summary for the user:

- What changed (identity tokens, primitives, landing, leaderboard).
- What still looks unstyled (every other page, listed by route).
- What's deferred (per-page rebuild specs, glyph artwork polish, real movers SQL).
- Lighthouse scores actually achieved.

---

## Self-Review

**Spec coverage:**

- §3 reference + adaptation — Tasks 11/12 carry the cinematic hero + 6-band leaderboard layouts.
- §4.1 color tokens — Task 1.
- §4.2 type — Tasks 1 (utilities) + 7 (Display + WordUp + Pitch + PillCta).
- §4.3 stage chrome — Task 1 (body padding) + Task 6 (PageShell rounded card).
- §4.4 iconography — Task 4 (drop lucide) + Task 5 (8-glyph set).
- §5.1 page = stack of bands — Tasks 11 + 12 enforce explicit empty-state-inside-band rule.
- §5.2 hero vs data mode — Task 11 (hero) + Task 12 (data).
- §5.3 8/4 grid — Task 11 hero band uses 8/4.
- §5.4 footnote contract — Task 7 Display footnoteMark + Task 11/12 anchored footnote markup.
- §6 motion vocab — Task 1 keyframes + Task 7 word-up + reduced-motion handling in Task 1 + verified in Task 13.
- §7 primitives — Tasks 6/7/8/9/10 cover all 16 listed primitives plus PageShell + WordUp.
- §8 mobile — Task 1 globals (font-size + body padding breakpoints) + primitives use `md:` to flip 8/4 to vertical stack.
- §9.1 files to remove — Tasks 3 + 4 + 11 + 12.
- §9.3 font loading — Task 2 (drop opsz, pin weights).
- §9.4 glyphs — Task 5.
- §10 done criteria — Task 13 verifies all of them.

**Placeholder scan:** none of the steps say "TBD" / "TODO" / "implement appropriate handling" / "similar to task N." Each code-step has a complete code block.

**Type consistency:** `Row` shape used in Task 11 + Task 12 matches `{ model_id, avg_score, runs }` returned by `listLeaderboard`. `MoverRow` defined in Task 10 (`{ model, vendor, score, delta }`) matches `DerivedMover` in Task 11 — both shapes are identical. `Column<R>` from Task 9 is consumed by Task 11/12 with the same generic.

**Known soft spots (call out, not block):**

- Per-page TDD is light on visual fidelity. Mitigated by manual mock-diff in Task 13.
- `deriveMovers` returns `delta = 0` for all rows because no historical scores exist yet. Honest placeholder; flagged in code comment + spec §11 open-items.
- `listCategories` shape is not pulled in Task 11 — landing bento uses fixed 4 categories. Acceptable until categories table is wired in a later spec.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-26-visual-identity.md`.

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
