import { z } from "zod";

export const BenchmarkCategory = z.enum([
  "coding",
  "reasoning",
  "math",
  "agent",
  "vision",
  "multilingual",
  "knowledge",
  "safety",
  "speed",
  "price",
]);
export type BenchmarkCategory = z.infer<typeof BenchmarkCategory>;

export const BenchmarkRowSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: BenchmarkCategory,
  opus: z.number().nullable(),
  gpt: z.number().nullable(),
  unit: z.enum(["%", "elo", "tok/s", "$/Mtok", "ms", "k"]),
  sourceIds: z.array(z.string().min(1)).min(1),
  capturedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  higherIsBetter: z.boolean(),
  note: z.string().optional(),
});
export type BenchmarkRow = z.infer<typeof BenchmarkRowSchema>;

export const SourceSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.url(),
  publisher: z.string(),
  capturedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type Source = z.infer<typeof SourceSchema>;
