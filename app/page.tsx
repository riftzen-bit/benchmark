import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Rule } from "@/components/shared/rule";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Hero } from "@/components/home/hero";
import { listPublicTasks } from "@/lib/db/queries/tasks";
import { listLeaderboard } from "@/lib/db/queries/leaderboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [tasks, leaderboard] = await Promise.all([
    listPublicTasks({ limit: 6 }).catch(() => []),
    listLeaderboard().catch(() => []),
  ]);

  return (
    <>
      <Container width="wide">
        <Hero tasksCount={tasks.length} runsCount={leaderboard.reduce((n, r) => n + r.runs, 0)} />
      </Container>

      <Container width="wide" className="py-12 md:py-20">
        <Rule weight="hair" className="mb-8" />
        <header className="mb-6 flex items-baseline justify-between">
          <Eyebrow>Latest tasks</Eyebrow>
          <Link
            href="/tasks"
            className="mono text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
          >
            All →
          </Link>
        </header>
        {tasks.length === 0 ? (
          <p className="text-sm text-[var(--mute)]">
            No tasks yet —{" "}
            <Link href="/tasks/new" className="underline">
              post the first one
            </Link>
            .
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
          <p className="text-sm text-[var(--mute)]">No runs yet.</p>
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
    </>
  );
}
