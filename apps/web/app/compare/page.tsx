import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { CompareBoard } from "@/components/compare/compare-board";
import { CompareVerdict } from "@/components/compare/compare-verdict";
import { ComparePicker } from "@/components/compare/compare-picker";
import { BENCHMARKS } from "@/lib/data/benchmarks";
import { loadLeaderboardSnapshot } from "@/lib/data/external/leaderboards";

export const metadata = { title: "Head-to-head" };
export const revalidate = 1800;

type Search = Promise<{ models?: string }>;

const DEFAULT_SEL = ["claude-opus-4-7", "gpt-5.5", "gemini-3-pro"];

export default async function ComparePage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const selected = parseSelection(sp.models);
  const snap = await loadLeaderboardSnapshot();

  const matrix = selected.map((id) => ({
    id,
    arena: snap.arena.find((e) => norm(e.model) === norm(id))?.score ?? null,
    openLlm: snap.openLlm.find((e) => norm(e.model) === norm(id))?.average ?? null,
    liveBench: snap.liveBench.find((e) => norm(e.model) === norm(id))?.global ?? null,
  }));

  return (
    <Container width="wide" className="py-12 md:py-16">
      <header className="mb-8 grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-end">
        <div>
          <Eyebrow>Head-to-head · issue 04.25</Eyebrow>
          <h1 className="display mt-3 text-4xl tracking-tight md:text-6xl">
            {selected.length} models, side by side.
          </h1>
        </div>
        <p className="max-w-prose text-sm text-[var(--mute)]">
          Pick 2-6 models. External scores pulled from LMSYS Arena, HF Open LLM v2, and
          LiveBench. In-house numbers below come from cited public sources.
        </p>
      </header>

      <ComparePicker selected={selected} />

      <Rule weight="hair" className="my-8" />

      <section>
        <header className="mb-4">
          <Eyebrow>External rankings</Eyebrow>
          <h2 className="display mt-2 text-2xl tracking-tight md:text-3xl">Live boards.</h2>
        </header>
        <div className="overflow-x-auto border-y border-[var(--rule)]">
          <table className="tnum w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--rule)] text-left">
                <th className="mono py-2 pl-3 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">Model</th>
                <th className="mono py-2 pr-4 text-right text-xs uppercase tracking-widest text-[var(--mute)]">Arena ELO</th>
                <th className="mono py-2 pr-4 text-right text-xs uppercase tracking-widest text-[var(--mute)]">Open LLM avg</th>
                <th className="mono py-2 pr-3 text-right text-xs uppercase tracking-widest text-[var(--mute)]">LiveBench global</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((m) => (
                <tr key={m.id} className="border-b border-[var(--rule)]/60">
                  <td className="mono py-2 pl-3 pr-4 font-medium">{m.id}</td>
                  <td className="mono py-2 pr-4 text-right">{m.arena == null ? "—" : Math.round(m.arena)}</td>
                  <td className="mono py-2 pr-4 text-right">{m.openLlm == null ? "—" : m.openLlm.toFixed(1)}</td>
                  <td className="mono py-2 pr-3 text-right">{m.liveBench == null ? "—" : m.liveBench.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Rule weight="hair" className="my-12" />

      <section>
        <header className="mb-4">
          <Eyebrow>In-house comparison · Opus vs GPT</Eyebrow>
          <h2 className="display mt-2 text-2xl tracking-tight md:text-3xl">Cited benchmarks.</h2>
          <p className="mt-2 max-w-prose text-sm text-[var(--mute)]">
            This section currently covers Opus 4.7 and GPT-5.5 only — we&apos;re collecting
            citation-backed numbers for more frontier models.
          </p>
        </header>
        <CompareVerdict rows={BENCHMARKS} />
        <Rule weight="hair" className="my-8" />
        <CompareBoard rows={BENCHMARKS} />
      </section>

      <Rule weight="hair" className="my-12" />

      <header className="mb-6">
        <Eyebrow>Spec sheet</Eyebrow>
        <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">Architecture &amp; price.</h2>
      </header>
      <p className="mono py-8 text-center text-xs uppercase tracking-widest text-[var(--mute)]">
        — section pending visual identity rebuild
      </p>
    </Container>
  );
}

function parseSelection(raw: string | undefined): string[] {
  if (!raw) return DEFAULT_SEL;
  const ids = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6);
  if (ids.length < 2) return DEFAULT_SEL;
  return ids;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/^[^/]+\//, "").replace(/[^a-z0-9.-]/g, "");
}
