import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function listLeaderboard(category?: string) {
  const supabase = await getSupabaseServer();
  let q = supabase
    .from("model_category_leaderboard")
    .select("model_id, category, runs, avg_score, last_run_at")
    .order("avg_score", { ascending: false, nullsFirst: false })
    .limit(500);
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
