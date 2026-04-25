import type { BenchmarkRow } from "@/lib/schema/benchmark";
import { winnerOf } from "@/lib/utils/delta";

interface Props {
  rows: ReadonlyArray<BenchmarkRow>;
  className?: string;
  height?: number;
}

export function ScoreSparkline({ rows, className, height = 64 }: Props) {
  const points = rows
    .filter((r) => r.opus !== null && r.gpt !== null && r.unit === "%")
    .slice(0, 12);
  if (points.length < 2) return null;

  const w = 320;
  const h = height;
  const stepX = w / (points.length - 1);

  function pathFor(getValue: (r: BenchmarkRow) => number | null) {
    return points
      .map((r, i) => {
        const v = getValue(r);
        if (v === null) return null;
        const x = i * stepX;
        const y = h - (v / 100) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .filter(Boolean)
      .join(" ");
  }

  return (
    <svg
      role="img"
      aria-label="Benchmark sparkline comparing Opus 4.7 and GPT-5.5 across recent benchmarks"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
    >
      <defs>
        <linearGradient id="sl-opus" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--opus)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--opus)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sl-gpt" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--gpt)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--gpt)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathFor((r) => r.opus)} L${w} ${h} L0 ${h} Z`}
        fill="url(#sl-opus)"
      />
      <path
        d={`${pathFor((r) => r.gpt)} L${w} ${h} L0 ${h} Z`}
        fill="url(#sl-gpt)"
      />
      <path d={pathFor((r) => r.opus)} stroke="var(--opus)" strokeWidth="1.5" fill="none" />
      <path d={pathFor((r) => r.gpt)} stroke="var(--gpt)" strokeWidth="1.5" fill="none" />
      {points.map((r, i) => {
        const winner = winnerOf(r);
        const x = i * stepX;
        const yo = r.opus !== null ? h - (r.opus / 100) * h : null;
        const yg = r.gpt !== null ? h - (r.gpt / 100) * h : null;
        return (
          <g key={r.id}>
            {yo !== null && (
              <circle
                cx={x}
                cy={yo}
                r={winner === "opus" ? 2.5 : 1.5}
                fill="var(--opus)"
              />
            )}
            {yg !== null && (
              <circle
                cx={x}
                cy={yg}
                r={winner === "gpt" ? 2.5 : 1.5}
                fill="var(--gpt)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
