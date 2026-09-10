"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, KeyRound, Mail, RefreshCw, Sparkles } from "lucide-react";
import {
  apiFetch,
  getPendingToken,
  setCustomerToken,
  setCustomerUser,
  syncGuestCartOnLogin,
} from "@/lib/api";

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

  // Auto-detect OTP from params or sessionStorage
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const pendingToken = getPendingToken();

    if (!code.trim() || code.trim().length !== 6) {
      setErrorMessage("يرجى إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }

    if (!pendingToken) {
      setErrorMessage("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً");
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

      // Sync local guest cart
      await syncGuestCartOnLogin();

      window.dispatchEvent(new Event("viora_auth_changed"));
      router.push(returnUrl);
    } else {
      setErrorMessage(res.message || "رمز التحقق غير صحيح أو منتهي الصلاحية.");
    }
  };

  const handleResend = async () => {
    const pendingToken = getPendingToken();
    if (!pendingToken) {
      setErrorMessage("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً");
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
      setErrorMessage(res.message || "تعذر إعادة إرسال الرمز، يرجى الانتظار دقيقة قبل المحاولة مجدداً.");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#ede5da] bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#fdf0f2] text-[#7d1d29]">
            <Mail className="size-8" />
          </div>
          <h1 className="mt-4 text-xl font-black text-[#1e1b18]">
            تأكيد البريد الإلكتروني
          </h1>
          <p className="mt-1.5 text-xs text-[#80766b] leading-relaxed">
            أدخل رمز التحقق (OTP) المكون من 6 أرقام المرسل إلى:
            <br />
            <strong className="text-[#1e1b18]">{email || "بريدك الإلكتروني"}</strong>
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

        {/* Dev OTP Helper Badge */}
        {detectedOtp && (
          <div className="mt-4 rounded-2xl bg-[#fdf0f2] p-3 text-xs font-bold text-[#7d1d29] border border-[#7d1d29]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="size-4" />
              <span>رمز التحقق الحالي:</span>
            </div>
            <span className="ltr-nums text-sm font-black tracking-widest bg-white px-2.5 py-1 rounded-xl shadow-xs">
              {detectedOtp}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="mt-6 flex flex-col gap-4">
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
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7d1d29] py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:bg-[#681822] hover:shadow-lg disabled:opacity-50"
          >
            <span>{loading ? "جاري التحقق..." : "تأكيد الحساب والدخول"}</span>
          </button>
        </form>

        {/* Resend button */}
        <div className="mt-6 flex items-center justify-between border-t border-[#ede5da] pt-4 text-xs text-[#80766b]">
          <span>لم يصلك الرمز في بريدك؟</span>
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="flex items-center gap-1 font-bold text-[#7d1d29] hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${resending ? "animate-spin" : ""}`} />
            <span>{resending ? "جاري الإرسال..." : "إعادة إرسال / جلب الرمز"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-[#80766b]">جاري التحميل...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
