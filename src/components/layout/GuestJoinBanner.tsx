"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomerToken } from "@/lib/api";

export default function GuestJoinBanner() {
  // Start hidden so server and client markup match, then reveal only to visitors.
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const refreshAuthState = () => setIsGuest(!getCustomerToken());

    refreshAuthState();
    window.addEventListener("viora_auth_changed", refreshAuthState);
    return () => window.removeEventListener("viora_auth_changed", refreshAuthState);
  }, []);

  if (!isGuest) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4a0e17] via-[#7d1d29] to-[#2d080e] p-8 text-white shadow-xl sm:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="space-y-2 text-center sm:text-right">
            <h3 className="text-2xl font-black sm:text-3xl">انضم إلى منصة فيورا اليوم</h3>
            <p className="max-w-md text-xs text-[#fbf4ea]/80 sm:text-sm">
              تصفح أفضل المتاجر المحلية، اختر منتجاتك المفضلة للرجال والنساء والأطفال، واستمتع بتجربة تسوق سلسة وآمنة.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full bg-white px-6 py-3 text-xs font-black text-[#7d1d29] shadow-md transition hover:scale-105 hover:bg-[#fbf4ea]"
            >
              إنشاء حساب جديد
            </Link>
            <Link
              href="/stores"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-black text-white backdrop-blur-md transition hover:bg-white/20"
            >
              استعرض المتاجر
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
