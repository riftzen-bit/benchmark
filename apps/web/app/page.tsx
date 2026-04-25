import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Rule } from "@/components/shared/rule";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Hero } from "@/components/home/hero";
import { IssueTape } from "@/components/home/issue-tape";
import { ScoreTally } from "@/components/home/score-tally";
import { HeadlineGrid } from "@/components/home/headline-grid";
import { ModelSpecGrid } from "@/components/home/model-spec-grid";
import { CtaRow } from "@/components/home/cta-row";
import { listPublicTasks } from "@/lib/db/queries/tasks";
import { listLeaderboard } from "@/lib/db/queries/leaderboard";
import { fetchTrendingHFModels } from "@/lib/data/external/huggingface";
import { TrendingModels } from "@/components/home/trending-models";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [tasks, leaderboard, trending] = await Promise.all([
    listPublicTasks({ limit: 6 }).catch(() => []),
    listLeaderboard().catch(() => []),
    fetchTrendingHFModels({ limit: 8 }),
  ]);

  return (
    <>
      <Container width="wide">
        <Hero
          tasksCount={tasks.length}
          runsCount={leaderboard.reduce((n, r) => n + r.runs, 0)}
        />
      </Container>

      <IssueTape />

      <Container width="wide" className="py-16 md:py-20">
        <header className="mb-8">
          <Eyebrow>Score tally &middot; issue 04.25</Eyebrow>
          <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">
            Where each model leads.
          </h2>
        </header>
        <ScoreTally />
      </Container>

      <Container width="wide" className="pb-16 md:pb-20">
        <header className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <Eyebrow>Headline benchmarks</Eyebrow>
            <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">
              Six benchmarks worth reading first.
            </h2>
          </div>
          <Link
            href="/benchmarks"
            className="mono shrink-0 text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
          >
            All 22 →
          </Link>
        </header>
        <HeadlineGrid />
      </Container>

      <Container width="wide" className="pb-16 md:pb-20">
        <header className="mb-6">
          <Eyebrow>Spec sheet</Eyebrow>
          <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">
            Two models. Two contracts.
          </h2>
        </header>
        <ModelSpecGrid />
      </Container>

      <Container width="wide" className="pb-16 md:pb-20">
        <header className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <Eyebrow>Hugging Face &middot; trending right now</Eyebrow>
            <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">
              What the open-weights world is downloading.
            </h2>
          </div>
          <a
            href="https://huggingface.co/models?sort=trending"
            target="_blank"
            rel="noopener noreferrer"
            className="mono shrink-0 text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
          >
            On HF &nearr;
          </a>
        </header>
        <TrendingModels models={trending} />
      </Container>

      <Container width="wide" className="py-12 md:py-16">
        <Rule weight="hair" className="mb-8" />
        <header className="mb-6 flex items-baseline justify-between">
          <Eyebrow>Latest community tasks</Eyebrow>
          <Link
            href="/tasks"
            className="mono text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
          >
            All →
          </Link>
        </header>
        {tasks.length === 0 ? (
          <p className="text-sm text-[var(--mute)]">
            No community tasks yet &mdash;{" "}
            <Link href="/tasks/new" className="underline">
              post the first one
            </Link>
            . Until then, the static catalogue at{" "}
            <Link href="/benchmarks" className="underline">
              /benchmarks
            </Link>{" "}
            has 22 cited benchmarks.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--rule)] border-y border-[var(--rule)] fade-up">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3 transition-colors hover:bg-[var(--rule)]/30"
              >
                <Link href={`/tasks/${t.slug}`}>
                  <span className="font-medium">{t.title}</span>{" "}
                  <span className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
                    {t.category}
                  </span>
                </Link>
                <time className="mono text-xs text-[var(--mute)]" dateTime={t.created_at}>
                  {new Date(t.created_at).toISOString().slice(0, 10)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Container>

      <Container width="wide" className="pb-16 md:pb-24">
        <Rule weight="hair" className="mb-8" />
        <header className="mb-6 flex items-baseline justify-between">
          <Eyebrow>Top of leaderboard</Eyebrow>
          <Link
            href="/leaderboard"
            className="mono text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
          >
            Full board →
          </Link>
        </header>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-[var(--mute)]">
            No community runs yet. Sign in and submit one to seed the board.
          </p>
        ) : (
          <table className="tnum w-full border-y border-[var(--rule)] text-sm">
            <thead>
              <tr className="border-b border-[var(--rule)] text-left">
                <th className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
                  Model
                </th>
                <th className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
                  Category
                </th>
                <th className="mono py-2 pr-4 text-right text-xs uppercase tracking-widest text-[var(--mute)]">
                  Avg
                </th>
                <th className="mono py-2 text-right text-xs uppercase tracking-widest text-[var(--mute)]">
                  Runs
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.slice(0, 10).map((r) => (
                <tr
                  key={`${r.model_id}-${r.category}`}
                  className="border-b border-[var(--rule)]/60"
                >
                  <td className="mono py-2 pr-4">{r.model_id}</td>
                  <td className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
                    {r.category}
                  </td>
                  <td className="mono py-2 pr-4 text-right">
                    {r.avg_score == null ? "—" : Number(r.avg_score).toFixed(2)}
                  </td>
                  <td className="mono py-2 text-right">{r.runs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Container>

      <Container width="wide" className="pb-24 md:pb-32">
        <Rule weight="hair" className="mb-10" />
        <div className="grid gap-6 md:grid-cols-[1.5fr_auto] md:items-end">
          <div>
            <Eyebrow>Run it yourself</Eyebrow>
            <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">
              Same prompts, your eyes, your verdict.
            </h2>
          </div>
          <CtaRow />
        </div>
      </Container>
    </>
  );
}
