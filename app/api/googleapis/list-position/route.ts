import { getSheetsClient } from "@/lib/auth/googleAuth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEETS_SETTING_ID,
      range: "POSITION!A2:B",
    });

    const rows = res.data.values || [];
    const locations = rows.map((row, i) => ({
      id: Number(row[0]) || i + 1,
      position: row[1],
    }));
    return NextResponse.json(locations);
  } catch (err) {
    console.error("POSITION API ERROR", err);
    return NextResponse.json(
      { message: "Gagal mengambil data jabatan." },
      { status: 500 }
    );
  }
}
