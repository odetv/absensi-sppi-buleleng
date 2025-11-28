"use client";
import { useEffect, useState } from "react";

export function MatchingDatetime(): boolean {
  const [clockMismatch, setClockMismatch] = useState(false);
  const [lastCheckedMinute, setLastCheckedMinute] = useState<number | null>(
    null
  );

  useEffect(() => {
    const checkClientTime = async () => {
      try {
        const res = await fetch(`/api/server-time?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        const serverTime = data.millis;
        const localTime = new Date();
        const offset = localTime.getTimezoneOffset(); // e.g. -480 for WITA
        const clientTime = localTime.getTime() - offset * 60 * 1000;
        const diffMinutes = Math.abs(serverTime - clientTime) / 1000 / 60;
        setClockMismatch(diffMinutes > 1);
      } catch (err) {
        console.error("Gagal mengambil waktu server", err);
      }
    };
    checkClientTime();

    const interval = setInterval(() => {
      const now = new Date();
      const currentMinute = now.getMinutes();
      if (lastCheckedMinute === null || currentMinute !== lastCheckedMinute) {
        setLastCheckedMinute(currentMinute);
        checkClientTime(); // hanya fetch ulang jika menit berganti
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastCheckedMinute]);

  return clockMismatch;
}
