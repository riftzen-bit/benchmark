import { Suspense } from "react";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { TrendingModels } from "@/components/home/trending-models";
import { PulseStats } from "@/components/pulse/pulse-stats";
import { PulseFilters } from "@/components/pulse/pulse-filters";
import { PulseTable } from "@/components/pulse/pulse-table";
import { loadPulseSnapshot } from "@/lib/data/external/pulse";

export const metadata = { title: "Live pulse" };
export const revalidate = 1800;

export default async function PulsePage() {
  const snap = await loadPulseSnapshot();
  const vendors = Array.from(new Set(snap.models.map((m) => m.vendor)))
    .filter(Boolean)
    .sort();

  return (
    <Container width="wide" className="py-12 md:py-16">
      <header className="mb-8 grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-end">
        <div>
          <Eyebrow>Live pulse, issue 04.25</Eyebrow>
          <h1 className="display mt-3 text-4xl tracking-tight md:text-6xl">
            Every model, one shelf.
          </h1>
        </div>
        <p className="max-w-prose text-sm text-[var(--mute)]">
          Live snapshot of {snap.models.length} models from OpenRouter and the
          Hugging Face Hub. Updated{" "}
          <time dateTime={snap.updatedAt} className="mono">
            {snap.updatedAt.slice(0, 16).replace("T", " ")}
          </time>
          {" "}UTC. Sources:{" "}
          <SourceBadge label="openrouter" status={snap.sources.or} />{" "}
          <SourceBadge label="huggingface" status={snap.sources.hf} />.
        </p>
      </header>

      <PulseStats snap={snap} />

      <Rule weight="hair" className="my-8" />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <Suspense fallback={null}>
          <section className="grid gap-4">
            <PulseFilters vendors={vendors} />
            <PulseTable models={snap.models} />
          </section>
        </Suspense>

        <aside className="grid gap-4">
          <header>
            <Eyebrow>Trending on HF</Eyebrow>
          </header>
          <TrendingModels models={snap.hf.slice(0, 6)} />
        </aside>
      </div>

      <Rule weight="hair" className="my-10" />

      <footer className="grid gap-3 text-xs text-[var(--mute)]">
        <p className="mono uppercase tracking-widest">Sources</p>
        <ul className="grid gap-1">
          <li>
            <a
              href="https://openrouter.ai/api/v1/models"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[var(--rule)] underline-offset-2"
            >
              openrouter.ai/api/v1/models
            </a>
            {" — context, pricing, modality."}
          </li>
          <li>
            <a
              href="https://huggingface.co/models?sort=trending"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[var(--rule)] underline-offset-2"
            >
              huggingface.co/api/models
            </a>
            {" — trending open-weights."}
          </li>
        </ul>
        <p>
          See{" "}
          <Link href="/methodology" className="underline">
            methodology
          </Link>{" "}
          for caveats. Numbers refresh every 30 min via Next.js ISR.
        </p>
      </footer>
    </Container>
  );
}

function SourceBadge({
  label,
  status,
}: {
  label: string;
  status: "live" | "fallback";
}) {
  return (
    <span
      className={
        "mono inline-block border px-1.5 py-0.5 text-[10px] uppercase tracking-widest " +
        (status === "live"
          ? "border-[var(--pos)]/60 text-[var(--pos)]"
          : "border-[var(--mute)]/60 text-[var(--mute)]")
      }
    >
      {label}: {status === "live" ? "live" : "cached"}
    </span>
  );
}
