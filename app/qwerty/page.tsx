"use client";
import { useEffect, useState } from "react";
import { getLocations, TypeLocation } from "../../lib/datasources/listLocation";
import CheckerAbsentUseSession from "@/components/CheckerAbsentUseSession";
import type { StatusAbsent } from "@/components/CheckerAbsentUseSession";
import Header from "@/components/Header";
import { FormatDate, FormatTime } from "@/components/DatetimeFormat";
import { MatchingDatetime } from "@/components/ValidationDatetime";

export default function Home() {
  const [datetimeMounted, setDatetimeMounted] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [sppgLocation, setSppgLocation] = useState<TypeLocation | null>(null);
  const [time, setTime] = useState(new Date());
  const [loadingIn, setLoadingIn] = useState(false);
  const [loadingOut, setLoadingOut] = useState(false);
  const clockMismatch = MatchingDatetime();
  const [locations, setLocations] = useState<TypeLocation[]>([]);
  const [loadingLocation, setLoadingLocations] = useState(true);
  const [absentStatus, setAbsentStatus] = useState<StatusAbsent | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const isFormValid =
    name && position && description && sppgLocation && !clockMismatch;

  const isButtonInDisabled =
    !isFormValid || loadingIn || loadingOut || absentStatus?.masuk;
  const isButtonOutDisabled =
    !isFormValid ||
    loadingIn ||
    loadingOut ||
    !absentStatus?.masuk ||
    absentStatus?.keluar;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/googleapis/auth/session");
        const data = await res.json();
        if (data.isLoggedIn && data.user) {
          setName(data.user.name);
          if (data.user.position) {
            setPosition(data.user.position);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil session", err);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    setDatetimeMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  const handleSubmitAbsent = async (type: "masuk" | "pulang") => {
    if (!isFormValid) return;
    if (type === "masuk") setLoadingIn(true);
    if (type === "pulang") setLoadingOut(true);

    setStatusMessage(null);

    const now = new Date();
    const date = now.toLocaleDateString("id-ID");
    const time = now.toTimeString().split(" ")[0];
    const day = now.toLocaleDateString("id-ID", { weekday: "long" });

    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const sheetName = `${month}-${year}`;
    const lat = sppgLocation.lat;
    const lon = sppgLocation.lon;

    const data = {
      time,
      day,
      date,
      absentType: type === "masuk" ? "Masuk" : "Keluar",
      name,
      position,
      description,
      latitude: lat,
      longitude: lon,
      sppgLocation: sppgLocation.name,
      mapsLocation: `https://www.google.com/maps/place/${lat},${lon}/@${lat},${lon},17z`,
      sheetName,
    };

    try {
      const res = await fetch("/api/googleapis/fetch-absent", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setStatusMessage({
          text: "Gagal menyimpan absensi ke server.",
          type: "error",
        });
        return;
      }

      setStatusMessage({
        text: `Berhasil! Absen ${type} sudah tercatat. Mengalihkan...`,
        type: "success",
      });

      setTimeout(() => {
        window.location.reload();
      }, 3000);

      setName("");
      setPosition("");
      setDescription("");
      setSppgLocation(null);
    } catch {
      setStatusMessage({
        text: "Terjadi kesalahan koneksi. Silahkan coba lagi.",
        type: "error",
      });
    } finally {
      if (type === "masuk") setLoadingIn(false);
      if (type === "pulang") setLoadingOut(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <Header />
        <div className="mb-4 text-center">
          <div className="w-full my-6 border-t border-gray-200" />
          <h1 className="text-lg font-semibold">Absensi SPPI Buleleng Bali</h1>
          <p className="text-sm text-gray-600">
            {datetimeMounted ? FormatDate(time) : "Memuat Tanggal..."}
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

        {statusMessage && (
          <div
            className={`p-4 rounded-lg mb-4 text-sm font-medium border ${
              statusMessage.type === "success"
                ? "bg-green-50 border-green-200 text-green-700 animate-pulse"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? "✅" : "❎"}
              {statusMessage.text}
            </div>
          </div>
        )}

        <CheckerAbsentUseSession onStatusChange={setAbsentStatus} />

        <div className="space-y-3 mt-3">
          <select
            value={name}
            disabled={true}
            className="w-full px-3 py-2 border rounded-lg text-sm appearance-none cursor-not-allowed"
          >
            <option value={name}>{`Nama - ` + name || "Memuat Nama..."}</option>
          </select>

          <select
            value={position}
            disabled={true}
            className="w-full px-3 py-2 border rounded-lg text-sm appearance-none cursor-not-allowed"
          >
            <option value={position}>
              {`Jabatan - ` + position || "Memuat Jabatan..."}
            </option>
          </select>

          <textarea
            placeholder={`Uraian Kegiatan\nCth: Magang di SPPG Buleleng Sukasada Pancasari`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg resize-y text-sm placeholder:text-xs"
          ></textarea>

          <select
            value={sppgLocation?.id || ""}
            onChange={(e) => {
              const loc =
                locations.find((l) => l.id === Number(e.target.value)) || null;
              setSppgLocation(loc);
            }}
            disabled={loadingLocation}
            className="w-full px-3 py-2 border rounded-lg cursor-pointer text-sm"
          >
            <option value="">
              {loadingLocation ? "Memuat Lokasi SPPG..." : "Pilih Lokasi SPPG"}
            </option>

            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          {sppgLocation && (
            <iframe
              title="Google Maps"
              width="100%"
              height="200"
              className="rounded-md border"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://maps.google.com/maps?&q=${sppgLocation.lat},${sppgLocation.lon}&z=17&output=embed`}
            ></iframe>
          )}

          <div className="flex justify-between gap-4 pt-2">
            <button
              id="buttonIn"
              disabled={isButtonInDisabled}
              onClick={() => handleSubmitAbsent("masuk")}
              className={`flex-1 py-3 rounded-lg text-white font-semibold uppercase ${
                isButtonInDisabled
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
              }`}
            >
              {absentStatus?.masuk
                ? "Absen Masuk"
                : loadingIn
                ? "Menyimpan..."
                : "Absen Masuk"}
            </button>

            <button
              id="buttonOut"
              disabled={isButtonOutDisabled}
              onClick={() => handleSubmitAbsent("pulang")}
              className={`flex-1 py-3 rounded-lg text-white font-semibold uppercase ${
                isButtonOutDisabled
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
              }`}
            >
              {absentStatus?.keluar
                ? "Absen Keluar"
                : loadingOut
                ? "Menyimpan..."
                : "Absen Keluar"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
