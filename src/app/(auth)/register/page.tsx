"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { apiFetch, setPendingToken } from "@/lib/api";
import GoogleButton from "@/components/auth/GoogleButton";
import AuthLayout from "@/components/auth/AuthLayout";
import { strings } from "@/lib/strings";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
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

    setLoading(true);

    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role: "CUSTOMER",
      }),
    });

    setLoading(false);

    if (res.success) {
      if (res.pendingToken) {
        setPendingToken(res.pendingToken);
      }
      const otp = res.otp || res.code || "";
      if (otp && typeof window !== "undefined") {
        sessionStorage.setItem("viora_last_otp", String(otp));
      }
      router.push(
        `/verify-email?email=${encodeURIComponent(email.trim())}${otp ? `&otp=${encodeURIComponent(otp)}` : ""
        }${returnUrl !== "/" ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ""}`
      );
    } else {
      setErrorMessage(
        res.message || "تعذر إنشاء الحساب، قد يكون البريد الإلكتروني مستخدماً مسبقاً."
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
        const { setCustomerToken, setCustomerUser, syncGuestCartOnLogin } = await import(
          "@/lib/api"
        );
        setCustomerToken(res.token);
        if (res.user) setCustomerUser(res.user);
        await syncGuestCartOnLogin();
        window.dispatchEvent(new Event("viora_auth_changed"));
        router.push(returnUrl);
      }
    } else {
      setErrorMessage(res.message || "تعذر التسجيل عبر Google حالياً.");
    }
  };

  return (
    <div>
      {/* Brand Header */}
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tight text-[#1e1b18]">
          {strings.auth.registerTitle}
        </h1>
        <p className="mt-1.5 text-xs font-semibold text-[#80766b]">
          {strings.auth.registerSubtitle}
        </p>
      </div>

      {/* Google Button at Top */}
      <div className="mt-6">
        <GoogleButton
          onCredential={handleGoogleCredential}
          busy={loading || googleLoading}
          text={strings.auth.googleAuth}
        />
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-4 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
          {errorMessage}
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-4">
        {/* Full Name */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#1e1b18]">
            {strings.auth.fullName}
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={strings.auth.fullNamePlaceholder}
              className="w-full rounded-2xl border border-[#ede5da] bg-[#faf7f2] py-3 pr-4 pl-10 text-xs text-[#1e1b18] outline-none transition focus:border-[#7d1d29] focus:bg-white"
            />
            <User className="absolute left-3.5 size-4 text-[#80766b]" />
          </div>
        </div>

        {/* Email */}
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

        {/* Password */}
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

        {/* Confirm Password */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7d1d29] to-[#580b1e] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:opacity-95 hover:shadow-lg active:scale-99 disabled:opacity-50"
        >
          <span>
            {loading ? strings.auth.registerSubmitting : strings.auth.registerButton}
          </span>
          <ArrowLeft className="size-4" />
        </button>
      </form>

      {/* Terms Notice */}
      <div className="mt-4 text-center text-[11px] font-semibold text-[#80766b]">
        <span>{strings.auth.termsNotice} </span>
        <Link href="/content/terms" className="text-[#7d1d29] hover:underline">
          {strings.auth.termsLink}
        </Link>{" "}
        <span>{strings.auth.and} </span>
        <Link href="/content/privacy" className="text-[#7d1d29] hover:underline">
          {strings.auth.privacyLink}
        </Link>
      </div>

      {/* Footer Login Link */}
      <div className="mt-6 border-t border-[#ede5da] pt-6 text-center text-xs text-[#80766b]">
        <span>{strings.auth.alreadyHaveAccount} </span>
        <Link
          href={`/login${returnUrl !== "/" ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""
            }`}
          className="font-black text-[#7d1d29] hover:underline"
        >
          {strings.auth.loginLink}
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs text-[#80766b]">جاري التحميل...</div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}