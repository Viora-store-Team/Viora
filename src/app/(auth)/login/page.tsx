"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import {
  apiFetch,
  setCustomerToken,
  setCustomerUser,
  setPendingToken,
  syncGuestCartOnLogin,
} from "@/lib/api";
import GoogleButton from "@/components/auth/GoogleButton";
import AuthLayout from "@/components/auth/AuthLayout";
import { strings } from "@/lib/strings";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(strings.auth.errors.requiredFields);
      return;
    }

    setLoading(true);

    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim(),
        password,
        role: "CUSTOMER",
      }),
    });

    setLoading(false);

    if (res.success) {
      if (res.requiresVerification && res.pendingToken) {
        setPendingToken(res.pendingToken);
        router.push(
          `/verify-email?email=${encodeURIComponent(
            email.trim()
          )}&returnUrl=${encodeURIComponent(returnUrl)}`
        );
        return;
      }

      if (res.token) {
        setCustomerToken(res.token);
        if (res.user) setCustomerUser(res.user);

        // Sync local guest cart
        await syncGuestCartOnLogin();

        window.dispatchEvent(new Event("viora_auth_changed"));
        router.push(returnUrl);
      }
    } else {
      setErrorMessage(
        res.message || "فشل تسجيل الدخول، تأكد من صحة البريد الإلكتروني وكلمة المرور."
      );
    }
  };

  const handleGoogleCredential = async (idToken: string) => {
    setGoogleLoading(true);
    setErrorMessage(null);

    const res = await apiFetch("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        idToken,
        role: "CUSTOMER",
      }),
    });

    setGoogleLoading(false);

    if (res.success) {
      if (res.requiresSetup && res.setupToken) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("viora_setup_token", res.setupToken);
        }
        router.push(
          `/google/complete${returnUrl !== "/" ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""
          }`
        );
        return;
      }

      if (res.token) {
        setCustomerToken(res.token);
        if (res.user) setCustomerUser(res.user);

        // Sync local guest cart
        await syncGuestCartOnLogin();

        window.dispatchEvent(new Event("viora_auth_changed"));
        router.push(returnUrl);
      }
    } else {
      setErrorMessage(res.message || "تعذر تسجيل الدخول عبر Google حالياً.");
    }
  };

  return (
    <div>
      {/* Brand Header (Matching Mobile Frame 2) */}
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tight text-[#1e1b18]">
          {strings.auth.loginTitle}
        </h1>
        <p className="mt-1.5 text-xs font-semibold text-[#80766b]">
          {strings.auth.loginSubtitle}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
          {errorMessage}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
        {/* Email Field */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#1e1b18]">
            {strings.auth.email}
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={strings.auth.emailPlaceholder}
              dir="ltr"
              className="w-full rounded-2xl border border-[#ede5da] bg-[#faf7f2] py-3 pr-4 pl-10 text-xs text-[#1e1b18] outline-none transition focus:border-[#7d1d29] focus:bg-white text-left"
            />
            <Mail className="absolute left-3.5 size-4 text-[#80766b]" />
          </div>
        </div>

        {/* Password Field */}
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
              className="absolute left-3.5 text-[#80766b] hover:text-[#1e1b18] transition"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#80766b] select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-[#ede5da] text-[#7d1d29] accent-[#7d1d29] focus:ring-[#7d1d29]/20"
            />
            <span>{strings.auth.rememberMe}</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-[#7d1d29] transition hover:underline"
          >
            {strings.auth.forgotPasswordLink}
          </Link>
        </div>

        {/* Submit Button (Burgundy Theme) */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7d1d29] to-[#580b1e] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:opacity-95 hover:shadow-lg active:scale-99 disabled:opacity-50"
        >
          <span>
            {loading ? strings.auth.loginSubmitting : strings.auth.loginButton}
          </span>
          <ArrowLeft className="size-4" />
        </button>
      </form>

      {/* Google Button */}
      <GoogleButton
        onCredential={handleGoogleCredential}
        busy={loading || googleLoading}
        text={strings.auth.googleAuthLogin}
      />

      {/* Footer Link */}
      <div className="mt-6 border-t border-[#ede5da] pt-6 text-center text-xs text-[#80766b]">
        <span>{strings.auth.noAccountPrompt} </span>
        <Link
          href={`/register${returnUrl !== "/" ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""
            }`}
          className="font-black text-[#7d1d29] hover:underline"
        >
          {strings.auth.createAccountLink}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs text-[#80766b]">جاري التحميل...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
