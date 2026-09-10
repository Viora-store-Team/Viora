import Link from "next/link";

const footerLinks = [
  { href: "/content/about", label: "من نحن" },
  { href: "/content/faq", label: "الأسئلة الشائعة" },
  { href: "/content/privacy", label: "سياسة الخصوصية وحماية البيانات" },
  { href: "/content/terms", label: "شروط الاستخدام" },
];

export default function Footer() {
  return (
    <footer
      className="relative mt-8 border-t"
      style={{ borderColor: "rgba(237,229,218,0.6)", background: "#ffffff" }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #7d1d29 30%, #c48b4e 60%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span
              className="text-lg font-black tracking-[0.2em]"
              style={{
                background: "linear-gradient(135deg, #7d1d29 0%, #c48b4e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              VIORA
            </span>
            <span className="text-[11px] text-[#80766b]">
              © {new Date().getFullYear()} جميع الحقوق محفوظة
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] font-bold text-[#80766b] transition-colors duration-200 hover:text-[#7d1d29]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
