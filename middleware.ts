import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const pathname = request.nextUrl.pathname;

  const publicPaths = [
    "/auth",
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/session",
  ];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!token) {
    if (!isPublic) return NextResponse.redirect(new URL("/auth", request.url));
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET);
    await jwtVerify(token, secret);
    if (pathname === "/auth") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  } catch {
    // JWT invalid
    const response = NextResponse.redirect(new URL("/auth", request.url));
    // Hapus cookie invalid
    response.cookies.set({
      name: "session_token",
      value: "",
      expires: new Date(0),
      path: "/",
    });
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
