import type { BenchmarkRow } from "@/lib/schema/benchmark";
import { winnerOf, deltaOf } from "@/lib/utils/delta";
import { ScoreCell } from "./score-cell";
import { ScoreBar } from "./score-bar";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { WinnerMark } from "@/components/shared/winner-mark";

interface Props {
  row: BenchmarkRow;
}

export function BoardRow({ row }: Props) {
  const winner = winnerOf(row);
  const delta = deltaOf(row.opus, row.gpt);
  const rawMax = Math.max(row.opus ?? 0, row.gpt ?? 0);
  const barMax = row.unit === "%" ? 100 : rawMax > 0 ? rawMax * 1.1 : 1;

  return (
    <div className="grid grid-cols-12 items-center gap-x-4 border-b border-[var(--rule)] py-5 transition-colors hover:bg-[var(--foreground)]/[0.02]">
      {/* Name — cols 1-5 */}
      <div className="col-span-5">
        <p className="text-base font-medium leading-snug">{row.label}</p>
        {row.note ? (
          <p className="mt-0.5 text-xs text-[var(--mute)]">{row.note}</p>
        ) : null}
      </div>

      {/* Opus — cols 6-7 */}
      <div className="col-span-2 space-y-1.5">
        <ScoreCell
          value={row.opus}
          unit={row.unit}
          isWinner={winner === "opus"}
          side="opus"
          sourceIds={row.sourceIds}
          size="md"
        />
        <ScoreBar
          value={row.opus}
          max={barMax}
          unit={row.unit}
          side="opus"
          winner={winner === "opus"}
          showLabel={false}
        />
      </div>

      {/* GPT — cols 8-9 */}
      <div className="col-span-2 space-y-1.5">
        <ScoreCell
          value={row.gpt}
          unit={row.unit}
          isWinner={winner === "gpt"}
          side="gpt"
          size="md"
        />
        <ScoreBar
          value={row.gpt}
          max={barMax}
          unit={row.unit}
          side="gpt"
          winner={winner === "gpt"}
          showLabel={false}
        />
      </div>

      {/* Delta + winner — cols 10-12 */}
      <div className="col-span-3 flex items-center justify-end gap-2">
        <DeltaBadge delta={delta} higherIsBetter={row.higherIsBetter} unit={row.unit} />
        {winner === "opus" || winner === "gpt" ? (
          <WinnerMark winner={winner} forSide={winner} />
        ) : null}
      </div>
    </div>
  );
}
