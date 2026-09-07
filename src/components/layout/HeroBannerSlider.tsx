"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "/hero-banner.jpg",
    title: "",
    subtitle: "",
    cta: "",
    ctaLink: "",
    useImage: true,
  },
  {
    id: 2,
    useImage: false,
    bg: "linear-gradient(135deg, #1e1b18 0%, #3d1a22 50%, #7d1d29 100%)",
    title: "أزياء تعكس شخصيتك",
    subtitle: "اكتشفي أحدث صيحات الموضة من أفضل المتاجر المحلية",
    cta: "تسوّقي الآن",
    ctaLink: "/products",
    accent: "#c48b4e",
  },
  {
    id: 3,
    useImage: false,
    bg: "linear-gradient(135deg, #7d1d29 0%, #c48b4e 100%)",
    title: "العروض الحصرية",
    subtitle: "خصومات تصل إلى 50% على منتجات مختارة",
    cta: "اكتشفي العروض",
    ctaLink: "/products/offers",
    accent: "#ffffff",
  },
  {
    id: 4,
    useImage: false,
    bg: "linear-gradient(135deg, #2d1b33 0%, #7d1d29 60%, #c48b4e 100%)",
    title: "المتاجر المميزة",
    subtitle: "تسوّقي من أفضل المتاجر الموثوقة في منصة فيورا",
    cta: "استعرضي المتاجر",
    ctaLink: "/stores",
    accent: "#fdf0f2",
  },
  {
    id: 5,
    useImage: false,
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #7d1d29 100%)",
    title: "تجربة تسوق لا مثيل لها",
    subtitle: "سهولة الطلب، سرعة التوصيل، وجودة مضمونة",
    cta: "ابدئي الآن",
    ctaLink: "/products",
    accent: "#c48b4e",
  },
];

export default function HeroBannerSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const goTo = useCallback(
    (index: number, dir: "next" | "prev" = "next") => {
      if (isAnimating) return;
      setIsAnimating(true);
      setDirection(dir);
      setTimeout(() => {
        setCurrent(index);
        setIsAnimating(false);
      }, 400);
    },
    [isAnimating]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, "next");
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, "prev");
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
      <div
        className="relative overflow-hidden rounded-3xl shadow-2xl"
        style={{ aspectRatio: "21/8" }}
      >
        {/* Slide Content */}
        <div
          key={current}
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: slide.useImage ? "#7d1d29" : slide.bg,
            animation: isAnimating
              ? direction === "next"
                ? "slideInFromLeft 0.4s ease"
                : "slideInFromRight 0.4s ease"
              : "fadeIn 0.5s ease",
          }}
        >
          {slide.useImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.image}
              alt="Viora - كل ما تبحثين عنه في عالم الموضة"
              className="size-full object-cover"
            />
          ) : (
            <div className="relative flex size-full flex-col items-center justify-center gap-4 px-8 text-center">
              {/* Decorative circles */}
              <div
                className="absolute -top-20 -right-20 size-64 rounded-full opacity-10"
                style={{ background: "rgba(255,255,255,0.2)" }}
              />
              <div
                className="absolute -bottom-16 -left-16 size-48 rounded-full opacity-10"
                style={{ background: "rgba(255,255,255,0.15)" }}
              />

              <h2
                className="relative text-2xl font-black text-white sm:text-4xl lg:text-5xl"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
              >
                {slide.title}
              </h2>
              <p className="relative max-w-md text-sm text-white/80 sm:text-base">
                {slide.subtitle}
              </p>
              {slide.cta && (
                <a
                  href={slide.ctaLink}
                  className="relative mt-2 rounded-full px-8 py-3 text-sm font-black transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  style={{
                    background: slide.accent,
                    color: slide.accent === "#ffffff" ? "#7d1d29" : "#ffffff",
                  }}
                >
                  {slide.cta}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Dark overlay for image slide */}
        {slide.useImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        )}

        {/* Navigation Arrows */}
        <button
          onClick={prev}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40 hover:scale-110"
          aria-label="السابق"
        >
          <ChevronRight className="size-5" />
        </button>
        <button
          onClick={next}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40 hover:scale-110"
          aria-label="التالي"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? "next" : "prev")}
              className="transition-all duration-300"
              style={{
                width: i === current ? "28px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: i === current ? "#ffffff" : "rgba(255,255,255,0.5)",
              }}
              aria-label={`الشريحة ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
