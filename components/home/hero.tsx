import Link from "next/link";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { SITE } from "@/lib/config/site";

export function Hero({ tasksCount, runsCount }: { tasksCount: number; runsCount: number }) {
  return (
    <section className="grid gap-10 py-16 md:grid-cols-[1.4fr_1fr] md:items-end md:gap-16 md:py-24">
      <div>
        <Eyebrow>{SITE.wordmark}</Eyebrow>
        <h1 className="figure mt-4 text-5xl leading-[0.95] md:text-7xl">
          Community-run<br />
          <span className="text-[var(--accent)]">benchmarks</span> for<br />
          frontier LLMs.
        </h1>
        <p className="mt-6 max-w-prose text-base text-[var(--mute)] md:text-lg">
          {SITE.description} Anyone signs up, posts a benchmark task, submits a run with a
          public chat-share link as evidence. The leaderboard is whatever the community has
          actually run — not vendor PR.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/tasks/new"
            className="mono border border-[var(--ink)] bg-[var(--ink)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--paper)]"
          >
            Post a task
          </Link>
          <Link
            href="/leaderboard"
            className="mono border border-[var(--rule)] px-4 py-2 text-xs uppercase tracking-widest hover:border-[var(--ink)]"
          >
            Open leaderboard
          </Link>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-6 border-l border-[var(--rule)] pl-6 md:gap-8">
        <div>
          <dt className="eyebrow">Public tasks</dt>
          <dd className="figure mt-1 text-5xl tabular-nums md:text-6xl">{tasksCount}</dd>
        </div>
        <div>
          <dt className="eyebrow">Total runs</dt>
          <dd className="figure mt-1 text-5xl tabular-nums md:text-6xl">{runsCount}</dd>
        </div>
        <div className="col-span-2">
          <Rule weight="hair" className="my-2" />
          <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
            Issue {SITE.issue} · live
          </p>
        </div>
      </dl>
    </section>
  );
}
