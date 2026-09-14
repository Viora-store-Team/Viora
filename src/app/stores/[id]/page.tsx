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

      {/* ─── 2. Store Identity ─── */}
      <section className="mb-10 rounded-[2rem] border border-[#eadfd4] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(65,25,30,.45)] sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-center">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-[1.6rem] border border-[#eadfd4] bg-[#fbf6f1] p-2 shadow-sm sm:size-28">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.logoUrl} alt={store.name} className="size-full rounded-[1.15rem] object-contain" />
              ) : (
                <StoreIcon className="size-11 text-[#8d1f30]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2.5">
                <h1 className="min-w-0 truncate text-2xl font-black text-[#241d19] sm:text-3xl">{store.name}</h1>
                {(store.status === "APPROVED" || store.isVerified) && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f5e5e7] px-2.5 py-1 text-[10px] font-black text-[#8d1f30]"><ShieldCheck className="size-3.5" />متجر موثّق</span>}
              </div>
              {store.description && <p className="mt-2 max-w-xl text-xs leading-6 text-[#746a63] sm:text-sm">{store.description}</p>}
              <div className="mt-4 grid max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                {(store.city || store.address) && <span className="flex min-w-0 items-center gap-2 rounded-xl bg-[#fbf6f1] px-3 py-2 text-[11px] font-medium text-[#635a52]"><MapPin className="size-3.5 shrink-0 text-[#8d1f30]" /><span className="truncate">{store.address || store.city}</span></span>}
                {store.phone && <span className="flex flex-row items-center gap-2 whitespace-nowrap rounded-xl bg-[#fbf6f1] px-3 py-2 text-[11px] font-medium text-[#635a52]"><Phone className="size-3.5 shrink-0 text-[#8d1f30]" /><span className="ltr-nums">{store.phone}</span></span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-60">
            <div className="rounded-2xl bg-[#fbf6f1] px-4 py-3 text-center"><Star className="mx-auto size-4 fill-[#d59a48] text-[#d59a48]" /><span className="mt-1 block text-sm font-black text-[#241d19]">{store.ratingAvg ? Number(store.ratingAvg).toFixed(1) : "جديد"}</span><span className="text-[10px] text-[#8b8177]">{store.ratingCount || 0} تقييم</span></div>
            <div className="rounded-2xl bg-[#f5e5e7] px-4 py-3 text-center"><Package className="mx-auto size-4 text-[#8d1f30]" /><span className="mt-1 block text-sm font-black text-[#8d1f30]">{products.length}</span><span className="text-[10px] text-[#8b8177]">منتج متاح</span></div>
          </div>
        </div>

        {store.categories && store.categories.length > 0 && <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#ede5da] pt-5"><span className="ml-1 text-xs font-black text-[#4a443e]">أقسام المتجر</span>{store.categories.map((cat) => <span key={cat.id} className="rounded-xl border border-[#eadfd4] bg-[#fbf6f1] px-3 py-1.5 text-[11px] font-bold text-[#635a52]">{cat.name}</span>)}</div>}
      </section>

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
