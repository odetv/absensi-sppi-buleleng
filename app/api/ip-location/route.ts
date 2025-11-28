import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();

    if (!data.success) {
      return NextResponse.json(
        { error: "Failed to fetch IP location" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      region: data.region,
      country: data.country,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "IP lookup error" }, { status: 500 });
  }
}
