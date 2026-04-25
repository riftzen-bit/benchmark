import { BenchmarkTable } from "@/components/benchmark/benchmark-table";
import { BENCHMARKS } from "@/lib/data/benchmarks";

export const metadata = {
  title: "Benchmarks — Opus 4.7 vs GPT-5.5",
};

export default function BenchmarksPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <header className="mb-10 max-w-[65ch]">
        <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
          Comparison table
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">All {BENCHMARKS.length} benchmarks</h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--mute)]">
          Each numeric cell carries a superscript citation that links to the source. Click
          any column header to sort. Filter by category. <span className="mono">n/a</span>
          {" "}means the vendor has not published a number, or no reliable third-party figure
          was found.
        </p>
      </header>
      <BenchmarkTable data={BENCHMARKS} />
    </div>
  );
}
