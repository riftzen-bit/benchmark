import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function getVoteTally(runId: string) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("run_vote_tally")
    .select("up, down, score")
    .eq("run_id", runId)
    .maybeSingle();
  if (error) throw error;
  return data ?? { up: 0, down: 0, score: 0 };
}

export async function getOwnVote(userId: string, runId: string): Promise<-1 | 0 | 1> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("votes")
    .select("value")
    .eq("user_id", userId)
    .eq("run_id", runId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return 0;
  return data.value === 1 ? 1 : -1;
}
