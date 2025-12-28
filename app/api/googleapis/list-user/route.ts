import { getSheetsClient } from "@/lib/auth/googleAuth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEETS_SETTING_ID,
      range: "ACCOUNT!A2:C",
    });

    const rows = res.data.values || [];
    const users = rows.map((row, i) => ({
      id: Number(row[0]) || i + 1,
      name: row[1],
      positions: row[2] ? row[2].split(",").map((p: string) => p.trim()) : [],
    }));
    return NextResponse.json(users);
  } catch (err) {
    console.error("ACCOUNT API ERROR", err);
    return NextResponse.json(
      { message: "Gagal mengambil data pengguna." },
      { status: 500 }
    );
  }
}
