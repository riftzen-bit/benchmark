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
      return acc;
    },
    { opus: 0, gpt: 0 },
  );

  return (
    <div className="mx-auto max-w-[1200px] px-6">
      <section className="grid gap-12 py-24 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
            April 2026 — Frontier Comparison
          </p>
          <h1 className="mt-4 text-5xl font-medium tracking-tight md:text-6xl">
            Opus 4.7
            <span className="text-[var(--mute)]"> vs </span>
            GPT-5.5
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-[var(--mute)]">
            {SITE_META.tagline} Every figure on this site is sourced from the vendor&apos;s
            release post, system card, or a reputable third-party leaderboard, with the
            citation linked from each cell.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/benchmarks"
              className="inline-flex items-center gap-2 border border-[var(--foreground)] bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] transition-colors hover:bg-transparent hover:text-[var(--foreground)]"
            >
              Open the full benchmark table
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/test-yourself"
              className="inline-flex items-center gap-2 border border-[var(--rule)] px-5 py-2.5 text-sm transition-colors hover:border-[var(--foreground)]"
            >
              Try the prompts yourself
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <aside className="md:col-span-4">
          <div className="border-t border-[var(--rule)] pt-6">
            <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
              Benchmarks tracked
            </p>
            <p className="mt-1 text-4xl tnum font-medium">{BENCHMARKS.length}</p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[var(--rule)] pt-6">
            <Stat label="Opus wins" value={tally.opus} />
            <Stat label="GPT wins" value={tally.gpt} />
            <Stat
              label="Tie / N-A"
              value={BENCHMARKS.length - tally.opus - tally.gpt}
            />
          </div>
        </aside>
      </section>

      <section className="py-16">
        <header className="mb-8 flex items-baseline justify-between">
          <h2 className="text-2xl font-medium tracking-tight">Headline benchmarks</h2>
          <Link
            href="/benchmarks"
            className="text-sm underline decoration-[var(--rule)] decoration-2 underline-offset-4 hover:decoration-[var(--accent)]"
          >
            See all {BENCHMARKS.length} →
          </Link>
        </header>
        <div className="grid md:grid-cols-2">
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">{label}</p>
      <p className="mt-1 text-2xl tnum">{value}</p>
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
        <Dt>Released</Dt>
        <Dd mono>{m.releaseDate}</Dd>
        <Dt>Context window</Dt>
        <Dd mono>{(m.contextWindow / 1000).toFixed(0)}k</Dd>
        <Dt>Max output</Dt>
        <Dd mono>{m.maxOutput ? `${(m.maxOutput / 1000).toFixed(0)}k` : "—"}</Dd>
        <Dt>Input price</Dt>
        <Dd mono>${m.inputPrice.toFixed(2)} / Mtok</Dd>
        <Dt>Output price</Dt>
        <Dd mono>${m.outputPrice.toFixed(2)} / Mtok</Dd>
        <Dt>API ID</Dt>
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
