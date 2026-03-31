import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { ApprovalStatus } from "@/lib/approvals";
import { getAdminSession } from "@/lib/admin-api";
import {
  deleteMemberApproval,
  getApprovalMap,
  pruneApprovalEntriesNotInMemberList,
  setMemberApproval,
} from "@/lib/approvals";
import { addExcludedMemberKey } from "@/lib/member-exclusions";
import { deleteMemberOverride, mergeMemberOverride, sanitizeMemberPatch } from "@/lib/member-overrides";
import { getMergedMembers, getMergedMembersUnfiltered } from "@/lib/members";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const members = await getMergedMembers();
    const validKeys = new Set(members.map((m) => m.lineageKey));
    try {
      await pruneApprovalEntriesNotInMemberList(validKeys);
    } catch (e) {
      console.error("[admin/members] prune approvals", e);
    }
    const approvals = await getApprovalMap();

    return NextResponse.json({
      members: members.map((m) => ({
        key: m.lineageKey,
        fullName: m.fullName,
        sector: m.sector,
        brand: m.brand,
        materials: m.materials,
        location: m.location,
        contact: m.contact,
        digitalContact: m.digitalContact ?? "",
        reference: m.reference ?? "",
        rank: m.rank ?? "",
        approval: approvals[m.lineageKey] ?? "approved",
      })),
      supabase: isSupabaseConfigured(),
    });
  } catch (e) {
    console.error("[admin/members GET]", e);
    const msg = e instanceof Error ? e.message : "Üye listesi oluşturulamadı";
    return NextResponse.json(
      { error: msg, members: [], supabase: isSupabaseConfigured() },
      { status: 500 },
    );
  }
}

type PostBody = {
  action?: string;
  lineageKey?: string;
  patch?: unknown;
  key?: string;
  status?: ApprovalStatus;
};

function revalidateMemberPages() {
  revalidatePath("/");
  revalidatePath("/anasayfa");
  revalidatePath("/katalog");
  revalidatePath("/oneriler");
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Üye işlemleri için Supabase gerekli" }, { status: 503 });
  }

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  if (body.action === "update") {
    const lineageKey = body.lineageKey?.trim();
    const patch = sanitizeMemberPatch(body.patch);
    if (!lineageKey) {
      return NextResponse.json({ error: "lineageKey gerekli" }, { status: 400 });
    }
    if (!patch) {
      return NextResponse.json({ error: "Geçerli alan gönderilmedi" }, { status: 400 });
    }

    const list = await getMergedMembers();
    const cur = list.find((m) => m.lineageKey === lineageKey);
    if (!cur) {
      return NextResponse.json({ error: "Üye bulunamadı" }, { status: 404 });
    }

    const next = { ...cur, ...patch };
    if (!next.fullName?.trim()) {
      return NextResponse.json({ error: "Tam ad boş olamaz" }, { status: 400 });
    }

    try {
      await mergeMemberOverride(lineageKey, patch);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kayıt başarısız";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    revalidateMemberPages();
    return NextResponse.json({ ok: true });
  }

  if (body.action === "exclude" || body.action === "delete") {
    const exKey = (body.key ?? body.lineageKey)?.trim();
    if (!exKey) {
      return NextResponse.json({ error: "key gerekli" }, { status: 400 });
    }

    const list = await getMergedMembersUnfiltered();
    if (!list.some((m) => m.lineageKey === exKey)) {
      return NextResponse.json({ error: "Üye bulunamadı" }, { status: 404 });
    }

    try {
      await addExcludedMemberKey(exKey);
      await deleteMemberOverride(exKey);
      await deleteMemberApproval(exKey);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kayıt başarısız";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    revalidateMemberPages();
    return NextResponse.json({ ok: true });
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

  revalidateMemberPages();

  return NextResponse.json({ ok: true });
}
