import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "./lib/admin-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    return NextResponse.redirect(new URL("/admin/login?misconfigured=1", req.url));
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
