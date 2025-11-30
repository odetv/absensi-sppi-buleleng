import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LogoutButton from "@/components/AuthButton";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <Header />
        <div className="w-full my-6 border-t border-gray-200" />
        <div className="text-center mb-6 flex flex-col justify-center items-center">
          <h1 className="text-lg font-semibold">Absensi SPPI BGN</h1>
          <p className="text-sm">Daftar Absensi Harian SPPI BGN</p>
          <LogoutButton />
        </div>
        <div className="flex flex-row justify-center items-center gap-2 w-full">
          <Link
            className="px-5 py-2 bg-blue-500 rounded-lg text-white font-semibold text-center hover:bg-blue-600 transition-colors"
            href="bgn-pusat"
            rel="noopener noreferrer"
          >
            BGN Pusat
          </Link>
          <Link
            className="px-5 py-2 bg-blue-500 rounded-lg text-white font-semibold text-center hover:bg-blue-600 transition-colors"
            href="kppg-denpasar"
            rel="noopener noreferrer"
          >
            KPPG Denpasar
          </Link>
          <Link
            className="px-5 py-2 bg-blue-500 rounded-lg text-white font-semibold text-center hover:bg-blue-600 transition-colors"
            href="korwil-buleleng"
            rel="noopener noreferrer"
          >
            Korwil Buleleng
          </Link>
        </div>
        <iframe
          className="mt-2 rounded-lg"
          src={`https://www.google.com/maps/d/u/0/embed?mid=${process.env.GOOGLE_MYMAPS_ID}&ehbc=2E312F&noprof=1`}
          width="100%"
          height="340"
        ></iframe>
        <Footer />
      </div>
    </main>
  );
}
