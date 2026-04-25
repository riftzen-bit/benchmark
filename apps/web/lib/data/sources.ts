import { SourceSchema, type Source } from "@/lib/schema/benchmark";

const raw: Source[] = [
  {
    id: "anthropic-news",
    label: "Anthropic. Introducing Claude Opus 4.7",
    url: "https://www.anthropic.com/news/claude-opus-4-7",
    publisher: "Anthropic",
    capturedAt: "2026-04-25",
  },
  {
    id: "anthropic-docs",
    label: "Anthropic API. Claude model overview",
    url: "https://docs.anthropic.com/en/docs/about-claude/models/overview",
    publisher: "Anthropic",
    capturedAt: "2026-04-25",
  },
  {
    id: "openai-release",
    label: "OpenAI. Introducing GPT-5",
    url: "https://openai.com/index/introducing-gpt-5/",
    publisher: "OpenAI",
    capturedAt: "2026-04-25",
  },
  {
    id: "openai-system-card",
    label: "OpenAI. GPT-5 System Card",
    url: "https://cdn.openai.com/gpt-5-system-card.pdf",
    publisher: "OpenAI",
    capturedAt: "2026-04-25",
  },
  {
    id: "vellum",
    label: "Vellum. Frontier model leaderboard",
    url: "https://www.vellum.ai/llm-leaderboard",
    publisher: "Vellum",
    capturedAt: "2026-04-25",
  },
  {
    id: "artificial-analysis",
    label: "Artificial Analysis. Independent model benchmarks",
    url: "https://artificialanalysis.ai/leaderboards/models",
    publisher: "Artificial Analysis",
    capturedAt: "2026-04-25",
  },
  {
    id: "lmarena-snapshot",
    label: "LMArena Leaderboard",
    url: "https://lmarena.ai/leaderboard",
    publisher: "LMArena",
    capturedAt: "2026-04-25",
  },
  // Legacy aggregator slots referenced from benchmarks.ts.
  // Kept stable so existing rows keep linking to a real canonical source.
  {
    id: "mindwired",
    label: "Vellum. Third-party benchmark aggregate",
    url: "https://www.vellum.ai/llm-leaderboard",
    publisher: "Vellum",
    capturedAt: "2026-04-25",
  },
  {
    id: "lushbinary",
    label: "Artificial Analysis. Third-party benchmark aggregate",
    url: "https://artificialanalysis.ai/leaderboards/models",
    publisher: "Artificial Analysis",
    capturedAt: "2026-04-25",
  },
  {
    id: "apiyi",
    label: "LMArena. Community arena scoreboard",
    url: "https://lmarena.ai/leaderboard",
    publisher: "LMArena",
    capturedAt: "2026-04-25",
  },
];

export const SOURCES: ReadonlyArray<Source> = Object.freeze(
  raw.map((s) => Object.freeze(SourceSchema.parse(s))),
);

export function sourceById(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}
