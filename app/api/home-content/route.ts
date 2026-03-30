import { NextResponse } from "next/server";
import { getResolvedHomeBlog, getResolvedHomeNews } from "@/lib/home-content-store";

/** Kamuya açık anasayfa içeriği (haber + blog). */
export async function GET() {
  const [news, blog] = await Promise.all([getResolvedHomeNews(), getResolvedHomeBlog()]);
  return NextResponse.json({ news, blog });
}
