"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { Banner } from "@/lib/banners";

export default function HeroBannerSlider({ banners }: { banners: Banner[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const slides = banners.filter((banner) => !failedImages.includes(banner.imageUrl));
  const count = slides.length;
  const activeSlide = count > 0 ? currentSlide % count : 0;

  useEffect(() => {
    if (count < 2 || paused || interacting) return;
    const timer = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % count);
    }, 6000);
    return () => clearInterval(timer);
  }, [count, paused, interacting]);

  if (count === 0) return null;

  return (
    <section
      aria-label="بنرات المتجر"
      aria-roledescription="عرض شرائح"
      className="relative mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 font-cairo dir-rtl"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
    >
      <div className="relative aspect-[1505/625] overflow-hidden rounded-2xl bg-[#f1dcc5] shadow-xl sm:rounded-3xl">
        {slides.map((slide, index) => (
          <div
            key={`${slide.slot}-${slide.imageUrl}`}
            aria-hidden={index !== activeSlide}
            className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
              index === activeSlide ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={`بنر المتجر ${slide.slot}`}
              className="h-full w-full object-contain"
              fetchPriority={index === 0 ? "high" : "auto"}
              onError={() => setFailedImages((previous) => [...previous, slide.imageUrl])}
            />
          </div>
        ))}
      </div>
        {count > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentSlide((activeSlide - 1 + count) % count)}
              aria-label="البنر السابق"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white hover:bg-brand-hover"
            >
              <ChevronRight className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlide((activeSlide + 1) % count)}
              aria-label="البنر التالي"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white hover:bg-brand-hover"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex min-w-0 items-center rounded-full bg-brand px-2">
              <div className="flex min-w-0 items-center overflow-x-auto">
              {slides.map((slide, index) => (
                <button
                  key={slide.slot}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`عرض البنر ${slide.slot}`}
                  aria-current={index === activeSlide ? "true" : undefined}
                  className="grid size-9 shrink-0 place-items-center"
                >
                  <span className={`h-2 rounded-full transition-all ${index === activeSlide ? "w-6 bg-white" : "w-2 bg-white/50"}`} />
                </button>
              ))}
              </div>
              <button
                type="button"
                onClick={() => setPaused((previous) => !previous)}
                aria-label={paused ? "تشغيل العرض التلقائي" : "إيقاف العرض التلقائي"}
                className="shrink-0 px-2 py-2 text-xs text-white"
              >
                {paused ? "تشغيل" : "إيقاف"}
              </button>
            </div>
          </div>
        )}
    </section>
  );
}
