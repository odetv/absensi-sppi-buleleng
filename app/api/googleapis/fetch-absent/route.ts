import { getSheetsClient } from "@/lib/auth/googleAuth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      time,
      day,
      date,
      absentType,
      name,
      position,
      description,
      latitude,
      longitude,
      sppgLocation,
      mapsLocation,
      sheetName,
    } = body;

    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEETS_PRESENT_ID;
    if (!spreadsheetId) {
      throw new Error(
        "GOOGLE_SPREADSHEETS_PRESENT_ID is not defined in environment variables."
      );
    }

    try {
      // Append langsung ke sheet yang sudah ada
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:J`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              time,
              day,
              date,
              absentType,
              name,
              position,
              description,
              latitude,
              longitude,
              sppgLocation,
              mapsLocation,
            ],
          ],
        },
      });

      return NextResponse.json({ message: "Data berhasil ditambahkan." });
    } catch (err: any) {
      if (err.message.includes("Unable to parse range")) {
        // Sheet belum ada, buat dulu
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: { title: sheetName },
                },
              },
            ],
          },
        });

        const sheetId = await getSheetIdByName(
          sheets,
          spreadsheetId,
          sheetName
        );

        // Tambah header
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1:K1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [
              [
                "Waktu",
                "Hari",
                "Tanggal",
                "Jenis Absen",
                "Nama",
                "Jabatan",
                "Uraian Kegiatan",
                "Latitude",
                "Longitude",
                "Lokasi SPPG",
                "Lokasi Maps",
              ],
            ],
          },
        });

        // Styling header
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 11,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                      textFormat: { bold: true },
                    },
                  },
                  fields: "userEnteredFormat(backgroundColor,textFormat)",
                },
              },
              {
                updateSheetProperties: {
                  properties: {
                    sheetId,
                    gridProperties: {
                      frozenRowCount: 1,
                    },
                  },
                  fields: "gridProperties.frozenRowCount",
                },
              },
              {
                setBasicFilter: {
                  filter: {
                    range: {
                      sheetId,
                      startRowIndex: 0,
                      endRowIndex: 1,
                      startColumnIndex: 0,
                      endColumnIndex: 11,
                    },
                  },
                },
              },
            ],
          },
        });

        // Append data baru SETELAH styling
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${sheetName}!A:J`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [
              [
                time,
                day,
                date,
                absentType,
                name,
                position,
                description,
                latitude,
                longitude,
                sppgLocation,
                mapsLocation,
              ],
            ],
          },
        });

        // Auto resize kolom (HARUS dilakukan SETELAH append data)
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                autoResizeDimensions: {
                  dimensions: {
                    sheetId,
                    dimension: "COLUMNS",
                    startIndex: 0,
                    endIndex: 11,
                  },
                },
              },
            ],
          },
        });

        return NextResponse.json({
          message: "Sheet baru dibuat & data berhasil ditambahkan.",
        });
      }

      throw err;
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal menulis ke sheet" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "GET not allowed" }, { status: 405 });
}

async function getSheetIdByName(
  sheets: any,
  spreadsheetId: string,
  sheetName: string
) {
  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = metadata.data.sheets.find(
    (s: any) => s.properties.title === sheetName
  );
  return sheet?.properties.sheetId;
}
