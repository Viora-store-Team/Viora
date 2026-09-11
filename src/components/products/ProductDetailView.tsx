"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Heart,
  Home,
  MapPin,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store as StoreIcon,
  Truck,
} from "lucide-react";
import { Product, ProductDetail, RatingItem } from "@/types";
import { apiFetch, getCustomerToken } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import ProductCard from "./ProductCard";
import VioraToast from "@/components/layout/VioraToast";

interface ProductDetailViewProps {
  product: ProductDetail;
  initialRatings: RatingItem[];
  relatedProducts: Product[];
}

export default function ProductDetailView({
  product,
  initialRatings,
  relatedProducts,
}: ProductDetailViewProps) {
  const router = useRouter();

  // Active Variant (Color)
  const variants = product.variants || [];
  const [activeVariantIdx, setActiveVariantIdx] = useState<number>(0);
  const activeVariant = variants[activeVariantIdx] || null;

  // Active Image
  const variantImages = activeVariant?.images?.length
    ? activeVariant.images
    : product.image
    ? [product.image]
    : [];
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  // Available Sizes for active variant
  const sizes = activeVariant?.sizes || [];
  const firstInStockSize = sizes.find((s) => s.stock > 0) || sizes[0] || null;
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(
    firstInStockSize ? firstInStockSize.id : null
  );

  // When variant changes, update size selection
  const handleSelectVariant = (idx: number) => {
    setActiveVariantIdx(idx);
    setActiveImageIdx(0);
    const newVariant = variants[idx];
    const newSizes = newVariant?.sizes || [];
    const inStock = newSizes.find((s) => s.stock > 0) || newSizes[0] || null;
    setSelectedSizeId(inStock ? inStock.id : null);
  };

  // Quantity
  const [quantity, setQuantity] = useState<number>(1);
  const selectedSize = sizes.find((s) => s.id === selectedSizeId);
  const maxStock = selectedSize ? selectedSize.stock : 1;
  const isOutOfStock = !selectedSize || selectedSize.stock <= 0;

  // Favorite
  const [isFav, setIsFav] = useState<boolean>(Boolean(product.isFavorite));
  const [favLoading, setFavLoading] = useState(false);

  // Cart action states
  const [addingToCart, setAddingToCart] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{
    show: boolean;
    text: string;
    type: "success" | "error";
  }>({ show: false, text: "", type: "success" });

  // Tabs: "desc" | "ratings" | "store"
  const [activeTab, setActiveTab] = useState<"desc" | "ratings" | "store">("desc");

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedbackToast({ show: true, text, type });
    setTimeout(() => {
      setFeedbackToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const handleToggleFavorite = async () => {
    const token = getCustomerToken();
    if (!token) { showToast("يرجى تسجيل الدخول لحفظ المنتج في المفضلة", "error"); return; }
    if (favLoading) return;
    setFavLoading(true);

    const nextState = !isFav;
    setIsFav(nextState);

    try {
      const result = nextState
        ? await apiFetch(`/favorites/${product.id}`, { method: "POST" })
        : await apiFetch(`/favorites/${product.id}`, { method: "DELETE" });
      if (!result.success) {
        setIsFav(!nextState);
        showToast(result.message || "تعذر تحديث المفضلة، حاولي مرة أخرى", "error");
      } else {
        showToast(nextState ? "تمت إضافة المنتج إلى المفضلة" : "تمت إزالة المنتج من المفضلة", "success");
      }
    } catch {
      setIsFav(!nextState);
      showToast("تعذر تحديث المفضلة، حاولي مرة أخرى", "error");
    } finally {
      setFavLoading(false);
    }
  };

  const handleAddToCart = async (goToCart = false) => {
    if (!selectedSizeId) {
      showToast("يرجى اختيار المقاس أولاً", "error");
      return;
    }
    if (isOutOfStock) {
      showToast("هذا المقاس غير متوفر حالياً", "error");
      return;
    }

    setAddingToCart(true);

    const res = await addToCart(selectedSizeId, quantity, {
      productId: product.id,
      productName: product.name,
      colorName: activeVariant?.colorName,
      sizeName: selectedSize?.name,
      price: product.price,
      image: variantImages[activeImageIdx] || product.image,
      storeName: product.store?.name,
    });

    setAddingToCart(false);

    if (res.success) {
      if (goToCart) {
        router.push("/cart");
      } else {
        showToast("تمت إضافة المنتج إلى السلة بنجاح! 🛍️", "success");
      }
    } else {
      showToast(res.message || "تعذر إضافة المنتج إلى السلة", "error");
    }
  };

  const currentImg = variantImages[activeImageIdx] || null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      {feedbackToast.show && <VioraToast message={feedbackToast.text} type={feedbackToast.type} onClose={() => setFeedbackToast((prev) => ({ ...prev, show: false }))} />}

      {/* ─── 1. Breadcrumb ─── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#80766b]">
        <Link href="/" className="flex items-center gap-1 hover:text-[#7d1d29] transition">
          <Home className="size-3.5" />
          <span>الرئيسية</span>
        </Link>
        <ChevronLeft className="size-3 text-[#ede5da]" />
        <Link href="/products" className="hover:text-[#7d1d29] transition">
          المنتجات
        </Link>
        {product.category && (
          <>
            <ChevronLeft className="size-3 text-[#ede5da]" />
            <Link
              href={`/products?categoryId=${product.category.id}`}
              className="hover:text-[#7d1d29] transition"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronLeft className="size-3 text-[#ede5da]" />
        <span className="font-bold text-[#1e1b18] truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* ─── 2. Main Product Grid (Gallery + Details) ─── */}
      <div className="grid grid-cols-1 gap-7 rounded-[2rem] bg-white p-3 ring-1 ring-[#e9e1d7] lg:grid-cols-12 lg:p-5">
        {/* Left/Gallery Column (5 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Big Image Preview */}
          <div className="relative aspect-[4/4.15] w-full overflow-hidden rounded-[1.5rem] bg-[#f3eee8]">
            {currentImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentImg}
                alt={product.name}
                className="size-full object-cover transition duration-300"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-[#80766b]">
                لا توجد صورة لهذا اللون
              </div>
            )}

            {/* Discount Badge */}
            {product.discountPercent && product.discountPercent > 0 && (
              <div className="absolute top-4 right-4 rounded-full bg-[#7d1d29] px-3 py-1.5 text-xs font-black text-white shadow-lg shadow-[#7d1d29]/30">
                %{product.discountPercent} خصم
              </div>
            )}

            {/* Favorite Button */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={favLoading}
              aria-label={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              className="absolute top-4 left-4 grid size-11 place-items-center rounded-full bg-white/95 text-[#4a443e] shadow-lg transition hover:scale-110 hover:text-[#7d1d29]"
            >
              <Heart
                className={`size-5 transition-colors ${
                  isFav ? "fill-[#7d1d29] text-[#7d1d29]" : "text-[#4a443e]"
                }`}
              />
            </button>
          </div>

          {/* Thumbnails list */}
          {variantImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto px-1 py-1">
              {variantImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImageIdx(i)}
                  className={`relative size-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    activeImageIdx === i
                      ? "border-[#7d1d29] shadow-sm"
                      : "border-[#ede5da] hover:border-[#80766b]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right/Info Column (7 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col rounded-[1.5rem] bg-[#fcf9f5] p-5 sm:p-7">
          {/* Store Info Card */}
          {product.store && (
            <Link
              href={`/stores/${product.store.id}`}
              className="group mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#eadfd4] bg-white px-3.5 py-2 transition hover:border-[#7d1d29]/40 w-fit"
            >
              <div className="grid size-6 place-items-center rounded-lg bg-[#faf7f2] text-[#c48b4e]">
                {product.store.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.store.logoUrl}
                    alt={product.store.name}
                    className="size-full rounded-lg object-cover"
                  />
                ) : (
                  <StoreIcon className="size-3.5" />
                )}
              </div>
              <span className="text-xs font-black text-[#1e1b18] group-hover:text-[#7d1d29] transition">
                {product.store.name}
              </span>
              {product.store.city && (
                <span className="flex items-center gap-0.5 text-[11px] text-[#80766b]">
                  <MapPin className="size-3 text-[#7d1d29]" />
                  <span>{product.store.city}</span>
                </span>
              )}
            </Link>
          )}

          {/* Product Title */}
          <h1 className="text-3xl font-black tracking-tight text-[#1e1b18] sm:text-4xl leading-tight">
            {product.name}
          </h1>

          {/* Ratings & Reviews summary */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="text-xs font-black text-[#1e1b18]">
                {product.ratingAvg ? Number(product.ratingAvg).toFixed(1) : "جديد"}
              </span>
            </div>
            <span className="h-3 w-px bg-[#ede5da]" />
            <span className="text-xs text-[#80766b]">
              {product.ratingCount || 0} تقييم
            </span>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-3 rounded-2xl bg-[#7d1d29] p-5 text-white shadow-[0_15px_30px_-20px_rgba(125,29,41,.8)]">
            <div className="flex items-baseline gap-1.5">
              <span className="ltr-nums text-3xl font-black text-white">
                {product.price} ₪
              </span>
              {product.compareAtPrice && (
                <span className="ltr-nums text-sm text-white/60 line-through">
                  {product.compareAtPrice} ₪
                </span>
              )}
            </div>
            {product.discountPercent && product.discountPercent > 0 && (
              <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-black text-[#f7d9a4]">
                وفرت %{product.discountPercent}
              </span>
            )}
          </div>

          {/* ─── Color / Variant Selection ─── */}
          {variants.length > 0 && (
            <div className="mt-6 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#1e1b18]">
                  اللون:{" "}
                  <span className="font-bold text-[#7d1d29]">
                    {activeVariant?.colorName || "غير محدد"}
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {variants.map((v, idx) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVariant(idx)}
                    className={`group flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      activeVariantIdx === idx
                        ? "border-[#7d1d29] bg-[#fdf0f2] text-[#7d1d29] shadow-xs"
                        : "border-[#ede5da] bg-white text-[#4a443e] hover:border-[#80766b]"
                    }`}
                  >
                    <span
                      className="size-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <span>{v.colorName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Size Selection ─── */}
          {sizes.length > 0 && (
            <div className="mt-6 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#1e1b18]">اختر المقاس:</span>
                {selectedSize && (
                  <span className="text-[11px] font-bold text-[#80766b]">
                    المتوفر: {selectedSize.stock} قطعة
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {sizes.map((s) => {
                  const isSelected = selectedSizeId === s.id;
                  const outOfStock = s.stock <= 0;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => {
                        setSelectedSizeId(s.id);
                        if (quantity > s.stock) setQuantity(1);
                      }}
                      className={`relative min-w-12 rounded-xl border px-4 py-2 text-center text-xs font-black transition ${
                        isSelected
                          ? "border-[#7d1d29] bg-[#7d1d29] text-white shadow-xs"
                          : outOfStock
                          ? "cursor-not-allowed border-[#ede5da] bg-[#ede5da]/40 text-[#80766b] line-through opacity-60"
                          : "border-[#ede5da] bg-white text-[#1e1b18] hover:border-[#7d1d29]"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Quantity & Action Buttons ─── */}
          <div className="mt-7 flex flex-col gap-4 border-t border-[#eadfd4] pt-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-[#1e1b18]">الكمية:</span>
              <div className="flex items-center rounded-xl border border-[#ede5da] bg-white shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid size-9 place-items-center text-[#4a443e] transition hover:text-[#7d1d29] disabled:opacity-40"
                  aria-label="تقليل الكمية"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="ltr-nums min-w-10 text-center text-sm font-black text-[#1e1b18]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= maxStock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  className="grid size-9 place-items-center text-[#4a443e] transition hover:text-[#7d1d29] disabled:opacity-40"
                  aria-label="زيادة الكمية"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={addingToCart || isOutOfStock}
                onClick={() => handleAddToCart(false)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#7d1d29] py-4 px-6 text-sm font-black text-white shadow-lg shadow-[#7d1d29]/25 transition duration-200 hover:bg-[#681822] disabled:opacity-50"
              >
                <ShoppingBag className="size-4.5" />
                <span>{addingToCart ? "جاري الإضافة..." : "أضف إلى السلة"}</span>
              </button>

              <button
                type="button"
                disabled={addingToCart || isOutOfStock}
                onClick={() => handleAddToCart(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#7d1d29] bg-white py-3.5 px-6 text-sm font-black text-[#7d1d29] transition duration-200 hover:bg-[#fdf0f2] disabled:opacity-50"
              >
                <span>اشتري الآن</span>
              </button>
            </div>
          </div>

          {/* ─── Trust Badges ─── */}
          <div className="mt-7 grid grid-cols-1 gap-3 border-t border-[#eadfd4] pt-5 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4a443e]">
              <Truck className="size-4 text-[#7d1d29]" />
              <span>توصيل سريع وآمن</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4a443e]">
              <ShieldCheck className="size-4 text-[#7d1d29]" />
              <span>منتج أصلي 100%</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4a443e]">
              <RotateCcw className="size-4 text-[#7d1d29]" />
              <span>استبدال وإرجاع سهل</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Tabs Section (Description, Reviews, Store) ─── */}
      <div className="mt-12 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <div className="rounded-[1.5rem] bg-[#57111c] p-6 text-white sm:p-8">
          <p className="text-xs font-bold text-[#f5d7a5]">تفاصيل المنتج</p>
          <h2 className="mt-2 text-2xl font-black">كل ما يهمك قبل الشراء</h2>
          <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("desc")}
            className={`rounded-xl px-4 py-3 text-right text-sm font-black transition ${
              activeTab === "desc"
                ? "bg-white text-[#7d1d29]"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            تفاصيل ووصف المنتج
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ratings")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-3 text-right text-sm font-black transition ${
              activeTab === "ratings"
                ? "bg-white text-[#7d1d29]"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>آراء وتقييمات الزبائن</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === "ratings" ? "bg-[#fdf0f2] text-[#7d1d29]" : "bg-white/10 text-white/80"}`}>
              {initialRatings.length}
            </span>
          </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-[1.5rem] bg-white p-6 ring-1 ring-[#e9e1d7] sm:p-8">
          {activeTab === "desc" && (
            <div className="max-w-3xl flex flex-col gap-5 text-sm text-[#4a443e] leading-8">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="text-[#80766b]">لا يتوفر وصف إضافي لهذا المنتج.</p>
              )}

              {/* Attributes table */}
              <div className="mt-2 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[#ede5da]">
                {product.brand && (
                  <div className="bg-[#fcf9f5] p-4">
                    <span className="text-xs text-[#80766b]">الماركة:</span>
                    <p className="text-xs font-black text-[#1e1b18]">{product.brand}</p>
                  </div>
                )}
                {product.material && (
                  <div className="bg-[#fcf9f5] p-4">
                    <span className="text-xs text-[#80766b]">الخامة:</span>
                    <p className="text-xs font-black text-[#1e1b18]">{product.material}</p>
                  </div>
                )}
                {product.category && (
                  <div className="bg-[#fcf9f5] p-4">
                    <span className="text-xs text-[#80766b]">القسم:</span>
                    <p className="text-xs font-black text-[#1e1b18]">{product.category.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="flex flex-col gap-6">
              {initialRatings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {initialRatings.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-2xl bg-[#fcf9f5] p-5 ring-1 ring-[#eadfd4]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#1e1b18]">
                          {r.user?.name || "زبون فيورا"}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`size-3.5 ${
                                idx < r.stars
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-[#ede5da]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="mt-2 text-xs text-[#4a443e] leading-relaxed">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#ede5da] p-8 text-center text-xs text-[#80766b]">
                  لا توجد تقييمات لهذا المنتج حتى الآن. كن أول من يقيّم بعد استلام الطلب!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── 4. Related Products ─── */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-[#ede5da] pt-12">
          <div className="flex items-center justify-between pb-6">
            <h2 className="text-xl font-black text-[#1e1b18]">منتجات مشابهة قد تعجبك</h2>
            <Link
              href={`/products?categoryId=${product.category?.id || ""}`}
              className="text-xs font-bold text-[#7d1d29] hover:underline flex items-center gap-1"
            >
              <span>عرض المزيد</span>
              <ChevronLeft className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
