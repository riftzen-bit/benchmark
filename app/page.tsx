import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Rule } from "@/components/shared/rule";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Hero } from "@/components/home/hero";
import { ScoreTally } from "@/components/home/score-tally";
import { IssueTape } from "@/components/home/issue-tape";
import { HeadlineGrid } from "@/components/home/headline-grid";
import { ModelSpecGrid } from "@/components/home/model-spec-grid";
import { BENCHMARKS } from "@/lib/data/benchmarks";

export default function HomePage() {
  return (
    <>
      {/* Hero — inside wide container so it aligns with header */}
      <Container width="wide">
        <Hero />
      </Container>

      {/* Score tally — full-bleed within container */}
      <Container width="wide" className="px-0 md:px-0">
        <ScoreTally />
      </Container>

      {/* Ticker tape — full-bleed, outside container */}
      <div className="py-6">
        <IssueTape />
      </div>

      {/* Headline benchmarks section */}
      <Container width="wide" className="py-16 md:py-24">
        <Rule weight="hair" className="mb-10" />
        <header className="mb-8 flex items-baseline justify-between">
          <Eyebrow>Headline benchmarks</Eyebrow>
          <Link
            href="/benchmarks"
            className="mono text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--accent)]"
          >
            See all {BENCHMARKS.length} →
          </Link>
        </header>
        <HeadlineGrid />
      </Container>

      {/* Model spec section */}
      <Container width="wide" className="pb-16 md:pb-24">
        <Rule weight="hair" className="mb-10" />
        <Eyebrow className="mb-8">The two models</Eyebrow>
        <ModelSpecGrid />
      </Container>
    </>
  );
}
