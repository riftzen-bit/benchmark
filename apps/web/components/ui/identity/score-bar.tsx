export function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-block h-1.5 w-[110px] bg-[var(--cream-dim)]">
        <span data-fill className="block h-full bg-[var(--cream)]" style={{ width: `${pct * 100}%` }} />
      </span>
      <span className="mono min-w-[44px] text-right font-semibold text-[var(--cream)]">{value.toFixed(1)}</span>
    </span>
  );
}
