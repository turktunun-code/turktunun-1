import type { Metadata } from "next";
import { CatalogClient } from "@/components/CatalogClient";
import { TAGLINE } from "@/lib/constants";
import { getMembers } from "@/lib/members";
import { getCatalogLogoSrc } from "@/lib/site-settings";

export const revalidate = 120;

export const metadata: Metadata = {
  title: `Üye kataloğu | Türk Tudun`,
  description: `Kurumsal üye kataloğu ve sektör filtrelemesi. ${TAGLINE}`,
};

export default async function KatalogPage() {
  const [members, logoSrc] = await Promise.all([getMembers(), getCatalogLogoSrc()]);
  return <CatalogClient members={members} logoSrc={logoSrc} />;
}
