export type DerivedMover = { model: string; vendor: string; score: number; delta: number };

type LeaderboardRow = { model_id: string; avg_score: number | null; runs: number };

export function deriveMovers(rows: LeaderboardRow[]): { up: DerivedMover[]; down: DerivedMover[] } {
  // TODO(historical-scores): when prev_avg lands upstream, swap delta from 0 to (avg - prev).
  const mapped = rows.map((r) => ({
    model: r.model_id,
    vendor: r.model_id.split("-")[0] ?? r.model_id,
    score: Number(r.avg_score ?? 0),
    delta: 0,
  }));
  const up = mapped.slice(0, 4);
  const down = [...mapped].reverse().slice(0, 4);
  return { up, down };
}
