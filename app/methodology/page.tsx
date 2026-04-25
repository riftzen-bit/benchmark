import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { MethSection } from "@/components/methodology/section";
import { SourceList } from "@/components/methodology/source-list";
import { CaveatList } from "@/components/methodology/caveat-list";
import { SITE_META } from "@/lib/data/meta";

export const metadata: Metadata = {
  title: "Methodology",
};

const CAVEATS = [
  {
    title: "Vendor-only benchmarks",
    body: "Some benchmarks have only been published by one vendor. Where the other vendor has not released a comparable figure, the cell shows n/a instead of an estimate.",
  },
  {
    title: "Third-party approximations",
    body: "A few figures are approximated by reputable third-party analysts when the vendor has not published the number directly. Those rows note the approximation.",
  },
  {
    title: "Prompt and harness sensitivity",
    body: "The same benchmark can produce materially different scores under different prompts, harnesses, or effort levels. The numbers shown reflect each vendor's default reporting configuration.",
  },
  {
    title: "Run-it is anecdote, not data",
    body: "The Run-it page is for hands-on intuition only. One run on one prompt is anecdote, not statistical evaluation.",
  },
];

const TOC = [
  { id: "sources", label: "Sources" },
  { id: "caveats", label: "Caveats" },
  { id: "updates", label: "Updates" },
  { id: "scope", label: "What we don't do" },
];

export default function MethodologyPage() {
  return (
    <Container width="default" className="py-16 md:py-24">
      {/* Page header — full row */}
      <header className="mb-4">
        <Eyebrow>Provenance · Issue 04.25</Eyebrow>
        <h1 className="display mt-3 text-4xl font-medium tracking-tight leading-[1.05] md:text-6xl">
          Where the numbers come from.
        </h1>
        <p className="mt-5 max-w-[64ch] text-lg leading-relaxed text-[var(--foreground)]/85 md:text-xl">
          Every numeric cell on the Tape carries a superscript citation that links to its
          source. This site does not run any evaluations of its own — it aggregates and links.
        </p>
      </header>

      {/* 12-col grid: main content + sticky rail */}
      <div className="mt-4 grid grid-cols-1 gap-x-12 md:grid-cols-12">
        {/* Main content — cols 1-8 */}
        <div className="md:col-span-8">
          <MethSection id="sources" eyebrow="01 · the receipts" title="Sources">
            <SourceList />
          </MethSection>

          <MethSection id="caveats" eyebrow="02 · what to watch out for" title="Caveats">
            <CaveatList items={CAVEATS} />
          </MethSection>

          <MethSection id="updates" eyebrow="03 · when this changes" title="Updates">
            <p className="text-base leading-relaxed text-[var(--mute)]">
              Last updated:{" "}
              <span className="mono text-[var(--foreground)]">{SITE_META.lastUpdated}</span>. When
              either vendor releases a new model or refreshes its model card, the dataset in{" "}
              <span className="mono">lib/data/benchmarks.ts</span> is revised and the footer
              timestamp moves forward.
            </p>
          </MethSection>

          <MethSection id="scope" eyebrow="04 · scope" title="What we don't do">
            <ul role="list" className="mt-2 space-y-3 text-base leading-relaxed text-[var(--mute)]">
              <li>No API calls are made to Anthropic or OpenAI.</li>
              <li>No scraping of vendor web UIs.</li>
              <li>No storage of anything you type — copying happens entirely in your browser.</li>
              <li>No promise that both models are free at the top tier. The Run-it page lists honest cost tiers for each playground.</li>
            </ul>
          </MethSection>
        </div>

        {/* Sticky right rail — cols 10-12 */}
        <aside className="hidden md:col-span-3 md:col-start-10 md:block">
          <div className="sticky top-24">
            <Eyebrow>Sections</Eyebrow>
            <ol className="mt-4 space-y-3">
              {TOC.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="mono group flex items-baseline gap-3 text-xs text-[var(--mute)] transition-colors hover:text-[var(--foreground)]"
                  >
                    <span className="tnum text-[var(--accent)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="uppercase tracking-widest">{item.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </Container>
  );
}
