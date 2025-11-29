"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // ✅ named import

interface JWTPayload {
  email: string;
  exp: number;
}

export default function LogoutButton() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    const token = getCookie("session_token");
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000); // detik
      const secondsUntilExpire = decoded.exp - currentTime;

      if (secondsUntilExpire <= 0) {
        router.push("/auth");
        return;
      }

      const timeout = setTimeout(() => {
        router.push("/auth");
      }, secondsUntilExpire * 1000);

      setTimeout(() => {
        setEmail(decoded.email);
      }, 0);

      return () => clearTimeout(timeout);
    } catch {
      router.push("/auth");
    }
  }, [router]);

  const handleLogout = async () => {
    setLoadingLogout(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
  };

  if (!email) return null;

  return (
    <div className="flex items-center gap-1 text-[14px]">
      <span className="text-gray-500">{email}</span>
      <span className="text-gray-500">|</span>
      <button
        onClick={handleLogout}
        disabled={loadingLogout}
        className={`font-bold cursor-pointer ${
          loadingLogout
            ? "text-gray-400 cursor-not-allowed"
            : "text-red-500 hover:text-red-600"
        }`}
      >
        {loadingLogout ? "Proses Keluar..." : "Keluar"}
      </button>
    </div>
  );
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}
