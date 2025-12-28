import { NextResponse } from "next/server";
import { getSheetsClient } from "@/lib/auth/googleAuth";

export async function GET() {
  try {
    const sheets = getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEETS_SETTING_ID,
      range: "GENERAL!A2:C2",
    });

    const value = res.data.values?.[0]?.[2] ?? "FALSE";

    return NextResponse.json({
      maintenance: value === "TRUE",
    });
  } catch (err) {
    console.error("MAINTENANCE API ERROR", err);
    return NextResponse.json({ maintenance: true });
  }
}
