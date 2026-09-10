"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Store as StoreIcon,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Category, Pagination, StoreDetail } from "@/types";
import StoreCard from "@/components/stores/StoreCard";

function StoresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryIdParam = searchParams.get("categoryId");
  const statusFilterParam = searchParams.get("filter") || "all"; // "all" | "featured" | "approved" | "pending"
  const queryParam = searchParams.get("q") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [stores, setStores] = useState<StoreDetail[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(queryParam);
  const [, startTransition] = useTransition();

  const selectedCategoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : null;

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  // Fetch categories
  useEffect(() => {
    apiFetch("/categories")
      .then((res) => {
        if (res.success && Array.isArray(res.categories)) {
          setCategories(res.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch stores & featured stores
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    params.set("page", String(pageParam));
    params.set("limit", "50");

    if (selectedCategoryId) {
      params.set("categoryId", String(selectedCategoryId));
    }

    Promise.all([
      apiFetch(`/stores?${params.toString()}`),
      apiFetch("/stores/featured?limit=50"),
    ])
      .then(([storesRes, featRes]) => {
        if (isCancelled) return;

        const featuredIds = new Set(
          featRes.success && Array.isArray(featRes.stores)
            ? featRes.stores.map((s: any) => s.id)
            : []
        );

        if (storesRes.success && Array.isArray(storesRes.stores)) {
          let list = (storesRes.stores as StoreDetail[])
            // Exclude REJECTED stores
            .filter((s) => s.status !== "REJECTED")
            .map((s) => ({
              ...s,
              isFeatured: featuredIds.has(s.id),
              isVerified: s.status === "APPROVED",
            }));

          // Status filter: all | featured | approved | pending
          if (statusFilterParam === "featured") {
            list = list.filter((s) => s.isFeatured);
          } else if (statusFilterParam === "approved") {
            list = list.filter((s) => s.status === "APPROVED");
          } else if (statusFilterParam === "pending") {
            list = list.filter((s) => s.status === "PENDING");
          }

          // Search query filter
          if (queryParam.trim()) {
            const q = queryParam.trim().toLowerCase();
            list = list.filter(
              (s) =>
                s.name.toLowerCase().includes(q) ||
                s.description?.toLowerCase().includes(q) ||
                s.city?.toLowerCase().includes(q) ||
                s.categories?.some((c) => c.name.toLowerCase().includes(q))
            );
          }

          setStores(list);
          if (storesRes.pagination) {
            setPagination({
              ...storesRes.pagination,
              total: list.length,
            });
          }
        } else {
          setStores([]);
        }
      })
      .catch(() => {
        if (!isCancelled) setStores([]);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategoryId, pageParam, queryParam, statusFilterParam]);

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
      router.push(`/stores?${nextParams.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: searchInput.trim() || null, page: 1 });
  };

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* ─── 1. Breadcrumbs ─── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#80766b]">
        <Link href="/" className="flex items-center gap-1 hover:text-[#7d1d29] transition">
          <Home className="size-3.5" />
          <span>الرئيسية</span>
        </Link>
        <ChevronLeft className="size-3 text-[#ede5da]" />
        <span className="font-bold text-[#1e1b18]">المتاجر</span>
        {activeCategory && (
          <>
            <ChevronLeft className="size-3 text-[#ede5da]" />
            <span className="font-bold text-[#7d1d29]">{activeCategory.name}</span>
          </>
        )}
      </nav>

      {/* ─── 2. Header & Title ─── */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-black text-[#1e1b18] sm:text-3xl">
          دليل المتاجر
        </h1>
        <p className="text-xs sm:text-sm text-[#80766b]">
          استعرض جميع المتاجر المسجلة، المميزة، والموثقة على منصة فيورا
        </p>
      </div>

      {/* ─── 3. Search & Filters Bar ─── */}
      <div className="mb-8 flex flex-col gap-5 rounded-3xl border border-[#ede5da] bg-white p-5 shadow-2xs">
        {/* Search bar & Status tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex w-full max-w-md items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث عن متجر باسمه، مدينته، أو تخصصه..."
              className="w-full rounded-2xl border border-[#ede5da] bg-[#faf7f2] py-2.5 pr-10 pl-10 text-xs text-[#1e1b18] placeholder-[#80766b] outline-none transition focus:border-[#7d1d29] focus:bg-white"
            />
            <Search className="absolute right-3.5 size-4 text-[#80766b]" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateUrl({ q: null, page: 1 });
                }}
                className="absolute left-3.5 text-[#80766b] hover:text-[#1e1b18]"
              >
                <X className="size-4" />
              </button>
            )}
          </form>

          {/* Status filter pills (All / Featured / Verified / Pending) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => updateUrl({ filter: "all", page: 1 })}
              className={`rounded-xl px-3.5 py-2 text-xs font-black transition ${
                statusFilterParam === "all"
                  ? "bg-[#7d1d29] text-white shadow-xs"
                  : "bg-[#faf7f2] text-[#4a443e] hover:bg-[#ede5da]/50"
              }`}
            >
              كل المتاجر
            </button>

            <button
              type="button"
              onClick={() => updateUrl({ filter: "featured", page: 1 })}
              className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
                statusFilterParam === "featured"
                  ? "bg-[#c48b4e] text-white shadow-xs"
                  : "bg-[#faf7f2] text-[#4a443e] hover:bg-[#ede5da]/50"
              }`}
            >
              <Sparkles className="size-3 text-amber-500" />
              <span>المميزة</span>
            </button>

            <button
              type="button"
              onClick={() => updateUrl({ filter: "approved", page: 1 })}
              className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
                statusFilterParam === "approved"
                  ? "bg-[#7d1d29] text-white shadow-xs"
                  : "bg-[#faf7f2] text-[#4a443e] hover:bg-[#ede5da]/50"
              }`}
            >
              <ShieldCheck className="size-3.5 text-[#7d1d29]" />
              <span>الموثقة</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[#ede5da]/50 pt-4">
            <span className="text-xs font-bold text-[#80766b] ml-1">القسم:</span>
            <button
              type="button"
              onClick={() => updateUrl({ categoryId: null, page: 1 })}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                selectedCategoryId === null
                  ? "bg-[#1e1b18] text-white shadow-xs"
                  : "bg-[#faf7f2] text-[#4a443e] hover:bg-[#ede5da]/50"
              }`}
            >
              الكل
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateUrl({ categoryId: cat.id, page: 1 })}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedCategoryId === cat.id
                    ? "bg-[#1e1b18] text-white shadow-xs"
                    : "bg-[#faf7f2] text-[#4a443e] hover:bg-[#ede5da]/50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. Stores Grid ─── */}
      {loading ? (
        /* Loading skeletons */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-[#ede5da] bg-white p-5 shadow-2xs animate-pulse"
            >
              <div className="h-24 w-full rounded-2xl bg-[#ede5da]/50 mb-4" />
              <div className="h-4 w-1/2 rounded bg-[#ede5da]/70 mb-2" />
              <div className="h-3 w-3/4 rounded bg-[#ede5da]/50 mb-4" />
              <div className="h-8 w-full rounded-xl bg-[#ede5da]/60" />
            </div>
          ))}
        </div>
      ) : stores.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => updateUrl({ page: pagination.page - 1 })}
                className="grid size-10 place-items-center rounded-xl border border-[#ede5da] bg-white text-[#1e1b18] shadow-2xs transition disabled:opacity-40 hover:border-[#7d1d29] hover:text-[#7d1d29]"
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
                className="grid size-10 place-items-center rounded-xl border border-[#ede5da] bg-white text-[#1e1b18] shadow-2xs transition disabled:opacity-40 hover:border-[#7d1d29] hover:text-[#7d1d29]"
                aria-label="الصفحة التالية"
              >
                <ChevronLeft className="size-4.5" />
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#ede5da] bg-white p-12 text-center shadow-2xs">
          <div className="grid size-16 place-items-center rounded-full bg-[#fdf0f2] text-[#7d1d29]">
            <StoreIcon className="size-8" />
          </div>
          <h3 className="mt-4 text-base font-black text-[#1e1b18]">
            لم يتم العثور على أي متجر
          </h3>
          <p className="mt-1.5 max-w-sm text-xs text-[#80766b] leading-relaxed">
            لم نجد أي متاجر تطابق خيارات الفلترة المحددة.
          </p>
          <button
            type="button"
            onClick={() => updateUrl({ q: null, categoryId: null, filter: "all", page: 1 })}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#7d1d29] px-5 py-2.5 text-xs font-black text-white shadow transition hover:bg-[#681822]"
          >
            <RotateCcw className="size-3.5" />
            <span>عرض كل المتاجر</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function StoresPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center text-sm font-bold text-[#80766b]">
          جاري تحميل المتاجر...
        </div>
      }
    >
      <StoresContent />
    </Suspense>
  );
}
