import Link from "next/link";

export default function KPPGDenpasar() {
  return (
    <div className="flex flex-col justify-center items-center gap-2 w-full h-screen">
      <h1 className="text-sm text-center font-semibold text-gray-700">
        Pilihan Absensi di KPPG Denpasar
      </h1>
      <div className="flex flex-row justify-center items-center gap-2 w-full">
        <Link
          className="px-5 py-2 bg-blue-500 rounded-lg text-white font-semibold text-center hover:bg-blue-600 transition-colors"
          href="kppg-denpasar/kasppg"
          rel="noopener noreferrer"
        >
          KaSPPG
        </Link>
        <Link
          className="px-5 py-2 bg-blue-500 rounded-lg text-white font-semibold text-center hover:bg-blue-600 transition-colors"
          href="kppg-denpasar/magang"
          rel="noopener noreferrer"
        >
          Magang
        </Link>
      </div>
    </div>
  );
}
