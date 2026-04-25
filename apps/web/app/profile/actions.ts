"use server";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { ProfileSchema } from "@/lib/auth/schema";

export type ProfileActionResult = { ok: false; error: string } | { ok: true };

export async function updateProfileAction(
  _prev: ProfileActionResult | null,
  fd: FormData,
): Promise<ProfileActionResult> {
  const user = await requireUser();
  const parsed = ProfileSchema.safeParse({
    username: fd.get("username"),
    display_name: fd.get("display_name") ?? "",
    bio: fd.get("bio") ?? "",
    avatar_url: fd.get("avatar_url") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid input" };
  }
  const supabase = await getSupabaseServer();
  const update = {
    username: parsed.data.username,
    display_name: parsed.data.display_name,
    bio: parsed.data.bio,
    avatar_url: parsed.data.avatar_url ? parsed.data.avatar_url : null,
  };
  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}
