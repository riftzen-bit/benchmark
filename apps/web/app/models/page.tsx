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
import { listVisibleModels } from "@/lib/db/queries/models";
import { listLeaderboard } from "@/lib/db/queries/leaderboard";
import { vendorLabel } from "@/lib/data/vendors";

export const metadata = { title: "Models" };
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/tasks", label: "Tasks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/compare", label: "Compare" },
  { href: "/models", label: "Models" },
  { href: "/pulse", label: "Pulse" },
];

const FEATURED_IDS = new Set(["claude-opus-4-7", "gpt-5.5"]);

type Row = {
  id: string;
  vendor: string;
  released: string | null;
  context: number | null;
  runs: number;
  featured: boolean;
};

export default async function ModelsPage() {
  const [dbModels, leaderboard] = await Promise.all([
    listVisibleModels().catch(() => []),
    listLeaderboard().catch(() => []),
  ]);

  const runsByModel = new Map<string, number>();
  for (const r of leaderboard) {
    runsByModel.set(r.model_id, (runsByModel.get(r.model_id) ?? 0) + r.runs);
  }

  const rows: Row[] = dbModels.map((m) => ({
    id: m.id,
    vendor: m.vendor,
    released: m.released_at ?? null,
    context: m.context_k ?? null,
    runs: runsByModel.get(m.id) ?? 0,
    featured: FEATURED_IDS.has(m.id),
  }));

  const featured = rows.filter((r) => r.featured);
  const registry = rows.filter((r) => !r.featured);
  const vendorCount = new Set(rows.map((r) => r.vendor)).size;
  const totalRuns = rows.reduce((n, r) => n + r.runs, 0);

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
      key: "vendor",
      header: "Vendor",
      align: "left",
      render: (r) => <span className="text-[var(--cream-mute)]">{vendorLabel(r.vendor)}</span>,
    },
    {
      key: "released",
      header: "Released",
      align: "right",
      render: (r) => <span className="tabular-nums text-[var(--cream-mute)]">{r.released ?? "—"}</span>,
    },
    {
      key: "context",
      header: "Context",
      align: "right",
      render: (r) => (
        <span className="tabular-nums text-[var(--cream-mute)]">{r.context ? `${r.context}k` : "—"}</span>
      ),
    },
    {
      key: "runs",
      header: "Runs",
      align: "right",
      render: (r) => (
        <span className={`tabular-nums ${r.runs > 0 ? "text-[var(--pos)]" : "text-[var(--cream-mute)]"}`}>
          {r.runs}
        </span>
      ),
    },
  ];

  return (
    <PageShell>
      <NavPill items={NAV} active="/models" liveDotOn />
      <CornerStats slot="left">
        issue 04·26 &nbsp; <span className="font-semibold text-[var(--cream)]">model·zoo</span>
      </CornerStats>
      <CornerStats slot="right">
        {rows.length} models · {vendorCount} vendors
      </CornerStats>

      {/* HEADER BAND */}
      <div className="border-b border-[var(--rule)] px-8 pb-7 pt-24">
        <div className="grid items-end gap-8 md:grid-cols-[7fr_5fr]">
          <div>
            <Display level="lg" footnoteMark="*">
              Model·zoo
            </Display>
          </div>
          <div className="pb-2">
            <StatStrip
              stats={[
                { label: "models", value: String(rows.length) },
                { label: "vendors", value: String(vendorCount) },
                { label: "featured", value: String(featured.length) },
                { label: "total runs", value: String(totalRuns) },
              ]}
            />
          </div>
        </div>
      </div>

      {/* FEATURED FRONTIER BAND */}
      <div className="px-8 pt-10">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Eyebrow>Featured frontier · cited spec</Eyebrow>
            <h2 className="display-md">On the bench</h2>
          </div>
          <Link
            className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)] hover:text-[var(--cream)]"
            href="/compare"
          >
            head·to·head →
          </Link>
        </div>
      </div>
      {featured.length === 0 ? (
        <p className="px-8 pb-2 text-sm text-[var(--cream-mute)]">
          No featured models registered yet.
        </p>
      ) : (
        <DataTable rowKey={(r) => r.id} columns={cols} rows={featured} />
      )}

      {/* LOCAL REGISTRY BAND */}
      <div className="mt-12 border-t border-[var(--rule)] px-8 pb-3 pt-10">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Eyebrow>Local registry · accepting submissions</Eyebrow>
            <h2 className="display-md">Open floor</h2>
          </div>
          <Link
            className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)] hover:text-[var(--cream)]"
            href="/leaderboard"
          >
            leaderboard →
          </Link>
        </div>
      </div>
      {registry.length === 0 ? (
        <p className="px-8 pb-10 text-sm text-[var(--cream-mute)]">
          Registry empty (Supabase not configured for this preview). Try{" "}
          <Link href="/benchmarks" className="underline">the static catalogue</Link> instead.
        </p>
      ) : (
        <DataTable rowKey={(r) => r.id} columns={cols} rows={registry} />
      )}

      {/* FOOTER */}
      <FooterBand
        left={
          <>
            <h4 className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
              How the catalogue works
            </h4>
            <p className="text-[13px] leading-[1.5] text-[var(--cream-mute)]">
              <strong className="font-medium text-[var(--cream)]">Featured frontier</strong> are the two
              models the cited row-by-row board compares directly. The
              <strong className="font-medium text-[var(--cream)]"> local registry</strong> lists every model
              accepting community submissions, with run counts pulled live from Supabase.
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
              <li><Link className="mono text-[11px] text-[var(--cream)]" href="/compare">Head-to-head →</Link></li>
              <li><Link className="mono text-[11px] text-[var(--cream)]" href="/vendors">Vendors →</Link></li>
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
