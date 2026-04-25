import type { Playground } from "@/lib/schema/prompt";
import { CostBadge } from "./cost-badge";

export function PlaygroundCard({ p }: { p: Playground }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-[var(--rule)] p-5 transition-colors hover:border-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-base font-medium tracking-tight group-hover:underline group-hover:decoration-[var(--accent)] group-hover:decoration-2 group-hover:underline-offset-4">
          {p.label} ↗
        </span>
        <CostBadge cost={p.cost} />
      </div>
      <p className="mt-2 text-sm text-[var(--foreground)]">{p.models}</p>
      {p.note ? (
        <p className="mt-2 text-xs leading-relaxed text-[var(--mute)]">{p.note}</p>
      ) : null}
    </a>
  );
}
