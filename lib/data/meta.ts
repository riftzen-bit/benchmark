export const SITE_META = {
  title: "Opus 4.7 vs GPT-5.5",
  tagline: "Đối chiếu hai mô hình mạnh nhất tháng 4/2026 bằng số liệu công khai.",
  lastUpdated: "2026-04-25",
  models: {
    opus: {
      name: "Claude Opus 4.7",
      vendor: "Anthropic",
      releaseDate: "2026-04-16",
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      inputPrice: 5,
      outputPrice: 25,
      apiId: "claude-opus-4-7",
      sourceId: "anthropic-docs",
    },
    gpt: {
      name: "GPT-5.5",
      vendor: "OpenAI",
      releaseDate: "2026-04-23",
      contextWindow: 1_000_000,
      maxOutput: null,
      inputPrice: 5,
      outputPrice: 30,
      apiId: "gpt-5.5",
      sourceId: "openai-release",
    },
  },
} as const;
