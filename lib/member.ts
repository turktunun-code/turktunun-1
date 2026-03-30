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
  source?: "seed" | "sheet";
};

export function memberDedupeKey(m: Pick<Member, "fullName" | "contact">): string {
  const name = m.fullName.toLowerCase().trim().replace(/\s+/g, " ");
  const digits = (m.contact || "").replace(/\D/g, "");
  return `${name}|${digits}`;
}
