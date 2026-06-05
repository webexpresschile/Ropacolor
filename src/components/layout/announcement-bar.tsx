"use client";

import { useEffect, useState } from "react";

const messages = [
  "Envíos a todo Chile en 24/48 hrs",
  "Mayorista desde 3 unidades — precio especial",
  "Síguenos en Instagram @ropaunicolorcl",
];

export function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-ink text-white">
      <div className="container-x flex h-9 items-center justify-center text-[11px] uppercase tracking-[0.22em]">
        <span className="truncate">{messages[idx]}</span>
      </div>
    </div>
  );
}
