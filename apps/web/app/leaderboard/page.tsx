import Link from "next/link";
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

type LeaderboardEntry = Awaited<ReturnType<typeof listLeaderboard>>[number];
type RankedEntry = LeaderboardEntry & { _rank: number };

export default async function LeaderboardPage() {
  const rows = await listLeaderboard().catch(() => [] as LeaderboardEntry[]);
  const totalRuns = rows.reduce((n, r) => n + r.runs, 0);
  const { up, down } = deriveMovers(rows);

  const cols: Column<RankedEntry>[] = [
    {
      key: "rank",
      header: "#",
      align: "left",
      render: (r) => (
        <span className="text-[11px] text-[var(--cream-mute)]">
          {String(r._rank).padStart(2, "0")}
        </span>
      ),
    },
    {
      key: "model",
      header: "Model",
      align: "left",
      render: (r) => (
        <span className="text-[14px] font-semibold tracking-[-0.01em] text-[var(--cream)] [font-family:var(--font-sans)]">
          {r.model_id}
        </span>
      ),
    },
    {
      key: "mean",
      header: "Mean",
      align: "right",
      render: (r) => <ScoreBar value={Number(r.avg_score ?? 0)} />,
    },
    {
      key: "spark",
      header: "7d",
      align: "right",
      render: () => <Sparkline values={[5, 5, 5, 5, 5, 5, 5]} trend="flat" />,
    },
    {
      key: "delta",
      header: "Δ",
      align: "right",
      render: () => <span className="text-[var(--cream-mute)]">—</span>,
    },
    {
      key: "runs",
      header: "Runs",
      align: "right",
      render: (r) => String(r.runs),
    },
  ];

  const ranked: RankedEntry[] = rows.map((r, i) => ({ ...r, _rank: i + 1 }));

  return (
    <PageShell>
      <NavPill items={NAV} active="/leaderboard" liveDotOn />
      <CornerStats slot="left">
        issue 04·26 &nbsp;{" "}
        <span className="font-semibold text-[var(--cream)]">leaderboard</span>
      </CornerStats>
      <CornerStats slot="right">
        {totalRuns} runs · {rows.length} models
      </CornerStats>

      {/* HEADER BAND */}
      <div className="border-b border-[var(--rule)] px-8 pb-7 pt-24">
        <div className="grid items-end gap-8 md:grid-cols-[7fr_5fr]">
          <div>
            <Display level="lg" footnoteMark="†">
              Tape
            </Display>
          </div>
          <div className="pb-2">
            <StatStrip
              stats={[
                { label: "runs · 7d", value: String(totalRuns) },
                { label: "models", value: String(rows.length) },
                { label: "tasks", value: "—" },
                { label: "contributors", value: "—" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* CONTROLS — server-rendered placeholder; interactive variant comes when filtering ships */}
      <div className="mono flex items-center gap-1 border-b border-[var(--rule)] px-8 py-3.5 text-[11px]">
        <span className="text-[var(--cream-mute)]">
          Sort: <span className="text-[var(--cream)]">mean ↓</span>
        </span>
        <span className="ml-auto text-[var(--cream-mute)]">
          <span className="text-[var(--cream)]">{rows.length}</span> models
        </span>
      </div>

      {/* PRIMARY: leaderboard */}
      {ranked.length > 0 ? (
        <DataTable
          rowKey={(r) => `${r.model_id}-${r.category}`}
          columns={cols}
          rows={ranked}
        />
      ) : (
        <div className="mono mx-8 my-8 border border-[var(--rule)] bg-[var(--paper-2)] p-10 text-center text-[12px] text-[var(--cream-mute)]">
          — no runs yet.{" "}
          <Link href="/tasks/new" className="underline">
            Post the first one →
          </Link>
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
      <TapeBand
        items={ranked.slice(0, 5).map((r) => ({
          time: "now",
          model: r.model_id,
          task: "rolling avg",
          score: Number(r.avg_score ?? 0),
          delta: 0,
        }))}
      />

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
      {/* TODO: per-category leader query — currently uses overall-top as a placeholder proxy. */}
      <BentoGrid
        cells={[
          {
            category: "Coding",
            value: ranked[0] ? Number(ranked[0].avg_score ?? 0).toFixed(1) : "—",
            winner: ranked[0]?.model_id ?? "—",
            vendor: "—",
            meta: `${ranked[0]?.runs ?? 0} runs`,
            spark: [3, 4, 5, 6, 8],
            sparkTrend: "up",
          },
          {
            category: "Reasoning",
            value: ranked[1] ? Number(ranked[1].avg_score ?? 0).toFixed(1) : "—",
            winner: ranked[1]?.model_id ?? "—",
            vendor: "—",
            meta: `${ranked[1]?.runs ?? 0} runs`,
            spark: [4, 5, 6, 7, 8],
            sparkTrend: "up",
          },
          {
            category: "Agentic",
            value: ranked[2] ? Number(ranked[2].avg_score ?? 0).toFixed(1) : "—",
            winner: ranked[2]?.model_id ?? "—",
            vendor: "—",
            meta: `${ranked[2]?.runs ?? 0} runs`,
            spark: [3, 3, 4, 5, 7],
            sparkTrend: "up",
          },
          {
            category: "Vision",
            value: ranked[3] ? Number(ranked[3].avg_score ?? 0).toFixed(1) : "—",
            winner: ranked[3]?.model_id ?? "—",
            vendor: "—",
            meta: `${ranked[3]?.runs ?? 0} runs`,
            spark: [4, 4, 5, 5, 5],
            sparkTrend: "flat",
          },
        ]}
        highlightIndex={0}
      />

      {/* FOOTER */}
      <FooterBand
        left={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
              How this board works
            </h4>
            <p className="text-[13px] leading-[1.5] text-[var(--cream-mute)]">
              <strong className="font-medium text-[var(--cream)]">Mean</strong> = arithmetic mean
              across categories. Models with under 5 runs in a category show{" "}
              <strong className="font-medium text-[var(--cream)]">—</strong>. Vendor-published
              numbers do not enter this board.
            </p>
          </>
        }
        mid={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
              Other boards
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link className="mono text-[11px] text-[var(--cream)]" href="/leaderboard?board=arena">
                  LMSYS Arena ↗
                </Link>
              </li>
              <li>
                <Link
                  className="mono text-[11px] text-[var(--cream)]"
                  href="/leaderboard?board=open-llm"
                >
                  HF Open-LLM v2 ↗
                </Link>
              </li>
              <li>
                <Link
                  className="mono text-[11px] text-[var(--cream)]"
                  href="/leaderboard?board=livebench"
                >
                  LiveBench ↗
                </Link>
              </li>
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
