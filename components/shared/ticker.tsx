"use client";
import { cn } from "@/lib/utils";

export interface TickerItem {
  id: string;
  label: string;
  opus: string;
  gpt: string;
  winner: "opus" | "gpt" | "tie" | "na";
}

interface Props {
  items: ReadonlyArray<TickerItem>;
  className?: string;
}

export function Ticker({ items, className }: Props) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div
      role="region"
      aria-label="Recent benchmark scores"
      className={cn(
        "relative overflow-hidden border-y border-[var(--rule)] bg-[var(--foreground)]/[0.02]",
        className,
      )}
    >
      <div className="flex w-max animate-ticker py-3 hover:[animation-play-state:paused] motion-reduce:!animate-none">
        {doubled.map((it, i) => (
          <span
            key={`${it.id}-${i}`}
            className="mono inline-flex items-baseline gap-2 px-6 text-xs whitespace-nowrap"
            aria-hidden={i >= items.length}
          >
            <span className="uppercase tracking-widest text-[var(--mute)]">{it.label}</span>
            <span
              className={cn(
                it.winner === "opus" && "text-[var(--opus)]",
                it.winner !== "opus" && "text-[var(--mute)]",
              )}
            >
              O {it.opus}
            </span>
            <span className="text-[var(--mute)]">·</span>
            <span
              className={cn(
                it.winner === "gpt" && "text-[var(--gpt)]",
                it.winner !== "gpt" && "text-[var(--mute)]",
              )}
            >
              G {it.gpt}
            </span>
          </span>
        ))}
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--background)] to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--background)] to-transparent"
      />
    </div>
  );
}
