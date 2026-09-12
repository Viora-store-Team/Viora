"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import {
  apiFetch,
  setCustomerToken,
  setCustomerUser,
  syncGuestCartOnLogin,
} from "@/lib/api";
import AuthLayout from "@/components/auth/AuthLayout";
import { strings } from "@/lib/strings";

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
      setErrorMessage(strings.auth.errors.requiredFields);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(strings.auth.errors.passwordsDoNotMatch);
      return;
    }

    if (password.length < 6) {
      setErrorMessage(strings.auth.errors.passwordTooShort);
      return;
    }

    const setupToken =
      typeof window !== "undefined"
        ? sessionStorage.getItem("viora_setup_token")
        : null;
    if (!setupToken) {
      setErrorMessage(strings.auth.errors.sessionExpired);
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
    <div>
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#fdf0f2] text-[#7d1d29]">
          <ShieldCheck className="size-7" />
        </div>
        <h1 className="mt-3 text-2xl font-black text-[#1e1b18]">
          {strings.auth.googleSetupTitle}
        </h1>
        <p className="mt-1.5 text-xs text-[#80766b] leading-relaxed">
          {strings.auth.googleSetupSubtitle}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-4 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleComplete} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#1e1b18]">
            {strings.auth.password}
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={strings.auth.passwordPlaceholder}
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
            {strings.auth.confirmPassword}
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={strings.auth.passwordPlaceholder}
              dir="ltr"
              className="w-full rounded-2xl border border-[#ede5da] bg-[#faf7f2] py-3 pr-4 pl-10 text-xs text-[#1e1b18] outline-none transition focus:border-[#7d1d29] focus:bg-white text-left"
            />
            <Lock className="absolute left-3.5 size-4 text-[#80766b]" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7d1d29] to-[#580b1e] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:opacity-95 hover:shadow-lg active:scale-99 disabled:opacity-50"
        >
          <span>{loading ? strings.auth.savingPassword : "حفظ كلمة المرور والدخول"}</span>
          <ArrowLeft className="size-4" />
        </button>
      </form>
    </div>
  );
}

export default function GoogleCompletePage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs text-[#80766b]">جاري التحميل...</div>
        }
      >
        <GoogleCompleteForm />
      </Suspense>
    </AuthLayout>
  );
}
