"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { TaskCreateSchema } from "@/lib/schema/task";

export type CreateTaskResult = { ok: false; error: string } | { ok: true; slug: string };

export async function createTaskAction(
  _prev: CreateTaskResult | null,
  fd: FormData,
): Promise<CreateTaskResult> {
  const user = await requireUser();
  const parsed = TaskCreateSchema.safeParse({
    slug: fd.get("slug"),
    title: fd.get("title"),
    category: fd.get("category"),
    body_md: fd.get("body_md"),
    rubric_md: fd.get("rubric_md") ?? "",
    visibility: fd.get("visibility") ?? "public",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid input" };
  }
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("benchmark_tasks").insert({
    ...parsed.data,
    author_id: user.id,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "slug already taken" };
    return { ok: false, error: error.message };
  }
  revalidatePath("/tasks");
  redirect(`/tasks/${parsed.data.slug}`);
}
