import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("pings").insert({});
    if (error) throw error;
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
