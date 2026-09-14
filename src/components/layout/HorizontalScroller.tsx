"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";

export default function HorizontalScroller({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const drag = useRef({ active: false, moved: false, suppressClick: false, startX: 0, startScroll: 0, rtl: true });
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;
    const checkOverflow = () => setHasOverflow(element.scrollWidth - element.clientWidth > 8);
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [children]);

  const showMore = () => {
    const element = scrollerRef.current;
    if (!element) return;
    const isRtl = getComputedStyle(element).direction === "rtl";
    element.scrollBy({ left: isRtl ? -Math.round(element.clientWidth * 0.75) : Math.round(element.clientWidth * 0.75), behavior: "smooth" });
  };

  return <div className="relative">
    <div
    ref={scrollerRef}
    className={`flex snap-x gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [touch-action:pan-y] [&::-webkit-scrollbar]:hidden ${className}`}
    onPointerDown={(event) => {
      const element = event.currentTarget;
      drag.current = {
        active: true,
        moved: false,
        suppressClick: false,
        startX: event.clientX,
        startScroll: element.scrollLeft,
        rtl: getComputedStyle(element).direction === "rtl",
      };
    }}
    onPointerMove={(event) => {
      if (!drag.current.active) return;
      const delta = event.clientX - drag.current.startX;

      // A small threshold keeps a normal tap/click on a category from becoming a drag.
      if (!drag.current.moved && Math.abs(delta) < 6) return;
      if (!drag.current.moved) {
        drag.current.moved = true;
        drag.current.suppressClick = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      event.preventDefault();
      event.currentTarget.scrollLeft = drag.current.startScroll + (drag.current.rtl ? delta : -delta);
    }}
    onPointerUp={(event) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      drag.current.active = false;
    }}
    onPointerCancel={(event) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      drag.current.active = false;
    }}
    onClickCapture={(event) => {
      if (!drag.current.suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      drag.current.suppressClick = false;
    }}
    >{children}</div>
    {hasOverflow && <button type="button" onClick={showMore} aria-label="عرض المزيد" className="absolute left-1 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-[#eadfd4] bg-white/95 text-[#8d1f30] shadow-md backdrop-blur transition hover:scale-105 hover:bg-[#8d1f30] hover:text-white"><ChevronLeft className="size-5" /></button>}
  </div>;
}
