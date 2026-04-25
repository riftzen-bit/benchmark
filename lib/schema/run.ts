import { z } from "zod";

export const EvidenceKind = z.enum(["url", "screenshot", "transcript"]);
export type EvidenceKind = z.infer<typeof EvidenceKind>;

export const RunStatus = z.enum(["live", "flagged", "removed"]);
export type RunStatus = z.infer<typeof RunStatus>;

export const RunCreateSchema = z
  .object({
    task_id: z.string().uuid(),
    model_id: z.string().min(1),
    score: z
      .union([z.coerce.number().min(-1000).max(1000000), z.literal("")])
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .optional(),
    unit: z.string().min(1).max(16).default("%"),
    evidence_kind: EvidenceKind,
    evidence_url: z.union([z.string().url(), z.literal("")]).optional(),
    notes_md: z.string().max(10000).default(""),
  })
  .superRefine((v, ctx) => {
    if (v.evidence_kind === "url" && !v.evidence_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["evidence_url"],
        message: "URL evidence requires evidence_url",
      });
    }
  });
export type RunCreateInput = z.infer<typeof RunCreateSchema>;
