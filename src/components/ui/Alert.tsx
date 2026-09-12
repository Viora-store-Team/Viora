"use client";

import React from "react";
import { CircleAlert, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

interface AlertProps {
  message: string;
  type?: "error" | "success" | "warning" | "info";
  onClose?: () => void;
  className?: string;
}

export default function Alert({
  message,
  type = "error",
  onClose,
  className = "",
}: AlertProps) {
  if (!message) return null;

  const styles = {
    error: "bg-red-50 text-red-700 border-red-200",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl p-4 border text-xs font-bold transition-all ${styles[type]} ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {type === "error" && <CircleAlert className="size-4.5 shrink-0 text-red-600" />}
        {type === "success" && <CheckCircle2 className="size-4.5 shrink-0 text-green-600" />}
        {type === "warning" && <AlertTriangle className="size-4.5 shrink-0 text-amber-600" />}
        {type === "info" && <Info className="size-4.5 shrink-0 text-blue-600" />}
        <span className="leading-relaxed">{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="opacity-70 hover:opacity-100 transition p-0.5"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
