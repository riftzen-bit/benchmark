import { cn } from "@/lib/utils";
import type { ModelKey } from "@/lib/config/site";
import { formatScore, type Unit } from "@/lib/utils/fmt";

interface Props {
  value: number | null;
  max: number;
  unit: Unit;
  side: ModelKey;
  winner: boolean;
  showLabel?: boolean;
  className?: string;
}

const FILL: Record<ModelKey, string> = {
  opus: "bg-[var(--opus)]",
  gpt: "bg-[var(--gpt)]",
};

export function ScoreBar({
  value,
  max,
  unit,
  side,
  winner,
  showLabel = true,
  className,
}: Props) {
  const safeMax = max > 0 ? max : 1;
  const pct = value === null ? 0 : Math.min(100, (value / safeMax) * 100);
  const label = `${side === "opus" ? "Claude Opus 4.7" : "GPT-5.5"}: ${formatScore(value, unit)}`;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="meter"
        aria-valuenow={value ?? 0}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label}
        className="relative h-1.5 flex-1 bg-[var(--rule)]"
      >
        <div
          aria-hidden
          className={cn(
            "h-full transition-[width] duration-500",
            FILL[side],
            value === null && "opacity-30",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel ? (
        <span
          className={cn(
            "mono w-20 shrink-0 text-right text-sm tnum",
            winner && (side === "opus" ? "text-[var(--opus)]" : "text-[var(--gpt)]") + " font-medium",
            value === null && "text-[var(--mute)]",
          )}
        >
          {formatScore(value, unit)}
        </span>
      ) : null}
    </div>
  );
}
