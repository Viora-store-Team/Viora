"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { strings } from "@/lib/strings";

interface AuthLayoutProps {
  children: ReactNode;
  showBackHome?: boolean;
}

export default function AuthLayout({ children, showBackHome = true }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#faf7f2] font-cairo text-[#1e1b18] antialiased selection:bg-[#7d1d29]/20 selection:text-[#7d1d29] dir-rtl">
      {/* ─── Main Form Side Container ─── */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8 lg:px-12 min-h-screen">
        {/* Mobile Header Brand Logo */}
        <div className="mb-6 lg:hidden text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-xl bg-[#7d1d29] text-white shadow-md">
              <ShoppingBag className="size-5" />
            </div>
            <span className="text-2xl font-black tracking-widest text-[#7d1d29]">
              {strings.appName}
            </span>
          </Link>
        </div>

        {/* Back to Home Link */}
        {showBackHome && (
          <div className="w-full max-w-md mb-4 flex justify-end">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#80766b] hover:text-[#7d1d29] transition group"
            >
              <span>العودة للرئيسية</span>
              <ArrowRight className="size-3.5 transition group-hover:-translate-x-1" />
            </Link>
          </div>
        )}

        {/* Form Card */}
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#ede5da] bg-white p-6 sm:p-8 shadow-xl shadow-[#7d1d29]/5 transition-all">
          {children}
        </div>
      </div>

      {/* ─── Desktop Visual Side Card (Matching User Screenshot Layout) ─── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] p-6 sm:p-8 flex-col justify-center items-center">
        <div className="relative size-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-[#ede5da] bg-gradient-to-br from-[#4a0e17] via-[#7d1d29] to-[#2d080e] group">
          {/* Custom Multi-Category Platform Image Mockup */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/auth_banner.jpg"
            alt="فيورا - منصة تسوق المتاجر المحلية"
            className="size-full object-cover object-center transition-transform duration-700 group-hover:scale-102"
            onError={(e) => {
              // Fallback styling if local image copy is pending
              (e.target as HTMLElement).style.display = "none";
            }}
          />

          {/* Decorative Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Bottom Card Title Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-8 text-white z-10 space-y-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-[#fbf4ea] border border-white/20">
              <ShoppingBag className="size-3.5 text-[#c48b4e]" />
              <span>منصة المتاجر المحلية الأولى</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              أهلاً بك بفيورا، منصتك لتسوق كل ما تحب
            </h3>
            <p className="text-xs font-medium text-white/80 leading-relaxed max-w-md">
              اختر وتصفح من بين أفضل المتاجر المحلية للأزياء الرجالية، النسائية، الأطفال، والأحذية والإكسسوارات واشترِ بسهولة وأمان.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
