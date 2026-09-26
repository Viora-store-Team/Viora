import Link from "next/link";
import { Search, Home, ShoppingBag, Store, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center dir-rtl font-cairo">
      {/* 404 Badge */}
      <div className="relative mb-6">
        <span className="text-7xl sm:text-9xl font-black tracking-tighter text-brand/15 select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid size-16 sm:size-20 place-items-center rounded-3xl bg-gradient-to-tr from-brand to-brand-hover text-white shadow-xl shadow-brand/25">
            <Search className="size-8 sm:size-10" />
          </div>
        </div>
      </div>

      {/* Main Titles */}
      <h1 className="text-2xl font-black text-ink sm:text-3xl">
        عذراً، هذه الصفحة أو العنصر غير موجود!
      </h1>
      <p className="mt-3 max-w-md text-xs sm:text-sm text-muted leading-relaxed">
        يبدو أن الرابط الذي تبحث عنه قد تم نقله أو حذفه، أو أن المعرّف المطلوب غير صحيح. يمكنك
        استكشاف متجر فيورا من خلال الروابط السريعة أدناه:
      </p>

      {/* Quick Action Links */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-xs font-black text-white shadow-md transition duration-200 hover:bg-[#681822] hover:scale-102 active:scale-98"
        >
          <Home className="size-4" />
          <span>الصفحة الرئيسية</span>
        </Link>
        <Link
          href="/products"
          className="flex items-center gap-2 rounded-2xl border border-line bg-white px-6 py-3.5 text-xs font-black text-ink shadow-2xs transition duration-200 hover:border-brand hover:text-brand hover:scale-102 active:scale-98"
        >
          <ShoppingBag className="size-4 text-brand" />
          <span>تصفح المنتجات</span>
        </Link>
        <Link
          href="/stores"
          className="flex items-center gap-2 rounded-2xl border border-line bg-white px-6 py-3.5 text-xs font-black text-ink shadow-2xs transition duration-200 hover:border-brand hover:text-brand hover:scale-102 active:scale-98"
        >
          <Store className="size-4 text-gold" />
          <span>المتاجر والشركاء</span>
        </Link>
      </div>
    </div>
  );
}
