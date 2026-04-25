import { SOURCES } from "@/lib/data/sources";
import { SITE_META } from "@/lib/data/meta";

export const metadata = {
  title: "Methodology — Opus 4.7 vs GPT-5.5",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-[800px] px-6 py-16 leading-relaxed">
      <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
        Methodology
      </p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight">
        Where the numbers come from, and what to watch out for
      </h1>

      <section className="mt-14">
        <h2 className="text-xl font-medium">Sources</h2>
        <p className="mt-3 text-[var(--mute)]">
          Every numeric cell on the <em>Benchmarks</em> page carries a superscript citation
          that links to its source. This site does not run any evaluations of its own — it
          aggregates and links.
        </p>
        <ul className="mt-6 space-y-3 text-sm">
          {SOURCES.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[var(--rule)] decoration-2 underline-offset-4 hover:decoration-[var(--accent)]"
              >
                {s.label}
              </a>
              <span className="ml-2 mono text-xs text-[var(--mute)]">
                {s.publisher} · captured {s.capturedAt}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-medium">Caveats</h2>
        <ul className="mt-4 list-disc space-y-3 pl-6 text-[var(--mute)]">
          <li>
            Some benchmarks have only been published by one vendor. Where the other vendor
            has not released a comparable figure, the cell shows <span className="mono">n/a</span>
            instead of an estimate.
          </li>
          <li>
            A few cells are approximated by reputable third-party analysts when the vendor
            has not published the number directly. Those rows note the approximation.
          </li>
          <li>
            The same benchmark can produce materially different scores under different
            prompts, harnesses, or effort levels. The numbers shown reflect each vendor&apos;s
            default reporting configuration.
          </li>
          <li>
            The <em>Try it</em> page is for hands-on intuition, not statistical evaluation.
            One run on one prompt is anecdote, not data.
          </li>
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-medium">Updates</h2>
        <p className="mt-3 text-[var(--mute)]">
          Last updated: <span className="mono">{SITE_META.lastUpdated}</span>. When either
          vendor releases a new model or refreshes its model card, the dataset in{" "}
          <span className="mono">lib/data/benchmarks.ts</span> is revised and the footer
          timestamp moves forward.
        </p>
      </section>

      <section className="mt-14 border-t border-[var(--rule)] pt-10">
        <h2 className="text-xl font-medium">What this site does not do</h2>
        <ul className="mt-4 list-disc space-y-3 pl-6 text-[var(--mute)]">
          <li>It does not call the Anthropic or OpenAI APIs.</li>
          <li>It does not scrape vendor web UIs.</li>
          <li>It does not store anything you type into the prompt cards — copying happens
            entirely in your browser.</li>
          <li>
            It does not promise that you can test both models for free at the top tier. The{" "}
            <em>Try it</em> page lists honest cost tiers for each playground.
          </li>
        </ul>
      </section>
    </div>
  );
}
