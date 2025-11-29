/* eslint-disable @next/next/no-img-element */
"use client";
import LOGO_SPPI from "@/public/logo-sppi.png";
import LOGO_BGN from "@/public/logo-bgn.png";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = isValidEmail(username) && password.length > 0;
  const handleLogin = async () => {
    if (!isFormValid) return;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/");
    } else {
      try {
        const data = await res.json();
        setErrorMsg(data.message || "Login failed");
      } catch {
        setErrorMsg("Login failed");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm"
      >
        <div className="text-center flex flex-row items-center gap-4 justify-center">
          <img src={LOGO_SPPI.src} alt="Logo SPPI" className="w-20 h-auto" />
          <img src={LOGO_BGN.src} alt="Logo BGN" className="w-48 h-auto" />
        </div>
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
          disabled={!isFormValid}
          className={`w-full py-2 rounded-lg text-white mt-4 transition ${
            isFormValid
              ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              : "bg-gray-400 cursor-not-allowed touch-none"
          }`}
        >
          MASUK
        </button>
        <div className="w-full my-6 pt-3 border-b border-gray-200" />
        <p className="text-xs text-center text-gray-500">
          © {new Date().getFullYear()} - Tim Data SPPI Buleleng Bali
        </p>
      </form>
    </div>
  );
}
