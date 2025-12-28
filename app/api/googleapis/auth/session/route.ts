import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return NextResponse.json({
      isLoggedIn: false,
      user: null,
    });
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        position: payload.position,
      },
    });
  } catch {
    return NextResponse.json({
      isLoggedIn: false,
      user: null,
    });
  }
}
