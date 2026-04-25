import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function listVisibleModels() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("models")
    .select("id, vendor, family, released_at, context_k")
    .eq("visible", true)
    .order("released_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listCategories() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("benchmark_categories").select("id, label").order("id");
  if (error) throw error;
  return data ?? [];
}
