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
            <Stat label="Opus" value={tally.opus} />
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
