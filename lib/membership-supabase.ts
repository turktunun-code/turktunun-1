import { memberDedupeKey } from "./member";
import type { MembershipFormPayload } from "./membership-submission";
import { getSupabaseAdmin } from "./supabase/admin";

export type StoredMembershipApplication = MembershipFormPayload & {
  submittedAt: string;
  source: string;
};

function socialDigest(r: MembershipFormPayload): string {
  const parts = [
    r.website && `Web: ${r.website}`,
    r.whatsappUrl && `WA: ${r.whatsappUrl}`,
    r.linkedInUrl && `LI: ${r.linkedInUrl}`,
    r.xUrl && `X: ${r.xUrl}`,
    r.instagramUrl && `IG: ${r.instagramUrl}`,
    r.facebookUrl && `FB: ${r.facebookUrl}`,
    r.youtubeUrl && `YT: ${r.youtubeUrl}`,
    r.tiktokUrl && `TT: ${r.tiktokUrl}`,
    r.socialOther && `Diger: ${r.socialOther}`,
  ].filter(Boolean) as string[];
  return parts.join(" | ");
}

function buildMemberRow(record: StoredMembershipApplication) {
  const r = record;
  const digital = [
    r.email && `E-posta: ${r.email}`,
    r.preferredContact && `Tercih: ${r.preferredContact}`,
    socialDigest(r),
  ]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 4000);

  const materials = [r.materials, r.companySummary].filter(Boolean).join("\n\n").slice(0, 4000);
  const location = [r.location, r.fullAddress].filter(Boolean).join(" — ").slice(0, 800);
  const reference = [r.referenceContact, r.howHeard && `Kaynak: ${r.howHeard}`, r.legalForm && `Yapı: ${r.legalForm}`]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 2000);

  return {
    lineage_key: memberDedupeKey({ fullName: r.fullName, contact: r.contact }),
    full_name: r.fullName.trim(),
    rank: r.jobTitle.trim().slice(0, 400),
    sector: r.sector.trim().slice(0, 1000),
    brand: r.brand.trim().slice(0, 400),
    materials,
    location,
    contact: r.contact.trim().slice(0, 200),
    digital_contact: digital,
    reference,
    source: "site-form",
  };
}

export async function persistMembershipApplication(record: StoredMembershipApplication): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;

  const { error: appErr } = await sb.from("membership_applications").insert({
    payload: record as unknown as Record<string, unknown>,
  });
  if (appErr) {
    console.error("[membership] application log", appErr.message);
    return false;
  }

  const row = buildMemberRow(record);
  const { data: existing, error: selErr } = await sb
    .from("members")
    .select("approval_status")
    .eq("lineage_key", row.lineage_key)
    .maybeSingle();

  if (selErr) {
    console.error("[membership] select", selErr.message);
    return false;
  }

  const now = new Date().toISOString();

  if (!existing) {
    const { error } = await sb.from("members").insert({
      ...row,
      approval_status: "pending",
      is_excluded: false,
      updated_at: now,
    });
    if (error) {
      console.error("[membership] insert", error.message);
      return false;
    }
    return true;
  }

  if (existing.approval_status === "approved") {
    return true;
  }

  const { error } = await sb
    .from("members")
    .update({
      ...row,
      approval_status: "pending",
      is_excluded: false,
      updated_at: now,
    })
    .eq("lineage_key", row.lineage_key);

  if (error) {
    console.error("[membership] update", error.message);
    return false;
  }
  return true;
}
