"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

export type VoteResult = { ok: false; error: string } | { ok: true };
export type CommentResult = { ok: false; error: string } | { ok: true };

const VoteValue = z.union([z.literal(1), z.literal(-1), z.literal(0)]);

export async function voteAction(
  runId: string,
  slug: string,
  value: -1 | 0 | 1,
): Promise<VoteResult> {
  const v = VoteValue.safeParse(value);
  if (!v.success) return { ok: false, error: "invalid vote" };
  const user = await requireUser();
  const supabase = await getSupabaseServer();
  if (v.data === 0) {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("user_id", user.id)
      .eq("run_id", runId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("votes")
      .upsert({ user_id: user.id, run_id: runId, value: v.data }, { onConflict: "user_id,run_id" });
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/tasks/${slug}/runs/${runId}`);
  return { ok: true };
}

const CommentSchema = z.object({ body_md: z.string().min(1).max(4000) });

export async function addCommentAction(
  runId: string,
  slug: string,
  _prev: CommentResult | null,
  fd: FormData,
): Promise<CommentResult> {
  const parsed = CommentSchema.safeParse({ body_md: fd.get("body_md") });
  if (!parsed.success) return { ok: false, error: "comment must be 1–4000 chars" };
  const user = await requireUser();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("comments").insert({
    run_id: runId,
    author_id: user.id,
    body_md: parsed.data.body_md,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/tasks/${slug}/runs/${runId}`);
  return { ok: true };
}
