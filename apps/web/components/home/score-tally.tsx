import { BENCHMARKS } from "@/lib/data/benchmarks";
import { tallyOf } from "@/lib/utils/aggregate";
import { Stat } from "@/components/shared/stat";

export function ScoreTally() {
  const t = tallyOf(BENCHMARKS);
  return (
    <div className="grid grid-cols-2 divide-x divide-[var(--rule)] border-y border-[var(--rule)] md:grid-cols-4">
      <div className="px-6 py-5 md:px-10">
        <Stat label="Opus leads" value={t.opus} side="opus" />
      </div>
      <div className="px-6 py-5 md:px-10">
        <Stat label="GPT leads" value={t.gpt} side="gpt" />
      </div>
      <div className="px-6 py-5 md:px-10 border-t border-[var(--rule)] md:border-t-0">
        <Stat label="Tie" value={t.tie} side="tie" />
      </div>
      <div className="px-6 py-5 md:px-10 border-t border-[var(--rule)] md:border-t-0">
        <Stat label="N/A" value={t.na} />
      </div>
    </div>
  );
}
