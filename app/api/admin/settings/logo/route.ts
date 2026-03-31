import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-api";
import { getSiteLogoUrl, setSiteLogoUrl } from "@/lib/site-settings";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const url = await getSiteLogoUrl();
  return NextResponse.json({ url, supabase: isSupabaseConfigured() });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase gerekli" }, { status: 503 });
  }

  let body: { url?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const raw = body.url;
  if (raw === null || raw === "" || raw === undefined) {
    await setSiteLogoUrl(null);
    revalidatePath("/katalog");
    return NextResponse.json({ ok: true, url: null });
  }

  const u = String(raw).trim();
  if (!/^https:\/\//i.test(u)) {
    return NextResponse.json(
      { error: "Yalnızca https:// ile başlayan mutlak URL kullanın." },
      { status: 400 },
    );
  }

  await setSiteLogoUrl(u);
  revalidatePath("/katalog");
  return NextResponse.json({ ok: true, url: u });
}
