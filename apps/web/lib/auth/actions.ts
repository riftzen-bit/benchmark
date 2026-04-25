"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { SignInSchema, SignUpSchema } from "@/lib/auth/schema";

export type AuthActionResult = { ok: false; error: string } | { ok: true };

function firstIssue(parsed: { success: false; error: { issues: { message: string }[] } }) {
  return parsed.error.issues[0]?.message ?? "invalid input";
}

export async function signUpAction(
  _prev: AuthActionResult | null,
  fd: FormData,
): Promise<AuthActionResult> {
  const parsed = SignUpSchema.safeParse({
    email: fd.get("email"),
    password: fd.get("password"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed) };
  const supabase = await getSupabaseServer();
  const origin = (await headers()).get("origin") ?? "";
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signInAction(
  _prev: AuthActionResult | null,
  fd: FormData,
): Promise<AuthActionResult> {
  const parsed = SignInSchema.safeParse({
    email: fd.get("email"),
    password: fd.get("password"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed) };
  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: error.message };
  redirect("/");
}

export async function signInWithGoogleAction(): Promise<void> {
  const supabase = await getSupabaseServer();
  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error) throw error;
  if (data?.url) redirect(data.url);
}
