import type { PulseSnapshot } from "@/lib/data/external/pulse";

interface Props {
  snap: PulseSnapshot;
}

export function PulseStats({ snap }: Props) {
  const vendors = new Set(snap.models.map((m) => m.vendor)).size;
  const cheapest = snap.models
    .map((m) => m.promptUSDPerMtok)
    .filter((n): n is number => n != null && n >= 0)
    .sort((a, b) => a - b)[0];
  const largestK = snap.models
    .map((m) => m.contextK ?? 0)
    .reduce((a, b) => Math.max(a, b), 0);
  return (
    <section
      aria-label="Pulse stats"
      className="grid grid-cols-2 gap-px bg-[var(--rule)] border border-[var(--rule)] md:grid-cols-4"
    >
      <Cell label="Models" value={snap.models.length.toString()} hint={snap.sources.or} />
      <Cell label="Vendors" value={vendors.toString()} hint={snap.sources.or} />
      <Cell
        label="Cheapest in $/Mtok"
        value={cheapest != null ? cheapest.toFixed(2) : "n/a"}
        hint="prompt"
      />
      <Cell
        label="Largest context"
        value={largestK > 0 ? `${formatK(largestK)}` : "n/a"}
        hint="tokens"
      />
    </section>
  );
}

function Cell({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-[var(--background)] p-4">
      <p className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
        {label}
      </p>
      <p className="figure mt-2 text-3xl tabular-nums">{value}</p>
      <p className="mono mt-0.5 text-[10px] uppercase tracking-widest text-[var(--mute)]">
        {hint}
      </p>
    </div>
  );
}

function formatK(k: number): string {
  if (k >= 1000) return `${(k / 1000).toFixed(1)}M`;
  return `${k}k`;
}
