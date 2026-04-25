import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function getOwnProfile(userId: string) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}
