import { cn } from "@/lib/utils";

export type Tone = "pos" | "neg" | "mute";
export type Stat = { label: string; value: string; sub?: string; subTone?: Tone };

const toneClass: Record<Tone, string> = {
  pos: "text-[var(--pos)]",
  neg: "text-[var(--neg)]",
  mute: "text-[var(--cream-mute)]",
};

export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn("px-4 md:px-[18px]", i !== 0 && "border-l border-[var(--rule)]")}
        >
          <div className="mono mb-1.5 text-[9px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">{s.label}</div>
          <div className="mono text-[28px] font-semibold leading-none tracking-[-0.02em] text-[var(--cream)]">{s.value}</div>
          {s.sub && (
            <div className={cn("mono mt-1 text-[10px]", toneClass[s.subTone ?? "mute"])}>{s.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
