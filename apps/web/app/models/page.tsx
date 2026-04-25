import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { ModelLabel } from "@/components/shared/model-mark";
import { TrendingModels } from "@/components/home/trending-models";
import { ModelSpecGrid } from "@/components/home/model-spec-grid";
import { fetchTrendingHFModels } from "@/lib/data/external/huggingface";
import { listVisibleModels } from "@/lib/db/queries/models";
import { listLeaderboard } from "@/lib/db/queries/leaderboard";
import { vendorLabel } from "@/lib/data/vendors";

export const metadata = { title: "Models" };
export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const [trending, dbModels, leaderboard] = await Promise.all([
    fetchTrendingHFModels({ limit: 12 }),
    listVisibleModels().catch(() => []),
    listLeaderboard().catch(() => []),
  ]);

  const runsByModel = new Map<string, number>();
  for (const r of leaderboard) {
    runsByModel.set(r.model_id, (runsByModel.get(r.model_id) ?? 0) + r.runs);
  }

  return (
    <Container width="wide" className="py-16 md:py-20">
      <header className="mb-10 grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-end">
        <div>
          <Eyebrow>Catalogue &middot; closed + open</Eyebrow>
          <h1 className="display mt-4 text-4xl tracking-tight md:text-6xl">
            The model<br />zoo, with citations.
          </h1>
        </div>
        <p className="max-w-prose text-base leading-relaxed text-[var(--mute)]">
          Featured frontier models on top, then live trending feed from the Hugging Face Hub
          ({trending.length} entries), then the local registry with community run counts.
        </p>
      </header>

      <Rule weight="ink" className="mb-10" />

      <section className="grid gap-6">
        <header className="flex items-baseline justify-between gap-4">
          <Eyebrow>Featured frontier &middot; cited spec</Eyebrow>
          <Link
            href="/compare"
            className="mono text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
          >
            Head-to-head →
          </Link>
        </header>
        <ModelSpecGrid />
      </section>

      <Rule weight="hair" className="my-16" />

      <section className="grid gap-6">
        <header className="flex items-baseline justify-between gap-4">
          <Eyebrow>Hugging Face &middot; trending right now</Eyebrow>
          <a
            href="https://huggingface.co/models?sort=trending"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
          >
            On HF &nearr;
          </a>
        </header>
        <TrendingModels models={trending} />
      </section>

      <Rule weight="hair" className="my-16" />

      <section className="grid gap-6">
        <header className="flex items-baseline justify-between gap-4">
          <div>
            <Eyebrow>Local registry &middot; visible models</Eyebrow>
            <h2 className="display mt-2 text-2xl tracking-tight md:text-3xl">
              Models accepting submissions.
            </h2>
          </div>
          <Link
            href="/leaderboard"
            className="mono text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
          >
            Leaderboard →
          </Link>
        </header>
        {dbModels.length === 0 ? (
          <p className="text-sm text-[var(--mute)]">
            Local registry is empty (Supabase not configured for this preview). Try{" "}
            <Link href="/benchmarks" className="underline">
              the static catalogue
            </Link>{" "}
            instead.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-px bg-[var(--rule)] md:grid-cols-2 lg:grid-cols-3">
            {dbModels.map((m) => {
              const runs = runsByModel.get(m.id) ?? 0;
              const featured = m.id === "claude-opus-4-7" || m.id === "gpt-5.5";
              return (
                <li key={m.id} className="bg-[var(--background)] p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    {featured ? (
                      <ModelLabel
                        model={m.id === "claude-opus-4-7" ? "opus" : "gpt"}
                        short={false}
                      />
                    ) : (
                      <p className="mono text-sm font-medium">{m.id}</p>
                    )}
                    <span className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
                      {vendorLabel(m.vendor)}
                    </span>
                  </div>
                  <dl className="mono mt-4 grid grid-cols-3 gap-3 text-[11px] tabular-nums">
                    <div>
                      <dt className="text-[9px] uppercase tracking-widest text-[var(--mute)]">
                        Released
                      </dt>
                      <dd>{m.released_at ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-widest text-[var(--mute)]">
                        Context
                      </dt>
                      <dd>{m.context_k ? `${m.context_k}k` : "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-widest text-[var(--mute)]">
                        Runs
                      </dt>
                      <dd className={runs > 0 ? "text-[var(--accent)]" : ""}>{runs}</dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Container>
  );
}
