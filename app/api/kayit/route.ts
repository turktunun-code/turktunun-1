import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { persistMembershipApplication } from "@/lib/membership-supabase";
import { parseMembershipBody } from "@/lib/membership-submission";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, issues: ["İstek gövdesi JSON biçiminde olmalıdır."] }, { status: 400 });
  }

  const parsed = parseMembershipBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, issues: parsed.issues }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        code: "NO_STORAGE",
        message:
          "Başvuru sunucusu yapılandırılmamış. Yöneticinizin NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ortam değişkenlerini ayarlaması gerekir.",
      },
      { status: 503 },
    );
  }

  const record = {
    ...parsed.data,
    submittedAt: new Date().toISOString(),
    source: "site-form",
  };

  const saved = await persistMembershipApplication(record);

  if (saved) {
    try {
      revalidatePath("/katalog");
      revalidatePath("/oneriler");
      revalidatePath("/anasayfa");
      revalidatePath("/admin");
    } catch (e) {
      console.error("[kayit] revalidatePath", e);
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Başvurunuz sisteme başarıyla iletilmiştir.",
    persisted: saved,
  });
}
