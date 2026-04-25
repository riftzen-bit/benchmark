import type { BenchmarkRow } from "@/lib/schema/benchmark";
import { winnerOf, deltaOf } from "@/lib/utils/delta";
import { ScorePair } from "./score-pair";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { SourceCite } from "./source-cite";

interface Props {
  row: BenchmarkRow;
}

export function BoardMobileCard({ row }: Props) {
  const winner = winnerOf(row);
  const delta = deltaOf(row.opus, row.gpt);

  return (
    <div className="border-b border-[var(--rule)] py-6">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-medium leading-snug">
            {row.label}
            <SourceCite ids={row.sourceIds} />
          </p>
          {row.note ? (
            <p className="mt-0.5 text-xs text-[var(--mute)]">{row.note}</p>
          ) : null}
        </div>
        <DeltaBadge
          delta={delta}
          higherIsBetter={row.higherIsBetter}
          unit={row.unit}
          className="shrink-0 pt-0.5"
        />
      </div>

      {/* Score bars */}
      <ScorePair row={row} showLabels />

      {/* Winner label */}
      {(winner === "opus" || winner === "gpt") && (
        <p className="mono mt-2 text-[10px] uppercase tracking-widest text-[var(--mute)]">
          {winner === "opus" ? "Opus leads" : "GPT leads"}
        </p>
      )}
    </div>
  );
}
