"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck } from "lucide-react";
import {
  apiFetch,
  setCustomerToken,
  setCustomerUser,
  syncGuestCartOnLogin,
} from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step: 1 (Request) -> 2 (Verify Code) -> 3 (Reset Password)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Step 1: Request Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    const res = await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim(),
        role: "CUSTOMER",
      }),
    });

    setLoading(false);

    if (res.success) {
      const otp = res.otp || res.code;
      if (otp) {
        setCode(String(otp));
        setInfoMessage(`تم إرسال الرمز: ${otp} (تم تعبئته تلقائياً)`);
      } else {
        setInfoMessage("تم إرسال رمز استعادة كلمة المرور إلى بريدك الإلكتروني.");
      }
      setStep(2);
    } else {
      setErrorMessage(res.message || "تعذر إرسال الرمز، يرجى المحاولة لاحقاً.");
    }
  };

  // Step 2: Verify Reset Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      setErrorMessage("يرجى إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await apiFetch("/auth/verify-reset-code", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim(),
        role: "CUSTOMER",
        code: code.trim(),
      }),
    });

    setLoading(false);

    if (res.success && res.resetToken) {
      setResetToken(res.resetToken);
      setInfoMessage("تم التحقق من الرمز بنجاح! أدخل كلمة المرور الجديدة.");
      setStep(3);
    } else {
      setErrorMessage(res.message || "رمز التحقق غير صحيح أو منتهي الصلاحية.");
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMessage("يرجى إدخال كلمة المرور الجديدة وتأكيدها");
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

    const res = await apiFetch("/auth/reset-password", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resetToken}`,
      },
      body: JSON.stringify({
        password,
        confirmPassword,
      }),
    });

    setLoading(false);

    if (res.success && res.token) {
      setCustomerToken(res.token);
      if (res.user) setCustomerUser(res.user);

      await syncGuestCartOnLogin();

      window.dispatchEvent(new Event("viora_auth_changed"));
      router.push("/");
    } else {
      setErrorMessage(res.message || "تعذر تعيين كلمة المرور الجديدة.");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#ede5da] bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#fdf0f2] text-[#7d1d29]">
            <KeyRound className="size-8" />
          </div>
          <h1 className="mt-4 text-xl font-black text-[#1e1b18]">
            استعادة كلمة المرور
          </h1>
          <p className="mt-1.5 text-xs text-[#80766b]">
            {step === 1 && "أدخل بريدك الإلكتروني وسنرسل لك رمزاً لتعيين كلمة مرور جديدة."}
            {step === 2 && `أدخل رمز التحقق المكون من 6 أرقام المرسل إلى ${email}`}
            {step === 3 && "أدخل كلمة المرور الجديدة لحسابك."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
            {errorMessage}
          </div>
        )}

        {/* Info Alert */}
        {infoMessage && (
          <div className="mt-6 rounded-2xl bg-green-50 p-4 text-xs font-bold text-green-700 border border-green-200 flex items-center gap-2">
            <Check className="size-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ─── Step 1: Request Code Form ─── */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="mt-6 flex flex-col gap-4">
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7d1d29] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:bg-[#681822] disabled:opacity-50"
            >
              <span>{loading ? "جاري الإرسال..." : "إرسال رمز الاستعادة"}</span>
              <ArrowLeft className="size-4" />
            </button>
          </form>
        )}

        {/* ─── Step 2: Verify Code Form ─── */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#1e1b18] text-center">
                رمز التحقق (6 أرقام)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                dir="ltr"
                className="w-full rounded-2xl border border-[#ede5da] bg-[#faf7f2] py-3.5 text-center text-2xl font-black tracking-widest text-[#7d1d29] outline-none transition focus:border-[#7d1d29] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7d1d29] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:bg-[#681822] disabled:opacity-50"
            >
              <span>{loading ? "جاري التحقق..." : "تأكيد الرمز والمتابعة"}</span>
              <ArrowLeft className="size-4" />
            </button>
          </form>
        )}

        {/* ─── Step 3: Reset Password Form ─── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="mt-6 flex flex-col gap-4">
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
                تأكيد كلمة المرور الجديدة
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
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7d1d29] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:bg-[#681822] disabled:opacity-50"
            >
              <span>{loading ? "جاري الحفظ..." : "حفظ كلمة المرور والدخول"}</span>
              <ShieldCheck className="size-4" />
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-8 border-t border-[#ede5da] pt-6 text-center text-xs text-[#80766b]">
          <Link href="/login" className="font-bold text-[#7d1d29] hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
