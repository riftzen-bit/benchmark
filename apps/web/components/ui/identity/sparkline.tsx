import { cn } from "@/lib/utils";

type Trend = "up" | "dn" | "flat";

export function Sparkline({ values, trend = "flat", height = 18 }: { values: number[]; trend?: Trend; height?: number }) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  return (
    <span className="inline-flex items-end gap-px" style={{ height }}>
      {values.map((v, i) => {
        const last = i === values.length - 1;
        const h = Math.max(2, Math.round((v / max) * height));
        return (
          <span
            key={i}
            data-bar
            data-trend={last ? trend : undefined}
            className={cn(
              "w-[2px]",
              last && trend === "up"
                ? "bg-[var(--pos)]"
                : last && trend === "dn"
                ? "bg-[var(--neg)]"
                : "bg-[var(--cream)] opacity-55",
            )}
            style={{ height: `${h}px` }}
          />
        );
      })}
    </span>
  );
}
