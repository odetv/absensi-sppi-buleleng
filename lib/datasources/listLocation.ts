export type TypeLocation = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  radius: number;
};

export async function getLocations(): Promise<TypeLocation[]> {
  const res = await fetch("/api/googleapis/list-location", {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Gagal mengambil lokasi");
  }
  return res.json();
}
