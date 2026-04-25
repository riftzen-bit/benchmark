import type { BenchmarkRow } from "@/lib/schema/benchmark";
import { winnerOf } from "@/lib/utils/delta";
import { ScoreBar } from "./score-bar";
import { ModelLabel } from "@/components/shared/model-mark";

interface Props {
  row: BenchmarkRow;
  showLabels?: boolean;
}

export function ScorePair({ row, showLabels = true }: Props) {
  const winner = winnerOf(row);
  const rawMax = Math.max(row.opus ?? 0, row.gpt ?? 0);
  const max = row.unit === "%" ? 100 : rawMax > 0 ? rawMax * 1.1 : 1;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        {showLabels ? <ModelLabel model="opus" className="w-24 shrink-0" /> : null}
        <ScoreBar
          value={row.opus}
          max={max}
          unit={row.unit}
          side="opus"
          winner={winner === "opus"}
        />
      </div>
      <div className="flex items-center gap-3">
        {showLabels ? <ModelLabel model="gpt" className="w-24 shrink-0" /> : null}
        <ScoreBar
          value={row.gpt}
          max={max}
          unit={row.unit}
          side="gpt"
          winner={winner === "gpt"}
        />
      </div>
    </div>
  );
}
