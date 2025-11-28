/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { LIST_NAME } from "../lib/list_name";
import { LIST_POSITION } from "../lib/list_position";
import LOGO_SPPI from "../public/logo-sppi.png";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [time, setTime] = useState(new Date());
  const [clockMismatch, setClockMismatch] = useState(false);
  const [loadingIn, setLoadingIn] = useState(false);
  const [loadingOut, setLoadingOut] = useState(false);

  const isFormValid =
    name && position && description && latitude && longitude && !clockMismatch;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkClientTime = async () => {
      try {
        const res = await fetch(`/api/server-time?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        const serverTime = data.millis;
        const localTime = new Date();
        const offset = localTime.getTimezoneOffset(); // -480 = WITA
        const clientTime = localTime.getTime() - offset * 60 * 1000;
        const diffMinutes = Math.abs(serverTime - clientTime) / 1000 / 60;
        setClockMismatch(diffMinutes > 1);
      } catch (err) {
        console.error("Gagal mengambil waktu server", err);
      }
    };
    const interval = setInterval(checkClientTime, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    navigator.geolocation.getCurrentPosition((pos) => {
      setLatitude(pos.coords.latitude.toFixed(6));
      setLongitude(pos.coords.longitude.toFixed(6));
    });
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Makassar",
    });
  };

  const formatTime = (date: Date) => {
    return date
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Makassar",
      })
      .replaceAll(".", ":");
  };

  const handleSubmit = async (typeAbsent: "masuk" | "pulang") => {
    if (!isFormValid) return;
    if (typeAbsent === "masuk") setLoadingIn(true);
    if (typeAbsent === "pulang") setLoadingOut(true);
    const now = new Date();
    const date = now.toLocaleDateString("id-ID");
    const time = now.toTimeString().split(" ")[0];
    const day = now.toLocaleDateString("id-ID", { weekday: "long" });
    const sheetName = `${now.getMonth() + 1}-${now.getFullYear()}`;
    const lokasiUrl = `https://www.google.com/maps/place/${latitude},${longitude}/@${latitude},${longitude},17z`;

    const data = {
      time,
      day,
      date,
      type: typeAbsent === "masuk" ? "Absen Masuk" : "Absen Keluar",
      name,
      position,
      description,
      latitude,
      longitude,
      location: lokasiUrl,
      sheetName,
    };

    try {
      const res = await fetch("/api/absent", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        alert("❌ Gagal menyimpan absensi. Coba lagi.");
        return;
      }

      alert(`Hai ${name}, absen ${typeAbsent} berhasil disimpan.`);
      setName("");
      setPosition("");
      setDescription("");

      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      });
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kesalahan koneksi. Coba beberapa saat lagi.");
    } finally {
      if (typeAbsent === "masuk") setLoadingIn(false);
      if (typeAbsent === "pulang") setLoadingOut(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <div className="mb-4 text-center">
          <img
            src={LOGO_SPPI.src}
            alt="Logo"
            className="mx-auto mb-4 w-24 h-auto"
          />
          <h1 className="text-lg font-semibold">Absensi SPPI Buleleng Bali</h1>
          <p className="text-sm text-gray-600">
            {mounted ? formatDate(time) : "Memuat tanggal..."}
          </p>
          <p className="text-2xl font-mono mt-1">
            {mounted ? formatTime(time) : "--:--:--"}
          </p>
        </div>

        {clockMismatch && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center mb-3">
            ⚠️ Waktu terdeteksi tidak cocok.
            <br />
            Harap sesuaikan tanggal dan jam perangkat Anda untuk melanjutkan
            absensi.
          </div>
        )}

        <div className="space-y-3">
          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg cursor-pointer"
          >
            <option value="">Pilih Nama</option>
            {LIST_NAME.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg cursor-pointer"
          >
            <option value="">Pilih Jabatan</option>
            {LIST_POSITION.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          <textarea
            placeholder={`Uraian Kegiatan\nCth: Magang di SPPG Buleleng Sukasada Pancasari`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg resize-y placeholder:text-xs"
          ></textarea>

          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                Lokasi:{" "}
                {latitude && longitude ? (
                  <span className="font-medium">
                    <a
                      className="text-blue-500 font-semibold cursor-pointer hover:text-blue-600"
                      target="_blank"
                      href={`https://maps.google.com/maps?ll&q=${latitude},${longitude}`}
                    >
                      {latitude}, {longitude}
                    </a>
                  </span>
                ) : (
                  <span className="text-red-600">
                    Tidak dapat menemukan lokasi. Pastikan GPS aktif.
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setLatitude(pos.coords.latitude.toFixed(6));
                    setLongitude(pos.coords.longitude.toFixed(6));
                  });
                }}
                className="text-blue-500 font-semibold cursor-pointer hover:text-blue-600"
              >
                Perbarui Lokasi
              </button>
            </div>

            {latitude && longitude && (
              <iframe
                title="Google Maps"
                width="100%"
                height="250"
                className="rounded-md border"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?&q=${latitude},${longitude}&z=17&output=embed`}
              ></iframe>
            )}
          </div>

          <div className="flex justify-between gap-4 pt-2">
            <button
              id="buttonIn"
              disabled={!isFormValid || loadingIn || loadingOut}
              onClick={() => handleSubmit("masuk")}
              className={`flex-1 py-2 rounded-lg text-white ${
                !isFormValid || loadingIn || loadingOut
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
              }`}
            >
              {loadingIn ? "Menyimpan..." : "Absen Masuk"}
            </button>

            <button
              id="buttonOut"
              disabled={!isFormValid || loadingIn || loadingOut}
              onClick={() => handleSubmit("pulang")}
              className={`flex-1 py-2 rounded-lg text-white ${
                !isFormValid || loadingIn || loadingOut
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
              }`}
            >
              {loadingOut ? "Menyimpan..." : "Absen Keluar"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
