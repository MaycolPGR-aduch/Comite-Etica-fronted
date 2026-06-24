import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/investigador",
  "/secretaria",
  "/coordinador",
  "/evaluador",
  "/admin",
];

const roleHomeByRoleCookie: Record<string, string> = {
  investigador: "/investigador/dashboard",
  secretaria: "/secretaria/bandeja",
  coordinador: "/coordinador/dashboard",
  evaluador: "/evaluador/bandeja",
  administrador: "/admin/configuracion",
};

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("ce_auth_token")?.value;
  const role = request.cookies.get("ce_auth_role")?.value;

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const isLoginRoute = pathname === "/login" || pathname === "/login/staff";
  if (isLoginRoute && token && role && roleHomeByRoleCookie[role]) {
    return NextResponse.redirect(new URL(roleHomeByRoleCookie[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/investigador/:path*",
    "/secretaria/:path*",
    "/coordinador/:path*",
    "/evaluador/:path*",
    "/admin/:path*",
    "/login",
    "/login/staff",
  ],
};
