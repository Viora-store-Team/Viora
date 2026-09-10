"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import {
  apiFetch,
  setCustomerToken,
  setCustomerUser,
  setPendingToken,
  syncGuestCartOnLogin,
} from "@/lib/api";
import GoogleButton from "@/components/auth/GoogleButton";

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
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage("يرجى ملء جميع الحقول المطلوبة");
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

    setLoading(true);
    setErrorMessage(null);

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
        `/verify-email?email=${encodeURIComponent(email.trim())}${
          otp ? `&otp=${encodeURIComponent(otp)}` : ""
        }${returnUrl !== "/" ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ""}`
      );
    } else {
      setErrorMessage(res.message || "تعذر إنشاء الحساب، قد يكون البريد الإلكتروني مستخدماً مسبقاً.");
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
          `/google/complete${returnUrl !== "/" ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`
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
      setErrorMessage(res.message || "تعذر التسجيل عبر Google حالياً.");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#ede5da] bg-white p-8 shadow-xl">
        {/* Brand */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block text-3xl font-black tracking-[0.2em]"
            style={{
              background: "linear-gradient(135deg, #7d1d29 0%, #c48b4e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            VIORA
          </Link>
          <h1 className="mt-3 text-xl font-black text-[#1e1b18]">
            إنشاء حساب زبون جديد
          </h1>
          <p className="mt-1 text-xs text-[#80766b]">
            انضم إلى فيورا واستمتع بتجربة تسوق فريدة ومميزة.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#1e1b18]">
              الاسم الكامل
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: يوسف نعيم"
                className="w-full rounded-2xl border border-[#ede5da] bg-[#faf7f2] py-3 pr-4 pl-10 text-xs text-[#1e1b18] outline-none transition focus:border-[#7d1d29] focus:bg-white"
              />
              <User className="absolute left-3.5 size-4 text-[#80766b]" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#1e1b18]">
              البريد الإلكتروني
            </label>
            <div className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@viora.com"
                dir="ltr"
                className="w-full rounded-2xl border border-[#ede5da] bg-[#faf7f2] py-3 pr-4 pl-10 text-xs text-[#1e1b18] outline-none transition focus:border-[#7d1d29] focus:bg-white text-left"
              />
              <Mail className="absolute left-3.5 size-4 text-[#80766b]" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#1e1b18]">
              كلمة المرور
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
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
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
            disabled={loading || googleLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7d1d29] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:bg-[#681822] hover:shadow-lg disabled:opacity-50"
          >
            <span>{loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب والتأكيد"}</span>
            <ArrowLeft className="size-4" />
          </button>
        </form>

        {/* Google Sign-In Button */}
        <GoogleButton
          onCredential={handleGoogleCredential}
          busy={loading || googleLoading}
          text="إنشاء حساب عبر Google"
        />

        {/* Footer Links */}
        <div className="mt-8 border-t border-[#ede5da] pt-6 text-center text-xs text-[#80766b]">
          <span>لديك حساب بالفعل؟ </span>
          <Link
            href={`/login${returnUrl !== "/" ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`}
            className="font-black text-[#7d1d29] hover:underline"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-[#80766b]">جاري التحميل...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
