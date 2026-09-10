"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, Filter, RotateCcw, X } from "lucide-react";
import { Category } from "@/types";

interface ProductsFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  sortBy: string;
  onSelectSort: (sort: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  totalProducts?: number;
}

export default function ProductsFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
  sortBy,
  onSelectSort,
  isOpenMobile,
  onCloseMobile,
  totalProducts,
}: ProductsFilterProps) {
  // Keep track of which parent categories are expanded in the accordion
  const [expandedParents, setExpandedParents] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    if (selectedCategoryId) {
      // Find if selected category is a child of any root
      for (const parent of categories) {
        if (
          parent.id === selectedCategoryId ||
          parent.children?.some((c) => c.id === selectedCategoryId)
        ) {
          initial[parent.id] = true;
        }
      }
    }
    return initial;
  });

  const toggleParent = (parentId: number) => {
    setExpandedParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  const hasActiveFilters = selectedCategoryId !== null || sortBy !== "newest";

  const handleReset = () => {
    onSelectCategory(null);
    onSelectSort("newest");
  };

  const content = (
    <div className="flex flex-col gap-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between border-b border-[#ede5da] pb-4">
        <div className="flex items-center gap-2">
          <Filter className="size-4.5 text-[#7d1d29]" />
          <h2 className="text-base font-black text-[#1e1b18]">الفلاتر</h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-[#7d1d29] hover:underline"
          >
            <RotateCcw className="size-3" />
            <span>إعادة ضبط</span>
          </button>
        )}
      </div>

      {/* Sort Section */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#80766b]">
          الترتيب حسب
        </h3>
        <div className="flex flex-col gap-1.5">
          {[
            { id: "newest", label: "الأحدث إضافةً" },
            { id: "price_asc", label: "السعر: من الأقل للأعلى" },
            { id: "price_desc", label: "السعر: من الأعلى للأقل" },
            { id: "discount", label: "أعلى نسبة خصم" },
          ].map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition duration-150 ${
                sortBy === option.id
                  ? "bg-[#fdf0f2] text-[#7d1d29]"
                  : "text-[#4a443e] hover:bg-[#faf7f2]"
              }`}
            >
              <span>{option.label}</span>
              <input
                type="radio"
                name="sort"
                value={option.id}
                checked={sortBy === option.id}
                onChange={() => onSelectSort(option.id)}
                className="accent-[#7d1d29]"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Categories Tree Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#80766b]">
            التصنيفات
          </h3>
          {totalProducts !== undefined && (
            <span className="text-[11px] text-[#80766b]">
              {totalProducts} منتج
            </span>
          )}
        </div>

        {/* "All Categories" option */}
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-right text-xs font-black transition ${
            selectedCategoryId === null
              ? "bg-[#7d1d29] text-white shadow-xs"
              : "text-[#1e1b18] hover:bg-[#faf7f2]"
          }`}
        >
          <span>كل الأقسام</span>
        </button>

        {/* Categories List */}
        <div className="flex flex-col gap-1 overflow-y-auto max-h-[460px] pl-1">
          {categories.map((cat) => {
            const hasChildren = cat.children && cat.children.length > 0;
            const isExpanded = !!expandedParents[cat.id];
            const isParentSelected = selectedCategoryId === cat.id;

            return (
              <div key={cat.id} className="flex flex-col">
                <div
                  className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 transition ${
                    isParentSelected
                      ? "bg-[#fdf0f2] text-[#7d1d29]"
                      : "text-[#1e1b18] hover:bg-[#faf7f2]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className="flex-1 text-right text-xs font-bold truncate"
                  >
                    {cat.name}
                  </button>

                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => toggleParent(cat.id)}
                      className="p-1 text-[#80766b] transition hover:text-[#1e1b18]"
                      aria-label="توسيع القسم"
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-3.5" />
                      ) : (
                        <ChevronLeft className="size-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Subcategories (Children) */}
                {hasChildren && isExpanded && (
                  <div className="mr-3 mt-1 flex flex-col gap-0.5 border-r border-[#ede5da] pr-2.5">
                    {cat.children!.map((sub) => {
                      const isSubSelected = selectedCategoryId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onSelectCategory(sub.id)}
                          className={`rounded-lg px-2.5 py-1 text-right text-xs transition ${
                            isSubSelected
                              ? "bg-[#7d1d29] font-black text-white"
                              : "font-medium text-[#4a443e] hover:bg-[#faf7f2] hover:text-[#7d1d29]"
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-2xl border border-[#ede5da] bg-white p-5 shadow-2xs">
          {content}
        </div>
      </aside>

      {/* ─── Mobile Drawer ─── */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Sheet */}
          <div className="relative mr-auto flex h-full w-4/5 max-w-sm flex-col bg-white p-6 shadow-2xl overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-black text-[#1e1b18]">
                تصفية المنتجات
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="grid size-8 place-items-center rounded-lg bg-[#faf7f2] text-[#4a443e] hover:text-[#7d1d29]"
              >
                <X className="size-4.5" />
              </button>
            </div>
            {content}

            <div className="mt-8 pt-4 border-t border-[#ede5da]">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full rounded-xl bg-[#7d1d29] py-3 text-center text-xs font-black text-white shadow"
              >
                عرض النتائج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
