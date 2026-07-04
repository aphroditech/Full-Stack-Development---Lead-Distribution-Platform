import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/config";

// Admin (protected) routes. Everything else — /login and public form slugs — is open.
const PROTECTED_EXACT = ["/"];
const PROTECTED_PREFIX = ["/brokers", "/form", "/distribution", "/leads"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected =
    PROTECTED_EXACT.includes(pathname) ||
    PROTECTED_PREFIX.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and static assets (anything with a file extension).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
