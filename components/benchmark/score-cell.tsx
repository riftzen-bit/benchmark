import { SourceCite } from "./source-cite";
import { formatScore } from "@/lib/utils/fmt";
import type { Unit } from "@/lib/utils/fmt";

interface Props {
  value: number | null;
  unit: Unit;
  isWinner: boolean;
  sourceIds?: ReadonlyArray<string>;
}

export function ScoreCell({ value, unit, isWinner, sourceIds }: Props) {
  return (
    <span
      className={`mono tnum text-sm ${
        isWinner ? "font-medium text-[var(--accent)]" : ""
      } ${value === null ? "text-[var(--mute)]" : ""}`}
    >
      {formatScore(value, unit)}
      {sourceIds && sourceIds.length > 0 ? <SourceCite ids={sourceIds} /> : null}
    </span>
  );
}
