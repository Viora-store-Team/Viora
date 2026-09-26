"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Heart,
  Home,
  LogIn,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { apiFetch, getCustomerToken } from "@/lib/api";
import { Product } from "@/types";
import ProductCard from "@/components/products/ProductCard";

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const loadFavorites = () => {
    const token = getCustomerToken();
    setIsLoggedIn(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    apiFetch("/favorites")
      .then((res) => {
        if (res.success && Array.isArray(res.products)) {
          setProducts(res.products);
        } else {
          setProducts([]);
        }
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFavorites();

    const handleFavUpdated = () => {
      loadFavorites();
    };

    window.addEventListener("viora_favorites_updated", handleFavUpdated);
    return () => {
      window.removeEventListener("viora_favorites_updated", handleFavUpdated);
    };
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
        <span className="font-bold text-ink">المفضلة</span>
      </nav>

      {/* ─── 2. Header & Title ─── */}
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Heart className="size-5 fill-brand" />
          </div>
          <h1 className="text-2xl font-black text-ink sm:text-3xl">
            المنتجات المفضلة
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          {loading
            ? "جاري جلب المنتجات المحفوظة..."
            : isLoggedIn
            ? `لديك ${products.length} منتج محفوظ في قائمة المفضلة`
            : "احفظ المنتجات التي تعجبك للرجوع إليها في أي وقت"}
        </p>
      </div>

      {/* ─── 3. Content ─── */}
      {loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-3 shadow-2xs animate-pulse"
            >
              <div className="aspect-square w-full rounded-xl bg-line/50" />
              <div className="mt-3 h-3 w-1/3 rounded bg-line/60" />
              <div className="mt-2 h-4 w-3/4 rounded bg-line/80" />
              <div className="mt-4 flex items-center justify-between">
                <div className="h-4 w-16 rounded bg-line/80" />
              </div>
            </div>
          ))}
        </div>
      ) : !isLoggedIn ? (
        /* ─── Guest / Not Logged In State ─── */
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white p-12 text-center shadow-2xs">
          <div className="grid size-20 place-items-center rounded-full bg-brand-soft text-brand">
            <Heart className="size-10 fill-brand" />
          </div>
          <h2 className="mt-5 text-xl font-black text-ink">
            سجل دخولك للوصول إلى مفضلتك
          </h2>
          <p className="mt-2 max-w-sm text-xs text-muted leading-relaxed">
            قم بتسجيل الدخول لمزامنة وحفظ المنتجات التي تعجبك عبر جميع أجهزتك والوصول إليها بسرعة.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-xs font-black text-white shadow-md transition hover:bg-[#681822]"
            >
              <LogIn className="size-4" />
              <span>تسجيل الدخول</span>
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-2xl border border-line bg-white px-6 py-3 text-xs font-black text-ink shadow-2xs transition hover:border-brand"
            >
              <ShoppingBag className="size-4 text-brand" />
              <span>تصفح المنتجات</span>
            </Link>
          </div>
        </div>
      ) : products.length > 0 ? (
        /* ─── Active Favorites Grid ─── */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* ─── Empty Favorites State ─── */
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white p-12 text-center shadow-2xs">
          <div className="grid size-20 place-items-center rounded-full bg-brand-soft text-brand">
            <Sparkles className="size-10" />
          </div>
          <h2 className="mt-5 text-xl font-black text-ink">
            قائمة المفضلة فارغة حالياً
          </h2>
          <p className="mt-2 max-w-sm text-xs text-muted leading-relaxed">
            لم تقم بإضافة أي منتجات إلى مفضلتك بعد. اضغط على أيقونة القلب على أي منتج لحفظه هنا والعودة إليه لاحقاً!
          </p>
          <Link
            href="/products"
            className="mt-6 flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-xs font-black text-white shadow-md transition hover:bg-[#681822]"
          >
            <ShoppingBag className="size-4" />
            <span>استكشف المنتجات الآن</span>
          </Link>
        </div>
      )}
    </div>
  );
}
