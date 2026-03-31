import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-api";
import { clearMemberOverlayState } from "@/lib/member-state-reset";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase gerekli" }, { status: 503 });
  }

  try {
    await clearMemberOverlayState();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sıfırlama başarısız";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  try {
    revalidatePath("/katalog");
    revalidatePath("/oneriler");
    revalidatePath("/anasayfa");
    revalidatePath("/admin");
  } catch (e) {
    console.error("[member-overlay-reset] revalidatePath", e);
  }

  return NextResponse.json({ ok: true });
}
