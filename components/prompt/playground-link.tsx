import { ExternalLink } from "lucide-react";
import type { Playground, PlaygroundCost } from "@/lib/schema/prompt";

const COST_LABEL: Record<PlaygroundCost, { text: string; tone: "free" | "neutral" }> = {
  "free-no-account": { text: "Free, no account", tone: "free" },
  "free-with-account": { text: "Free, signup required", tone: "neutral" },
  subscription: { text: "Subscription", tone: "neutral" },
  "pay-as-you-go": { text: "Pay per token", tone: "neutral" },
};

export function PlaygroundLink({ p }: { p: Playground }) {
  const cost = COST_LABEL[p.cost];
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 border border-[var(--rule)] bg-[var(--background)] px-3 py-2 text-sm transition-colors hover:border-[var(--foreground)] hover:bg-[var(--rule)]"
      title={p.note}
    >
      <span className="font-medium">{p.label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-[var(--mute)] group-hover:text-[var(--foreground)]" />
      <span
        className={`mono ml-1 text-[10px] uppercase tracking-widest ${
          cost.tone === "free" ? "text-[var(--accent)]" : "text-[var(--mute)]"
        }`}
      >
        {cost.text}
      </span>
    </a>
  );
}
