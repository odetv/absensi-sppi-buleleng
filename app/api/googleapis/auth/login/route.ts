import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { getSheetsClient } from "@/lib/auth/googleAuth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const sheets = getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEETS_SETTING_ID,
      range: "ACCOUNT!A2:E",
    });

    const rows = res.data.values || [];

    // 🔎 Cari user berdasarkan EMAIL
    const user = rows.find(
      (row) =>
        row[3]?.toLowerCase() === username.toLowerCase() && row[4] === password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    const [id, name, position, email] = user;

    // 🔑 Buat JWT
    const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET);

    const token = await new SignJWT({
      id,
      name,
      email,
      position,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    // 🍪 Simpan ke cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: "session_token",
      value: token,
      httpOnly: true,
      maxAge: 1800, // 30 menit
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      user: {
        name,
        email,
        position,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
