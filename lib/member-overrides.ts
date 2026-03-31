import type { Member, MemberWithLineage } from "./member";
import { getSupabaseAdmin } from "./supabase/admin";

export type MemberOverridePatch = Partial<
  Pick<
    Member,
    | "fullName"
    | "sector"
    | "brand"
    | "materials"
    | "location"
    | "contact"
    | "digitalContact"
    | "reference"
    | "rank"
  >
>;

const MAX_FIELD = 4_000;

function clampStr(s: string): string {
  return s.trim().slice(0, MAX_FIELD);
}

export function sanitizeMemberPatch(raw: unknown): MemberOverridePatch | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const out: MemberOverridePatch = {};
  const set = (k: keyof MemberOverridePatch) => {
    const v = o[k];
    if (typeof v !== "string") return;
    (out as Record<string, string>)[k] = clampStr(v);
  };
  set("fullName");
  set("sector");
  set("brand");
  set("materials");
  set("location");
  set("contact");
  set("digitalContact");
  set("reference");
  set("rank");
  return Object.keys(out).length > 0 ? out : null;
}

/** Üye verisi doğrudan veritabanı satırında tutulur. */
export async function applyMemberOverridesBulk(members: MemberWithLineage[]): Promise<MemberWithLineage[]> {
  return members;
}

export async function mergeMemberOverride(lineageKey: string, patch: MemberOverridePatch): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase yok");

  const row: Record<string, string> = {};
  if (patch.fullName !== undefined) row.full_name = patch.fullName;
  if (patch.sector !== undefined) row.sector = patch.sector;
  if (patch.brand !== undefined) row.brand = patch.brand;
  if (patch.materials !== undefined) row.materials = patch.materials;
  if (patch.location !== undefined) row.location = patch.location;
  if (patch.contact !== undefined) row.contact = patch.contact;
  if (patch.digitalContact !== undefined) row.digital_contact = patch.digitalContact;
  if (patch.reference !== undefined) row.reference = patch.reference;
  if (patch.rank !== undefined) row.rank = patch.rank;

  if (Object.keys(row).length === 0) return;

  row.updated_at = new Date().toISOString();

  const { error } = await sb.from("members").update(row).eq("lineage_key", lineageKey.trim());
  if (error) throw new Error(error.message);
}

export async function deleteMemberOverride(_lineageKey: string): Promise<void> {
  return;
}
