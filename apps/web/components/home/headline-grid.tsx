import { BENCHMARKS } from "@/lib/data/benchmarks";
import { pickByIds } from "@/lib/utils/aggregate";
import { HeadlineCard } from "@/components/home/headline-card";

const HEADLINE_IDS = [
  "swe-bench-pro",
  "terminal-bench-2",
  "gpqa-diamond",
  "mmmlu",
  "browsecomp",
  "output-price",
] as const;

export function HeadlineGrid() {
  const rows = pickByIds(BENCHMARKS, HEADLINE_IDS);
  const [r0, r1, r2, r3, r4, r5] = rows;
  return (
    <div className="grid grid-cols-12 gap-px bg-[var(--rule)]">
      {/* Row 1: large (1-7) + small (8-12) */}
      {r0 && <HeadlineCard row={r0} className="col-span-12 md:col-span-7" />}
      {r1 && <HeadlineCard row={r1} className="col-span-12 md:col-span-5" />}
      {/* Row 2: three-way split */}
      {r2 && <HeadlineCard row={r2} className="col-span-12 md:col-span-5" />}
      {r3 && <HeadlineCard row={r3} className="col-span-12 md:col-span-4" />}
      {r4 && <HeadlineCard row={r4} className="col-span-12 md:col-span-3" />}
      {/* Row 3: full-width */}
      {r5 && <HeadlineCard row={r5} className="col-span-12" />}
    </div>
  );
}
