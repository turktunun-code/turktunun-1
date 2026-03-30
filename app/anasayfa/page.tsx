import { HomeLanding } from "@/components/HomeLanding";
import { TAGLINE } from "@/lib/constants";
import { getResolvedHomeBlog, getResolvedHomeNews } from "@/lib/home-content-store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Anasayfa | Türk Tudun`,
  description: `Haberler, blog ve üye katalogu. ${TAGLINE}`,
};

export const revalidate = 60;

export default async function AnasayfaPage() {
  const [initialNews, initialBlog] = await Promise.all([getResolvedHomeNews(), getResolvedHomeBlog()]);
  return <HomeLanding initialNews={initialNews} initialBlog={initialBlog} />;
}
