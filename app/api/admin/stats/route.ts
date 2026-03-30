import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/analytics";
import { getAdminSession } from "@/lib/admin-api";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
