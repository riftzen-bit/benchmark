import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function listPublicTasks(opts?: { category?: string; limit?: number }) {
  const supabase = await getSupabaseServer();
  let q = supabase
    .from("benchmark_tasks")
    .select("id, slug, title, category, author_id, created_at, visibility")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 100);
  if (opts?.category) q = q.eq("category", opts.category);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getTaskBySlug(slug: string) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("benchmark_tasks")
    .select("id, slug, title, category, body_md, rubric_md, author_id, visibility, created_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listOwnTasks(userId: string) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("benchmark_tasks")
    .select("id, slug, title, category, visibility, created_at")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
