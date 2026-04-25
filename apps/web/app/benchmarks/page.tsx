import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { BenchmarkBoard } from "@/components/benchmark/benchmark-board";
import { BENCHMARKS } from "@/lib/data/benchmarks";

export const metadata = {
  title: "Benchmarks. Opus 4.7 vs GPT-5.5",
};

export default function BenchmarksPage() {
  return (
    <Container width="wide" className="py-16 md:py-20">
      <header className="mb-10">
        <Eyebrow>The Tape · Issue 04.25</Eyebrow>
        <h1 className="display mt-4 text-4xl tracking-tight md:text-5xl">
          All {BENCHMARKS.length} benchmarks, side by side
        </h1>
        <p className="mt-4 max-w-[65ch] leading-relaxed text-[var(--mute)]">
          Every cell carries a superscript citation linking to the primary source. Click
          column headers to sort. Filter by category using the chips below.{" "}
          <span className="mono">n/a</span> means the vendor has not published a number,
          or no reliable third-party figure was found.
        </p>
      </header>
      <BenchmarkBoard data={BENCHMARKS} />
    </Container>
  );
}
