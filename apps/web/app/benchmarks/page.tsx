import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { BenchmarkBoard } from "@/components/benchmark/benchmark-board";
import { ExternalScoresPanel } from "@/components/benchmarks/external-scores-panel";
import { BENCHMARKS } from "@/lib/data/benchmarks";
import { loadLeaderboardSnapshot } from "@/lib/data/external/leaderboards";

export const metadata = { title: "Benchmarks" };
export const revalidate = 1800;

export default async function BenchmarksPage() {
  const snap = await loadLeaderboardSnapshot();
  return (
    <Container width="wide" className="py-16 md:py-20">
      <header className="mb-10">
        <Eyebrow>The Tape · Issue 04.25</Eyebrow>
        <h1 className="display mt-4 text-4xl tracking-tight md:text-5xl">
          External boards plus {BENCHMARKS.length} cited benchmarks.
        </h1>
        <p className="mt-4 max-w-[65ch] leading-relaxed text-[var(--mute)]">
          Live snapshots from LMSYS Arena, HF Open LLM v2, and LiveBench at the top.
          In-house benchmark table below — every cell carries a superscript citation.
        </p>
      </header>

      <ExternalScoresPanel snap={snap} />

      <Rule weight="hair" className="my-12" />

      <BenchmarkBoard data={BENCHMARKS} />
    </Container>
  );
}
