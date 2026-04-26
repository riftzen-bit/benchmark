import { cn } from "@/lib/utils";

export type MoverRow = { model: string; vendor: string; score: number; delta: number };

function fmt(d: number) {
  if (d === 0) return "±0.0";
  return `${d > 0 ? "+" : ""}${d.toFixed(1)}`;
}

function Col({ title, subtitle, rows }: { title: string; subtitle: string; rows: MoverRow[] }) {
  return (
    <div className="px-8 pb-7 pt-6">
      <div className="mb-3.5 flex items-baseline gap-2.5">
        <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--cream)]">{title}</h3>
        <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">{subtitle}</span>
      </div>
      {rows.map((r, i) => {
        const tone = r.delta > 0 ? "text-[var(--pos)]" : r.delta < 0 ? "text-[var(--neg)]" : "text-[var(--cream-mute)]";
        return (
          <div
            key={r.model}
            className="mono grid grid-cols-[24px_1fr_70px_60px] items-baseline gap-3 border-b border-[var(--rule)] py-2.5 text-[12px] last:border-b-0"
          >
            <span className="text-[10px] text-[var(--cream-mute)]">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="text-[13px] font-semibold text-[var(--cream)] [font-family:var(--font-sans)]">{r.model}</span>
              <span className="ml-1.5 text-[9px] uppercase tracking-[0.12em] text-[var(--cream-mute)]">{r.vendor}</span>
            </span>
            <span className="text-right">{r.score.toFixed(1)}</span>
            <span className={cn("text-right font-bold", tone)}>{fmt(r.delta)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function MoversPanel({ up, down }: { up: MoverRow[]; down: MoverRow[] }) {
  return (
    <div className="grid grid-cols-1 border-b border-[var(--rule)] md:grid-cols-2">
      <Col title="Climbing" subtitle={`top ${up.length}`} rows={up} />
      <div className="md:border-l md:border-[var(--rule)]">
        <Col title="Falling" subtitle={`bottom ${down.length}`} rows={down} />
      </div>
    </div>
  );
}
