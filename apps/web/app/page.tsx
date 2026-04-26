import Link from "next/link";
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

type LeaderboardEntry = Awaited<ReturnType<typeof listLeaderboard>>[number];
type RankedEntry = LeaderboardEntry & { _rank: number };

export default async function HomePage() {
  const [tasks, leaderboard] = await Promise.all([
    listPublicTasks({ limit: 6 }).catch(() => []),
    listLeaderboard().catch(() => []),
  ]);

  const totalRuns = leaderboard.reduce((n, r) => n + r.runs, 0);
  const top5: RankedEntry[] = leaderboard.slice(0, 5).map((r, i) => ({ ...r, _rank: i + 1 }));
  const { up, down } = deriveMovers(leaderboard);
  const topScore = top5[0]?.avg_score ?? 0;

  const bandCols: Column<RankedEntry>[] = [
    { key: "rank", header: "#", align: "left", render: (r) => <span className="text-[11px] text-[var(--cream-mute)]">{String(r._rank).padStart(2, "0")}</span> },
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
        <div aria-hidden="true" className="absolute inset-0 px-10 pb-10 pt-20 opacity-55">
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
        <div aria-hidden="true" className="mono pointer-events-none absolute right-[6%] top-[38%] text-[240px] font-bold leading-none tracking-[-0.04em] text-[rgba(225,224,204,0.04)]">
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
          <Link href="/leaderboard" className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--cream-mute)] hover:text-[var(--cream)]">
            Open full board →
          </Link>
        </div>
      </div>
      {top5.length > 0 ? (
        <div className="px-2">
          <DataTable rowKey={(r) => `${r.model_id}-${r.category}`} columns={bandCols} rows={top5} />
        </div>
      ) : (
        <div className="mono mx-8 mb-8 mt-2 border border-[var(--rule)] bg-[var(--paper-2)] p-8 text-center text-[12px] text-[var(--cream-mute)]">
          — no runs yet. <Link href="/tasks/new" className="underline">Post the first one →</Link>
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
