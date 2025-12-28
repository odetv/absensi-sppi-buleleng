import { getSheetsClient } from "@/lib/auth/googleAuth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEETS_SETTING_ID,
      range: "LOCATION!A2:E",
    });

    const rows = res.data.values || [];
    const locations = rows.map((row, i) => ({
      id: Number(row[0]) || i + 1,
      name: row[1],
      lat: Number(row[2]),
      lon: Number(row[3]),
      radius: Number(row[4]) || 30,
    }));
    return NextResponse.json(locations);
  } catch (err) {
    console.error("LOCATION API ERROR", err);
    return NextResponse.json(
      { message: "Gagal mengambil data lokasi." },
      { status: 500 }
    );
  }
}
