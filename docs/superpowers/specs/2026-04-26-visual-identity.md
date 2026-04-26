# Visual Identity — Frontier Tape

**Date:** 2026-04-26
**Status:** Draft for review
**Supersedes (visual layer only):** `2026-04-25-llm-benchmark-site-design.md` §6 ("warm paper editorial"), and the Phase 4 visual placeholder in `2026-04-25-community-rebuild-master.md`.
**Scope:** identity only. Page-by-page rebuild specs come after this is locked.

## 1. Goal

Replace the current warm-paper-editorial look (Inter + Fraunces, hairline rules, accent orange/teal) with one cohesive dark identity that does **not** read as default-AI. Prove it survives both cinematic landing and dense data pages. Lock the tokens, primitives, and composition rules so every subsequent page rebuild reuses them.

## 2. Non-goals

- **Light mode.** Dropped. Single dark theme. Existing `ThemeProvider` + theme-toggle are removed in implementation.
- **Bilingual chrome (VN+EN) in this phase.** Chrome ships English-only; VN re-added in a later i18n phase via a strings layer.
- **Lucide icons** or any general-purpose icon library. Replaced by a small custom glyph set + plain typographic chars.
- **Animation system beyond what's listed in §6.** No spring physics, no scroll-jacking, no parallax.
- **Per-page rebuild.** This spec defines the language. Page rebuilds are separate specs that consume it.

## 3. Reference + adaptation

**Origin reference:** `cdn.21st.dev/waleedkibhen/saa-s-template` "Prisma" hero — cream-on-dark, full-bleed background video, oversized display heading with word pull-up, asterisk footnote, black pill nav top-center, noise + gradient overlay, pill CTA with circular icon-bubble.

**What we keep:**

- Cream `#E1E0CC` foreground on near-black `#0A0A0B` ground.
- Black pill nav top-center, rounded bottom corners only.
- Noise + downward gradient overlay on hero.
- Massive display heading with word pull-up + dagger/asterisk footnote.
- Pill CTA (cream pill, black icon-bubble suffix).
- Rounded 28px page-container corners.

**What we change for the benchmark site:**

- Background video → **live tape of real model runs** scrolling vertically. The cinematics are the data. No video file weight.
- Decorative asterisk → **functional footnote** (defines a term: "tape", "live", etc).
- Single hero with no follow-up → **stack of bands**, every page ends in a footer band with no dead canvas (see §5).
- Single brand wordmark → **issue-tape header** (`issue 04·26`, `141 runs today`, `updated 14:42:08 ICT`) anchored top-left/right, mono.

**Locked mocks** (committed alongside this spec under `2026-04-26-visual-identity-mocks/`):

- `hero-v1.html` — landing hero, cinematic mode.
- `leaderboard-v2.html` — `/leaderboard`, dense-data mode, 6-band layout.

These two mocks are normative. Future page mocks must read as the same site.

## 4. Tokens

### 4.1 Color

CSS custom properties (live in `globals.css`, also exposed to Tailwind v4 via `@theme`):

| Token | Value | Use |
|---|---|---|
| `--paper` | `#0A0A0B` | Page ground |
| `--paper-2` | `#111114` | Sub-bands, cards, tape-band background |
| `--cream` | `#E1E0CC` | Foreground text, fills, primary CTA pill |
| `--cream-mute` | `rgba(225,224,204,.55)` | Secondary text, eyebrows, vendors |
| `--cream-dim` | `rgba(225,224,204,.18)` | Tertiary text, disabled |
| `--rule` | `rgba(225,224,204,.10)` | Borders, table rules, dividers |
| `--pos` | `#5eead4` | Positive deltas, climbing, live indicator |
| `--neg` | `#f97171` | Negative deltas, falling |
| `--zero` | same as `--cream-mute` | Flat / no-change |
| `--hot` | `#ff5b3a` | Single rare emphasis (e.g. "new"). Use sparingly. |

**Rules:**

- No other accents. No vendor brand colors.
- No gradients except the hero `linear-gradient(180deg, paper/.65 0%, paper/.2 30%, paper/.4 70%, paper/.92 100%)` overlay.
- No shadows. No glow.
- Noise overlay only on hero (SVG fractalNoise, 0.35 opacity, `mix-blend: overlay`).

