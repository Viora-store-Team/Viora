"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, RefreshCw, KeyRound } from "lucide-react";
import {
  apiFetch,
  getPendingToken,
  setCustomerToken,
  setCustomerUser,
  syncGuestCartOnLogin,
} from "@/lib/api";
import OtpInput from "@/components/auth/OtpInput";
import AuthLayout from "@/components/auth/AuthLayout";
import { strings } from "@/lib/strings";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otpParam = searchParams.get("otp") || "";
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [detectedOtp, setDetectedOtp] = useState<string | null>(null);

  // Success state (Frame 5)
  const [isSuccess, setIsSuccess] = useState(false);

  // Timer for resend code
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    let initialOtp = otpParam;
    if (!initialOtp && typeof window !== "undefined") {
      initialOtp = sessionStorage.getItem("viora_last_otp") || "";
    }

    if (initialOtp && initialOtp.length === 6) {
      setCode(initialOtp);
      setDetectedOtp(initialOtp);
      setInfoMessage(`تم التقاط رمز التحقق تلقائياً: ${initialOtp}`);
    }
  }, [otpParam]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pendingToken = getPendingToken();

    if (!code.trim() || code.trim().length !== 6) {
      setErrorMessage(strings.auth.errors.otpRequired);
      return;
    }

    if (!pendingToken) {
      setErrorMessage(strings.auth.errors.sessionExpired);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await apiFetch("/auth/verify-email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pendingToken}`,
      },
      body: JSON.stringify({
        code: code.trim(),
      }),
    });

    setLoading(false);

    if (res.success && res.token) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("viora_last_otp");
      }

      setCustomerToken(res.token);
      if (res.user) setCustomerUser(res.user);

      await syncGuestCartOnLogin();
      window.dispatchEvent(new Event("viora_auth_changed"));

      // Show Frame 5 Success Screen
      setIsSuccess(true);
    } else {
      setErrorMessage(res.message || "رمز التحقق غير صحيح أو منتهي الصلاحية.");
    }
  };

  const handleResend = async () => {
    const pendingToken = getPendingToken();
    if (!pendingToken) {
      setErrorMessage(strings.auth.errors.sessionExpired);
      return;
    }

    setResending(true);
    setErrorMessage(null);
    setInfoMessage(null);

    const res = await apiFetch("/auth/resend-code", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pendingToken}`,
      },
      body: JSON.stringify({}),
    });

    setResending(false);

    if (res.success) {
      setTimer(60);
      setCanResend(false);

      const newOtp = res.otp || res.code;
      if (newOtp) {
        setCode(String(newOtp));
        setDetectedOtp(String(newOtp));
        if (typeof window !== "undefined") {
          sessionStorage.setItem("viora_last_otp", String(newOtp));
        }
        setInfoMessage(`تم توليد رمز تحقق جديد: ${newOtp} (تم تعبئته تلقائياً)`);
      } else {
        setInfoMessage("تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني بنجاح.");
      }
    } else {
      setErrorMessage(
        res.message || "تعذر إعادة إرسال الرمز، يرجى الانتظار دقيقة قبل المحاولة مجدداً."
      );
    }
  };

  if (isSuccess) {
    return (
      <div className="py-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-tr from-[#16a34a] to-[#4ade80] text-white shadow-xl shadow-green-500/20">
          <CheckCircle2 className="size-14 stroke-[2.5]" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-[#1e1b18]">
            {strings.auth.accountCreatedSuccessTitle}
          </h1>
          <p className="mt-2 text-xs font-semibold text-[#80766b] leading-relaxed max-w-xs mx-auto">
            {strings.auth.accountCreatedSuccessDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(returnUrl)}
          className="w-full rounded-2xl bg-gradient-to-r from-[#7d1d29] to-[#580b1e] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:opacity-95 hover:shadow-lg active:scale-99"
        >
          {strings.auth.goToHomeButton}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tight text-[#1e1b18]">
          {strings.auth.verifyTitle}
        </h1>
        <p className="mt-2 text-xs font-semibold text-[#80766b] leading-relaxed">
          {strings.auth.verifySubtitle}:
          <br />
          <strong className="text-[#1e1b18] ltr-nums text-sm font-bold mt-1 inline-block">
            {email || "بريدك الإلكتروني"}
          </strong>
        </p>
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
          {errorMessage}
        </div>
      )}

      {infoMessage && (
        <div className="mt-4 rounded-2xl bg-green-50 p-3 text-xs font-bold text-green-700 border border-green-200 flex items-center justify-center gap-2">
          <span>{infoMessage}</span>
        </div>
      )}

      {detectedOtp && (
        <div className="mt-4 rounded-2xl bg-[#fdf0f2] p-3 text-xs font-bold text-[#7d1d29] border border-[#7d1d29]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4" />
            <span>{strings.auth.devOtpNotice}</span>
          </div>
          <span className="ltr-nums text-sm font-black tracking-widest bg-white px-3 py-1 rounded-xl shadow-2xs">
            {detectedOtp}
          </span>
        </div>
      )}

      <form onSubmit={handleVerify} className="mt-6 space-y-6">
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

      <div className="mt-6 flex items-center justify-between border-t border-[#ede5da] pt-4 text-xs text-[#80766b]">
        <span>{strings.auth.didNotReceiveCode}</span>

        {canResend ? (
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="flex items-center gap-1 font-bold text-[#7d1d29] hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${resending ? "animate-spin" : ""}`} />
            <span>
              {resending ? strings.auth.resendingCode : strings.auth.resendCode}
            </span>
          </button>
        ) : (
          <span className="font-bold text-[#7d1d29] ltr-nums bg-[#fdf0f2] px-2.5 py-1 rounded-lg">
            {strings.auth.resendCode} ({formatTimer(timer)})
          </span>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs text-[#80766b]">جاري التحميل...</div>
        }
      >
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  );
}
