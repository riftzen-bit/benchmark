import Link from "next/link";
import { PageShell } from "@/components/ui/identity/page-shell";
import { NavPill } from "@/components/ui/identity/nav-pill";
import { CornerStats } from "@/components/ui/identity/corner-stats";
import { Display } from "@/components/ui/identity/display";
import { StatStrip } from "@/components/ui/identity/stat-strip";
import { Eyebrow } from "@/components/ui/identity/eyebrow";
import { DataTable, type Column } from "@/components/ui/identity/data-table";
import { FooterBand } from "@/components/ui/identity/footer-band";
import { Colophon } from "@/components/ui/identity/colophon";
import { PillCta } from "@/components/ui/identity/pill-cta";
import { CompareBoard } from "@/components/compare/compare-board";
import { CompareVerdict } from "@/components/compare/compare-verdict";
import { ComparePicker } from "@/components/compare/compare-picker";
import { BENCHMARKS } from "@/lib/data/benchmarks";
import { loadLeaderboardSnapshot } from "@/lib/data/external/leaderboards";
import { tallyOf } from "@/lib/utils/aggregate";

export const metadata = { title: "Head-to-head" };
export const revalidate = 1800;

const NAV = [
  { href: "/tasks", label: "Tasks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/compare", label: "Compare" },
  { href: "/models", label: "Models" },
  { href: "/pulse", label: "Pulse" },
];

const DEFAULT_SEL = ["claude-opus-4-7", "gpt-5.5", "gemini-3-pro"];

type Search = Promise<{ models?: string }>;
type Row = { id: string; arena: number | null; openLlm: number | null; liveBench: number | null };