### 4.2 Type

Drop Fraunces. Single sans + single mono.

| Family | Weights | Use | Source |
|---|---|---|---|
| `Inter` | 400, 500, 600, 700 | Display, body, model names | `next/font/google` |
| `JetBrains Mono` | 400, 500, 600, 700 | Numerals, eyebrows, nav, labels, timestamps, IDs, sparkline rows | `next/font/google` |

OpenType: enable `tnum`, `lnum`, `ss01` on every numeric context. Lining tabular numerals everywhere or numbers don't line up.

**Type scale** (mobile in parens, otherwise desktop):

| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | `22vw` (`18vw`) | 500 | `-0.07em` | Landing hero only |
| `display-lg` | `11vw` (`14vw`) | 500 | `-0.06em` | Page-header on data pages (Tape, Compare, Tasks) |
| `display-md` | `36px` (`28px`) | 500 | `-0.04em` | Section heads (Right now, Up & down, Who wins what) |
| `body` | `13px` | 400 | `0` | Sans body text |
| `body-lg` | `14–15px` | 400/600 | `-0.01em` | Pitch paragraphs, model names in tables |
| `mono` | `12–13px` | 400/600 | tabular | Tables, deltas, timestamps |
| `eyebrow` | `10–11px` | 500 | `0.14em` upper | Section eyebrows, nav links, corner stats |
| `micro` | `9–10px` | 500 | `0.14em` upper | Vendor tags, footnote text |

### 4.3 Stage, spacing, radii

- **Stage chrome.** `<body>` has bg `#18181b` (one notch lighter than `--paper`) and `padding: 16px` (mobile `8px`). Inside, the page container is `bg: var(--paper); border-radius: 28px (mobile 20px); overflow: hidden`. The "card on a slightly lighter dark mat" effect is brand chrome, not optional. Header pill nav anchors to the top of this card, not the viewport.
- Cards, bento, controls, segmented buttons: `0` radius, except CTA pills (`999px`) and segmented-control endcaps (`999px` on first/last button only).
- Padding scale: `4 / 8 / 12 / 18 / 24 / 32 / 38 / 96` px. No 10/14/16/20 — tighter scale forces consistency.
- Bands separated by `1px solid var(--rule)`. No gap.

### 4.4 Iconography

- Default: typographic chars only (`→ ↑ ↓ · † * ± ↗ ▾ ✓ ✕`).
- Custom glyph set (commissioned, ~8 glyphs max), only where chars don't suffice:
  1. `vote-up` / `vote-down` (1 glyph, mirrored)
  2. `flag`
  3. `share`
  4. `copy`
  5. `sort`
  6. `filter`
  7. `search`
  8. `external-link`
- Glyph spec: 16px viewBox, 1.25px stroke, sharp terminals, single-color (currentColor).
- Stored as React components in `components/ui/glyphs/`.
- **No** lucide-react / phosphor / radix-icons / heroicons. Remove `lucide-react` from `package.json`.

## 5. Composition rules

### 5.1 Page = stack of bands

Every page is a vertical stack of bands. A band is a horizontal slab with its own internal grid and its own job. Bands are separated by 1px rules. **No band may be empty.** If a band has no real content for a given user/state, the band is removed, not min-heighted.

Canonical bands (not all bands appear on all pages):

1. **Header band** — display heading (page name) + side strip of meta (stats, controls, or pitch).
2. **Filter / control band** — segmented controls + sort indicator + count.
3. **Primary content band** — table, grid, hero, prompt, etc.
4. **Live tape band** — horizontal scrolling ticker of recent activity (only on pages where it adds signal — landing, leaderboard, model detail).
5. **Movers / signals band** — secondary aggregate (e.g. up-and-down, recent verdicts).
6. **Bento band** — 3–4 card grid with one card highlighted in cream-on-paper inverse (for emphasis).
7. **Footer band** — 2–3 column slab: methodology / sources / submit-CTA.
8. **Colophon strip** — single row, mono, 10px: issue, copyright, repo link.

**Density rule:** no page ends with empty canvas. If you can't justify another band, footer + colophon close it.

### 5.2 Hero mode vs data mode

Two composition modes share the identity:

