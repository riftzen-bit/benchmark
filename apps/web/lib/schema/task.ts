import { z } from "zod";

export const TaskCategory = z.enum([
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
  "knowledge",
  "safety",
  "speed",
  "price",
]);
export type TaskCategory = z.infer<typeof TaskCategory>;

export const TaskVisibility = z.enum(["public", "unlisted"]);
export type TaskVisibility = z.infer<typeof TaskVisibility>;

const slugRe = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;

export const TaskCreateSchema = z.object({
  slug: z.string().regex(slugRe, "lowercase letters/digits/hyphens, 3-64 chars"),
  title: z.string().min(3).max(120),
  category: TaskCategory,
  body_md: z.string().min(10).max(20000),
  rubric_md: z.string().max(10000).default(""),
  visibility: TaskVisibility.default("public"),
});
export type TaskCreateInput = z.infer<typeof TaskCreateSchema>;

export const TaskUpdateSchema = TaskCreateSchema.partial().omit({ slug: true });
export type TaskUpdateInput = z.infer<typeof TaskUpdateSchema>;
