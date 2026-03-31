import type { MemberWithLineage } from "./member";
import { getSupabaseAdmin } from "./supabase/admin";

export type ApprovalStatus = "approved" | "pending" | "rejected";

export async function getApprovalMap(): Promise<Record<string, ApprovalStatus>> {
  const sb = getSupabaseAdmin();
  if (!sb) return {};

  const { data, error } = await sb.from("members").select("lineage_key, approval_status");
  if (error) {
    console.error("[approvals] okunamadı", error.message);
    return {};
  }

  const out: Record<string, ApprovalStatus> = {};
  for (const r of data ?? []) {
    const k = r.lineage_key as string;
    const s = r.approval_status as string;
    if (s === "approved" || s === "pending" || s === "rejected") {
      out[k] = s;
    }
  }
  return out;
}

export async function setMemberApproval(memberKey: string, status: ApprovalStatus): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase yapılandırılmadı");

  const { error } = await sb
    .from("members")
    .update({ approval_status: status, updated_at: new Date().toISOString() })
    .eq("lineage_key", memberKey.trim());
  if (error) throw new Error(error.message);
}

export async function deleteMemberApproval(memberKey: string): Promise<void> {
  await setMemberApproval(memberKey, "approved");
}

/** Artık kullanılmıyor; uyumluluk için no-op. */
export async function pruneApprovalEntriesNotInMemberList(_validLineageKeys: Set<string>): Promise<number> {
  return 0;
}

export function filterPublicMembers(
  members: MemberWithLineage[],
  approvalMap: Record<string, ApprovalStatus>,
): MemberWithLineage[] {
  return members.filter((m) => {
    const status = approvalMap[m.lineageKey] ?? "approved";
    return status === "approved";
  });
}