- **Hero mode** (landing): tape background, ghost stat (huge translucent number), noise + gradient overlay, `display-xl`.
- **Data mode** (everything else): no tape background, no noise, no ghost stat. `display-lg`. Bands stacked tight.

The pill nav, corner stats, color tokens, type, and footer/colophon are shared.

### 5.3 Asymmetric grid

Hero band + section heads use a 12-col grid with **8/4 split** (display left, side-content right) on desktop, stacked on mobile. The 8/4 split is the brand. Avoid 6/6 (reads symmetric, generic).

### 5.4 Footnote contract

Asterisks/daggers in headings always pay off, anchored to the bottom-right of their band:

- `Frontier*` → `* tape — n. continuous record of trades, scores, and verifications, broadcast as they happen.`
- `Tape†` → `† live = updated within last 5m.`

If a heading has no real footnote, no asterisk.

## 6. Motion

Restraint. Vocabulary is small, every move means something.

| Move | Where | Duration | Easing |
|---|---|---|---|
| `word-up` | Display headings, hero pitch, hero CTA. Per-word stagger 0.08s on words. | 0.6s (heading), 0.8s (pitch/CTA) | `cubic-bezier(.16,1,.3,1)` |
| `pulse` (live dot) | Nav `Live` indicator, "live" badges | 1.6s loop | `ease-in-out` |
| `scroll-y` (tape) | Hero background tape | 90s linear infinite, vertical | `linear` |
| `scroll-x` (ticker) | Live-tape band on data pages | 60s linear infinite, horizontal, masked at edges | `linear` |
| `cta-gap` | Pill CTA hover: `gap` 8px → 14px, icon-bubble `scale(1.08)` | 0.2s | `ease` |
| `row-hover` | Table rows: bg `transparent` → `rgba(cream, .025)` | instant | n/a |

**Forbidden:** parallax, scroll-jack, page-transition slides, reveal-on-scroll fades on every section, springs, bouncy modal entries, animated gradient meshes, anything WebGL, anything that runs more than `scroll-y/x` simultaneously.

`prefers-reduced-motion: reduce` disables `word-up`, `pulse`, `scroll-y`, `scroll-x`. Hero tape becomes a static slice. CTA gap-hover becomes instant.

## 7. Component primitives

These are the building blocks. Each gets its own React file in `components/ui/identity/`. Implementation phase fills them; this spec freezes their contract.

| Primitive | Props sketch | Notes |
|---|---|---|
| `<NavPill>` | `items`, `active`, `liveDotOn` | Black, top-center, rounded bottom only. Mono uppercase 11px. Right-most slot reserved for `Sign in` / avatar. |
| `<CornerStats slot="left|right">` | children = mono uppercase strings with one `<strong>` (cream) per line | Absolute, 18px from top + 28px from edge. |
| `<Eyebrow>` | text | Mono 10–11px uppercase, `--cream-mute`. |
| `<Display level="xl|lg|md">` | text, footnoteMark? ("*" \| "†") | Word-pull-up baked in. Asterisk auto-aligns superscript. |
| `<Pitch>` | text, maxWidth=320 | `--cream-mute`, 13–15px, line-height 1.35–1.4. |
| `<PillCta href|onClick>` | text, glyph (default `→`) | Cream pill, dark icon-bubble suffix, gap-hover. |
| `<SegmentedControl>` | options, value, onChange | First/last button rounded 999, others square. Active = cream fill. |
| `<StatStrip>` | array of `{label, value, sub}`, sub colored by `pos\|neg\|mute` | 4-up, vertical-rule separators. Mono numerals. |
| `<ScoreBar>` | value 0–100, max?=100 | 110px track at `cream/.08`, fill `cream`, num right-aligned, tabular. |
| `<Sparkline>` | values[], trend?: `up\|dn\|flat` | 18px tall, 2px-wide bars, last bar tinted by trend. |
| `<DataTable>` | columns, rows | Mono 13px, narrow rules, hover cream/.025, rank cell first, vendor tag inline w/ model. |
| `<TapeBand direction="x|y">` | items[] (timestamp, model, task, score, delta) | Edge-mask gradients, infinite scroll, dup-track for seamless loop. |
| `<MoversPanel>` | up: rows[], down: rows[] | 1×2 split, vertical rule between. |
| `<BentoGrid>` | cells[], highlightIndex | 4-up. Highlight cell uses inverse (cream bg, paper fg). |
| `<FooterBand>` | left, mid, right slots | 2/1/1 columns, vertical rules, methodology + sources + submit CTA. |
| `<Colophon>` | left, right strings | Mono 10px uppercase row. |

