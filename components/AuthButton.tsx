"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SessionUser {
  id: number;
  name: string;
  email: string;
  position: string;
}

export default function LogoutButton() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch("/api/googleapis/auth/session", {
        cache: "no-store",
      });

      if (!res.ok) {
        router.push("/auth");
        return;
      }

      const data = await res.json();

      if (!data.isLoggedIn) {
        router.push("/auth");
        return;
      }

      setUser(data.user);
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    setLoadingLogout(true);
    await fetch("/api/googleapis/auth/logout", {
      method: "POST",
    });
    router.push("/auth");
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-1 text-[14px]">
      <span className="text-gray-500">
        {user.name} ({user.position})
      </span>
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
