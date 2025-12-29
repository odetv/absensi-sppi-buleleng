"use client";
import { useEffect, useState } from "react";
import { getUsers, TypeUser } from "../../lib/datasources/listUser";
import { getPositions, TypePosition } from "../../lib/datasources/listPosition";
import { getLocations, TypeLocation } from "../../lib/datasources/listLocation";
import CheckerAbsentUseSession from "@/components/CheckerAbsentUseSession";
import type { StatusAbsent } from "@/components/CheckerAbsentUseSession";

export default function Home() {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [sppgLocation, setSppgLocation] = useState<TypeLocation | null>(null);
  const [loadingIn, setLoadingIn] = useState(false);
  const [loadingOut, setLoadingOut] = useState(false);

  const [locations, setLocations] = useState<TypeLocation[]>([]);
  const [loadingLocation, setLoadingLocations] = useState(true);

  const [positions, setPositions] = useState<TypePosition[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<TypePosition[]>(
    []
  );
  const [loadingPositions, setLoadingPositions] = useState(true);

  const [users, setUsers] = useState<TypeUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [absentStatus, setAbsentStatus] = useState<StatusAbsent | null>(null);

  const isFormValid =
    name && position && description && timeInput && dateInput && sppgLocation;

  const isButtonInDisabled =
    !isFormValid || loadingIn || loadingOut || absentStatus?.masuk;
  const isButtonOutDisabled =
    !isFormValid ||
    loadingIn ||
    loadingOut ||
    !absentStatus?.masuk ||
    absentStatus?.keluar;

  useEffect(() => {
    if (!name) {
      setFilteredPositions([]);
      setPosition("");
      return;
    }
    const user = users.find((u) => u.name === name);
    if (!user) return;
    const matched = positions.filter((p) =>
      user.positions.includes(p.position)
    );
    setFilteredPositions(matched);
    if (matched.length === 1) {
      setPosition(matched[0].position);
    } else {
      setPosition("");
    }
  }, [name, users, positions]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await getPositions();
        setPositions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPositions(false);
      }
    };
    fetchPositions();
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
      const res = await fetch("/api/googleapis/fetch-absent", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        alert("Gagal menyimpan absensi. Coba lagi.");
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
      alert("Terjadi kesalahan koneksi. Coba beberapa saat lagi.");
    } finally {
      if (type === "masuk") setLoadingIn(false);
      if (type === "pulang") setLoadingOut(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-lg font-semibold text-center mb-6">
          Absensi SPPI Buleleng Bali
        </h1>

        <CheckerAbsentUseSession onStatusChange={setAbsentStatus} />

        <div className="space-y-3 mt-3">
          <select
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setPosition("");
            }}
            disabled={loadingUsers}
            className="w-full px-3 py-2 border rounded-lg cursor-pointer text-sm"
          >
            <option value="">
              {loadingUsers ? "Memuat Nama..." : "Pilih Nama"}
            </option>

            {users.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={!name || loadingPositions}
            className="w-full px-3 py-2 border rounded-lg cursor-pointer text-sm"
          >
            <option value="">
              {!name
                ? "Pilih Jabatan"
                : filteredPositions.length === 0
                ? "Tidak Memiliki Jabatan (Hubungi Admin)"
                : "Pilih Jabatan"}
            </option>

            {filteredPositions.map((p) => (
              <option key={p.id} value={p.position}>
                {p.position}
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
              className="w-full px-3 py-2 border rounded-lg cursor-pointer text-sm"
            />

            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg cursor-pointer text-sm"
            />
          </div>

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
