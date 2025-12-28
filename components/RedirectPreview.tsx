"use client";
import { useEffect, useState } from "react";

interface RedirectPreviewProps {
  url: string;
  message: string;
}

export default function RedirectPreview({
  url,
  message,
}: RedirectPreviewProps) {
  const delay = 1000;
  const [counter, setCounter] = useState(delay / 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    const timer = setTimeout(() => {
      window.location.replace(url);
    }, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [url]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2">
      <div className="animate-pulse text-sm font-semibold text-gray-700">
        {message}
      </div>
      <div className="text-sm text-gray-500">
        Tunggu dalam <b>{counter}</b> detik
      </div>
    </div>
  );
}
