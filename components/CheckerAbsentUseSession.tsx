"use client";
import { useEffect, useState } from "react";

export type StatusAbsent = {
  masuk: boolean;
  keluar: boolean;
  jamMasuk?: string | null;
  jamKeluar?: string | null;
};

type SessionUser = {
  id: string;
  name: string;
  email: string;
  position: string;
};

type Props = {
  onStatusChange?: (status: StatusAbsent) => void;
};

export default function CheckerAbsentUseSession({ onStatusChange }: Props) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<StatusAbsent | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const date = now.toLocaleDateString("id-ID");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const sheetName = `${month}-${year}`;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/googleapis/auth/session");
        const data = await res.json();
        if (data.isLoggedIn && data.user?.name) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Session error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!user?.name) return;

    const checkAbsent = async () => {
      try {
        const res = await fetch("/api/googleapis/check-absent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.name,
            sheetName,
            date,
          }),
        });

        const data = await res.json();

        if (data.success) {
          const newStatus: StatusAbsent = {
            masuk: data.masuk,
            keluar: data.keluar,
            jamMasuk: data.jamMasuk,
            jamKeluar: data.jamKeluar,
          };

          setStatus(newStatus);
          onStatusChange?.(newStatus);
        }
      } catch (err) {
        console.error("CheckerAbsent error:", err);
      }
    };

    checkAbsent();
  }, [user, date, sheetName, onStatusChange]);

  if (loading || !user || !status) return null;

  return (
    <div className="mb-3 rounded-lg border p-3 text-sm bg-gray-100">
      <p className="font-semibold mb-1">Status Absensi</p>

      <div className="text-xs">
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
    </div>
  );
}
