import { NextResponse } from "next/server";
import {
  trackFormCtaClick,
  trackPageView,
  trackSearchQuery,
  trackSectorPick,
} from "@/lib/analytics";

type Body = {
  type?: string;
  sector?: string;
  query?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  switch (body.type) {
    case "page_view":
      await trackPageView();
      break;
    case "sector":
      if (body.sector) await trackSectorPick(body.sector);
      break;
    case "search":
      if (body.query) await trackSearchQuery(body.query);
      break;
    case "form_cta":
      await trackFormCtaClick();
      break;
    default:
      return NextResponse.json({ ok: false }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
