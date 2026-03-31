import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "./lib/admin-auth";
import { updateSession } from "./utils/supabase/middleware";

function mergeSupabaseCookies(from: NextResponse, to: NextResponse) {
  const setCookies = from.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    for (const line of setCookies) {
      to.headers.append("set-cookie", line);
    }
    return;
  }
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value);
  });
}

export async function middleware(request: NextRequest) {
  const sessionResponse = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/admin")) {
    return sessionResponse;
  }

  if (pathname.startsWith("/admin/login")) {
    return sessionResponse;
  }

  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    const redirect = NextResponse.redirect(new URL("/admin/login?misconfigured=1", request.url));
    mergeSupabaseCookies(sessionResponse, redirect);
    return redirect;
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    const redirect = NextResponse.redirect(new URL("/admin/login", request.url));
    mergeSupabaseCookies(sessionResponse, redirect);
    return redirect;
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return sessionResponse;
  } catch {
    const redirect = NextResponse.redirect(new URL("/admin/login", request.url));
    mergeSupabaseCookies(sessionResponse, redirect);
    return redirect;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
