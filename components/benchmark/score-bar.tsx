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
  const pct = value === null ? 0 : Math.min(100, (value / max) * 100);
  const fill = variant === "opus" ? "bg-[var(--foreground)]" : "bg-[var(--mute)]";
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-1.5 flex-1 bg-[var(--rule)]">
        <div
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
