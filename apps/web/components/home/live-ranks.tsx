import Link from "next/link";
import type { LeaderboardSnapshot } from "@/lib/data/external/leaderboards";
import { Eyebrow } from "@/components/shared/eyebrow";

interface Props {
  snap: LeaderboardSnapshot;
}

export function LiveRanks({ snap }: Props) {
  return (
    <section className="grid grid-cols-1 gap-px bg-[var(--rule)] md:grid-cols-3">
      <Card
        title="Arena ELO"
        subtitle="LMSYS · top 5"
        href="/leaderboard?board=arena"
        rows={snap.arena.slice(0, 5).map((e) => ({ label: e.model, value: Math.round(e.score).toString() }))}
      />
      <Card
        title="Open LLM avg"
        subtitle="HF v2 · top 5"
        href="/leaderboard?board=open-llm"
        rows={snap.openLlm.slice(0, 5).map((e) => ({ label: e.model, value: e.average.toFixed(1) }))}
      />
      <Card
        title="LiveBench global"
        subtitle="GitHub · top 5"
        href="/leaderboard?board=livebench"
        rows={snap.liveBench.slice(0, 5).map((e) => ({ label: e.model, value: e.global.toFixed(1) }))}
      />
    </section>
  );
}

function Card({
  title,
  subtitle,
  href,
  rows,
}: {
  title: string;
  subtitle: string;
  href: string;
  rows: ReadonlyArray<{ label: string; value: string }>;
}) {
  return (
    <Link
      href={href}
      className="group block bg-[var(--background)] p-5 transition-colors hover:bg-[var(--foreground)]/[0.04]"
    >
      <Eyebrow>{subtitle}</Eyebrow>
      <h3 className="display mt-2 text-lg tracking-tight group-hover:text-[var(--accent)]">
        {title}
      </h3>
      <ol className="mono mt-4 grid gap-1 text-xs">
        {rows.map((r, i) => (
          <li key={r.label} className="flex items-baseline justify-between gap-3 border-b border-[var(--rule)]/40 py-1">
            <span className="flex items-baseline gap-2">
              <span className="w-5 text-right text-[var(--mute)]">{i + 1}</span>
              <span className="truncate">{r.label}</span>
            </span>
            <span className="tnum font-medium">{r.value}</span>
          </li>
        ))}
      </ol>
    </Link>
  );
}
