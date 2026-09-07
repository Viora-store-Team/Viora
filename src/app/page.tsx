import Link from "next/link";
import {
  ChevronLeft,
  Layers,
  MapPin,
  Store as StoreIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import HeroBannerSlider from "@/components/layout/HeroBannerSlider";

interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  children?: Category[];
}

interface Product {
  id: number;
  name: string;
  price: string;
  compareAtPrice?: string | null;
  discountPercent?: number | null;
  image?: string | null;
  imageUrl?: string | null;
  store?: { id: number; name: string };
  storeName?: string;
}

interface StoreItem {
  id: number;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  city?: string | null;
  ratingAvg?: string | number | null;
  categories?: { id: number; name: string }[];
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
      featuredStores: (featuredStoresRes.stores || []) as StoreItem[],
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

          {/* Clean Horizontal Scroll WITHOUT any scrollbar line */}
          <div className="flex items-start gap-6 overflow-x-auto py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="group flex shrink-0 flex-col items-center gap-2.5 text-center"
              >
                <div className="relative grid size-20 sm:size-24 place-items-center overflow-hidden rounded-full border-2 border-[#ede5da] bg-white p-1.5 shadow-2xs transition duration-300 group-hover:border-[#7d1d29] group-hover:scale-105 group-hover:shadow-md">
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center rounded-full bg-[#fdf0f2] text-[#7d1d29]">
                      <Layers className="size-8" />
                    </div>
                  )}
                </div>
                <span className="max-w-[100px] text-sm font-bold text-[#1e1b18] group-hover:text-[#7d1d29] transition line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredStores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.id}`}
                className="group flex items-center gap-4.5 rounded-2xl border border-[#ede5da] bg-white p-4.5 shadow-2xs transition duration-200 hover:border-[#7d1d29]/40 hover:shadow-md"
              >
                {/* Large Store Logo */}
                <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#ede5da] bg-[#faf7f2] shadow-2xs">
                  {store.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.logoUrl}
                      alt={store.name}
                      className="size-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <StoreIcon className="size-9 text-[#7d1d29]" />
                  )}
                </div>

                {/* Store Info */}
                <div className="flex flex-1 flex-col overflow-hidden">
                  <h3 className="text-base font-black text-[#1e1b18] group-hover:text-[#7d1d29] transition truncate">
                    {store.name}
                  </h3>

                  {store.description && (
                    <p className="mt-1 text-xs text-[#80766b] line-clamp-1 leading-relaxed">
                      {store.description}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center gap-2.5 text-xs text-[#80766b]">
                    {store.city && (
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="size-3.5 text-[#7d1d29]" />
                        <span>{store.city}</span>
                      </span>
                    )}

                    {store.categories && store.categories.length > 0 && (
                      <span className="rounded-lg bg-[#faf7f2] px-2.5 py-0.5 text-xs font-bold text-[#4a443e]">
                        {store.categories[0].name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
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
            {bestSelling.map((product) => {
              const prodImg = product.image || product.imageUrl;
              const storeName = product.store?.name || product.storeName;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#ede5da] bg-white shadow-2xs transition duration-200 hover:border-[#7d1d29]/40 hover:shadow-md"
                >
                  {/* Product Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[#faf7f2]">
                    {prodImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={prodImg}
                        alt={product.name}
                        className="size-full object-cover transition duration-300 group-hover:scale-104"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-sm text-[#80766b]">
                        لا توجد صورة
                      </div>
                    )}

                    {product.discountPercent && product.discountPercent > 0 && (
                      <span className="absolute top-3 right-3 rounded-lg bg-[#7d1d29] px-2.5 py-1 text-xs font-black text-white shadow-xs">
                        %{product.discountPercent} خصم
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col p-4">
                    {storeName && (
                      <span className="text-xs font-bold text-[#80766b]">
                        {storeName}
                      </span>
                    )}
                    <h3 className="mt-1 text-sm font-black text-[#1e1b18] line-clamp-1 group-hover:text-[#7d1d29] transition">
                      {product.name}
                    </h3>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="ltr-nums text-base font-black text-[#7d1d29]">
                        {product.price} ₪
                      </span>
                      {product.compareAtPrice && (
                        <span className="ltr-nums text-xs text-[#80766b] line-through">
                          {product.compareAtPrice} ₪
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
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
