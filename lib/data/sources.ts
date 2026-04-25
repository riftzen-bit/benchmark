import { SourceSchema, type Source } from "@/lib/schema/benchmark";

const raw: Source[] = [
  {
    id: "anthropic-news",
    label: "Anthropic — Introducing Claude Opus 4.7",
    url: "https://www.anthropic.com/news/claude-opus-4-7",
    publisher: "Anthropic",
    capturedAt: "2026-04-25",
  },
  {
    id: "anthropic-docs",
    label: "Anthropic API — What's new in Claude Opus 4.7",
    url: "https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7",
    publisher: "Anthropic",
    capturedAt: "2026-04-25",
  },
  {
    id: "openai-release",
    label: "OpenAI — Introducing GPT-5.5",
    url: "https://openai.com/index/introducing-gpt-5-5/",
    publisher: "OpenAI",
    capturedAt: "2026-04-25",
  },
  {
    id: "openai-system-card",
    label: "OpenAI — GPT-5.5 System Card",
    url: "https://deploymentsafety.openai.com/gpt-5-5",
    publisher: "OpenAI",
    capturedAt: "2026-04-25",
  },
  {
    id: "vellum",
    label: "Vellum — Claude Opus 4.7 Benchmarks Explained",
    url: "https://www.vellum.ai/blog/claude-opus-4-7-benchmarks-explained",
    publisher: "Vellum",
    capturedAt: "2026-04-25",
  },
  {
    id: "mindwired",
    label: "MindwiredAI — GPT-5.5 vs Opus 4.7",
    url: "https://mindwiredai.com/2026/04/24/gpt-5-5-is-here-benchmarks-pricing-and-who-should-actually-upgrade-april-2026/",
    publisher: "MindwiredAI",
    capturedAt: "2026-04-25",
  },
  {
    id: "lushbinary",
    label: "Lushbinary — GPT-5.5 vs Claude Opus 4.7",
    url: "https://lushbinary.com/blog/gpt-5-5-vs-claude-opus-4-7-comparison-benchmarks-pricing/",
    publisher: "Lushbinary",
    capturedAt: "2026-04-25",
  },
  {
    id: "apiyi",
    label: "Apiyi — Claude Opus 4.7 Benchmark Review 2026",
    url: "https://help.apiyi.com/en/claude-opus-4-7-benchmark-review-2026-en.html",
    publisher: "Apiyi",
    capturedAt: "2026-04-25",
  },
];

export const SOURCES: ReadonlyArray<Source> = Object.freeze(
  raw.map((s) => Object.freeze(SourceSchema.parse(s))),
);

export function sourceById(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}
