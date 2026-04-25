import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { VENDORS, vendorLabel } from "@/lib/data/vendors";
import { listVisibleModels } from "@/lib/db/queries/models";
import { listLeaderboard } from "@/lib/db/queries/leaderboard";

export const metadata = { title: "Vendors" };
export const dynamic = "force-dynamic";

type DBModel = { id: string; vendor: string; family: string; released_at: string | null; context_k: number | null };

export default async function VendorsPage() {
  const [dbModels, leaderboard] = await Promise.all([
    listVisibleModels().catch(() => [] as DBModel[]),
    listLeaderboard().catch(() => []),
  ]);

  const runsByModel = new Map<string, number>();
  for (const r of leaderboard) {
    runsByModel.set(r.model_id, (runsByModel.get(r.model_id) ?? 0) + r.runs);
  }

  const byVendor = new Map<string, DBModel[]>();
  for (const m of dbModels) {
    const arr = byVendor.get(m.vendor) ?? [];
    arr.push(m);
    byVendor.set(m.vendor, arr);
  }

  // Show known vendors first (in declared order), then any DB-only vendors at end.
  const knownIds = new Set(VENDORS.map((v) => v.id));
  const tail = [...byVendor.keys()].filter((id) => !knownIds.has(id)).sort();
  const ordered = [
    ...VENDORS.filter((v) => byVendor.has(v.id)),
    ...tail.map((id) => ({ id, label: vendorLabel(id), url: "", swatch: "#666", blurb: "" })),
  ];

  return (
    <Container width="wide" className="py-16 md:py-20">
      <header className="mb-10 grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-end">
        <div>
          <Eyebrow>Vendors &middot; competitive set</Eyebrow>
          <h1 className="display mt-4 text-4xl tracking-tight md:text-6xl">
            Who ships<br />the frontier.
          </h1>
        </div>
        <p className="max-w-prose text-base leading-relaxed text-[var(--mute)]">
          Every vendor we currently track. Closed weights, open weights, hybrids — all
          welcome on the tape. Add a model that&rsquo;s missing? Open a task with the spec.
        </p>
      </header>

      <Rule weight="ink" className="mb-10" />

      {ordered.length === 0 ? (
        <p className="text-sm text-[var(--mute)]">
          Local registry empty. Run <code className="mono">bunx supabase db push</code> +{" "}
          <code className="mono">bunx supabase db seed</code>.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-px bg-[var(--rule)] md:grid-cols-2">
          {ordered.map((v) => {
            const models = byVendor.get(v.id) ?? [];
            const totalRuns = models.reduce((n, m) => n + (runsByModel.get(m.id) ?? 0), 0);
            return (
              <li key={v.id} className="flex flex-col gap-4 bg-[var(--background)] p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="inline-block h-3 w-3 border border-[var(--ink)]"
                      style={{ background: v.swatch }}
                    />
                    <h2 className="display text-xl tracking-tight">{v.label}</h2>
                  </div>
                  <span className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
                    {models.length} models &middot; {totalRuns} runs
                  </span>
                </div>
                {v.blurb && (
                  <p className="text-sm text-[var(--mute)]">{v.blurb}</p>
                )}
                <ul className="mono divide-y divide-[var(--rule)] border-y border-[var(--rule)] text-xs">
                  {models.map((m) => {
                    const runs = runsByModel.get(m.id) ?? 0;
                    return (
                      <li
                        key={m.id}
                        className="grid grid-cols-[1fr_auto_auto_auto] items-baseline gap-3 py-2"
                      >
                        <span>{m.id}</span>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--mute)]">
                          {m.family}
                        </span>
                        <span className="tabular-nums text-[var(--mute)]">
                          {m.context_k ? `${m.context_k}k` : "—"}
                        </span>
                        <span
                          className={`tabular-nums ${runs > 0 ? "text-[var(--accent)]" : "text-[var(--mute)]"}`}
                        >
                          {runs}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {v.url && (
                  <Link
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono self-start text-[10px] uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
                  >
                    {new URL(v.url).host} &nearr;
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
