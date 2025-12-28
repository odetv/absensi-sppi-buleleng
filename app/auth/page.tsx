/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AuthPage() {
  const router = useRouter();
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const isFormValid = isValidEmail(username) && password.length > 0;
  const handleLogin = async () => {
    if (!isFormValid) return;

    setLoadingLogin(true); // Mulai loading

    try {
      const res = await fetch("/api/googleapis/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setErrorMsg(data.message || "Login gagal");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan saat login");
    } finally {
      setLoadingLogin(false); // Apapun hasilnya, loading harus dihentikan
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoadingLogin(true);
    e.preventDefault();
    await handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm"
      >
        <Header />
        <div className="w-full my-6 border-t border-gray-200" />
        <div className="text-center mb-6 flex flex-col justify-center items-center">
          <h1 className="text-lg font-semibold">Absensi SPPI BGN</h1>
          <p className="text-sm">Masuk dan Lengkapi Absensi Harian</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 pr-10 border rounded-lg"
              autoComplete="username"
              inputMode="email"
              required
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 opacity-60 text-lg">
              ✉️
            </span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg pr-10"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 text-xl text-gray-500 focus:outline-none"
              aria-label="Toggle password visibility"
            >
              {showPassword ? "🙉" : "🙈"}
            </button>
          </div>

          {errorMsg && <p className="text-red-500 text-xs mb-1">{errorMsg}</p>}
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loadingLogin}
          className={`w-full py-2 rounded-lg mt-4 transition-colors cursor-pointer font-semibold text-white flex items-center justify-center gap-2
    ${
      !isFormValid || loadingLogin
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
    }
  `}
        >
          {loadingLogin ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                />
              </svg>
              Proses Masuk
            </>
          ) : (
            "Masuk"
          )}
        </button>

        <Footer />
      </form>
    </div>
  );
}
