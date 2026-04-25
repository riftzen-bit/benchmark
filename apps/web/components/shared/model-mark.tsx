import { cn } from "@/lib/utils";
import type { ModelKey } from "@/lib/config/site";

const TONE: Record<ModelKey, string> = {
  opus: "text-[var(--opus)]",
  gpt: "text-[var(--gpt)]",
};

const DOT: Record<ModelKey, string> = {
  opus: "bg-[var(--opus)]",
  gpt: "bg-[var(--gpt)]",
};

export function ModelLabel({
  model,
  short = true,
  className,
}: {
  model: ModelKey;
  short?: boolean;
  className?: string;
}) {
  const text = model === "opus" ? (short ? "Opus 4.7" : "Claude Opus 4.7") : "GPT-5.5";
  return (
    <span className={cn("mono inline-flex items-center gap-1.5 text-xs", TONE[model], className)}>
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", DOT[model])} />
      {text}
    </span>
  );
}

export function ModelDot({ model, className }: { model: ModelKey; className?: string }) {
  return <span aria-hidden className={cn("h-2 w-2 rounded-full", DOT[model], className)} />;
}
