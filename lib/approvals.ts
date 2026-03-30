import { memberDedupeKey, type Member } from "./member";
import { getRedis } from "./redis";

export type ApprovalStatus = "approved" | "pending" | "rejected";

const HASH_KEY = "member:approval";

export async function getApprovalMap(): Promise<Record<string, ApprovalStatus>> {
  const r = getRedis();
  if (!r) return {};

  const raw = await r.hgetall(HASH_KEY);
  const out: Record<string, ApprovalStatus> = {};

  for (const [k, v] of Object.entries(raw ?? {})) {
    if (v === "approved" || v === "pending" || v === "rejected") {
      out[k] = v;
    }
  }

  return out;
}

export async function setMemberApproval(memberKey: string, status: ApprovalStatus): Promise<void> {
  const r = getRedis();
  if (!r) throw new Error("Redis yapılandırılmadı");

  if (status === "approved") {
    await r.hdel(HASH_KEY, memberKey);
  } else {
    await r.hset(HASH_KEY, { [memberKey]: status });
  }
}

/** Katalogda yalnızca onaylı kayıtlar: varsayılan onaylı; pending ve rejected gizlenir. */
export function filterPublicMembers(
  members: Member[],
  approvalMap: Record<string, ApprovalStatus>,
): Member[] {
  return members.filter((m) => {
    const key = memberDedupeKey(m);
    const status = approvalMap[key] ?? "approved";
    return status === "approved";
  });
}
