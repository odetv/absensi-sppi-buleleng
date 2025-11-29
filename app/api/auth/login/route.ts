import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const validUsernames =
    process.env.AUTH_USERNAME?.split(",").map((e) => e.trim()) || [];
  const validPassword = process.env.AUTH_PASSWORD;

  const emailMatch = validUsernames.includes(username);
  const passwordMatch = password === validPassword;

  if (!emailMatch && !passwordMatch) {
    return NextResponse.json(
      { success: false, message: "Email dan Password salah!" },
      { status: 401 }
    );
  }

  if (!emailMatch) {
    return NextResponse.json(
      { success: false, message: "Email tidak ditemukan!" },
      { status: 401 }
    );
  }

  if (!passwordMatch) {
    return NextResponse.json(
      { success: false, message: "Password salah!" },
      { status: 401 }
    );
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ email: username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set({
    name: "session_token",
    maxAge: 3600,
    value: token,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return NextResponse.json({ success: true });
}
