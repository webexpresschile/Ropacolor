"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

export type Toast = {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
};

type ToastContextValue = {
  toasts: Toast[];
  toast: (message: string, type?: Toast["type"]) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let globalToasts: Toast[] = [];
let globalListeners: Array<(toasts: Toast[]) => void> = [];

function emit() {
  globalListeners.forEach((fn) => fn([...globalToasts]));
}

export function toast(message: string, type: Toast["type"] = "info") {
  const id = Math.random().toString(36).slice(2, 9);
  globalToasts = [...globalToasts, { id, message, type }];
  emit();
  setTimeout(() => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    emit();
  }, 3500);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    globalListeners.push(setToasts);
    return () => {
      globalListeners = globalListeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    emit();
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
