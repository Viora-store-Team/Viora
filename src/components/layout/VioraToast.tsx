"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";

export default function VioraToast({ message, type = "success", onClose }: { message: string; type?: "success" | "error"; onClose?: () => void }) {
  const isError = type === "error";
  return <div role="status" aria-live="polite" className="fixed inset-x-4 bottom-5 z-[70] mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-white/20 bg-[#711b2a] px-3 py-3 text-white shadow-[0_18px_45px_-12px_rgba(80,10,24,.6)] sm:bottom-7">
    <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${isError ? "bg-[#f4d5d8] text-[#8b1f2d]" : "bg-[#f5d8a5] text-[#6e1624]"}`}>{isError ? <CircleAlert className="size-4.5" /> : <CheckCircle2 className="size-4.5" />}</span>
    <p className="min-w-0 text-sm font-bold leading-relaxed">{message}</p>
    {onClose && <button type="button" onClick={onClose} aria-label="إغلاق التنبيه" className="grid size-8 shrink-0 place-items-center rounded-lg text-white/75 transition hover:bg-white/10 hover:text-white"><X className="size-4" /></button>}
  </div>;
}
