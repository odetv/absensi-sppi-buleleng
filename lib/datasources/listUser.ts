export type TypeUser = {
  id: number;
  name: string;
  positions: string[];
};

export async function getUsers(): Promise<TypeUser[]> {
  const res = await fetch("/api/googleapis/list-user", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil info pengguna");
  }

  return res.json();
}
