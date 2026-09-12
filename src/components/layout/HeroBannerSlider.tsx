"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Sparkles, ArrowLeft } from "lucide-react";
import { strings } from "@/lib/strings";

interface Slide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  gradient: string;
  image?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    badge: "منصة التسوّق الشاملة",
    title: "تسوّق من أفضل المتاجر المحلية في مكان واحد",
    subtitle: "تصفح أحدث صيحات الموضة، الأزياء الرجالية والنسائية، والأطفال والأحذية مع توصيل سريع وآمن.",
    ctaText: "تصفّح المنتجات",
    ctaLink: "/products",
    secondaryCtaText: "استكشف المتاجر",
    secondaryCtaLink: "/stores",
    gradient: "from-[#4a0e17] via-[#7d1d29] to-[#2d080e]",
    image: "/images/auth_banner.jpg",
  },
  {
    id: 2,
    badge: "عروض وتخفيضات موسمية",
    title: "خصومات حصرية على تشكيلات الموسم الجديدة",
    subtitle: "استمتع بعروض مميزة من أشهر المحلات التجارية المحلية بأسعار منافسة.",
    ctaText: "شاهد العروض",
    ctaLink: "/products/offers",
    secondaryCtaText: "المتاجر المميزة",
    secondaryCtaLink: "/stores",
    gradient: "from-[#2d080e] via-[#580b1e] to-[#7d1d29]",
  },
  {
    id: 3,
    badge: "دفع آمن وشحن مباشر",
    title: "خيارات دفع مرنة وسريعة مع محفظة فيورا",
    subtitle: "ادفع بسهولة عبر رصيد محفظتك الرقمية أو عند الاستلام مباشرة.",
    ctaText: "محفظتي",
    ctaLink: "/wallet",
    secondaryCtaText: "إنشاء حساب",
    secondaryCtaLink: "/register",
    gradient: "from-[#7d1d29] via-[#4a0e17] to-[#1e1b18]",
  },
];

export default function HeroBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 font-cairo dir-rtl">
      <div className="relative overflow-hidden rounded-3xl bg-[#1e1b18] shadow-2xl min-h-[380px] sm:min-h-[440px] flex items-center">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 pointer-events-auto z-10" : "opacity-0 pointer-events-none z-0"
            }`}
          >
            {/* Background Gradient & Pattern */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
            <div className="absolute -top-32 -left-32 size-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-[#c48b4e]/10 blur-3xl pointer-events-none" />

            {/* Slide Content */}
            <div className="relative z-10 flex h-full flex-col justify-between p-8 sm:p-14 text-white max-w-2xl">
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-[#fbf4ea] border border-white/15 mb-4 shadow-sm">
                  <Sparkles className="size-3.5 text-[#c48b4e]" />
                  <span>{slide.badge}</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-4xl font-black leading-tight sm:leading-tight tracking-tight text-white text-balance">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="mt-3 text-xs sm:text-sm text-[#fbf4ea]/85 leading-relaxed max-w-xl">
                  {slide.subtitle}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-black text-[#7d1d29] shadow-lg transition duration-200 hover:bg-[#fbf4ea] hover:scale-105 active:scale-95"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowLeft className="size-4" />
                </Link>

                {slide.secondaryCtaText && slide.secondaryCtaLink && (
                  <Link
                    href={slide.secondaryCtaLink}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md px-6 py-3.5 text-xs font-bold text-white transition duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
                  >
                    <span>{slide.secondaryCtaText}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="السابق"
          className="absolute right-4 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-2xl border border-white/20 bg-black/20 text-white backdrop-blur-md transition hover:bg-white/30 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="size-5" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="التالي"
          className="absolute left-4 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-2xl border border-white/20 bg-black/20 text-white backdrop-blur-md transition hover:bg-white/30 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Slide Indicators Dots */}
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 px-3 py-1.5 backdrop-blur-md border border-white/10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`شريحة ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
