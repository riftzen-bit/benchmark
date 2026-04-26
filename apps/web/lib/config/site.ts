export const SITE = {
  name: "Frontier Tape",
  wordmark: "frontier·tape",
  tagline: "Community-run benchmarks for frontier LLMs.",
  description:
    "Open community platform for posting and comparing real LLM benchmark runs with cited evidence.",
  issue: "04.25",
} as const;

export const NAV = [
  { href: "/", label: "Overview" },
  { href: "/pulse", label: "Pulse" },
  { href: "/compare", label: "Compare" },
  { href: "/benchmarks", label: "Tape" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/models", label: "Models" },
  { href: "/vendors", label: "Vendors" },
  { href: "/test-yourself", label: "Run it" },
  { href: "/methodology", label: "Methodology" },
] as const;

export const NAV_PRIMARY_HREFS = [
  "/pulse",
  "/compare",
  "/benchmarks",
  "/leaderboard",
  "/tasks",
  "/test-yourself",
] as const;

export type ModelKey = "opus" | "gpt";

export const MODEL_DISPLAY: Record<ModelKey, { short: string; full: string; vendor: string }> = {
  opus: { short: "Opus 4.7", full: "Claude Opus 4.7", vendor: "Anthropic" },
  gpt: { short: "GPT-5.5", full: "GPT-5.5", vendor: "OpenAI" },
};
