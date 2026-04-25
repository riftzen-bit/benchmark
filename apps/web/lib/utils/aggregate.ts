import type { BenchmarkRow } from "@/lib/schema/benchmark";
import { winnerOf } from "@/lib/utils/delta";

export interface Tally {
  opus: number;
  gpt: number;
  tie: number;
  na: number;
  total: number;
}

export function tallyOf(rows: ReadonlyArray<BenchmarkRow>): Tally {
  const t: Tally = { opus: 0, gpt: 0, tie: 0, na: 0, total: rows.length };
  for (const r of rows) {
    const w = winnerOf(r);
    if (w === "opus") t.opus += 1;
    else if (w === "gpt") t.gpt += 1;
    else if (w === "tie") t.tie += 1;
    else t.na += 1;
  }
  return t;
}

export function pickByIds<T extends { id: string }>(
  rows: ReadonlyArray<T>,
  ids: ReadonlyArray<string>,
): ReadonlyArray<T> {
  return ids
    .map((id) => rows.find((r) => r.id === id))
    .filter((r): r is T => Boolean(r));
}

export function groupByCategory<T extends { category: string }>(
  rows: ReadonlyArray<T>,
): ReadonlyArray<{ category: T["category"]; rows: ReadonlyArray<T> }> {
  const order = new Map<string, T[]>();
  for (const r of rows) {
    const list = order.get(r.category) ?? [];
    list.push(r);
    order.set(r.category, list);
  }
  return Array.from(order.entries()).map(([category, rows]) => ({
    category: category as T["category"],
    rows,
  }));
}
