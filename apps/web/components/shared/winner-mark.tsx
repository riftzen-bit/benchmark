import { cn } from "@/lib/utils";
import type { ModelKey } from "@/lib/config/site";
import type { Winner } from "@/lib/utils/delta";

interface Props {
  winner: Winner;
  forSide: ModelKey;
  className?: string;
}

export function WinnerMark({ winner, forSide, className }: Props) {
  if (winner !== forSide) return null;
  return (
    <span
      aria-label="winner"
      className={cn(
        "mono inline-flex h-4 items-center px-1.5 text-[10px] uppercase tracking-widest",
        forSide === "opus"
          ? "bg-[var(--opus)]/15 text-[var(--opus)]"
          : "bg-[var(--gpt)]/15 text-[var(--gpt)]",
        className,
      )}
    >
      lead
    </span>
  );
}
