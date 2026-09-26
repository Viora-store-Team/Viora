import Link from "next/link";
import { ArrowUpLeft, Heart, ShieldCheck, Sparkles, Store, Truck } from "lucide-react";
import { strings } from "@/lib/strings";

const links = [
  { href: "/content/about", label: "من نحن" },
  { href: "/content/faq", label: "الأسئلة الشائعة" },
  { href: "/content/privacy", label: strings.auth.privacyLink },
  { href: "/content/terms", label: strings.auth.termsLink },
];

export default function Footer() {
  return (
    <footer className="v-footer overflow-hidden">
      {/* Top Banner Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-hover via-gold to-brand" />

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] sm:px-8 lg:py-16">
        {/* Brand & Description */}
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-white p-2 shadow-lg">
              <img src="/viora-mark.png" alt="" className="size-full object-contain" />
            </div>
            <div>
              <span className="block text-2xl font-black tracking-widest text-white">
                {strings.brandEnglish}
              </span>
              <span className="block text-[10px] font-semibold text-gold-soft-soft/80">
                {strings.brandSubtitle}
              </span>
            </div>
          </Link>

          <p className="max-w-sm text-sm leading-relaxed text-gold-soft-soft/80 font-medium">
            منصتك الأولى لتسوق أرقى المتاجر المحلية، تصفح تشكيلات الأزياء والموضة للرجال، النساء، والأطفال واشترِ بسهولة وأمان.
          </p>

          <div className="flex items-center gap-2 pt-2 text-gold-soft">
            <Sparkles className="size-4" />
            <span className="text-sm font-bold text-white/90">أفضل المتاجر الموثقة في مكان واحد</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-black text-gold-soft tracking-wider uppercase">
            روابط سريعة
          </h2>
          <nav className="mt-4 flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-sm font-semibold text-white/80 transition hover:text-white hover:translate-x-1"
              >
                <span>{link.label}</span>
                <ArrowUpLeft className="size-3 text-gold-soft" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-sm font-black text-gold-soft tracking-wider uppercase">
            الأقسام الشهيرة
          </h2>
          <nav className="mt-4 flex flex-col gap-3 text-sm font-semibold text-white/80">
            <Link href="/products?categoryId=1" className="hover:text-white transition">
              {strings.home.categories.men}
            </Link>
            <Link href="/products?categoryId=8" className="hover:text-white transition">
              {strings.home.categories.women}
            </Link>
            <Link href="/products?categoryId=170" className="hover:text-white transition">
              {strings.home.categories.kids}
            </Link>
            <Link href="/products?categoryId=222" className="hover:text-white transition">
              {strings.home.categories.shoes}
            </Link>
          </nav>
        </div>

        {/* Trust Badges */}
        <div>
          <h2 className="text-sm font-black text-gold-soft tracking-wider uppercase">
            تسوّق بثقة
          </h2>
          <div className="mt-4 space-y-3.5 text-sm font-semibold text-white/80">
            <p className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 shrink-0 text-gold-soft" />
              <span>متاجر معتمدة ومنتجات مضمونة</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Truck className="size-4 shrink-0 text-gold-soft" />
              <span>توصيل سريع وآمن لجميع المناطق</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Heart className="size-4 shrink-0 text-gold-soft" />
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
