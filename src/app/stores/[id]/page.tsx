import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  Home,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Star,
  Store as StoreIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Product, StoreDetail } from "@/types";
import ProductCard from "@/components/products/ProductCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getStoreData(id: string) {
  try {
    const [storeRes, productsRes] = await Promise.all([
      apiFetch(`/stores/${id}`),
      apiFetch(`/products?storeId=${id}&limit=50`),
    ]);

    if (!storeRes.success || !storeRes.store) {
      return null;
    }

    return {
      store: storeRes.store as StoreDetail,
      products: (productsRes.products || []) as Product[],
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await apiFetch(`/stores/${id}`);
    if (res.success && res.store) {
      const s = res.store as StoreDetail;
      return {
        title: `${s.name} | فيورا (Viora)`,
        description: s.description || `تسوّق أحدث المنتجات والأزياء من متجر ${s.name} على منصة فيورا.`,
      };
    }
  } catch {}

  return {
    title: "المتجر | فيورا (Viora)",
  };
}

export default async function StoreDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getStoreData(id);

  if (!data) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-[#fdf0f2] text-[#7d1d29]">
          <StoreIcon className="size-8" />
        </div>
        <h1 className="mt-4 text-xl font-black text-[#1e1b18]">
          المتجر غير موجود أو غير متاح
        </h1>
        <p className="mt-2 text-xs text-[#80766b] leading-relaxed">
          عذراً، لم نتمكن من العثور على هذا المتجر أو قد يكون حسابه معطلاً حالياً.
        </p>
        <Link
          href="/stores"
          className="mt-6 flex items-center gap-2 rounded-xl bg-[#7d1d29] px-5 py-2.5 text-xs font-black text-white shadow hover:bg-[#681822] transition"
        >
          <ChevronLeft className="size-4" />
          <span>تصفح جميع المتاجر</span>
        </Link>
      </div>
    );
  }

  const { store, products } = data;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* ─── 1. Breadcrumbs ─── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#80766b]">
        <Link href="/" className="flex items-center gap-1 hover:text-[#7d1d29] transition">
          <Home className="size-3.5" />
          <span>الرئيسية</span>
        </Link>
        <ChevronLeft className="size-3 text-[#ede5da]" />
        <Link href="/stores" className="hover:text-[#7d1d29] transition">
          المتاجر
        </Link>
        <ChevronLeft className="size-3 text-[#ede5da]" />
        <span className="font-bold text-[#1e1b18]">{store.name}</span>
      </nav>

      {/* ─── 2. Store Header Hero ─── */}
      <div className="relative mb-12 overflow-hidden rounded-3xl border border-[#ede5da] bg-white shadow-2xs">
        {/* Cover Banner */}
        <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-[#7d1d29]/20 via-[#c48b4e]/20 to-[#7d1d29]/20">
          {store.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.coverUrl}
              alt=""
              className="size-full object-cover"
            />
          )}
        </div>

        {/* Store Profile Info */}
        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="-mt-14 mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              {/* Logo */}
              <div className="relative grid size-24 sm:size-28 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-[#faf7f2] shadow-lg">
                {store.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <StoreIcon className="size-12 text-[#7d1d29]" />
                )}
              </div>

              {/* Title & Badge */}
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#1e1b18]">
                    {store.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf0f2] px-2.5 py-0.5 text-[11px] font-black text-[#7d1d29]">
                    <ShieldCheck className="size-3.5" />
                    <span>متجر موثق</span>
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#80766b]">
                  {store.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5 text-[#7d1d29]" />
                      <span>{store.city} {store.address ? `- ${store.address}` : ""}</span>
                    </span>
                  )}
                  {store.phone && (
                    <span className="flex items-center gap-1 ltr-nums">
                      <Phone className="size-3 text-[#7d1d29]" />
                      <span>{store.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Rating badge */}
            <div className="flex items-center gap-2 rounded-2xl bg-[#faf7f2] border border-[#ede5da] px-4 py-2 w-fit">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#1e1b18]">
                  {store.ratingAvg ? Number(store.ratingAvg).toFixed(1) : "متجر جديد"}
                </span>
                <span className="text-[10px] text-[#80766b]">
                  {store.ratingCount || 0} تقييم
                </span>
              </div>
            </div>
          </div>

          {/* Description & Categories */}
          {store.description && (
            <p className="mt-2 text-xs sm:text-sm text-[#4a443e] leading-relaxed max-w-3xl">
              {store.description}
            </p>
          )}

          {store.categories && store.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#ede5da]/50 pt-4">
              <span className="text-xs font-bold text-[#80766b]">أقسام المتجر:</span>
              {store.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-xl bg-[#faf7f2] px-3 py-1 text-xs font-bold text-[#4a443e]"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── 3. Store Products Section ─── */}
      <div className="flex items-center justify-between pb-6 border-b border-[#ede5da] mb-6">
        <div>
          <h2 className="text-xl font-black text-[#1e1b18]">منتجات المتجر</h2>
          <p className="mt-0.5 text-xs text-[#80766b]">
            عرض {products.length} منتج متوفر لدى {store.name}
          </p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#ede5da] bg-white p-12 text-center shadow-2xs">
          <div className="grid size-16 place-items-center rounded-full bg-[#fdf0f2] text-[#7d1d29]">
            <Package className="size-8" />
          </div>
          <h3 className="mt-4 text-base font-black text-[#1e1b18]">
            لا توجد منتجات معروضة حالياً
          </h3>
          <p className="mt-1 text-xs text-[#80766b]">
            يقوم المتجر بتحديث وتجهيز منتجاته قريباً.
          </p>
        </div>
      )}
    </div>
  );
}
