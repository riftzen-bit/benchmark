import type { LeaderboardSnapshot } from "@/lib/data/external/leaderboards";
import { Eyebrow } from "@/components/shared/eyebrow";

interface Props {
  snap: LeaderboardSnapshot;
}

export function ExternalScoresPanel({ snap }: Props) {
  return (
    <section className="grid grid-cols-1 gap-px bg-[var(--rule)] md:grid-cols-3">
      <Column
        title="LMSYS Arena"
        subtitle="ELO, top 10"
        rows={snap.arena.slice(0, 10).map((e) => ({
          rank: e.rank,
          label: e.model,
          value: Math.round(e.score).toString(),
        }))}
      />
      <Column
        title="HF Open LLM v2"
        subtitle="Average, top 10"
        rows={snap.openLlm.slice(0, 10).map((e) => ({
          rank: e.rank,
          label: e.model,
          value: e.average.toFixed(1),
        }))}
      />
      <Column
        title="LiveBench"
        subtitle="Global, top 10"
        rows={snap.liveBench.slice(0, 10).map((e) => ({
          rank: e.rank,
          label: e.model,
          value: e.global.toFixed(1),
        }))}
      />
    </section>
  );
}

function Column({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: ReadonlyArray<{ rank: number; label: string; value: string }>;
}) {
  return (
    <div className="bg-[var(--background)] p-5">
      <Eyebrow>{subtitle}</Eyebrow>
      <h3 className="display mt-2 text-lg tracking-tight">{title}</h3>
      <ol className="mono mt-4 grid gap-1 text-xs">
        {rows.map((r) => (
          <li key={r.label} className="flex items-baseline justify-between gap-3 border-b border-[var(--rule)]/40 py-1">
            <span className="flex items-baseline gap-2">
              <span className="w-6 text-right text-[var(--mute)]">{String(r.rank).padStart(2, "0")}</span>
              <span className="truncate">{r.label}</span>
            </span>
            <span className="tnum font-medium">{r.value}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
