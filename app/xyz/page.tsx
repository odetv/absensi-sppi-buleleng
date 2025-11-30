"use client";
import { useState } from "react";
import { LIST_NAME } from "../../lib/list_name";
import { LIST_POSITION } from "../../lib/list_position";
import { SPPG_LOCATIONS, TypeSPPGLocation } from "../../lib/sppg_location";

export default function Home() {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [sppgLocation, setSppgLocation] = useState<TypeSPPGLocation | null>(
    null
  );
  const [loadingIn, setLoadingIn] = useState(false);
  const [loadingOut, setLoadingOut] = useState(false);

  const isFormValid =
    name && position && description && timeInput && dateInput && sppgLocation;

  const handleSubmitAbsent = async (type: "masuk" | "pulang") => {
    if (!isFormValid) return;
    if (type === "masuk") setLoadingIn(true);
    if (type === "pulang") setLoadingOut(true);
    const dateObj = new Date(dateInput);
    const formattedDate = dateObj.toLocaleDateString("id-ID");
    const day = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
    const [hour, minute] = timeInput.split(":");
    const seconds = String(new Date().getSeconds()).padStart(2, "0");
    const finalTime = `${hour}:${minute}:${seconds}`;
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    const sheetName = `${month}-${year}`;
    const lat = sppgLocation.lat;
    const lon = sppgLocation.lon;

    const data = {
      time: finalTime,
      day,
      date: formattedDate,
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
      setTimeInput("");
      setDateInput("");
      setSppgLocation(null);
    } catch {
      alert("❌ Terjadi kesalahan koneksi. Coba beberapa saat lagi.");
    } finally {
      if (type === "masuk") setLoadingIn(false);
      if (type === "pulang") setLoadingOut(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-lg font-semibold text-center">
          Absensi SPPI Buleleng Bali
        </h1>

        <div className="space-y-3 mt-6">
          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
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
            className="w-full px-3 py-2 border rounded-lg text-sm"
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

          <div className="flex flex-row gap-2">
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />

            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <select
            value={sppgLocation?.name || ""}
            onChange={(e) => {
              const loc =
                SPPG_LOCATIONS.find((loc) => loc.name === e.target.value) ||
                null;
              setSppgLocation(loc);
            }}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Pilih Lokasi SPPG</option>
            {SPPG_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
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
