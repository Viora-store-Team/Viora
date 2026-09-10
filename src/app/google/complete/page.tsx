"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import {
  apiFetch,
  setCustomerToken,
  setCustomerUser,
  syncGuestCartOnLogin,
} from "@/lib/api";

function GoogleCompleteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMessage("يرجى إدخال كلمة المرور وتأكيدها");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("يجب ألا تقل كلمة المرور عن 6 أحرف");
      return;
    }

    const setupToken = typeof window !== "undefined" ? sessionStorage.getItem("viora_setup_token") : null;
    if (!setupToken) {
      setErrorMessage("انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول عبر Google");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await apiFetch("/auth/google/complete", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${setupToken}`,
      },
      body: JSON.stringify({
        password,
        confirmPassword,
      }),
    });

    setLoading(false);

    if (res.success && res.token) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("viora_setup_token");
      }

      setCustomerToken(res.token);
      if (res.user) setCustomerUser(res.user);

      // Sync guest cart
      await syncGuestCartOnLogin();

      window.dispatchEvent(new Event("viora_auth_changed"));
      router.push(returnUrl);
    } else {
      setErrorMessage(res.message || "تعذر إكمال التسجيل، يرجى المحاولة مجدداً.");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#ede5da] bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#fdf0f2] text-[#7d1d29]">
            <ShieldCheck className="size-8" />
          </div>
          <h1 className="mt-4 text-xl font-black text-[#1e1b18]">
            إكمال إنشاء الحساب
          </h1>
          <p className="mt-1.5 text-xs text-[#80766b] leading-relaxed">
            قم بتعيين كلمة مرور لحسابك لتتمكن من الدخول مباشرة عبر بريدك أو عبر Google في أي وقت.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleComplete} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#1e1b18]">
              كلمة المرور الجديدة
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full rounded-2xl border border-[#ede5da] bg-[#faf7f2] py-3 pr-4 pl-10 text-xs text-[#1e1b18] outline-none transition focus:border-[#7d1d29] focus:bg-white text-left"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 text-[#80766b] hover:text-[#1e1b18]"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#1e1b18]">
              تأكيد كلمة المرور
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full rounded-2xl border border-[#ede5da] bg-[#faf7f2] py-3 pr-4 pl-10 text-xs text-[#1e1b18] outline-none transition focus:border-[#7d1d29] focus:bg-white text-left"
              />
              <Lock className="absolute left-3.5 size-4 text-[#80766b]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7d1d29] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:bg-[#681822] hover:shadow-lg disabled:opacity-50"
          >
            <span>{loading ? "جاري الحفظ..." : "إكمال التسجيل والدخول"}</span>
            <ArrowLeft className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function GoogleCompletePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-[#80766b]">جاري التحميل...</div>}>
      <GoogleCompleteForm />
    </Suspense>
  );
}
