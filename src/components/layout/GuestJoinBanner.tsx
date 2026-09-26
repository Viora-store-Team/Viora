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
    <section className="v-container">
      <div className="relative overflow-hidden rounded-panel bg-brand p-8 text-white sm:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="space-y-2 text-center sm:text-right">
            <h3 className="text-2xl font-black sm:text-3xl">انضم إلى منصة فيورا اليوم</h3>
            <p className="max-w-md text-sm text-white/85">
              تصفح أفضل المتاجر المحلية، اختر منتجاتك المفضلة للرجال والنساء والأطفال، واستمتع بتجربة تسوق سلسة وآمنة.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/register"
              className="v-button bg-white text-brand hover:bg-gold-soft"
            >
              إنشاء حساب جديد
            </Link>
            <Link
              href="/stores"
              className="v-button border border-white/40 bg-transparent hover:bg-white/10"
            >
              استعرض المتاجر
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
