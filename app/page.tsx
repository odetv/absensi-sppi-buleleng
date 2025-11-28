/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { LIST_NAME } from "../lib/list_name";
import { LIST_POSITION } from "../lib/list_position";
import LOGO_SPPI from "../public/logo-sppi.png";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [kegiatan, setKegiatan] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [waktu, setWaktu] = useState(new Date());
  const [clockMismatch, setClockMismatch] = useState(false);

  const isFormValid =
    nama && jabatan && kegiatan && latitude && longitude && !clockMismatch;

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

    const interval = setInterval(checkClientTime, 2000); // ✅ realtime update
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setWaktu(new Date()), 1000);
    navigator.geolocation.getCurrentPosition((pos) => {
      setLatitude(pos.coords.latitude.toFixed(6));
      setLongitude(pos.coords.longitude.toFixed(6));
    });
    return () => clearInterval(interval);
  }, []);

  const formatTanggal = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Makassar",
    });
  };

  const formatJam = (date: Date) => {
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

  const handleSubmit = (jenis: "masuk" | "pulang") => {
    if (!isFormValid) return;

    alert(`Hai ${nama}, absen ${jenis} berhasil dilakukan.`);

    setNama("");
    setJabatan("");
    setKegiatan("");
    setLatitude("");
    setLongitude("");

    navigator.geolocation.getCurrentPosition((pos) => {
      setLatitude(pos.coords.latitude.toFixed(6));
      setLongitude(pos.coords.longitude.toFixed(6));
    });
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
          <h1 className="text-lg font-semibold">
            Absensi Harian SPPI Buleleng Bali
          </h1>
          <p className="text-sm text-gray-600">
            {mounted ? formatTanggal(waktu) : "Memuat tanggal..."}
          </p>
          <p className="text-2xl font-mono mt-1">
            {mounted ? formatJam(waktu) : "--:--:--"}
          </p>
        </div>

        {clockMismatch && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center mb-3">
            ⚠️ Waktu perangkat Anda tidak cocok dengan waktu server (WITA).
            <br />
            Harap sesuaikan tanggal dan jam perangkat Anda untuk melanjutkan
            absensi.
          </div>
        )}

        <div className="space-y-3">
          <select
            value={nama}
            onChange={(e) => setNama(e.target.value)}
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
            value={jabatan}
            onChange={(e) => setJabatan(e.target.value)}
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
            placeholder="Uraian Kegiatan"
            value={kegiatan}
            onChange={(e) => setKegiatan(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg resize-y"
          ></textarea>

          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                Lokasi:{" "}
                {latitude && longitude ? (
                  <span className="font-medium">
                    {latitude}, {longitude}
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
                className="text-blue-500 font-semibold hover:underline"
              >
                Perbarui Lokasi
              </button>
            </div>

            {latitude && longitude && (
              <iframe
                title="Google Maps Interactive"
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
              disabled={!isFormValid}
              onClick={() => handleSubmit("masuk")}
              className={`flex-1 py-2 rounded-lg text-white ${
                isFormValid
                  ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Absen Masuk
            </button>
            <button
              disabled={!isFormValid}
              onClick={() => handleSubmit("pulang")}
              className={`flex-1 py-2 rounded-lg text-white ${
                isFormValid
                  ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Absen Pulang
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
