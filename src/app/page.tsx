import Link from "next/link";
import {
  ChevronLeft,
  Sparkles,
  ShoppingBag,
  Store as StoreIcon,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Award,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getPublishedBanners } from "@/lib/banners";
import HeroBannerSlider from "@/components/layout/HeroBannerSlider";
import HomeCategories from "@/components/layout/HomeCategories";
import GuestJoinBanner from "@/components/layout/GuestJoinBanner";
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
  const [{ categories, featuredStores, bestSelling }, banners] = await Promise.all([
    getHomeData(),
    getPublishedBanners(),
  ]);

  return (
    <div className="flex flex-col gap-12 pb-24 bg-[#faf7f2]">
      {/* ─── 1. Main Hero Slider ─────────────────────────────────────── */}
      <HeroBannerSlider banners={banners} />

      {/* ─── 2. Platform Value Props (Trust & Benefits Bar) ───────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 rounded-3xl bg-white p-6 border border-[#ede5da] shadow-sm">
          <div className="flex items-center gap-3 p-2">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#fdf0f2] text-[#7d1d29]">
              <StoreIcon className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1e1b18]">متاجر محددة وموثوقة</h4>
              <p className="text-[11px] text-[#80766b] mt-0.5">أفضل المحلات التجارية والمصممين</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#fdf0f2] text-[#7d1d29]">
              <Truck className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1e1b18]">توصيل سريع وبحذر</h4>
              <p className="text-[11px] text-[#80766b] mt-0.5">تغليف آمن وتوصيل لباب بيتك</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#fdf0f2] text-[#7d1d29]">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1e1b18]">تسوق ودفع آمن</h4>
              <p className="text-[11px] text-[#80766b] mt-0.5">حماية كاملة ومعاملات آمنة</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#fdf0f2] text-[#7d1d29]">
              <Award className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1e1b18]">جودة مضمونة</h4>
              <p className="text-[11px] text-[#80766b] mt-0.5">منتجات أصلية وبضاعة ممتازة</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Categories Circular Icons ───────────────────────────── */}
      {categories.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between pb-6 border-b border-[#ede5da] mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f2] px-3 py-1 text-[11px] font-bold text-[#7d1d29] mb-2">
                <Sparkles className="size-3" />
                <span>تصفح الأقسام</span>
              </div>
              <h2 className="text-xl font-black text-[#1e1b18] sm:text-2xl">
                التصنيفات الرئيسية
              </h2>
              <p className="mt-1 text-xs text-[#80766b]">
                اختر القسم المناسب وتصفح المنتجات المتوفرة في المتاجر
              </p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-xs font-bold text-[#7d1d29] transition hover:underline"
            >
              <span>عرض كل الأقسام</span>
              <ChevronLeft className="size-4" />
            </Link>
          </div>

          <HomeCategories categories={categories} />
        </section>
      )}

      {/* ─── 4. Featured Stores (المتاجر المميزة) ───────────────────── */}
      {featuredStores.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between pb-6 border-b border-[#ede5da] mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f2] px-3 py-1 text-[11px] font-bold text-[#7d1d29] mb-2">
                <Award className="size-3" />
                <span>نخبة المتاجر</span>
              </div>
              <h2 className="text-xl font-black text-[#1e1b18] sm:text-2xl">
                المتاجر المميزة
              </h2>
              <p className="mt-1 text-xs text-[#80766b]">
                أفضل المتاجر الموثقة والمميزة في منصة فيورا
              </p>
            </div>
            <Link
              href="/stores"
              className="flex items-center gap-1 text-xs font-bold text-[#7d1d29] transition hover:underline"
            >
              <span>جميع المتاجر</span>
              <ChevronLeft className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredStores.map((store) => (
              <StoreCard key={store.id} store={{ ...store, isFeatured: true }} />
            ))}
          </div>
        </section>
      )}

      {/* ─── 5. Best Selling Products (الأكثر طلباً) ────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between pb-6 border-b border-[#ede5da] mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f2] px-3 py-1 text-[11px] font-bold text-[#7d1d29] mb-2">
              <Star className="size-3" />
              <span>الأعلى تقييماً وإقبالاً</span>
            </div>
            <h2 className="text-xl font-black text-[#1e1b18] sm:text-2xl">
              المنتجات الأكثر طلباً
            </h2>
            <p className="mt-1 text-xs text-[#80766b]">
              المنتجات الأكثر مبيعاً في كافة أقسام المنصة
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-xs font-bold text-[#7d1d29] transition hover:underline"
          >
            <span>جميع المنتجات</span>
            <ChevronLeft className="size-4" />
          </Link>
        </div>

        {bestSelling.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bestSelling.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#ede5da] bg-white p-12 text-center text-xs font-semibold text-[#80766b]">
            لا توجد منتجات معروضة حالياً.
          </div>
        )}
      </section>

      {/* ─── 6. Guest Callout Banner ───────────────────────────────────── */}
      <GuestJoinBanner />
    </div>
  );
}
