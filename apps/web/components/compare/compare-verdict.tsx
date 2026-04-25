import type { BenchmarkRow } from "@/lib/schema/benchmark";
import { tallyOf } from "@/lib/utils/aggregate";
import { Eyebrow } from "@/components/shared/eyebrow";

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
    <section aria-label="Verdict" className="grid gap-6">
      <header className="flex items-baseline justify-between gap-4">
        <Eyebrow>Verdict bar &middot; cited benchmarks only</Eyebrow>
        <span className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
          {decided}/{t.total} decided &middot; {t.na} n/a
        </span>
      </header>

      <div
        role="img"
        aria-label={`Opus leads ${t.opus}, ties ${t.tie}, GPT leads ${t.gpt}.`}
        className="flex h-3 w-full overflow-hidden border border-[var(--rule)]"
      >
        <span style={{ width: `${opusPct}%` }} className="bg-[var(--opus)]" />
        <span style={{ width: `${tiePct}%` }} className="bg-[var(--rule)]" />
        <span style={{ width: `${gptPct}%` }} className="bg-[var(--gpt)]" />
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
  opus: "text-[var(--opus)]",
  gpt: "text-[var(--gpt)]",
  tie: "text-[var(--mute)]",
};

function Cell({ label, value, pct, side }: CellProps) {
  return (
    <div className="bg-[var(--background)] px-5 py-4">
      <dt className="eyebrow">{label}</dt>
      <dd
        className={`figure mt-2 flex items-baseline gap-3 text-3xl tabular-nums md:text-4xl ${TONE[side]}`}
      >
        <span>{value}</span>
        <span className="mono text-xs text-[var(--mute)]">
          {pct.toFixed(0)}%
        </span>
      </dd>
    </div>
  );
}
