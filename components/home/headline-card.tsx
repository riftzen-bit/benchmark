import { Eyebrow } from "@/components/shared/eyebrow";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { WinnerMark } from "@/components/shared/winner-mark";
import { SourceCite } from "@/components/benchmark/source-cite";
import { ScorePair } from "@/components/benchmark/score-pair";
import { winnerOf, deltaOf } from "@/lib/utils/delta";
import type { BenchmarkRow } from "@/lib/schema/benchmark";

interface Props {
  row: BenchmarkRow;
  className?: string;
}

export function HeadlineCard({ row, className }: Props) {
  const winner = winnerOf(row);
  const delta = deltaOf(row.opus, row.gpt);
  return (
    <article
      className={[
        "flex flex-col gap-4 border border-[var(--rule)] p-5 transition-colors hover:border-[var(--foreground)]",
        className ?? "",
      ].join(" ")}
    >
      {/* Header */}
      <header>
        <Eyebrow>{row.category}</Eyebrow>
        <h3 className="display mt-1 text-xl leading-snug">
          {row.label}
          <SourceCite ids={row.sourceIds} />
        </h3>
      </header>

      {/* Score bars */}
      <div className="flex-1">
        <ScorePair row={row} showLabels />
      </div>

      {/* Footer */}
      <footer className="flex items-center gap-3 flex-wrap">
        <DeltaBadge delta={delta} higherIsBetter={row.higherIsBetter} unit={row.unit} />
        {winner !== "na" && winner !== "tie" && (
          <WinnerMark winner={winner} forSide={winner} />
        )}
      </footer>
    </article>
  );
}
