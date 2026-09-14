"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import HorizontalScroller from "./HorizontalScroller";

type Category = {
  id: number;
  name: string;
  imageUrl?: string | null;
};

type CategoryCardsProps = {
  categories: Category[];
  activeCategoryId?: number | null;
  allIcon: ReactNode;
  allLabel?: string;
  onSelect?: (id: number | null) => void;
  getHref?: (category: Category | null) => string;
};

export default function CategoryCards({
  categories,
  activeCategoryId = null,
  allIcon,
  allLabel = "الكل",
  onSelect,
  getHref,
}: CategoryCardsProps) {
  const cardClass = (isActive: boolean) =>
    `group flex w-32 shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border bg-white p-1.5 text-right shadow-sm transition duration-200 sm:w-36 ${
      isActive
        ? "border-[#8d1f30] ring-2 ring-[#8d1f30]/15"
        : "border-[#eadfd4] hover:-translate-y-0.5 hover:border-[#caa59d] hover:shadow-md"
    }`;

  const content = (category: Category | null, isActive: boolean) => (
    <>
      <span
        className={`grid h-20 overflow-hidden rounded-[1rem] sm:h-24 ${
          isActive ? "bg-[#8d1f30] text-white" : "bg-[#f3ece4] text-[#7d1d29]"
        }`}
      >
        {category?.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : category ? (
          <span className="grid size-full place-items-center text-2xl font-black">
            {category.name.slice(0, 1)}
          </span>
        ) : (
          <span className="grid size-full place-items-center">{allIcon}</span>
        )}
      </span>
      <span
        className={`mt-2 line-clamp-2 min-h-8 px-1 text-center text-[11px] font-black leading-4 sm:text-xs ${
          isActive ? "text-[#8d1f30]" : "text-[#3f3833]"
        }`}
      >
        {category?.name || allLabel}
      </span>
    </>
  );

  const renderCard = (category: Category | null) => {
    const isActive = activeCategoryId === (category?.id ?? null);
    const className = cardClass(isActive);
    const children = content(category, isActive);

    if (getHref) {
      return (
        <Link key={category?.id ?? "all"} href={getHref(category)} className={className}>
          {children}
        </Link>
      );
    }

    return (
      <button
        key={category?.id ?? "all"}
        type="button"
        onClick={() => onSelect?.(category?.id ?? null)}
        className={className}
      >
        {children}
      </button>
    );
  };

  return (
    <HorizontalScroller className="cursor-grab active:cursor-grabbing">
      {renderCard(null)}
      {categories.map((category) => renderCard(category))}
    </HorizontalScroller>
  );
}
