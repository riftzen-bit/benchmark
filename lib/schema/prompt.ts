import { z } from "zod";

export const PromptDifficulty = z.enum(["easy", "medium", "hard", "extreme"]);
export type PromptDifficulty = z.infer<typeof PromptDifficulty>;

export const PromptCategory = z.enum([
  "coding",
  "reasoning",
  "math",
  "agent",
  "vision",
  "multilingual",
  "long-context",
  "creative",
  "debug",
  "planning",
]);
export type PromptCategory = z.infer<typeof PromptCategory>;

export const PromptSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: PromptCategory,
  difficulty: PromptDifficulty,
  body: z.string().min(1),
  watchFor: z.array(z.string().min(1)),
  playgroundIds: z.array(z.string().min(1)).min(1),
});
export type Prompt = z.infer<typeof PromptSchema>;

export const PlaygroundCost = z.enum([
  "free-no-account",
  "free-with-account",
  "subscription",
  "pay-as-you-go",
]);
export type PlaygroundCost = z.infer<typeof PlaygroundCost>;

export const PlaygroundSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.url(),
  cost: PlaygroundCost,
  models: z.string().min(1),
  forModel: z.enum(["opus-4-7", "gpt-5-5", "both", "anonymous"]),
  note: z.string().optional(),
});
export type Playground = z.infer<typeof PlaygroundSchema>;