## 8. Mobile (<768px)

Identity must hold. Adjustments only:

- `display-xl` 22vw → 18vw (still fills width).
- 8/4 grid → vertical stack: display first, then pitch + CTA below.
- Pill nav top-center → **bottom-fixed** pill (thumb reach), still black, still rounded-top corners only. `Sign in` collapses behind avatar/menu glyph.
- Corner stats become a single mono row above the display, not absolute.
- Tables: horizontal scroll on the inner element, not the page. Sparkline + score-bar columns hide first if needed.
- Bento grid 4-up → 2×2.
- Footer band 3-up → stacked.
- Hero tape background still runs (vertically). Ghost stat hidden under 768px.

## 9. Implementation notes

### 9.1 Files to remove

- `components/layout/theme-provider.tsx`
- `components/layout/theme-toggle.tsx`
- `next-themes` dep
- `lucide-react` dep
- All `dark:` Tailwind variants (single dark theme = no variant needed)
- Light-mode tokens in `globals.css` `:root` (replaced by single dark token block)
- Existing `Container`, `Eyebrow`, `Rule`, `Stat`, `Ticker`, `RelativeTime` etc. reviewed against §7 — kept only if they match the new contract; otherwise replaced.

### 9.2 Tailwind v4

All tokens in §4.1 exposed via `@theme {}` so `bg-paper`, `text-cream`, `border-rule` work. Type scale tokens not exposed as utilities — use semantic component classes (`.display-xl`, `.eyebrow`, etc.) defined in `globals.css` to keep markup readable.

### 9.3 Font loading

`next/font/google` for Inter + JetBrains Mono. Drop `axes: ["opsz"]` (current code asks for it on Inter — Inter doesn't have opsz axis). Variable font, weights `400 500 600 700`. Preload both. No `display-swap` flicker mitigation needed since dark page → cream text.

### 9.4 Custom glyphs

`components/ui/glyphs/` exports 8 named React components. Each `<svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.25} />`. No icon font, no sprite sheet.

### 9.5 Per-page guidance (informational, not normative)

- `/` (landing): hero mode + 4–5 follow-up bands (top-of-board snapshot, live tape, this-week movers, category bento, submit CTA).
- `/leaderboard`: data mode, mocked above.
- `/compare`: data mode, asymmetric VS layout (one side cream, other side outlined).
- `/tasks`, `/tasks/[slug]`: data mode, prompt block as cinematic centerpiece (cream-on-paper, mono).
- `/profile`, `/(auth)/*`: data mode, single-band forms, no chrome.
- `/methodology`, `/vendors`: data mode, long-form mono-heavy reading.

Each gets its own page-rebuild spec downstream.

## 10. Definition of done (identity layer)

- §4 tokens live in `globals.css` + Tailwind `@theme`.
- §7 primitives implemented under `components/ui/identity/` with TypeScript strict + no `any`.
- Landing hero (`app/page.tsx`) and `/leaderboard` rebuilt against the primitives, matching the locked mocks.
- Old theme-provider + theme-toggle + lucide deleted. `bun run guard`, `lint`, `typecheck`, `build` pass.
- Reduced-motion preference disables tape + word-up + pulse.
- Lighthouse mobile ≥ 90 on landing + leaderboard.
- One reviewer (user) signs off that the rebuilt landing + leaderboard read as a different site from the prior issue.

## 11. Open items (non-blocking, for downstream specs)

- Custom glyph designer / source — phosphor-clone with sharp terminals or hand-drawn? Decide in primitives implementation plan.
- Live-data refresh cadence (websocket vs polling vs ISR).
- Tape data: synthesized from `benchmark_runs` table reverse-chrono, capped at last 30. SQL for view defined in page-rebuild specs.
- Avatar / sign-in slot in nav pill (initials chip vs glyph) — picked when auth pages get their rebuild spec.
