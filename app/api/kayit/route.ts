import { NextResponse } from "next/server";
import { FORM_URL } from "@/lib/constants";
import { parseMembershipBody } from "@/lib/membership-submission";
import { getRedis } from "@/lib/redis";

const LIST_KEY = "kayit:basvurular";

/** Başvuruyu Redis kuyruğa yazar. Redis yoksa Google Form adresini döner. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, issues: ["İstek gövdesi JSON biçiminde olmalıdır."] }, { status: 400 });
  }

  const parsed = parseMembershipBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, issues: parsed.issues }, { status: 400 });
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json(
      {
        ok: false,
        code: "NO_STORAGE",
        message:
          "Başvurunuz şu anda sistem kayıtlarına alınamamıştır. Aynı içeriği Google Form aracılığıyla iletmeniz rica olunur.",
        formUrl: FORM_URL,
      },
      { status: 503 },
    );
  }

  const record = {
    ...parsed.data,
    submittedAt: new Date().toISOString(),
    source: "site-form",
  };

  await r.lpush(LIST_KEY, JSON.stringify(record));

  return NextResponse.json({ ok: true, message: "Başvurunuz sisteme başarıyla iletilmiştir." });
}
