"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, Flame, Home, Package, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Product, Pagination } from "@/types";
import ProductCard from "@/components/products/ProductCard";

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/products/offers?limit=50")
      .then((res) => {
        if (res.success && Array.isArray(res.products)) {
          setProducts(res.products);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* ─── 1. Breadcrumbs ─── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="flex items-center gap-1 hover:text-brand transition">
          <Home className="size-3.5" />
          <span>الرئيسية</span>
        </Link>
        <ChevronLeft className="size-3 text-line" />
        <Link href="/products" className="hover:text-brand transition">
          المنتجات
        </Link>
        <ChevronLeft className="size-3 text-line" />
        <span className="font-bold text-brand">عروض وخصومات</span>
      </nav>

      {/* ─── 2. Header & Title ─── */}
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="grid size-10 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Flame className="size-5 fill-brand" />
          </div>
          <h1 className="text-2xl font-black text-ink sm:text-3xl">
            أحدث العروض والتخفيضات
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          تصفحي أفضل المنتجات المخفضة والعروض الحصرية من مختلف المتاجر
        </p>
      </div>

      {/* ─── 3. Grid ─── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-3 shadow-2xs animate-pulse"
            >
              <div className="aspect-square w-full rounded-xl bg-line/50" />
              <div className="mt-3 h-3 w-1/3 rounded bg-line/60" />
              <div className="mt-2 h-4 w-3/4 rounded bg-line/80" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white p-12 text-center shadow-2xs">
          <Sparkles className="size-12 text-brand" />
          <h2 className="mt-4 text-lg font-black text-ink">
            لا توجد عروض نشطة حالياً
          </h2>
          <p className="mt-1 text-xs text-muted">
            ترقبوا أحدث العروض والخصومات القادمة قريباً!
          </p>
          <Link
            href="/products"
            className="mt-6 rounded-2xl bg-brand px-6 py-2.5 text-xs font-black text-white shadow"
          >
            تصفح جميع المنتجات
          </Link>
        </div>
      )}
    </div>
  );
}
