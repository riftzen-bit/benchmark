import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
