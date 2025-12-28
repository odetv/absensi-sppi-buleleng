export type TypePosition = {
  id: number;
  position: string;
};

export async function getPositions(): Promise<TypePosition[]> {
  const res = await fetch("/api/googleapis/list-position", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil jabatan");
  }

  return res.json();
}
