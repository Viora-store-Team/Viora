import { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  HelpCircle,
  Home,
  Info,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface PageProps {
  params: Promise<{ key: string }>;
}

const PAGES_NAV = [
  { key: "terms", label: "الشروط والأحكام", icon: FileText, docLabel: "وثيقة الشروط والأحكام الرسمية" },
  { key: "privacy", label: "سياسة الخصوصية", icon: ShieldCheck, docLabel: "وثيقة سياسة الخصوصية الرسمية" },
  { key: "about", label: "من نحن", icon: Info, docLabel: "وثيقة التعريف بالمنصة" },
  { key: "faq", label: "الأسئلة الشائعة", icon: HelpCircle, docLabel: "دليل الأسئلة والأجوبة الشائعة" },
];

const DEFAULT_TITLES: Record<string, string> = {
  terms: "شروط وأحكام استخدام منصة فيورا (Terms & Conditions)",
  privacy: "سياسة الخصوصية وحماية بيانات المستخدمين (Privacy Policy)",
  about: "عن منصة فيورا (About Viora)",
  faq: "الأسئلة الشائعة حول منصة فيورا (FAQ)",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { key } = await params;
  const pageTitle = DEFAULT_TITLES[key] || "معلومات المنصة";
  return {
    title: `${pageTitle} | فيورا (Viora)`,
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { key } = await params;

  let pageData: { title?: string; html?: string; updatedAt?: string } | null = null;

  try {
    const res = await apiFetch(`/content/${key}`);
    if (res.success && res.page) {
      pageData = res.page;
    }
  } catch {}

  const activePageMeta = PAGES_NAV.find((p) => p.key === key) || PAGES_NAV[0];
  const activeTitle = pageData?.title || DEFAULT_TITLES[key] || "معلومات المنصة";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      {/* ─── Breadcrumbs ─── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#80766b]">
        <Link href="/" className="flex items-center gap-1 hover:text-[#7d1d29] transition">
          <Home className="size-3.5" />
          <span>الرئيسية</span>
        </Link>
        <ChevronLeft className="size-3 text-[#ede5da]" />
        <span className="font-bold text-[#1e1b18]">{activePageMeta.label}</span>
      </nav>

      {/* ─── 4 Official Content Tabs ─── */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PAGES_NAV.map((p) => {
          const isSelected = p.key === key;
          const NavIcon = p.icon;
          return (
            <Link
              key={p.key}
              href={`/content/${p.key}`}
              className={`flex items-center justify-center gap-2 rounded-2xl p-3 text-xs font-black transition-all duration-200 ${
                isSelected
                  ? "bg-[#7d1d29] text-white shadow-md shadow-[#7d1d29]/20"
                  : "bg-white border border-[#ede5da] text-[#4a443e] hover:border-[#7d1d29]/40 hover:text-[#7d1d29] hover:bg-[#faf7f2]/50"
              }`}
            >
              <NavIcon className="size-4 shrink-0" />
              <span>{p.label}</span>
            </Link>
          );
        })}
      </div>

      {/* ─── Main Content Document (Matches Admin Preview Style) ─── */}
      <div className="w-full rounded-2xl border border-[#ede5da] bg-white p-6 sm:p-10 shadow-xs">
        {/* Document Header Letterhead */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ede5da] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-[#7d1d29] tracking-wider">VIORA</span>
            <span className="text-xs text-[#80766b]">
              · {activePageMeta.docLabel}
            </span>
          </div>
          <span className="rounded-full bg-[#faf7f2] border border-[#ede5da] px-3 py-1 text-xs font-bold text-[#80766b]">
            {pageData?.updatedAt
              ? `تاريخ النشر: ${new Date(pageData.updatedAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}`
              : "نسخة معتمدة"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-[#1e1b18] mb-6 leading-tight">
          {activeTitle}
        </h1>

        {/* Content Body */}
        {pageData?.html ? (
          <div
            className="text-sm text-[#4a443e] leading-relaxed font-sans prose prose-neutral max-w-none
              [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-[#7d1d29] [&_h2]:mt-6 [&_h2]:mb-2.5
              [&_h3]:text-base [&_h3]:font-black [&_h3]:text-[#1e1b18] [&_h3]:mt-5 [&_h3]:mb-1.5
              [&_p]:mb-3 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:mb-3 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pr-5 [&_ol]:mb-3 [&_ol]:space-y-1
              [&_blockquote]:border-r-4 [&_blockquote]:border-[#7d1d29] [&_blockquote]:bg-[#faf7f2] [&_blockquote]:p-3.5 [&_blockquote]:rounded-xl [&_blockquote]:my-4 [&_blockquote]:text-xs [&_blockquote]:font-bold [&_blockquote]:text-[#7d1d29]
              [&_hr]:my-5 [&_hr]:border-[#ede5da]
              [&_strong]:font-black [&_strong]:text-[#1e1b18]
              [&_a]:text-[#7d1d29] [&_a]:font-bold [&_a]:underline"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: pageData.html }}
          />
        ) : (
          <div className="py-12 text-center text-xs text-[#80766b]">
            جاري تجهيز محتوى هذه الصفحة...
          </div>
        )}
      </div>
    </div>
  );
}