export default async function ComparePage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const selected = parseSelection(sp.models);
  const snap = await loadLeaderboardSnapshot();

  const matrix: Row[] = selected.map((id) => ({
    id,
    arena: snap.arena.find((e) => norm(e.model) === norm(id))?.score ?? null,
    openLlm: snap.openLlm.find((e) => norm(e.model) === norm(id))?.average ?? null,
    liveBench: snap.liveBench.find((e) => norm(e.model) === norm(id))?.global ?? null,
  }));

  const tally = tallyOf(BENCHMARKS);
  const sourceStatus = [
    { label: "arena", status: snap.sources.arena },
    { label: "open-llm", status: snap.sources.openLlm },
    { label: "livebench", status: snap.sources.liveBench },
  ];
  const liveCount = sourceStatus.filter((s) => s.status === "live").length;
  const extras = selected.filter((id) => id !== "claude-opus-4-7" && id !== "gpt-5.5");

  const cols: Column<Row>[] = [
    {
      key: "model",
      header: "Model",
      align: "left",
      render: (r) => (
        <span className="text-[14px] font-semibold tracking-[-0.01em] text-[var(--cream)] [font-family:var(--font-sans)]">
          {r.id}
        </span>
      ),
    },
    {
      key: "arena",
      header: "Arena ELO",
      align: "right",
      render: (r) => (
        <span className="tabular-nums text-[var(--cream)]">{r.arena == null ? "—" : Math.round(r.arena)}</span>
      ),
    },
    {
      key: "openllm",
      header: "Open-LLM avg",
      align: "right",
      render: (r) => (
        <span className="tabular-nums text-[var(--cream)]">{r.openLlm == null ? "—" : r.openLlm.toFixed(1)}</span>
      ),
    },
    {
      key: "livebench",
      header: "LiveBench",
      align: "right",
      render: (r) => (
        <span className="tabular-nums text-[var(--cream)]">{r.liveBench == null ? "—" : r.liveBench.toFixed(1)}</span>
      ),
    },
  ];

  return (
    <PageShell>
      <NavPill items={NAV} active="/compare" liveDotOn />
      <CornerStats slot="left">
        issue 04·26 &nbsp; <span className="font-semibold text-[var(--cream)]">head·to·head</span>
      </CornerStats>
      <CornerStats slot="right">
        {liveCount}/3 sources live · {selected.length} models
      </CornerStats>

      {/* HEADER BAND */}
      <div className="border-b border-[var(--rule)] px-8 pb-7 pt-24">
        <div className="grid items-end gap-8 md:grid-cols-[7fr_5fr]">
          <div>
            <Display level="lg" footnoteMark="*">
              Side·by·side
            </Display>
          </div>
          <div className="pb-2">
            <StatStrip
              stats={[
                { label: "models", value: String(selected.length) },
                { label: "cited rows", value: String(tally.total) },
                { label: "decided", value: String(tally.opus + tally.gpt + tally.tie) },
                { label: "n/a", value: String(tally.na) },
              ]}
            />
          </div>
        </div>
      </div>

      {/* PICKER BAND */}
      <div className="border-b border-[var(--rule)] px-8 py-5">
        <div className="mb-3 flex items-end justify-between gap-4">
          <Eyebrow>Pick 2-6 models · drives Live boards above only</Eyebrow>
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
            row-by-row below stays on Opus 4.7 vs GPT-5.5
          </span>
        </div>
        <ComparePicker selected={selected} />
        {extras.length > 0 && (
          <p className="mono mt-3 text-[11px] text-[var(--cream-mute)]">
            <span className="text-[var(--cream)]">{extras.join(", ")}</span> picked but not in row-by-row scope (cited data covers Opus + GPT only).
          </p>
        )}
      </div>

      {/* EXTERNAL RANKINGS BAND */}
      <div className="px-8 pt-10">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Eyebrow>External rankings · Arena · Open-LLM · LiveBench</Eyebrow>
            <h2 className="display-md">Live boards</h2>
          </div>
          <div className="mono flex gap-3 text-[10px] uppercase tracking-[0.14em]">
            {sourceStatus.map((s) => (
              <span
                key={s.label}
                className={s.status === "live" ? "text-[var(--pos)]" : "text-[var(--cream-mute)]"}
              >
                {s.label} · {s.status}
              </span>
            ))}
          </div>
        </div>
      </div>
      <DataTable rowKey={(r) => r.id} columns={cols} rows={matrix} />

      {/* REFERENCE PAIR DIVIDER */}
      <div className="mt-12 border-y border-[var(--rule)] bg-[var(--paper-2)] px-8 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
            Reference pair · fixed scope
          </span>
          <span className="mono text-[11px] tracking-[-0.01em] text-[var(--cream)]">
            claude-opus-4-7 <span className="text-[var(--cream-mute)]">vs</span> gpt-5.5
          </span>
        </div>
      </div>

      {/* VERDICT BAND */}
      <div className="px-8 pt-10">
        <div className="mb-3 flex items-end gap-4">
          <Eyebrow>Verdict bar · cited rows only</Eyebrow>
          <h2 className="display-md">Who wins</h2>
        </div>
        <CompareVerdict rows={BENCHMARKS} />
      </div>

      {/* CITED BENCHMARKS BAND */}
      <div className="px-8 pb-10 pt-10">
        <div className="mb-3 flex items-end gap-4">
          <Eyebrow>Cited benchmarks · per-row deltas</Eyebrow>
          <h2 className="display-md">Row by row</h2>
        </div>
        <p className="mb-5 max-w-prose text-[13px] leading-[1.5] text-[var(--cream-mute)]">
          Each row = one published benchmark. Bars show advantage of the leader; Δ is signed gap. Citation-backed numbers for more frontier models pending.
        </p>
        <CompareBoard rows={BENCHMARKS} />
      </div>

      {/* FOOTER */}
      <FooterBand
        left={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
              How head-to-head works
            </h4>
            <p className="text-[13px] leading-[1.5] text-[var(--cream-mute)]">
              <strong className="font-medium text-[var(--cream)]">External rankings</strong> pulled live from
              LMSYS Arena, HF Open-LLM v2, LiveBench. Falls back to last snapshot if a source is down.
              <strong className="font-medium text-[var(--cream)]"> Cited benchmarks</strong> below come from
              vendor cards + paper sources, never synthetic claims.
            </p>
          </>
        }
        mid={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
              Other boards
            </h4>
            <ul className="space-y-1.5">
              <li><Link className="mono text-[11px] text-[var(--cream)]" href="/leaderboard">Frontier Tape →</Link></li>
              <li><Link className="mono text-[11px] text-[var(--cream)]" href="/models">Model catalogue →</Link></li>
              <li><Link className="mono text-[11px] text-[var(--cream)]" href="/methodology">Methodology →</Link></li>
            </ul>
          </>
        }
        right={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
              Add to the tape
            </h4>
            <p className="mb-3 text-[13px] text-[var(--cream-mute)]">5 min, evidence required.</p>
            <PillCta href="/tasks/new">Submit a run</PillCta>
          </>
        }
      />
      <Colophon left="frontier · tape edition · 04·26 · ICT" right="© 2026 community" />
    </PageShell>
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
