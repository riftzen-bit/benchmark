export type Unit = "%" | "elo" | "tok/s" | "$/Mtok" | "ms" | "k";

export function formatScore(value: number | null, unit: Unit): string {
  if (value === null) return "n/a";
  switch (unit) {
    case "%":
      return `${value.toFixed(1)}%`;
    case "elo":
      return `${Math.round(value)}`;
    case "tok/s":
      return `${value.toFixed(0)} tok/s`;
    case "$/Mtok":
      return `$${value.toFixed(2)} / Mtok`;
    case "ms":
      return `${Math.round(value)} ms`;
    case "k":
      return `${value.toFixed(0)}k`;
  }
}

export function formatDelta(delta: number | null): string {
  if (delta === null) return "—";
  const formatted = delta.toFixed(1);
  if (formatted === "0.0" || formatted === "-0.0") return "0.0";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${formatted}`;
}

export function formatPrice(perMtok: number): string {
  return `$${perMtok.toFixed(2)}`;
}
