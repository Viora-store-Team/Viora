import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import HeroBannerSlider from "@/components/layout/HeroBannerSlider";
import HomeCategories from "@/components/layout/HomeCategories";
import ProductCard from "@/components/products/ProductCard";
import StoreCard from "@/components/stores/StoreCard";
import { Product, StoreDetail } from "@/types";

interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  children?: Category[];
}

async function getHomeData() {
  try {
    const [categoriesRes, featuredStoresRes, bestSellingRes] = await Promise.all([
      apiFetch("/categories"),
      apiFetch("/stores/featured?limit=6"),
      apiFetch("/products/best-selling?limit=8"),
    ]);

    const roots = (categoriesRes.categories || []) as Category[];

    return {
      categories: roots,
      featuredStores: (featuredStoresRes.stores || []) as StoreDetail[],
      bestSelling: (bestSellingRes.products || []) as Product[],
    };
  } catch {
    return {
      categories: [],
      featuredStores: [],
      bestSelling: [],
    };
  }
}

export default async function HomePage() {
  const { categories, featuredStores, bestSelling } = await getHomeData();

  return (
    <div className="flex flex-col gap-14 pb-20">
      {/* ─── 1. Hero Banner Slider ──────────────────────────────────── */}
      <HeroBannerSlider />

      {/* ─── 2. Categories Circular Icons (No Scrollbar, Bigger Font) ─ */}
      {categories.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between pb-6">
            <div>
              <h2 className="text-xl font-black text-[#1e1b18] sm:text-2xl">
                التصنيفات الرئيسية
              </h2>
              <p className="mt-1 text-sm text-[#80766b]">
                تصفحي الأزياء والمنتجات حسب القسم
              </p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-bold text-[#7d1d29] hover:underline"
            >
              <span>عرض كل الأقسام</span>
              <ChevronLeft className="size-4" />
            </Link>
          </div>

          <HomeCategories categories={categories} />
        </section>
      )}

      {/* ─── 3. Featured Stores (المتاجر المميزة) ───────────────────── */}
      {featuredStores.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between pb-6">
            <div>
              <h2 className="text-xl font-black text-[#1e1b18] sm:text-2xl">
                المتاجر المميزة
              </h2>
              <p className="mt-1 text-sm text-[#80766b]">
                أفضل المتاجر الموثقة والمميزة على منصة فيورا
              </p>
            </div>
            <Link
              href="/stores"
              className="flex items-center gap-1 text-sm font-bold text-[#7d1d29] hover:underline"
            >
              <span>جميع المتاجر</span>
              <ChevronLeft className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredStores.map((store) => <StoreCard key={store.id} store={{ ...store, isFeatured: true }} />)}
          </div>
        </section>
      )}

      {/* ─── 4. Best Selling Products (الأكثر طلباً) ────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h2 className="text-xl font-black text-[#1e1b18] sm:text-2xl">
              المنتجات الأكثر طلباً
            </h2>
            <p className="mt-1 text-sm text-[#80766b]">
              المنتجات الأكثر مبيعاً وإقبالاً من الزبائن
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-bold text-[#7d1d29] hover:underline"
          >
            <span>جميع المنتجات</span>
            <ChevronLeft className="size-4" />
          </Link>
        </div>

        {bestSelling.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bestSelling.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#ede5da] p-12 text-center text-sm text-[#80766b]">
            لا توجد منتجات معروضة حالياً.
          </div>
        )}
      </section>
    </div>
  );
}
