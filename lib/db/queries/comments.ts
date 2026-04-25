import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function listComments(runId: string) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("comments")
    .select("id, run_id, author_id, body_md, created_at")
    .eq("run_id", runId)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw error;
  return data ?? [];
}
