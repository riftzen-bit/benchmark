import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { ModelLabel } from "@/components/shared/model-mark";
import { CompareBoard } from "@/components/compare/compare-board";
import { CompareVerdict } from "@/components/compare/compare-verdict";
import { ModelSpecGrid } from "@/components/home/model-spec-grid";
import { BENCHMARKS } from "@/lib/data/benchmarks";

export const metadata = {
  title: "Head-to-head — Opus 4.7 vs GPT-5.5",
};

export default function ComparePage() {
  return (
    <Container width="wide" className="py-16 md:py-20">
      <header className="mb-10 grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-end">
        <div>
          <Eyebrow>Head-to-head &middot; issue 04.25</Eyebrow>
          <h1 className="display mt-4 text-4xl tracking-tight md:text-6xl">
            <ModelLabel model="opus" short={false} className="text-2xl md:text-4xl" />
            <br />
            <span className="text-[var(--mute)]">vs.</span>
            <br />
            <ModelLabel model="gpt" short={false} className="text-2xl md:text-4xl" />
          </h1>
        </div>
        <p className="max-w-prose text-base leading-relaxed text-[var(--mute)]">
          Filter by category, sort by margin, see which side wins each benchmark and by how
          much. Numbers come from cited public sources only &mdash; no in-house evals.
        </p>
      </header>

      <CompareVerdict rows={BENCHMARKS} />

      <Rule weight="hair" className="my-12" />

      <CompareBoard rows={BENCHMARKS} />

      <Rule weight="hair" className="my-16" />

      <header className="mb-6">
        <Eyebrow>Spec sheet</Eyebrow>
        <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">
          Architecture &amp; price.
        </h2>
      </header>
      <ModelSpecGrid />
    </Container>
  );
}
