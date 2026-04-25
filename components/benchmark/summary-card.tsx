import type { BenchmarkRow } from "@/lib/schema/benchmark";
import { winnerOf, deltaOf } from "@/lib/utils/delta";
import { ScoreBar } from "./score-bar";
import { SourceCite } from "./source-cite";
import { formatDelta } from "@/lib/utils/fmt";

export function SummaryCard({ row }: { row: BenchmarkRow }) {
  const winner = winnerOf(row);
  const delta = deltaOf(row.opus, row.gpt);
  const rawMax = Math.max(row.opus ?? 0, row.gpt ?? 0);
  const max = row.unit === "%" ? 100 : rawMax > 0 ? rawMax * 1.1 : 1;
  return (
    <article className="border-t border-[var(--rule)] py-6">
      <header className="flex items-baseline justify-between">
        <h3 className="text-base font-medium tracking-tight">
          {row.label}
          <SourceCite ids={row.sourceIds} />
        </h3>
        <span className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
          {row.category}
        </span>
      </header>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-24 text-sm">Opus 4.7</span>
          <ScoreBar
            value={row.opus}
            max={max}
            unit={row.unit}
            variant="opus"
            winner={winner === "opus"}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-24 text-sm text-[var(--mute)]">GPT-5.5</span>
          <ScoreBar
            value={row.gpt}
            max={max}
            unit={row.unit}
            variant="gpt"
            winner={winner === "gpt"}
          />
        </div>
      </div>
      {delta !== null ? (
        <p className="mt-3 mono text-xs text-[var(--mute)]">
          Δ Opus−GPT = {formatDelta(delta)} {row.unit === "%" ? "pts" : ""}
        </p>
      ) : null}
    </article>
  );
}
