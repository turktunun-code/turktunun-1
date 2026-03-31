export type Member = {
  rank?: string;
  fullName: string;
  sector: string;
  brand: string;
  materials: string;
  location: string;
  contact: string;
  digitalContact?: string;
  reference?: string;
  source?: "supabase" | "sheet" | "site-form";
};

/** Tablo satırına sabit kimlik; düzenleme ve onay bu anahtarla tutulur (ad/iletişim değişse bile). */
export type MemberWithLineage = Member & { lineageKey: string };

export function memberDedupeKey(m: Pick<Member, "fullName" | "contact">): string {
  const name = m.fullName.toLowerCase().trim().replace(/\s+/g, " ");
  const digits = (m.contact || "").replace(/\D/g, "");
  return `${name}|${digits}`;
}
