import { filterPublicMembers, getApprovalMap } from "./approvals";
import { getExcludedMemberKeys } from "./member-exclusions";
import { applyMemberOverridesBulk } from "./member-overrides";
import { type Member, type MemberWithLineage } from "./member";
import { getSupabaseAdmin } from "./supabase/admin";

type MemberDbRow = {
  lineage_key: string;
  rank: string;
  full_name: string;
  sector: string;
  brand: string;
  materials: string;
  location: string;
  contact: string;
  digital_contact: string;
  reference: string;
  source: string;
};

function rowToMemberWithLineage(r: MemberDbRow): MemberWithLineage {
  return {
    lineageKey: r.lineage_key,
    rank: r.rank?.trim() ? r.rank : undefined,
    fullName: r.full_name,
    sector: r.sector ?? "",
    brand: r.brand ?? "",
    materials: r.materials ?? "",
    location: r.location ?? "",
    contact: r.contact ?? "",
    digitalContact: r.digital_contact?.trim() ? r.digital_contact : undefined,
    reference: r.reference?.trim() ? r.reference : undefined,
    source: (r.source as Member["source"]) ?? "supabase",
  };
}

async function fetchMembersFromDb(): Promise<MemberWithLineage[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data, error } = await sb
    .from("members")
    .select("lineage_key,rank,full_name,sector,brand,materials,location,contact,digital_contact,reference,source")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[members] Supabase", error.message);
    return [];
  }

  return (data ?? []).map((r) => rowToMemberWithLineage(r as MemberDbRow));
}

function normalizeMergedMemberList(list: MemberWithLineage[]): MemberWithLineage[] {
  const seen = new Set<string>();
  const out: MemberWithLineage[] = [];
  for (const m of list) {
    if (m.fullName.trim().length < 2) continue;
    if (seen.has(m.lineageKey)) continue;
    seen.add(m.lineageKey);
    out.push(m);
  }
  return out;
}

async function computeMergedMemberList(): Promise<MemberWithLineage[]> {
  const sheet = await fetchMembersFromDb();
  const withOverrides = await applyMemberOverridesBulk(sheet);
  return normalizeMergedMemberList(withOverrides);
}

export async function getMergedMembersUnfiltered(): Promise<MemberWithLineage[]> {
  return computeMergedMemberList();
}

export async function getMergedMembers(): Promise<MemberWithLineage[]> {
  const list = await computeMergedMemberList();
  const excluded = await getExcludedMemberKeys();
  if (excluded.size === 0) return list;
  return list.filter((m) => !excluded.has(m.lineageKey));
}

export async function getMembers(): Promise<Member[]> {
  const merged = await getMergedMembers();
  const map = await getApprovalMap();
  return filterPublicMembers(merged, map).map(({ lineageKey: _, ...m }) => m);
}
