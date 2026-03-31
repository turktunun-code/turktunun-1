import { DEFAULT_CATALOG_LOGO } from "./constants";
import { getSupabaseAdmin } from "./supabase/admin";

const LOGO_KEY = "logo_url";

function coerceString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number" || typeof v === "boolean") return String(v).trim() || null;
  return null;
}

export async function getSiteLogoUrl(): Promise<string | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;

  const { data, error } = await sb.from("site_settings").select("value").eq("key", LOGO_KEY).maybeSingle();
  if (error) {
    console.error("[site-settings] logo", error.message);
    return null;
  }
  return coerceString(data?.value);
}

export async function getCatalogLogoSrc(): Promise<string> {
  const custom = await getSiteLogoUrl();
  return custom ?? DEFAULT_CATALOG_LOGO;
}

export async function setSiteLogoUrl(url: string | null): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase yapılandırılmadı");

  if (!url?.trim()) {
    await sb.from("site_settings").delete().eq("key", LOGO_KEY);
    return;
  }

  const u = url.trim().slice(0, 2048);
  const { error } = await sb.from("site_settings").upsert(
    { key: LOGO_KEY, value: u, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}
