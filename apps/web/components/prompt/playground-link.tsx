import { ExternalLink } from "lucide-react";
import type { Playground } from "@/lib/schema/prompt";
import { ModelDot } from "@/components/shared/model-mark";

const COST_SHORT: Record<string, string> = {
  "free-no-account": "Free",
  "free-with-account": "Free, signup",
  subscription: "Sub",
  "pay-as-you-go": "Pay/token",
};

export function PlaygroundLink({ p }: { p: Playground }) {
  const costLabel = COST_SHORT[p.cost] ?? p.cost;
  const showOpus = p.forModel === "opus-4-7" || p.forModel === "both";
  const showGpt = p.forModel === "gpt-5-5" || p.forModel === "gpt-5" || p.forModel === "both";

  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 border border-[var(--rule)] bg-[var(--background)] px-3 py-2 text-sm transition-colors hover:border-[var(--foreground)] hover:bg-[var(--rule)]"
      title={p.note}
    >
      {showOpus && <ModelDot model="opus" />}
      {showGpt && <ModelDot model="gpt" />}
      <span className="font-medium">{p.label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-[var(--mute)] group-hover:text-[var(--foreground)]" />
      <span
        className={`mono text-[10px] uppercase tracking-widest ${
          p.cost === "free-no-account" ? "text-[var(--accent)]" : "text-[var(--mute)]"
        }`}
      >
        {costLabel}
      </span>
    </a>
  );
}
