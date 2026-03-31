import { getSupabaseAdmin } from "./supabase/admin";

export async function getExcludedMemberKeys(): Promise<Set<string>> {
  const sb = getSupabaseAdmin();
  if (!sb) return new Set();

  const { data, error } = await sb.from("members").select("lineage_key").eq("is_excluded", true);
  if (error) {
    console.error("[member-exclusions]", error.message);
    return new Set();
  }

  return new Set((data ?? []).map((r) => (r.lineage_key as string).trim()).filter(Boolean));
}

export async function addExcludedMemberKey(lineageKey: string): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase yapılandırılmadı");
  const k = lineageKey.trim();
  if (!k) throw new Error("Geçersiz anahtar");

  const { error } = await sb
    .from("members")
    .update({ is_excluded: true, updated_at: new Date().toISOString() })
    .eq("lineage_key", k);
  if (error) throw new Error(error.message);
}
