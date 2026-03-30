import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-api";
import { getGoogleSheetAdminView, setGoogleSheetSettings } from "@/lib/google-sheet-settings";
import { isRedisConfigured } from "@/lib/redis";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const view = await getGoogleSheetAdminView();
  return NextResponse.json(view);
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (!isRedisConfigured()) {
    return NextResponse.json({ error: "Ayarları kaydetmek için Redis gerekli" }, { status: 503 });
  }

  let body: {
    sheetId?: string;
    gid?: string;
    /** Panelden gönderilmezse mevcut anahtar korunur; null = sil */
    serviceAccountJson?: string | null;
    clearServiceAccount?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const sheetId = typeof body.sheetId === "string" ? body.sheetId : "";
  const gid = typeof body.gid === "string" ? body.gid : "0";

  let serviceAccountJson: string | null | undefined;
  if (body.clearServiceAccount === true) {
    serviceAccountJson = null;
  } else if ("serviceAccountJson" in body) {
    const v = body.serviceAccountJson;
    serviceAccountJson = v === undefined ? undefined : v === null ? null : String(v);
  } else {
    serviceAccountJson = undefined;
  }

  try {
    await setGoogleSheetSettings({ sheetId, gid, serviceAccountJson });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Kayıt başarısız";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  revalidatePath("/anasayfa");
  revalidatePath("/katalog");
  revalidatePath("/oneriler");

  const view = await getGoogleSheetAdminView();
  return NextResponse.json({ ok: true, ...view });
}
