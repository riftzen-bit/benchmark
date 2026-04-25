import type { BenchmarkRow } from "@/lib/schema/benchmark";
import type { BenchmarkCategory } from "@/lib/schema/benchmark";
import { Rule } from "@/components/shared/rule";
import { BoardRow } from "./board-row";
import { BoardMobileCard } from "./board-mobile-card";

interface Props {
  category: BenchmarkCategory;
  rows: ReadonlyArray<BenchmarkRow>;
  isFirst?: boolean;
}

export function CategorySection({ category, rows, isFirst = false }: Props) {
  return (
    <section aria-label={category}>
      <Rule weight={isFirst ? "ink" : "hair"} />
      <div className="flex items-baseline justify-between py-2">
        <p className="eyebrow">{category}</p>
        <span className="mono text-[11px] text-[var(--mute)]">
          {rows.length} {rows.length === 1 ? "benchmark" : "benchmarks"}
        </span>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        {rows.map((row) => (
          <BoardRow key={row.id} row={row} />
        ))}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        {rows.map((row) => (
          <BoardMobileCard key={row.id} row={row} />
        ))}
      </div>
    </section>
  );
}
