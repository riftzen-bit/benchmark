import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { listLeaderboard } from "@/lib/db/queries/leaderboard";
import { listCategories } from "@/lib/db/queries/models";
import Link from "next/link";

export const metadata = { title: "Leaderboard" };
export const dynamic = "force-dynamic";

type Search = Promise<{ category?: string }>;

export default async function LeaderboardPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const [rows, categories] = await Promise.all([listLeaderboard(sp.category), listCategories()]);
  return (
    <Container width="wide" className="py-12">
      <header className="mb-8">
        <Eyebrow>Community leaderboard</Eyebrow>
        <p className="mt-2 max-w-prose text-sm text-[var(--mute)]">
          Average score across community-submitted runs, grouped by model and category.
          Anyone can submit a run with cited evidence.
        </p>
      </header>

      <nav className="mono mb-6 flex flex-wrap gap-2 text-xs uppercase tracking-widest">
        <Link
          href="/leaderboard"
          className={`border border-[var(--rule)] px-2 py-1 ${
            !sp.category ? "bg-[var(--ink)] text-[var(--paper)]" : ""
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/leaderboard?category=${c.id}`}
            className={`border border-[var(--rule)] px-2 py-1 ${
              sp.category === c.id ? "bg-[var(--ink)] text-[var(--paper)]" : ""
            }`}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--mute)]">No runs yet for this slice.</p>
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
              <th className="mono py-2 pr-4 text-right text-xs uppercase tracking-widest text-[var(--mute)]">
                Runs
              </th>
              <th className="mono py-2 text-xs uppercase tracking-widest text-[var(--mute)]">
                Last run
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
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
                <td className="mono py-2 pr-4 text-right">{r.runs}</td>
                <td className="mono py-2 text-xs text-[var(--mute)]">
                  {r.last_run_at ? new Date(r.last_run_at).toISOString().slice(0, 10) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Container>
  );
}
