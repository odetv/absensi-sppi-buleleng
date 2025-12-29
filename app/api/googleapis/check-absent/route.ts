import { getSheetsClient } from "@/lib/auth/googleAuth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, sheetName, date } = await req.json();

    if (!name || !sheetName || !date) {
      return NextResponse.json(
        { error: "name, sheetName, dan date wajib diisi" },
        { status: 400 }
      );
    }

    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEETS_PRESENT_ID;

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SPREADSHEETS_PRESENT_ID belum diset");
    }

    let rows: string[][] = [];

    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A2:E`,
      });
      rows = res.data.values || [];
    } catch {
      // sheet belum ada
      return NextResponse.json({
        success: true,
        masuk: false,
        keluar: false,
        jamMasuk: null,
        jamKeluar: null,
      });
    }

    let sudahMasuk = false;
    let sudahKeluar = false;
    let jamMasuk: string | null = null;
    let jamKeluar: string | null = null;

    rows.forEach((row) => {
      const waktu = row[0]; // ⬅️ JAM ABSEN
      const rowDate = row[2];
      const rowType = row[3];
      const rowName = row[4];

      if (rowName === name && rowDate === date) {
        if (rowType === "Masuk") {
          sudahMasuk = true;
          jamMasuk = waktu;
        }
        if (rowType === "Keluar") {
          sudahKeluar = true;
          jamKeluar = waktu;
        }
      }
    });

    return NextResponse.json({
      success: true,
      masuk: sudahMasuk,
      keluar: sudahKeluar,
      jamMasuk,
      jamKeluar,
    });
  } catch (error) {
    console.error("CHECK ABSENT ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Gagal cek absen" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "GET not allowed" }, { status: 405 });
}
