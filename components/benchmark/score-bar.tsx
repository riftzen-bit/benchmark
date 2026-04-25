import { formatScore } from "@/lib/utils/fmt";
import type { Unit } from "@/lib/utils/fmt";

interface Props {
  value: number | null;
  max: number;
  unit: Unit;
  variant: "opus" | "gpt";
  winner: boolean;
}

export function ScoreBar({ value, max, unit, variant, winner }: Props) {
  const safeMax = max > 0 ? max : 1;
  const pct = value === null ? 0 : Math.min(100, (value / safeMax) * 100);
  const fill = variant === "opus" ? "bg-[var(--foreground)]" : "bg-[var(--mute)]";
  const label = `${variant === "opus" ? "Claude Opus 4.7" : "GPT-5.5"}: ${formatScore(value, unit)}`;
  return (
    <div className="flex items-center gap-3">
      <div
        role="meter"
        aria-valuenow={value ?? 0}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label}
        className="relative h-1.5 flex-1 bg-[var(--rule)]"
      >
        <div
          aria-hidden="true"
          className={`h-full ${fill} transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`mono w-20 text-right text-sm tnum ${
          winner ? "text-[var(--accent)] font-medium" : ""
        }`}
      >
        {formatScore(value, unit)}
      </span>
    </div>
  );
}
