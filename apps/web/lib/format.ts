export function fmtDelta(d: number): string {
  if (d === 0) return "±0.0";
  return `${d > 0 ? "+" : ""}${d.toFixed(1)}`;
}
