import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const param = req.nextUrl.searchParams.get("secret");

  if (!secret || param !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/");
  revalidatePath("/katalog");
  return NextResponse.json({ ok: true, revalidated: true });
}
