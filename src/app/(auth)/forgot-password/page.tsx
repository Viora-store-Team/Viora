"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  Check,
  ShieldCheck,
} from "lucide-react";
import {
  apiFetch,
  setCustomerToken,
  setCustomerUser,
  syncGuestCartOnLogin,
} from "@/lib/api";
import OtpInput from "@/components/auth/OtpInput";
import AuthLayout from "@/components/auth/AuthLayout";
import { strings } from "@/lib/strings";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage(strings.auth.errors.invalidEmail);
      return;
    }

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

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      setErrorMessage(strings.auth.errors.otpRequired);
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
      setInfoMessage(null);
      setStep(3);
    } else {
      setErrorMessage(res.message || "رمز التحقق غير صحيح أو منتهي الصلاحية.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

    setLoading(true);

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

      setStep(4);
    } else {
      setErrorMessage(res.message || "تعذر تعيين كلمة المرور الجديدة.");
    }
  };

  const reqLengthValid = password.length >= 6;
  const reqMatchValid = Boolean(password) && password === confirmPassword;

  return (
    <AuthLayout>
      {step === 1 && (
        <div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-[#1e1b18]">
              {strings.auth.forgotTitle}
            </h1>
            <p className="mt-1.5 text-xs font-semibold text-[#80766b] leading-relaxed">
              {strings.auth.forgotSubtitle}
            </p>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleRequestCode} className="mt-6 flex flex-col gap-4">
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7d1d29] to-[#580b1e] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:opacity-95 hover:shadow-lg active:scale-99 disabled:opacity-50"
            >
              <span>{loading ? strings.auth.sendingCode : strings.auth.sendResetCodeButton}</span>
              <ArrowLeft className="size-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-[#ede5da] pt-6 text-center text-xs text-[#80766b]">
            <Link
              href="/login"
              className="font-bold text-[#7d1d29] hover:underline"
            >
              {strings.auth.backToLogin}
            </Link>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-[#1e1b18]">
              {strings.auth.verifyTitle}
            </h1>
            <p className="mt-1.5 text-xs font-semibold text-[#80766b] leading-relaxed">
              أدخل رمز التحقق المكون من 6 أرقام المرسل إلى:
              <br />
              <strong className="text-[#1e1b18] ltr-nums text-sm font-bold mt-1 inline-block">
                {email}
              </strong>
            </p>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
              {errorMessage}
            </div>
          )}

          {infoMessage && (
            <div className="mt-4 rounded-2xl bg-green-50 p-3 text-xs font-bold text-green-700 border border-green-200 text-center">
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="mt-6 space-y-6">
            <div>
              <label className="mb-3 block text-xs font-bold text-[#1e1b18] text-center">
                {strings.auth.otpBoxLabel}
              </label>
              <OtpInput
                value={code}
                onChange={(val) => setCode(val)}
                length={6}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-2xl bg-gradient-to-r from-[#7d1d29] to-[#580b1e] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:opacity-95 hover:shadow-lg active:scale-99 disabled:opacity-50"
            >
              {loading ? strings.auth.verifySubmitting : strings.auth.verifyButton}
            </button>
          </form>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-[#1e1b18]">
              {strings.auth.resetTitle}
            </h1>
            <p className="mt-1.5 text-xs font-semibold text-[#80766b] leading-relaxed">
              {strings.auth.resetSubtitle}
            </p>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="mt-6 flex flex-col gap-4">
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

            <div className="rounded-2xl bg-[#faf7f2] p-4 border border-[#ede5da] space-y-2 text-xs">
              <span className="block font-bold text-[#1e1b18]">
                {strings.auth.requirementsTitle}
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`size-4 rounded-full flex items-center justify-center text-white transition ${
                    reqLengthValid ? "bg-[#15803d]" : "bg-[#80766b]/30"
                  }`}
                >
                  <Check className="size-2.5 stroke-[3]" />
                </div>
                <span className={reqLengthValid ? "font-bold text-[#15803d]" : "text-[#80766b]"}>
                  {strings.auth.reqLength}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`size-4 rounded-full flex items-center justify-center text-white transition ${
                    reqMatchValid ? "bg-[#15803d]" : "bg-[#80766b]/30"
                  }`}
                >
                  <Check className="size-2.5 stroke-[3]" />
                </div>
                <span className={reqMatchValid ? "font-bold text-[#15803d]" : "text-[#80766b]"}>
                  {strings.auth.reqMatch}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7d1d29] to-[#580b1e] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:opacity-95 hover:shadow-lg active:scale-99 disabled:opacity-50"
            >
              <span>
                {loading ? strings.auth.savingPassword : strings.auth.savePasswordButton}
              </span>
              <ShieldCheck className="size-4" />
            </button>
          </form>
        </div>
      )}

      {step === 4 && (
        <div className="py-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-tr from-[#16a34a] to-[#4ade80] text-white shadow-xl shadow-green-500/20">
            <CheckCircle2 className="size-14 stroke-[2.5]" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-[#1e1b18]">
              {strings.auth.passwordUpdatedSuccessTitle}
            </h1>
            <p className="mt-2 text-xs font-semibold text-[#80766b] leading-relaxed max-w-xs mx-auto">
              {strings.auth.passwordUpdatedSuccessDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full rounded-2xl bg-gradient-to-r from-[#7d1d29] to-[#580b1e] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:opacity-95 hover:shadow-lg active:scale-99"
          >
            {strings.auth.loginButton}
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
