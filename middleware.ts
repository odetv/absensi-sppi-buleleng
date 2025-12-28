import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /** =========================
   * 1. BYPASS STATIC & API CHECK
   ========================= */
  if (
    pathname.startsWith("/api/googleapis/general/maintenance") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  /** =========================
   * 2. CEK MAINTENANCE
   ========================= */
  let maintenance = false;
  try {
    const protocol = request.headers.get("x-forwarded-proto") ?? "http";
    const host = request.headers.get("host");
    const res = await fetch(
      `${protocol}://${host}/api/googleapis/general/maintenance`,
      { cache: "no-store" }
    );
    const data = await res.json();
    maintenance = Boolean(data.maintenance);
  } catch (err) {
    console.error("Maintenance check failed", err);
  }

  /** =========================
 * 3. RULE MAINTENANCE (ANTI LOOP)
 ========================= */
  // 🔴 MAINTENANCE AKTIF
  if (maintenance) {
    // Kalau sudah di /maintenance → LANJUT, JANGAN REDIRECT
    if (pathname === "/maintenance") {
      return NextResponse.next();
    }
    // Selain itu → redirect ke /maintenance
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }
  // 🟢 MAINTENANCE MATI
  if (!maintenance && pathname === "/maintenance") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  /** =========================
   * 4. AUTH CHECK
   ========================= */
  const token = request.cookies.get("session_token")?.value;
  const publicPaths = [
    "/auth",
    "/api/googleapis/auth/login",
    "/api/googleapis/auth/logout",
    "/api/googleapis/auth/session",
  ];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET);
      await jwtVerify(token, secret);
      if (pathname === "/auth") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      const response = NextResponse.redirect(new URL("/auth", request.url));
      response.cookies.set("session_token", "", {
        expires: new Date(0),
        path: "/",
      });
      return response;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
