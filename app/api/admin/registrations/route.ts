import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-api";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ items: [] as unknown[], supabase: false });
  }

  try {
    const { data, error } = await sb
      .from("membership_applications")
      .select("id,payload,submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[admin/registrations]", error.message);
      return NextResponse.json({ error: "Başvuru listesi okunamadı" }, { status: 500 });
    }

    const items = (data ?? []).map((row) => ({
      id: row.id,
      submittedAt: row.submitted_at,
      ...(row.payload as Record<string, unknown>),
    }));

    return NextResponse.json({ items, supabase: true });
  } catch (e) {
    console.error("[admin/registrations]", e);
    return NextResponse.json({ error: "Başvuru listesi okunamadı" }, { status: 500 });
  }
}
