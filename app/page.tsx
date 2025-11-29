/* eslint-disable @next/next/no-img-element */
"use client";
import LOGO_SPPI from "../public/logo-sppi.png";
import LOGO_BGN from "../public/logo-bgn.png";
import LogoutButton from "@/components/AuthButton";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <div className="text-center flex flex-row items-center gap-4 justify-center">
          <img src={LOGO_SPPI.src} alt="Logo SPPI" className="w-20 h-auto" />
          <img src={LOGO_BGN.src} alt="Logo BGN" className="w-48 h-auto" />
        </div>
        <div className="w-full my-6 border-t border-gray-200" />
        <div className="text-center mb-6 flex flex-col justify-center items-center">
          <h1 className="text-lg font-semibold">Absensi SPPI BGN</h1>
          <p className="text-sm">Daftar Absensi Harian SPPI BGN</p>
          <LogoutButton />
        </div>
        <div className="flex flex-row justify-center items-center gap-2">
          <a
            className="px-6 py-3 bg-blue-400 rounded-lg text-white font-semibold text-center hover:bg-blue-500 transition-colors"
            href="bgn-pusat"
            target="_blank"
            rel="noopener noreferrer"
          >
            Portal Pusat
          </a>
          <a
            className="px-6 py-3 bg-blue-400 rounded-lg text-white font-semibold text-center hover:bg-blue-500 transition-colors"
            href="kppg-denpasar"
            target="_blank"
            rel="noopener noreferrer"
          >
            KPPG Denpasar
          </a>
          <a
            className="px-6 py-3 bg-blue-400 rounded-lg text-white font-semibold text-center hover:bg-blue-500 transition-colors"
            href="korwil-buleleng"
            rel="noopener noreferrer"
          >
            Korwil Buleleng
          </a>
        </div>
        <div className="w-full my-6 pt-3 border-b border-gray-200" />
        <p className="text-xs text-center text-gray-500">
          © {new Date().getFullYear()} - Tim Data SPPI Buleleng Bali
        </p>
      </div>
    </main>
  );
}
