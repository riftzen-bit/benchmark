export const SITE = {
  name: "Frontier Tape",
  wordmark: "frontier·tape",
  tagline:
    "Two frontier models, public numbers, no spin. Every figure links to its source.",
  issue: "04.25",
  description:
    "Side-by-side comparison of Claude Opus 4.7 and GPT-5.5 drawn from public, cited numbers.",
} as const;

export const NAV = [
  { href: "/", label: "Overview" },
  { href: "/benchmarks", label: "The Tape" },
  { href: "/test-yourself", label: "Run it" },
  { href: "/methodology", label: "Provenance" },
] as const;

export type ModelKey = "opus" | "gpt";

export const MODEL_DISPLAY: Record<ModelKey, { short: string; full: string; vendor: string }> = {
  opus: { short: "Opus 4.7", full: "Claude Opus 4.7", vendor: "Anthropic" },
  gpt: { short: "GPT-5.5", full: "GPT-5.5", vendor: "OpenAI" },
};
