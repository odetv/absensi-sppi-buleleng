"use client";
import { useEffect, useState } from "react";
import LOGO_SPPI from "../../public/logo-sppi.png";
import { LIST_NAME } from "../../lib/list_name";
import { LIST_POSITION } from "../../lib/list_position";
import { TypeSPPGLocation } from "../../lib/sppg_location";
import { FormatDate, FormatTime } from "../../components/DatetimeFormat";
import { MatchingLocation } from "../../components/ValidationLocation";
import { MatchingDatetime } from "../../components/ValidationDatetime";

export default function Home() {
  const [datetimeMounted, setDatetimeMounted] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [sppgLocation, setSppgLocation] = useState<TypeSPPGLocation | null>(
    null
  );
  const [time, setTime] = useState(new Date());
  const [loadingIn, setLoadingIn] = useState(false);
  const [loadingOut, setLoadingOut] = useState(false);
  const clockMismatch = MatchingDatetime();

  const isFormValid =
    name &&
    position &&
    description &&
    latitude &&
    longitude &&
    sppgLocation &&
    !clockMismatch;

  useEffect(() => {
    setDatetimeMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    navigator.geolocation.getCurrentPosition((pos) => {
      setLatitude(pos.coords.latitude.toFixed(6));
      setLongitude(pos.coords.longitude.toFixed(6));
    });
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      const location = MatchingLocation(
        parseFloat(latitude),
        parseFloat(longitude)
      );
      setSppgLocation(location);
    }
  }, [latitude, longitude]);

  const handleSubmitAbsent = async (type: "masuk" | "pulang") => {
    if (!isFormValid) return;
    if (type === "masuk") setLoadingIn(true);
    if (type === "pulang") setLoadingOut(true);
    const now = new Date();
    const date = now.toLocaleDateString("id-ID");
    const time = now.toTimeString().split(" ")[0];
    const day = now.toLocaleDateString("id-ID", { weekday: "long" });
    const sheetName = `${now.getMonth() + 1}-${now.getFullYear()}`;

    const data = {
      time,
      day,
      date,
      absentType: type === "masuk" ? "Masuk" : "Keluar",
      name,
      position,
      description,
      latitude,
      longitude,
      sppgLocation: sppgLocation.name,
      mapsLocation: `https://www.google.com/maps/place/${latitude},${longitude}/@${latitude},${longitude},17z`,
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

      alert(`Hai ${name}, absen ${type} berhasil disimpan.`);
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
      if (type === "masuk") setLoadingIn(false);
      if (type === "pulang") setLoadingOut(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <div className="mb-4 text-center">
          {/* eslint-disable @next/next/no-img-element */}
          <img
            src={LOGO_SPPI.src}
            alt="Logo"
            className="mx-auto mb-4 w-24 h-auto"
          />
          <h1 className="text-lg font-semibold">Absensi SPPI Buleleng Bali</h1>
          <p className="text-sm text-gray-600">
            {datetimeMounted ? FormatDate(time) : "Memuat tanggal..."}
          </p>
          <p className="text-2xl font-mono mt-1">
            {datetimeMounted ? FormatTime(time) : "--:--:--"}
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
            className="w-full px-3 py-2 border rounded-lg cursor-pointer text-sm"
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
            className="w-full px-3 py-2 border rounded-lg cursor-pointer text-sm"
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
            className="w-full px-3 py-2 border rounded-lg resize-y text-sm placeholder:text-xs"
          ></textarea>

          <div className="text-sm text-gray-600 space-y-2">
            {latitude && longitude && (
              <iframe
                title="Google Maps"
                width="100%"
                height="200"
                className="rounded-md border"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?&q=${latitude},${longitude}&z=17&output=embed`}
              ></iframe>
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col items-start gap-1 text-xs">
                <p className="font-semibold">Informasi Lokasi Terkini</p>

                <div>
                  Dapur:{" "}
                  {latitude && longitude ? (
                    <span className="">
                      <a
                        className="text-blue-500 cursor-pointer hover:text-blue-600"
                        target="_blank"
                        href={`https://maps.google.com/maps?ll&q=${latitude},${longitude}`}
                      >
                        {sppgLocation ? (
                          <span className="text-blue-500">
                            {sppgLocation.name}
                          </span>
                        ) : (
                          <span className="text-red-600">Diluar area SPPG</span>
                        )}
                      </a>
                    </span>
                  ) : (
                    <span className="text-red-600">
                      Tidak dapat menemukan lokasi SPPG.
                    </span>
                  )}
                </div>

                <div>
                  Koordinat:{" "}
                  {latitude && longitude ? (
                    <span className="">
                      <a
                        className="text-blue-500 cursor-pointer hover:text-blue-600"
                        target="_blank"
                        href={`https://maps.google.com/maps?ll&q=${latitude},${longitude}`}
                      >
                        {sppgLocation ? (
                          <span className=" text-blue-500">
                            {sppgLocation.lat}, {sppgLocation.lon}
                          </span>
                        ) : (
                          <span className="text-red-600">Diluar area SPPG</span>
                        )}
                      </a>
                    </span>
                  ) : (
                    <span className="text-red-600">
                      Tidak dapat menemukan titik lokasi.
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
                  className="text-white font-semibold text-center cursor-pointer px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition-colors"
                >
                  Perbarui Lokasi
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-4 pt-2">
            <button
              id="buttonIn"
              disabled={!isFormValid || loadingIn || loadingOut}
              onClick={() => handleSubmitAbsent("masuk")}
              className={`flex-1 py-3 rounded-lg text-white font-semibold transition-colors uppercase ${
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
              onClick={() => handleSubmitAbsent("pulang")}
              className={`flex-1 py-3 rounded-lg text-white font-semibold transition-colors uppercase ${
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
