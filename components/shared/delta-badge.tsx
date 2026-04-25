import { cn } from "@/lib/utils";
import { formatDelta } from "@/lib/utils/fmt";

interface Props {
  delta: number | null;
  higherIsBetter: boolean;
  unit?: string;
  className?: string;
}

export function DeltaBadge({ delta, higherIsBetter, unit, className }: Props) {
  if (delta === null) {
    return (
      <span className={cn("mono tnum text-xs text-[var(--mute)]", className)}>—</span>
    );
  }
  const opusFavored = higherIsBetter ? delta > 0 : delta < 0;
  const tone =
    Math.abs(delta) < 0.05
      ? "text-[var(--mute)]"
      : opusFavored
        ? "text-[var(--opus)]"
        : "text-[var(--gpt)]";
  const suffix = unit === "%" ? " pts" : "";
  return (
    <span className={cn("mono tnum text-xs", tone, className)}>
      Δ {formatDelta(delta)}
      {suffix}
    </span>
  );
}
