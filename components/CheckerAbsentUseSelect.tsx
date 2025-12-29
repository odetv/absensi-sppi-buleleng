"use client";
import { useEffect, useState } from "react";

type CheckerAbsentProps = {
  name: string;
};

export default function CheckerAbsent({ name }: CheckerAbsentProps) {
  const [status, setStatus] = useState<{
    masuk: boolean;
    keluar: boolean;
    jamMasuk?: string | null;
    jamKeluar?: string | null;
  } | null>(null);
  const now = new Date();
  const date = now.toLocaleDateString("id-ID");
  const sheetName = `${now.getMonth() + 1}-${now.getFullYear()}`;

  useEffect(() => {
    if (!name) return;

    const checkAbsent = async () => {
      try {
        const res = await fetch("/api/googleapis/check-absent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            sheetName,
            date,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus({
            masuk: data.masuk,
            keluar: data.keluar,
            jamMasuk: data.jamMasuk,
            jamKeluar: data.jamKeluar,
          });
        }
      } catch (err) {
        console.error("CheckerAbsent error:", err);
      }
    };
    checkAbsent();
  }, [name, date, sheetName]);

  if (!name || !status) return null;

  return (
    <div className="mb-4 rounded-lg border bg-gray-50 p-3 text-sm">
      <p>
        Absen Masuk:{" "}
        {status.masuk ? (
          <span className="text-green-600 font-semibold">
            ✔ Pukul {status.jamMasuk}
          </span>
        ) : (
          <span className="text-red-600">✖ Belum</span>
        )}
      </p>

      <p>
        Absen Keluar:{" "}
        {status.keluar ? (
          <span className="text-green-600 font-semibold">
            ✔ Pukul {status.jamKeluar}
          </span>
        ) : (
          <span className="text-red-600">✖ Belum</span>
        )}
      </p>
    </div>
  );
}
