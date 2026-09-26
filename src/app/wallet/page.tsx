"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet as WalletIcon,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Gift,
  CheckCircle2,
} from "lucide-react";
import { getCustomerToken } from "@/lib/api";

export default function WalletPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      router.push("/login?returnUrl=/wallet");
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-3 text-xs text-muted">
          <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <span>جاري تحميل بيانات المحفظة...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12 dir-rtl font-cairo">
      {/* ─── Breadcrumbs ─── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-brand transition">
          الرئيسية
        </Link>
        <span className="text-line">/</span>
        <span className="font-bold text-ink">المحفظة الإلكترونية</span>
      </nav>

      {/* ─── Hero Coming Soon Card ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#4a0815] via-brand to-[#200509] p-8 text-white shadow-2xl shadow-brand/20 sm:p-12 md:p-16">
        {/* Subtle decorative background circles */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-gold-soft backdrop-blur-md">
            <Sparkles className="size-3.5 text-[#e5b378]" />
            <span>الإصدار الثاني • قريباً جداً</span>
          </div>

          {/* Icon Badge */}
          <div className="relative mt-8">
            <div className="grid size-24 place-items-center rounded-[2rem] border border-white/20 bg-white/15 text-white shadow-xl backdrop-blur-md sm:size-28">
              <WalletIcon className="size-12 text-gold-soft sm:size-14" />
            </div>
            <span className="absolute -bottom-2 -right-2 grid size-8 place-items-center rounded-full bg-gold text-white shadow-md">
              <Zap className="size-4" />
            </span>
          </div>

          {/* Titles */}
          <h1 className="mt-6 text-2xl font-black sm:text-3xl md:text-4xl text-[#fffdfa] tracking-tight">
            محفظة فيورا الإلكترونية
          </h1>
          <p className="mt-3 max-w-xl text-sm sm:text-base text-gold-soft/85 leading-relaxed">
            نعمل حالياً على تطوير تجربة مالية متكاملة وسلسة. ستتوفر المحفظة الإلكترونية رسمياً في
            <strong className="text-white mx-1">الإصدار الثاني (V2)</strong>
            لتسهيل عمليات الدفع، شحن الرصيد، وإدارة مشترياتك بكل أمان وسرعة.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-black text-brand shadow-lg transition duration-200 hover:bg-[#fff9f8] hover:scale-102 active:scale-98"
            >
              <ShoppingBag className="size-4" />
              <span>متابعة التسوق واستكشاف المنتجات</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-xs font-black text-white backdrop-blur-md transition duration-200 hover:bg-white/20 hover:scale-102 active:scale-98"
            >
              <span>الانتقال للملف الشخصي</span>
              <ArrowRight className="size-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Preview Features Grid ─── */}
      <div className="mt-12">
        <div className="mb-6 text-center sm:text-right">
          <h2 className="text-lg font-black text-ink sm:text-xl">
            ماذا ستقدم لك محفظة فيورا في الإصدار القادم؟
          </h2>
          <p className="text-xs text-muted mt-1">
            مجموعة من الميزات الذكية المصممة لجعل تجربة التسوق أسهل وأسرع
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-6 shadow-2xs transition hover:border-brand/30 hover:shadow-md">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
              <Zap className="size-6" />
            </div>
            <h3 className="text-sm font-black text-ink">دفع فوري بضغطة واحدة</h3>
            <p className="text-xs text-muted leading-relaxed">
              إتمام الطلبات بسرعة قياسية مباشرة من رصيدك المتاح دون الحاجة لبطاقات أو انتظار.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-6 shadow-2xs transition hover:border-brand/30 hover:shadow-md">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
              <CreditCard className="size-6" />
            </div>
            <h3 className="text-sm font-black text-ink">خيارات شحن مرنة ومتعددة</h3>
            <p className="text-xs text-muted leading-relaxed">
              شحن الرصيد بسهولة عبر الحسابات البنكية المحلية والمحافظ الإلكترونية الشائعة.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-6 shadow-2xs transition hover:border-brand/30 hover:shadow-md">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
              <Gift className="size-6" />
            </div>
            <h3 className="text-sm font-black text-ink">كاش باك وعروض حصرية</h3>
            <p className="text-xs text-muted leading-relaxed">
              استمتع بمكافآت دورية، رصيد إضافي عند الشحن، وخصومات خاصة بمستخدمي المحفظة.
            </p>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-6 shadow-2xs transition hover:border-brand/30 hover:shadow-md">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-sm font-black text-ink">حماية وأمان معتمد</h3>
            <p className="text-xs text-muted leading-relaxed">
              تشفير كامل لجميع العمليات المالية وسجل مفصل وشفاف لكل عملية شحن ودفع.
            </p>
          </div>

          {/* Card 5 */}
          <div className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-6 shadow-2xs transition hover:border-brand/30 hover:shadow-md">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="text-sm font-black text-ink">استرجاع فوري للمبالغ</h3>
            <p className="text-xs text-muted leading-relaxed">
              في حال إلغاء أي طلب أو إرجاعه، يتم إيداع المبلغ في محفظتك تلقائياً وفي نفس اللحظة.
            </p>
          </div>

          {/* Card 6 */}
          <div className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-6 shadow-2xs transition hover:border-brand/30 hover:shadow-md">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
              <Sparkles className="size-6" />
            </div>
            <h3 className="text-sm font-black text-ink">تحويل الرصيد والمشاركة</h3>
            <p className="text-xs text-muted leading-relaxed">
              إمكانية إهداء وتحويل رصيد مشتريات لأفراد العائلة والأصدقاء داخل المنصة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
