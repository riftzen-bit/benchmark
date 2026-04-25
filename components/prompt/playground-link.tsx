import { ExternalLink } from "lucide-react";
import type { Playground } from "@/lib/schema/prompt";

export function PlaygroundLink({ p }: { p: Playground }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 border border-[var(--rule)] px-3 py-1.5 text-xs hover:border-[var(--foreground)]"
      title={p.note}
    >
      {p.label}
      <ExternalLink className="h-3 w-3 opacity-60" />
      {p.needsAccount ? (
        <span className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
          login
        </span>
      ) : (
        <span className="mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
          free
        </span>
      )}
    </a>
  );
}
