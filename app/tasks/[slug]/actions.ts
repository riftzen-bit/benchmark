"use server";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { RunCreateSchema } from "@/lib/schema/run";

export type CreateRunResult = { ok: false; error: string } | { ok: true };

export async function submitRunAction(
  slug: string,
  taskId: string,
  _prev: CreateRunResult | null,
  fd: FormData,
): Promise<CreateRunResult> {
  const user = await requireUser();
  const parsed = RunCreateSchema.safeParse({
    task_id: taskId,
    model_id: fd.get("model_id"),
    score: fd.get("score") ?? "",
    unit: fd.get("unit") ?? "%",
    evidence_kind: fd.get("evidence_kind"),
    evidence_url: fd.get("evidence_url") ?? "",
    notes_md: fd.get("notes_md") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid input" };
  }
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("benchmark_runs").insert({
    task_id: parsed.data.task_id,
    model_id: parsed.data.model_id,
    author_id: user.id,
    score: parsed.data.score ?? null,
    unit: parsed.data.unit,
    evidence_kind: parsed.data.evidence_kind,
    evidence_url: parsed.data.evidence_url || null,
    notes_md: parsed.data.notes_md,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/tasks/${slug}`);
  return { ok: true };
}
