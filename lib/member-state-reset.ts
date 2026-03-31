import { getSupabaseAdmin } from "./supabase/admin";

/** Onayları «onaylı», gizlenenleri görünür yapar (veri satırları silinmez). */
export async function clearMemberOverlayState(): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase yapılandırılmadı");

  const { error } = await sb
    .from("members")
    .update({
      is_excluded: false,
      approval_status: "approved",
      updated_at: new Date().toISOString(),
    })
    .neq("lineage_key", "");

  if (error) throw new Error(error.message);
}
