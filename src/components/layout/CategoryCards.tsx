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
    `group flex w-32 shrink-0 snap-start flex-col overflow-hidden rounded-card border bg-white p-1.5 text-right shadow-sm transition duration-200 sm:w-36 ${
      isActive
        ? "border-brand ring-2 ring-brand/15"
        : "border-line hover:-translate-y-0.5 hover:border-[#caa59d] hover:shadow-md"
    }`;

  const content = (category: Category | null, isActive: boolean) => (
    <>
      <span
        className={`grid h-20 overflow-hidden rounded-[1rem] sm:h-24 ${
          isActive ? "bg-brand text-white" : "bg-[#f3ece4] text-brand"
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
        className={`mt-2 line-clamp-2 min-h-12 px-1 text-center text-sm font-bold leading-6 ${
          isActive ? "text-brand" : "text-[#3f3833]"
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
        aria-pressed={isActive}
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
