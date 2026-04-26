import { cn } from "@/lib/utils";

export type TapeItem = {
  time: string;
  model: string;
  task: string;
  score: number;
  delta?: number;
};

function deltaState(d?: number): "pos" | "neg" | "zero" | undefined {
  if (d === undefined) return undefined;
  if (d > 0) return "pos";
  if (d < 0) return "neg";
  return "zero";
}

function fmtDelta(d?: number) {
  if (d === undefined) return "";
  if (d === 0) return "±0.0";
  return `${d > 0 ? "+" : ""}${d.toFixed(1)}`;
}

export function TapeBand({ items, durationSec = 60 }: { items: TapeItem[]; durationSec?: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative flex h-14 items-center overflow-hidden border-y border-[var(--rule)] bg-[var(--paper-2)]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-[linear-gradient(90deg,var(--paper-2),transparent)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-[linear-gradient(-90deg,var(--paper-2),transparent)]" />
      <div
        data-scroll-x
        className="flex gap-9 whitespace-nowrap pl-8"
        style={{ animation: `scroll-x ${durationSec}s linear infinite` }}
      >
        {doubled.map((it, i) => {
          const ds = deltaState(it.delta);
          return (
            <span key={i} data-tape-item="true" className="mono inline-flex items-baseline gap-2 text-[12px]">
              <span className="text-[var(--cream-mute)]">{it.time}</span>
              <span className="font-semibold text-[var(--cream)] [font-family:var(--font-sans)]">{it.model}</span>
              <span className="text-[var(--cream-mute)]">·</span>
              <span>{it.task}</span>
              <span className="text-[var(--cream-mute)]">→</span>
              <span className="font-bold">{it.score.toFixed(1)}</span>
              {ds && (
                <span
                  data-delta={ds}
                  className={cn(
                    "text-[11px]",
                    ds === "pos" ? "text-[var(--pos)]" : ds === "neg" ? "text-[var(--neg)]" : "text-[var(--cream-mute)]",
                  )}
                >
                  {fmtDelta(it.delta)}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
