import Link from "next/link";
import { ArrowUpLeft, Heart, ShieldCheck, ShoppingBag, Sparkles, Store, Truck } from "lucide-react";
import { strings } from "@/lib/strings";

const links = [
  { href: "/content/about", label: "من نحن" },
  { href: "/content/faq", label: "الأسئلة الشائعة" },
  { href: "/content/privacy", label: strings.auth.privacyLink },
  { href: "/content/terms", label: strings.auth.termsLink },
];

export default function Footer() {
  return (
    <footer className="mt-20 overflow-hidden bg-gradient-to-b from-[#3b0a12] via-[#580b1e] to-[#1e0307] text-white font-cairo dir-rtl">
      {/* Top Banner Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#580b1e] via-[#c48b4e] to-[#7d1d29]" />

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] sm:px-8 lg:py-16">
        {/* Brand & Description */}
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 text-white shadow-lg">
              <ShoppingBag className="size-6 text-[#c48b4e]" />
            </div>
            <div>
              <span className="block text-2xl font-black tracking-widest text-white">
                {strings.brandEnglish}
              </span>
              <span className="block text-[10px] font-semibold text-[#fbf4ea]/80">
                {strings.brandSubtitle}
              </span>
            </div>
          </Link>

          <p className="max-w-sm text-xs leading-relaxed text-[#fbf4ea]/80 font-medium">
            منصتك الأولى لتسوق أرقى المتاجر المحلية، تصفح تشكيلات الأزياء والموضة للرجال، النساء، والأطفال واشترِ بسهولة وأمان.
          </p>

          <div className="flex items-center gap-2 pt-2 text-[#c48b4e]">
            <Sparkles className="size-4" />
            <span className="text-xs font-bold text-white/90">أفضل المتاجر الموثقة في مكان واحد</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xs font-black text-[#c48b4e] tracking-wider uppercase">
            روابط سريعة
          </h2>
          <nav className="mt-4 flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-xs font-semibold text-white/80 transition hover:text-white hover:translate-x-1"
              >
                <span>{link.label}</span>
                <ArrowUpLeft className="size-3 text-[#c48b4e]" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-xs font-black text-[#c48b4e] tracking-wider uppercase">
            الأقسام الشهيرة
          </h2>
          <nav className="mt-4 flex flex-col gap-3 text-xs font-semibold text-white/80">
            <Link href="/products?category=men" className="hover:text-white transition">
              {strings.home.categories.men}
            </Link>
            <Link href="/products?category=women" className="hover:text-white transition">
              {strings.home.categories.women}
            </Link>
            <Link href="/products?category=kids" className="hover:text-white transition">
              {strings.home.categories.kids}
            </Link>
            <Link href="/products?category=shoes" className="hover:text-white transition">
              {strings.home.categories.shoes}
            </Link>
          </nav>
        </div>

        {/* Trust Badges */}
        <div>
          <h2 className="text-xs font-black text-[#c48b4e] tracking-wider uppercase">
            تسوّق بثقة
          </h2>
          <div className="mt-4 space-y-3.5 text-xs font-semibold text-white/80">
            <p className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 shrink-0 text-[#c48b4e]" />
              <span>متاجر معتمدة ومنتجات مضمونة</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Truck className="size-4 shrink-0 text-[#c48b4e]" />
              <span>توصيل سريع وآمن لجميع المناطق</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Heart className="size-4 shrink-0 text-[#c48b4e]" />
              <span>صُنع بحب لدعم التسوق المحلي</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/10 px-6 py-5 sm:px-8 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-[11px] font-semibold text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {strings.brandEnglish}. جميع الحقوق محفوظة.</span>
          <span>{strings.brandSubtitle}</span>
        </div>
      </div>
    </footer>
  );
}
