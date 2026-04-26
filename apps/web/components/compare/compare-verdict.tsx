import type { BenchmarkRow } from "@/lib/schema/benchmark";
import { tallyOf } from "@/lib/utils/aggregate";

interface Props {
  rows: ReadonlyArray<BenchmarkRow>;
}

export function CompareVerdict({ rows }: Props) {
  const t = tallyOf(rows);
  const decided = t.opus + t.gpt + t.tie;
  const opusPct = decided ? (t.opus / decided) * 100 : 0;
  const gptPct = decided ? (t.gpt / decided) * 100 : 0;
  const tiePct = decided ? (t.tie / decided) * 100 : 0;

  return (
    <section aria-label="Verdict" className="grid gap-5">
      <div className="flex items-baseline justify-end">
        <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
          {decided}/{t.total} decided &middot; {t.na} n/a
        </span>
      </div>

      <div
        role="img"
        aria-label={`Opus leads ${t.opus}, ties ${t.tie}, GPT leads ${t.gpt}.`}
        className="flex h-3 w-full overflow-hidden border border-[var(--rule)]"
      >
        <span style={{ width: `${opusPct}%` }} className="bg-[var(--pos)]" />
        <span style={{ width: `${tiePct}%` }} className="bg-[var(--cream-dim)]" />
        <span style={{ width: `${gptPct}%` }} className="bg-[var(--neg)]" />
      </div>

      <dl className="grid grid-cols-3 gap-px overflow-hidden border border-[var(--rule)] bg-[var(--rule)]">
        <Cell label="Opus 4.7 wins" value={t.opus} pct={opusPct} side="opus" />
        <Cell label="Tie" value={t.tie} pct={tiePct} side="tie" />
        <Cell label="GPT-5.5 wins" value={t.gpt} pct={gptPct} side="gpt" />
      </dl>
    </section>
  );
}

interface CellProps {
  label: string;
  value: number;
  pct: number;
  side: "opus" | "gpt" | "tie";
}

const TONE: Record<CellProps["side"], string> = {
  opus: "text-[var(--pos)]",
  gpt: "text-[var(--neg)]",
  tie: "text-[var(--cream-mute)]",
};

function Cell({ label, value, pct, side }: CellProps) {
  return (
    <div className="bg-[var(--paper)] px-5 py-4">
      <dt className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">{label}</dt>
      <dd
        className={`mono mt-2 flex items-baseline gap-3 text-3xl font-semibold leading-none tabular-nums tracking-[-0.02em] md:text-4xl ${TONE[side]}`}
      >
        <span>{value}</span>
        <span className="mono text-xs font-normal text-[var(--cream-mute)]">
          {pct.toFixed(0)}%
        </span>
      </dd>
    </div>
  );
}
