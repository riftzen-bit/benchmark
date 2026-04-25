import { cn } from "@/lib/utils";
import { SourceCite } from "./source-cite";
import { formatScore, type Unit } from "@/lib/utils/fmt";
import type { ModelKey } from "@/lib/config/site";

interface Props {
  value: number | null;
  unit: Unit;
  isWinner: boolean;
  side: ModelKey;
  sourceIds?: ReadonlyArray<string>;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = { sm: "text-sm", md: "text-base", lg: "text-lg" } as const;

const WIN_TONE: Record<ModelKey, string> = {
  opus: "text-[var(--opus)] font-semibold",
  gpt: "text-[var(--gpt)] font-semibold",
};

export function ScoreCell({
  value,
  unit,
  isWinner,
  side,
  sourceIds,
  size = "sm",
  className,
}: Props) {
  const tone =
    value === null
      ? "text-[var(--mute)]"
      : isWinner
        ? WIN_TONE[side]
        : "text-[var(--foreground)]";
  return (
    <span className={cn("mono tnum inline-flex items-baseline gap-0.5", SIZE[size], tone, className)}>
      {formatScore(value, unit)}
      {sourceIds && sourceIds.length > 0 ? <SourceCite ids={sourceIds} /> : null}
    </span>
  );
}
