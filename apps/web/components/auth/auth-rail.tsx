import Link from "next/link";
import { Brand } from "@/components/layout/brand";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { ModelDot } from "@/components/shared/model-mark";
import { BENCHMARKS } from "@/lib/data/benchmarks";
import { SOURCES } from "@/lib/data/sources";
import { tallyOf } from "@/lib/utils/aggregate";
import { SITE } from "@/lib/config/site";
import { QuoteRotator } from "./quote-rotator";

const QUOTES = [
  {
    text: "Vendor PR runs the leaderboard. We run the receipts.",
    by: "frontier·tape · editorial",
  },
  {
    text: "If a number isn't cited, it isn't a number — it's a vibe.",
    by: "house style guide",
  },
  {
    text: "One run is anecdote. A hundred cited runs is data.",
    by: "methodology, §02",
  },
  {
    text: "We don't call the API for you. You bring the receipt.",
    by: "submission rules",
  },
] as const;

export function AuthRail() {
  const tally = tallyOf(BENCHMARKS);
  return (
    <aside className="relative isolate flex h-full flex-col justify-between gap-10 overflow-hidden border-r border-[var(--rule)] bg-[var(--foreground)]/[0.025] p-8 md:p-12">
      <div
        aria-hidden
        className="dot-paper pointer-events-none absolute inset-0 opacity-40"
      />

      <div className="relative flex items-center justify-between">
        <Brand />
        <Link
          href="/"
          className="mono text-[10px] uppercase tracking-widest text-[var(--mute)] hover:text-[var(--foreground)]"
        >
          ← back to issue
        </Link>
      </div>

      <div className="relative grid gap-8">
        <div>
          <Eyebrow>Issue {SITE.issue} · live</Eyebrow>
          <h2 className="figure mt-4 text-4xl leading-[0.95] tracking-tight md:text-6xl">
            Two frontier<br />
            models. <span className="text-[var(--accent)]">{BENCHMARKS.length}</span><br />
            cited<br />
            benchmarks.
          </h2>
          <p className="mt-5 max-w-[40ch] text-sm leading-relaxed text-[var(--mute)] md:text-base">
            Open community platform for posting and comparing real LLM benchmark runs with
            cited evidence. No vendor PR. No anonymous numbers. Receipts only.
          </p>
        </div>

        <Rule weight="hair" />

        <dl className="grid grid-cols-3 gap-6">
          <div>
            <dt className="eyebrow flex items-center gap-1.5">
              <ModelDot model="opus" /> Opus leads
            </dt>
            <dd className="figure mt-1 text-3xl tabular-nums text-[var(--opus)] md:text-4xl">
              {tally.opus}
            </dd>
          </div>
          <div>
            <dt className="eyebrow flex items-center gap-1.5">
              <ModelDot model="gpt" /> GPT leads
            </dt>
            <dd className="figure mt-1 text-3xl tabular-nums text-[var(--gpt)] md:text-4xl">
              {tally.gpt}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Sources</dt>
            <dd className="figure mt-1 text-3xl tabular-nums md:text-4xl">{SOURCES.length}</dd>
          </div>
        </dl>

        <Rule weight="hair" />

        <QuoteRotator items={QUOTES} />
      </div>

      <div className="relative -mx-8 md:-mx-12">
        <p className="mono py-8 text-center text-xs uppercase tracking-widest text-[var(--mute)]">
          — section pending visual identity rebuild
        </p>
      </div>
    </aside>
  );
}
