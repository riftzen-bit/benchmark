import { BENCHMARKS } from "@/lib/data/benchmarks";
import { pickByIds } from "@/lib/utils/aggregate";
import { winnerOf } from "@/lib/utils/delta";
import { formatScore } from "@/lib/utils/fmt";
import { Ticker } from "@/components/shared/ticker";
import type { TickerItem } from "@/components/shared/ticker";

const TAPE_IDS = [
  "swe-bench-pro",
  "terminal-bench-2",
  "gpqa-diamond",
  "mmmlu",
  "browsecomp",
  "mcp-atlas",
  "hle-no-tools",
  "output-price",
] as const;

export function IssueTape() {
  const rows = pickByIds(BENCHMARKS, TAPE_IDS);
  const items: TickerItem[] = rows.map((row) => ({
    id: row.id,
    label: row.label,
    opus: formatScore(row.opus, row.unit),
    gpt: formatScore(row.gpt, row.unit),
    winner: winnerOf(row),
  }));
  return <Ticker items={items} />;
}
