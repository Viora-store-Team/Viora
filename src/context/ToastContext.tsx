"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => showToast(msg, "success"), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, "error"), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, "info"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none dir-rtl font-cairo">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl p-4 shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
              t.type === "error"
                ? "bg-[#4a0e17] text-white border-[#7d1d29]/40"
                : t.type === "info"
                ? "bg-[#1e1b18] text-white border-white/20"
                : "bg-gradient-to-r from-[#166534] to-[#15803d] text-white border-green-500/30"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`grid size-8 shrink-0 place-items-center rounded-xl ${
                  t.type === "error"
                    ? "bg-red-500/20 text-red-200"
                    : t.type === "info"
                    ? "bg-blue-500/20 text-blue-200"
                    : "bg-white/20 text-white"
                }`}
              >
                {t.type === "error" ? (
                  <CircleAlert className="size-4.5" />
                ) : t.type === "info" ? (
                  <Info className="size-4.5" />
                ) : (
                  <CheckCircle2 className="size-4.5" />
                )}
              </div>
              <p className="text-xs font-bold leading-relaxed">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-white/70 hover:text-white transition p-1"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
