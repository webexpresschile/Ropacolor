"use client";

import { ToastProvider, useToast } from "@/lib/toast-context";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function ToasterInner() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 rounded-none border bg-white px-5 py-3 text-sm shadow-xl animate-fade-in",
            t.type === "success" && "border-l-4 border-l-green-600",
            t.type === "error" && "border-l-4 border-l-red-600",
            t.type === "info" && "border-line"
          )}
        >
          <span className="text-ink">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function Toaster() {
  return (
    <ToastProvider>
      <ToasterInner />
    </ToastProvider>
  );
}
