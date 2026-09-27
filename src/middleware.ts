import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ATTRIBUTION_COOKIE = "td_attribution";
const ATTRIBUTION_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid"];
const ADMIN_SESSION_COOKIE = "td_admin_session";

/**
 * Runs on the Edge runtime, so it re-implements a minimal JWT check instead
 * of importing the Node-only auth service. Any admin route other than the
 * login page requires a valid session; everything else just gets the
 * attribution cookie logic below.
 */
async function isValidAdminSession(token: string | undefined) {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET));
    return true;
  } catch {
    return false;
  }
}

/**
 * First-touch attribution: if the incoming request carries any campaign
 * parameter and no attribution cookie exists yet, store it for 30 days so it
 * survives until checkout, however many pages the visitor browses first.
 * Also gate-keeps every /admin route (except /admin/login) behind a valid
 * signed session cookie.
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login") {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const valid = await isValidAdminSession(token);
    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const response = NextResponse.next();

  const hasParam = ATTRIBUTION_PARAMS.some((key) => request.nextUrl.searchParams.has(key));
  const alreadyStored = request.cookies.has(ATTRIBUTION_COOKIE);

  if (hasParam && !alreadyStored) {
    const attribution: Record<string, string> = { landingPage: request.nextUrl.pathname };
    for (const key of ATTRIBUTION_PARAMS) {
      const value = request.nextUrl.searchParams.get(key);
      if (value) attribution[key] = value;
    }
    response.cookies.set(ATTRIBUTION_COOKIE, JSON.stringify(attribution), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
