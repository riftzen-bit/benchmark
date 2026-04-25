import type { PromptDifficulty } from "@/lib/schema/prompt";
import { cn } from "@/lib/utils";

const STYLES: Record<PromptDifficulty, string> = {
  easy: "border-[var(--rule)] text-[var(--mute)]",
  medium: "border-[var(--foreground)] text-[var(--foreground)]",
  hard: "border-[var(--accent)] text-[var(--accent)]",
  extreme: "border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]",
};

export function DifficultyPill({ difficulty }: { difficulty: PromptDifficulty }) {
  return (
    <span
      className={cn(
        "mono inline-block border px-2 py-0.5 text-[11px] uppercase tracking-widest",
        STYLES[difficulty],
      )}
    >
      {difficulty}
    </span>
  );
}
