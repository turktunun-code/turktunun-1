import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminPasswordConfigured, signAdminToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json({ ok: false, error: "Yönetim erişimi için sistemde şifre tanımlı değildir." }, { status: 503 });
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "İstek biçimi geçersizdir." }, { status: 400 });
  }

  const password = body.password ?? "";
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Girilen parola doğrulanamadı." }, { status: 401 });
  }

  let token: string;
  try {
    token = await signAdminToken();
  } catch {
    return NextResponse.json({ ok: false, error: "Oturum imzalama anahtarı yapılandırılmamıştır." }, { status: 503 });
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
