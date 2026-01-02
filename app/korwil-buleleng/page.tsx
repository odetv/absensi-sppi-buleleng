"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUsers, TypeUser } from "../../lib/datasources/listUser";
import { getPositions, TypePosition } from "../../lib/datasources/listPosition";
import { TypeLocation } from "../../lib/datasources/listLocation";
import { FormatDate, FormatTime } from "../../components/DatetimeFormat";
import { MatchingLocation } from "../../components/ValidationLocation";
import { MatchingDatetime } from "../../components/ValidationDatetime";
import CheckerAbsentUseSession from "@/components/CheckerAbsentUseSession";
import type { StatusAbsent } from "@/components/CheckerAbsentUseSession";

export default function Home() {
  const [datetimeMounted, setDatetimeMounted] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [sppgLocation, setSppgLocation] = useState<TypeLocation | null>(null);
  const [time, setTime] = useState(new Date());
  const [loadingIn, setLoadingIn] = useState(false);
  const [loadingOut, setLoadingOut] = useState(false);
  const clockMismatch = MatchingDatetime();

  const [positions, setPositions] = useState<TypePosition[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<TypePosition[]>(
    []
  );
  const [loadingPositions, setLoadingPositions] = useState(true);

  const [users, setUsers] = useState<TypeUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [absentStatus, setAbsentStatus] = useState<StatusAbsent | null>(null);

  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

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

  const isFormValid =
    name &&
    position &&
    description &&
    latitude &&
    longitude &&
    sppgLocation &&
    !clockMismatch;

  const isButtonInDisabled =
    !isFormValid || loadingIn || loadingOut || absentStatus?.masuk;
  const isButtonOutDisabled =
    !isFormValid ||
    loadingIn ||
    loadingOut ||
    !absentStatus?.masuk ||
    absentStatus?.keluar;

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
      (async () => {
        const location = await MatchingLocation(
          parseFloat(latitude),
          parseFloat(longitude)
        );
        setSppgLocation(location);
      })();
    }
  }, [latitude, longitude]);

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
        text: `Berhasil! ${name}, absen ${type} sudah tercatat. Mengalihkan dalam 3 detik...`,
        type: "success",
      });

      setName("");
      setPosition("");
      setDescription("");

      setTimeout(() => {
        window.location.reload();
      }, 3000);

      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      });
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

        {statusMessage && (
          <div
            className={`p-4 rounded-lg mb-4 text-sm font-medium border ${
              statusMessage.type === "success"
                ? "bg-green-50 border-green-200 text-green-700 animate-pulse"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? "✅" : "❌"}
              {statusMessage.text}
            </div>
          </div>
        )}

        <CheckerAbsentUseSession onStatusChange={setAbsentStatus} />

        <div className="space-y-3">
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
                ? "Tidak Memiliki Jabatan"
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

        <Footer />
      </div>
    </main>
  );
}
