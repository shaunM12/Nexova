import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/backoffice/auth/constants";
import { resolveAuthRedirect } from "@/lib/backoffice/auth/redirect";

export function middleware(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE;
  const target = resolveAuthRedirect(`${pathname}${search}`, hasSession, searchParams.get("next"));
  return target ? NextResponse.redirect(new URL(target, request.url)) : NextResponse.next();
}

/** Backoffice only — the public site never runs this middleware. */
export const config = {
  matcher: ["/backoffice/:path*"],
};
