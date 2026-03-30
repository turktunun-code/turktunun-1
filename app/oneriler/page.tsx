import type { Metadata } from "next";
import { OnerilerClient } from "@/components/OnerilerClient";
import { TAGLINE } from "@/lib/constants";
import { getMembers } from "@/lib/members";

export const revalidate = 120;

type Search = { demand?: string; sector?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const d = (sp.demand ?? "").trim().slice(0, 80);
  const title =
    d.length > 0
      ? `Talep sonuçları: ${d}${d.length >= 80 ? "…" : ""} | Türk Tudun`
      : `Talep temelli sonuçlar | Türk Tudun`;
  return {
    title,
    description: `Türk Tudun talep temelli üye eşleştirme sonuçları. ${TAGLINE}`,
  };
}

export default async function OnerilerPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const members = await getMembers();
  return (
    <OnerilerClient
      members={members}
      initialDemand={sp.demand ?? ""}
      initialSector={sp.sector ?? ""}
    />
  );
}
