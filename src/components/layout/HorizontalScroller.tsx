"use client";

import { useRef } from "react";

export default function HorizontalScroller({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const drag = useRef({ active: false, startX: 0, startScroll: 0, rtl: true });

  return <div
    className={`flex snap-x gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    onPointerDown={(event) => { const element = event.currentTarget; drag.current = { active: true, startX: event.clientX, startScroll: element.scrollLeft, rtl: getComputedStyle(element).direction === "rtl" }; element.setPointerCapture(event.pointerId); }}
    onPointerMove={(event) => { if (!drag.current.active) return; const delta = event.clientX - drag.current.startX; event.currentTarget.scrollLeft = drag.current.startScroll + (drag.current.rtl ? delta : -delta); }}
    onPointerUp={() => { drag.current.active = false; }}
    onPointerCancel={() => { drag.current.active = false; }}
  >{children}</div>;
}
