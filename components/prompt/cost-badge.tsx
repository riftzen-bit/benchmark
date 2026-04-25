import type { PlaygroundCost } from "@/lib/schema/prompt";
import { cn } from "@/lib/utils";

const LABEL: Record<PlaygroundCost, string> = {
  "free-no-account": "Free",
  "free-with-account": "Free, signup",
  subscription: "Subscription",
  "pay-as-you-go": "Pay per token",
};

const STYLE: Record<PlaygroundCost, string> = {
  "free-no-account": "text-[var(--accent)] bg-[var(--accent)]/10",
  "free-with-account": "text-[var(--mute)]",
  subscription: "text-[var(--mute)]",
  "pay-as-you-go": "text-[var(--mute)]",
};

export function CostBadge({ cost }: { cost: PlaygroundCost }) {
  return (
    <span
      className={cn(
        "mono inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest",
        STYLE[cost],
      )}
    >
      {LABEL[cost]}
    </span>
  );
}
