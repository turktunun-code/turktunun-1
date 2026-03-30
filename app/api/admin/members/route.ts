import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { ApprovalStatus } from "@/lib/approvals";
import { getAdminSession } from "@/lib/admin-api";
import { getApprovalMap, setMemberApproval } from "@/lib/approvals";
import { memberDedupeKey } from "@/lib/member";
import { getMergedMembers } from "@/lib/members";
import { isRedisConfigured } from "@/lib/redis";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const members = await getMergedMembers();
  const approvals = await getApprovalMap();

  return NextResponse.json({
    members: members.map((m) => ({
      key: memberDedupeKey(m),
      fullName: m.fullName,
      sector: m.sector,
      brand: m.brand,
      contact: m.contact,
      approval: approvals[memberDedupeKey(m)] ?? "approved",
    })),
    redis: isRedisConfigured(),
  });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (!isRedisConfigured()) {
    return NextResponse.json({ error: "Onay kaydı için Redis gerekli" }, { status: 503 });
  }

  let body: { key?: string; status?: ApprovalStatus };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const key = body.key?.trim();
  const status = body.status;

  if (!key) {
    return NextResponse.json({ error: "key gerekli" }, { status: 400 });
  }

  if (status !== "approved" && status !== "pending" && status !== "rejected") {
    return NextResponse.json({ error: "Geçersiz status" }, { status: 400 });
  }

  try {
    await setMemberApproval(key, status);
  } catch {
    return NextResponse.json({ error: "Kayıt başarısız" }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/anasayfa");
  revalidatePath("/katalog");
  revalidatePath("/oneriler");

  return NextResponse.json({ ok: true });
}
