import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function listRunsByTask(taskId: string) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("benchmark_runs")
    .select(
      "id, model_id, score, unit, evidence_kind, evidence_url, notes_md, status, author_id, created_at",
    )
    .eq("task_id", taskId)
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function getRun(runId: string) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("benchmark_runs")
    .select(
      "id, task_id, model_id, score, unit, evidence_kind, evidence_url, notes_md, status, author_id, created_at",
    )
    .eq("id", runId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listOwnRuns(userId: string) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("benchmark_runs")
    .select("id, task_id, model_id, score, unit, status, created_at")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}
