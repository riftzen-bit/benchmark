import { Sparkline } from "./sparkline";
import { cn } from "@/lib/utils";

export type BentoCell = {
  category: string;
  value: string;
  winner: string;
  vendor: string;
  meta: string;
  spark: number[];
  sparkTrend?: "up" | "dn" | "flat";
};

export function BentoGrid({ cells, highlightIndex = 0 }: { cells: BentoCell[]; highlightIndex?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 px-6 pb-8 pt-2 md:grid-cols-4">
      {cells.map((c, i) => {
        const hi = i === highlightIndex;
        return (
          <div
            key={c.category}
            data-bento-cell
            data-highlight={hi}
            className={cn(
              "relative flex min-h-[170px] flex-col justify-between overflow-hidden border border-[var(--rule)] p-[18px]",
              hi ? "bg-[var(--cream)] text-[var(--paper)]" : "bg-[var(--paper-2)] text-[var(--cream)]",
            )}
          >
            <div>
              <div
                className={cn(
                  "mono text-[10px] uppercase tracking-[0.14em]",
                  hi ? "text-[rgba(10,10,11,0.6)]" : "text-[var(--cream-mute)]",
                )}
              >
                {c.category}
              </div>
              <div className="mono my-1 text-[56px] font-semibold leading-none tracking-[-0.04em]">{c.value}</div>
              <div className="text-[14px] font-semibold">
                {c.winner}
                <span
                  className={cn(
                    "mono ml-1.5 text-[9px] uppercase tracking-[0.12em]",
                    hi ? "text-[rgba(10,10,11,0.55)]" : "text-[var(--cream-mute)]",
                  )}
                >
                  {c.vendor}
                </span>
              </div>
            </div>
            <div
              className={cn(
                "mono mt-2 text-[10px]",
                hi ? "text-[rgba(10,10,11,0.6)]" : "text-[var(--cream-mute)]",
              )}
            >
              {c.meta}
            </div>
            <div className="absolute right-3.5 top-3.5">
              <Sparkline values={c.spark} trend={c.sparkTrend ?? "flat"} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
