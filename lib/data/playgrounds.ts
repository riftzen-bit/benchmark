import { PlaygroundSchema, type Playground } from "@/lib/schema/prompt";

const raw: Playground[] = [
  {
    id: "arena-battle",
    label: "Arena (Battle Mode)",
    url: "https://arena.ai/",
    cost: "free-no-account",
    models: "Random anonymous pairing — both models may appear if voted in",
    forModel: "anonymous",
    note: "Formerly LMArena. Free, no signup. You don't pick the models — Battle Mode pairs two anonymous models and you vote which response was better. Refresh until you draw Opus 4.7 or GPT-5.5.",
  },
  {
    id: "claude-pro",
    label: "Claude.ai (Pro)",
    url: "https://claude.ai/new",
    cost: "subscription",
    models: "Claude Opus 4.7 (Pro $20/month)",
    forModel: "opus-4-7",
    note: "Free tier gives Sonnet/Haiku only. Opus 4.7 requires Claude Pro. Most reliable way to test Opus 4.7 on the web.",
  },
  {
    id: "anthropic-console",
    label: "Anthropic Console",
    url: "https://console.anthropic.com/workbench",
    cost: "pay-as-you-go",
    models: "Claude Opus 4.7 ($5 / $25 per Mtok)",
    forModel: "opus-4-7",
    note: "Direct API workbench. Pay per token, no subscription. Cheapest way to test Opus 4.7 occasionally — costs a few cents per prompt.",
  },
  {
    id: "chatgpt-plus",
    label: "ChatGPT (Plus)",
    url: "https://chatgpt.com/",
    cost: "subscription",
    models: "GPT-5.5 (Plus $20/month)",
    forModel: "gpt-5-5",
    note: "Free tier has limited GPT-5.5 quota that drops to a lighter model when exhausted. Plus gives reliable GPT-5.5 access.",
  },
  {
    id: "openai-playground",
    label: "OpenAI Playground",
    url: "https://platform.openai.com/playground",
    cost: "pay-as-you-go",
    models: "GPT-5.5 ($5 / $30 per Mtok)",
    forModel: "gpt-5-5",
    note: "Direct API playground. Pay per token, no subscription. Cheapest way to test GPT-5.5 occasionally.",
  },
  {
    id: "duck-ai",
    label: "Duck.ai",
    url: "https://duck.ai/",
    cost: "free-no-account",
    models: "Claude 3.5 Haiku, GPT-4o mini (older models only)",
    forModel: "both",
    note: "DuckDuckGo's free anonymous chat. Useful for orientation but does NOT include Opus 4.7 or GPT-5.5 in the free tier — only older versions. Subscription unlocks GPT-5 and Sonnet 4 (still not 4.7 / 5.5).",
  },
  {
    id: "poe",
    label: "Poe",
    url: "https://poe.com/",
    cost: "subscription",
    models: "Claude Opus 4.7 + GPT-5.5 (Poe subscription)",
    forModel: "both",
    note: "Quora's chat aggregator. Subscription gives both top-tier models in one interface — convenient if you only want to subscribe to one service.",
  },
];

export const PLAYGROUNDS: ReadonlyArray<Playground> = Object.freeze(
  raw.map((p) => Object.freeze(PlaygroundSchema.parse(p))),
);

export function playgroundById(id: string): Playground | undefined {
  return PLAYGROUNDS.find((p) => p.id === id);
}
