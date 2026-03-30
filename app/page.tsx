import { CatalogClient } from "@/components/CatalogClient";
import { getMembers } from "@/lib/members";
import { getCatalogLogoSrc } from "@/lib/site-settings";

export const revalidate = 120;

export default async function Home() {
  const [members, logoSrc] = await Promise.all([getMembers(), getCatalogLogoSrc()]);
  return <CatalogClient members={members} logoSrc={logoSrc} />;
}
