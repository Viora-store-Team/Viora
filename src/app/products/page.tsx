"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Home,
  Package,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Category, Product, Pagination } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import ProductsFilter from "@/components/products/ProductsFilter";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL params
  const categoryIdParam = searchParams.get("categoryId");
  const storeIdParam = searchParams.get("storeId");
  const queryParam = searchParams.get("q") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const sortParam = searchParams.get("sort") || "newest";

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(queryParam);
  const [, startTransition] = useTransition();

  const selectedCategoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : null;
  const selectedStoreId = storeIdParam ? parseInt(storeIdParam, 10) : null;

  // Sync search input if URL changes
  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  // 1. Fetch categories tree once
  useEffect(() => {
    apiFetch("/categories")
      .then((res) => {
        if (res.success && Array.isArray(res.categories)) {
          setCategories(res.categories);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Fetch products based on filters
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    params.set("page", String(pageParam));
    params.set("limit", "20");

    if (selectedCategoryId) {
      params.set("categoryId", String(selectedCategoryId));
    }
    if (selectedStoreId) {
      params.set("storeId", String(selectedStoreId));
    }

    apiFetch(`/products?${params.toString()}`)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && Array.isArray(res.products)) {
          let list = res.products as Product[];

          // Client-side text filter if search query is present
          if (queryParam.trim()) {
            const q = queryParam.trim().toLowerCase();
            list = list.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.category?.name.toLowerCase().includes(q) ||
                p.store?.name.toLowerCase().includes(q)
            );
          }

          // Sorting
          if (sortParam === "price_asc") {
            list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          } else if (sortParam === "price_desc") {
            list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          } else if (sortParam === "discount") {
            list = [...list].sort(
              (a, b) => (b.discountPercent || 0) - (a.discountPercent || 0)
            );
          }

          setProducts(list);
          if (res.pagination) {
            setPagination({
              ...res.pagination,
              total: queryParam.trim() ? list.length : res.pagination.total,
            });
          }
        } else {
          setProducts([]);
        }
      })
      .catch(() => {
        if (!isCancelled) setProducts([]);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategoryId, selectedStoreId, pageParam, queryParam, sortParam]);

  // Update query params helper
  const updateUrl = (updates: Record<string, string | number | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === undefined) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(val));
      }
    });

    startTransition(() => {
      router.push(`/products?${nextParams.toString()}`);
    });
  };

  // Find active category object for title/breadcrumbs
  const findCategory = (
    cats: Category[],
    id: number | null
  ): { current: Category | null; parent: Category | null } => {
    if (!id) return { current: null, parent: null };
    for (const cat of cats) {
      if (cat.id === id) return { current: cat, parent: null };
      if (cat.children) {
        const sub = cat.children.find((c) => c.id === id);
        if (sub) return { current: sub, parent: cat };
      }
    }
    return { current: null, parent: null };
  };

  const { current: currentCategory, parent: parentCategory } = findCategory(
    categories,
    selectedCategoryId
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: searchInput.trim() || null, page: 1 });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push("/products");
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* ─── 1. Breadcrumbs ─── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#80766b]">
        <Link href="/" className="flex items-center gap-1 hover:text-[#7d1d29] transition">
          <Home className="size-3.5" />
          <span>الرئيسية</span>
        </Link>
        <ChevronLeft className="size-3 text-[#ede5da]" />
        <Link
          href="/products"
          className={`transition ${
            !currentCategory && !queryParam
              ? "font-bold text-[#1e1b18]"
              : "hover:text-[#7d1d29]"
          }`}
        >
          المنتجات
        </Link>

        {parentCategory && (
          <>
            <ChevronLeft className="size-3 text-[#ede5da]" />
            <button
              type="button"
              onClick={() => updateUrl({ categoryId: parentCategory.id, page: 1 })}
              className="hover:text-[#7d1d29] transition"
            >
              {parentCategory.name}
            </button>
          </>
        )}

        {currentCategory && (
          <>
            <ChevronLeft className="size-3 text-[#ede5da]" />
            <span className="font-bold text-[#1e1b18]">{currentCategory.name}</span>
          </>
        )}

        {queryParam && (
          <>
            <ChevronLeft className="size-3 text-[#ede5da]" />
            <span className="font-bold text-[#7d1d29]">بحث: &quot;{queryParam}&quot;</span>
          </>
        )}
      </nav>

      {/* ─── 2. Header & Title ─── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1e1b18] sm:text-3xl">
            {currentCategory
              ? currentCategory.name
              : queryParam
              ? `نتائج البحث عن: "${queryParam}"`
              : "جميع المنتجات"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#80766b]">
            {loading
              ? "جاري تحميل المنتجات..."
              : `تم العثور على ${pagination.total} منتج`}
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#ede5da] bg-white px-4 py-2.5 text-xs font-bold text-[#1e1b18] shadow-2xs hover:border-[#7d1d29]"
            suppressHydrationWarning
          >
            <SlidersHorizontal className="size-4 text-[#7d1d29]" />
            <span>تصفية وترتيب</span>
            {(selectedCategoryId || sortParam !== "newest") && (
              <span className="size-2 rounded-full bg-[#7d1d29]" />
            )}
          </button>
        </div>
      </div>

      {/* ─── 3. Search & Filter Bar ─── */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#ede5da] bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search input form */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex flex-1 items-center max-w-md"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحث عن منتج، متجر، أو ماركة..."
            className="w-full rounded-xl border border-[#ede5da] bg-[#faf7f2] py-2.5 pr-10 pl-10 text-xs text-[#1e1b18] placeholder-[#80766b] outline-none transition focus:border-[#7d1d29] focus:bg-white"
            suppressHydrationWarning
          />
          <Search className="absolute right-3 size-4 text-[#80766b]" />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateUrl({ q: null, page: 1 });
              }}
              className="absolute left-3 text-[#80766b] hover:text-[#1e1b18]"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        {/* Quick Active Chips */}
        {(selectedCategoryId || queryParam || sortParam !== "newest") && (
          <div className="flex flex-wrap items-center gap-2">
            {currentCategory && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#fdf0f2] px-2.5 py-1 text-xs font-bold text-[#7d1d29]">
                <span>{currentCategory.name}</span>
                <button
                  type="button"
                  onClick={() => updateUrl({ categoryId: null, page: 1 })}
                  className="hover:opacity-75"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {queryParam && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#fdf0f2] px-2.5 py-1 text-xs font-bold text-[#7d1d29]">
                <span>بحث: {queryParam}</span>
                <button
                  type="button"
                  onClick={() => updateUrl({ q: null, page: 1 })}
                  className="hover:opacity-75"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-bold text-[#80766b] hover:text-[#7d1d29] hover:underline"
            >
              مسح الكل
            </button>
          </div>
        )}
      </div>

      {/* ─── 4. Main Layout: Sidebar + Grid ─── */}
      <div className="flex items-start gap-8">
        {/* Desktop Filter Sidebar */}
        <ProductsFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => updateUrl({ categoryId: id, page: 1 })}
          sortBy={sortParam}
          onSelectSort={(sort) => updateUrl({ sort, page: 1 })}
          isOpenMobile={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
          totalProducts={pagination.total}
        />

        {/* Products Grid Area */}
        <div className="flex-1">
          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#ede5da] bg-white p-3 shadow-2xs animate-pulse"
                >
                  <div className="aspect-square w-full rounded-xl bg-[#ede5da]/50" />
                  <div className="mt-3 h-3 w-1/3 rounded bg-[#ede5da]/60" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-[#ede5da]/80" />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-4 w-16 rounded bg-[#ede5da]/80" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Active Products Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* ─── 5. Pagination Controls ─── */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => updateUrl({ page: pagination.page - 1 })}
                    className="grid size-10 place-items-center rounded-xl border border-[#ede5da] bg-white text-[#1e1b18] shadow-2xs transition disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#7d1d29] hover:text-[#7d1d29]"
                    aria-label="الصفحة السابقة"
                  >
                    <ChevronRight className="size-4.5" />
                  </button>

                  <div className="flex items-center gap-1.5 px-3 text-xs font-black text-[#1e1b18]">
                    <span>صفحة</span>
                    <span className="ltr-nums rounded-lg bg-[#7d1d29] px-2.5 py-1 text-white">
                      {pagination.page}
                    </span>
                    <span>من</span>
                    <span className="ltr-nums">{pagination.totalPages}</span>
                  </div>

                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => updateUrl({ page: pagination.page + 1 })}
                    className="grid size-10 place-items-center rounded-xl border border-[#ede5da] bg-white text-[#1e1b18] shadow-2xs transition disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#7d1d29] hover:text-[#7d1d29]"
                    aria-label="الصفحة التالية"
                  >
                    <ChevronLeft className="size-4.5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ede5da] bg-white p-12 text-center shadow-2xs">
              <div className="grid size-16 place-items-center rounded-full bg-[#fdf0f2] text-[#7d1d29]">
                <Package className="size-8" />
              </div>
              <h3 className="mt-4 text-base font-black text-[#1e1b18]">
                لم يتم العثور على أي منتجات
              </h3>
              <p className="mt-1.5 max-w-sm text-xs text-[#80766b] leading-relaxed">
                لم نجد أي منتجات تطابق خيارات التصفية أو البحث الحالية. جرب تغيير القسم أو مسح كلمات البحث.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-6 flex items-center gap-2 rounded-xl bg-[#7d1d29] px-5 py-2.5 text-xs font-black text-white shadow transition hover:bg-[#681822]"
              >
                <RotateCcw className="size-3.5" />
                <span>إعادة ضبط كل الفلاتر</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center text-sm font-bold text-[#80766b]">
          جاري تحميل المنتجات...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
