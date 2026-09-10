"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  Home,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Store as StoreIcon,
  Trash2,
  Truck,
} from "lucide-react";
import { CartData, CartItem } from "@/types";
import {
  clearAllCart,
  fetchFullCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/cart";
import { getCustomerToken } from "@/lib/api";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadCart = async () => {
    setLoading(true);
    try {
      const data = await fetchFullCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();

    const handleCartUpdated = () => {
      fetchFullCart().then((data) => setCart(data));
    };

    window.addEventListener("viora_cart_updated", handleCartUpdated);
    return () => {
      window.removeEventListener("viora_cart_updated", handleCartUpdated);
    };
  }, []);

  const handleUpdateQty = async (
    item: CartItem,
    newQty: number
  ) => {
    if (newQty < 1) return;
    if (item.stock !== undefined && newQty > item.stock) {
      showToast(`الكمية المتوفرة في المخزون هي ${item.stock} فقط`);
      return;
    }

    setActionLoading((prev) => ({ ...prev, [item.id]: true }));
    const res = await updateCartItemQuantity(item.id, item.variantSizeId, newQty);
    setActionLoading((prev) => ({ ...prev, [item.id]: false }));

    if (res.success && res.cart) {
      setCart(res.cart);
    } else if (!res.success) {
      showToast(res.message || "فشل تعديل الكمية");
    }
  };

  const handleRemove = async (item: CartItem) => {
    setActionLoading((prev) => ({ ...prev, [item.id]: true }));
    const res = await removeCartItem(item.id, item.variantSizeId);
    setActionLoading((prev) => ({ ...prev, [item.id]: false }));

    if (res.success && res.cart) {
      setCart(res.cart);
      showToast("تم حذف المنتج من السلة");
    } else if (!res.success) {
      showToast(res.message || "فشل حذف المنتج");
    }
  };

  const handleClearCart = async () => {
    if (!confirm("هل أنت متأكد من رغبتك في تفريغ سلة المشتريات بالكامل؟")) {
      return;
    }

    setIsClearing(true);
    const res = await clearAllCart();
    setIsClearing(false);

    if (res.success) {
      setCart({
        stores: [],
        summary: {
          itemsCount: 0,
          totalQuantity: 0,
          total: "0.00",
          storesCount: 0,
          unavailableCount: 0,
        },
      });
      showToast("تم إفراغ السلة بالكامل");
    } else {
      showToast(res.message || "تعذر إفراغ السلة");
    }
  };

  const handleCheckout = () => {
    const token = getCustomerToken();
    if (!token) {
      showToast("يرجى تسجيل الدخول أولاً لإتمام الطلب");
      return;
    }

    if (cart?.summary.unavailableCount && cart.summary.unavailableCount > 0) {
      showToast("يرجى إزالة الأصناف غير المتوفرة قبل إتمام الطلب");
      return;
    }

    router.push("/checkout");
  };

  const hasItems = cart && cart.stores.some((s) => s.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* ─── Toast Feedback ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-[#7d1d29] px-5 py-3 text-xs font-black text-white shadow-2xl">
          <Check className="size-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Breadcrumbs ─── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#80766b]">
        <Link href="/" className="flex items-center gap-1 hover:text-[#7d1d29] transition">
          <Home className="size-3.5" />
          <span>الرئيسية</span>
        </Link>
        <ChevronLeft className="size-3 text-[#ede5da]" />
        <span className="font-bold text-[#1e1b18]">سلة المشتريات</span>
      </nav>

      {/* ─── Page Title ─── */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1e1b18] sm:text-3xl">
            سلة المشتريات
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#80766b]">
            {loading
              ? "جاري مراجعة الأصناف..."
              : hasItems
              ? `لديك ${cart?.summary.totalQuantity} قطعة من ${cart?.summary.storesCount} متجر`
              : "سلتك خالية حالياً"}
          </p>
        </div>

        {hasItems && (
          <button
            type="button"
            onClick={handleClearCart}
            disabled={isClearing}
            className="flex items-center gap-1.5 rounded-xl border border-[#ede5da] bg-white px-3.5 py-2 text-xs font-bold text-[#80766b] transition hover:border-red-300 hover:text-red-600 disabled:opacity-50 w-fit"
          >
            <Trash2 className="size-3.5" />
            <span>{isClearing ? "جاري الإفراغ..." : "إفراغ السلة"}</span>
          </button>
        )}
      </div>

      {/* ─── Content ─── */}
      {loading ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 flex flex-col gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-[#ede5da] bg-white p-6 shadow-2xs animate-pulse"
              >
                <div className="h-4 w-1/4 rounded bg-[#ede5da]/70 mb-4" />
                <div className="flex gap-4 border-t border-[#ede5da]/50 pt-4">
                  <div className="size-20 rounded-2xl bg-[#ede5da]/50" />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="h-4 w-1/2 rounded bg-[#ede5da]/70" />
                    <div className="h-3 w-1/4 rounded bg-[#ede5da]/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4">
            <div className="h-64 rounded-3xl border border-[#ede5da] bg-white p-6 shadow-2xs animate-pulse" />
          </div>
        </div>
      ) : hasItems ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* ─── Items Column Grouped by Store (8 cols) ─── */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {cart.stores.map((storeGroup) => (
              <div
                key={storeGroup.id}
                className="overflow-hidden rounded-3xl border border-[#ede5da] bg-white shadow-2xs transition hover:shadow-md"
              >
                {/* Store Header */}
                <div className="flex items-center justify-between border-b border-[#ede5da] bg-[#faf7f2] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-xl border border-[#ede5da] bg-white text-[#c48b4e] shadow-2xs">
                      {storeGroup.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={storeGroup.logoUrl}
                          alt={storeGroup.name}
                          className="size-full rounded-xl object-cover"
                        />
                      ) : (
                        <StoreIcon className="size-4.5" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/stores/${storeGroup.id}`}
                        className="text-sm font-black text-[#1e1b18] hover:text-[#7d1d29] transition"
                      >
                        {storeGroup.name}
                      </Link>
                      <p className="text-[11px] text-[#80766b]">
                        {storeGroup.items.length} أصناف
                      </p>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-xs text-[#80766b]">مجموع المتجر:</span>
                    <span className="mr-1.5 ltr-nums text-sm font-black text-[#7d1d29]">
                      {storeGroup.subtotal} ₪
                    </span>
                  </div>
                </div>

                {/* Store Items List */}
                <div className="divide-y divide-[#ede5da]/60 p-6 flex flex-col gap-4">
                  {storeGroup.items.map((item) => {
                    const isBusy = actionLoading[item.id];
                    const isUnavailable = !item.isAvailable;

                    return (
                      <div
                        key={item.id}
                        className={`flex flex-col gap-4 pt-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between ${
                          isUnavailable ? "opacity-60" : ""
                        }`}
                      >
                        {/* Product Info & Thumb */}
                        <div className="flex items-center gap-4 flex-1">
                          <Link
                            href={`/products/${item.product.id}`}
                            className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-[#ede5da] bg-[#faf7f2]"
                          >
                            {item.product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-[10px] text-[#80766b]">
                                لا توجد صورة
                              </div>
                            )}
                          </Link>

                          <div className="flex flex-col">
                            <Link
                              href={`/products/${item.product.id}`}
                              className="text-sm font-black text-[#1e1b18] hover:text-[#7d1d29] transition line-clamp-1"
                            >
                              {item.product.name}
                            </Link>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#80766b]">
                              {item.color && (
                                <span className="flex items-center gap-1 font-medium">
                                  <span
                                    className="size-2.5 rounded-full border border-black/10"
                                    style={{ backgroundColor: item.color.hex }}
                                  />
                                  <span>{item.color.name}</span>
                                </span>
                              )}

                              {item.size && (
                                <span className="rounded-md bg-[#faf7f2] px-2 py-0.5 font-bold text-[#4a443e]">
                                  مقاس: {item.size.name}
                                </span>
                              )}
                            </div>

                            {/* Warning message if unavailable */}
                            {isUnavailable && (
                              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600">
                                <AlertTriangle className="size-3.5 shrink-0" />
                                <span>{item.issueMessage || "هذا الصنف لم يعد متوفراً"}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price & Quantity & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-[#ede5da]/40 pt-3 sm:border-0 sm:pt-0">
                          {/* Quantity selector */}
                          <div className="flex items-center rounded-xl border border-[#ede5da] bg-white shadow-2xs">
                            <button
                              type="button"
                              disabled={isBusy || item.quantity <= 1 || isUnavailable}
                              onClick={() => handleUpdateQty(item, item.quantity - 1)}
                              className="grid size-8 place-items-center text-[#4a443e] transition hover:text-[#7d1d29] disabled:opacity-30"
                              aria-label="تقليل الكمية"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="ltr-nums min-w-8 text-center text-xs font-black text-[#1e1b18]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={
                                isBusy ||
                                (item.stock !== undefined && item.quantity >= item.stock) ||
                                isUnavailable
                              }
                              onClick={() => handleUpdateQty(item, item.quantity + 1)}
                              className="grid size-8 place-items-center text-[#4a443e] transition hover:text-[#7d1d29] disabled:opacity-30"
                              aria-label="زيادة الكمية"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-left min-w-20">
                            <span className="ltr-nums text-base font-black text-[#7d1d29]">
                              {item.lineTotal} ₪
                            </span>
                          </div>

                          {/* Delete Item */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleRemove(item)}
                            className="grid size-8 place-items-center rounded-lg text-[#80766b] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                            aria-label="حذف العنصر"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ─── Order Summary Sidebar (4 cols) ─── */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="rounded-3xl border border-[#ede5da] bg-white p-6 shadow-2xs">
              <h2 className="text-base font-black text-[#1e1b18] border-b border-[#ede5da] pb-4">
                ملخص الطلب
              </h2>

              <div className="mt-4 flex flex-col gap-3 text-xs text-[#80766b]">
                <div className="flex items-center justify-between">
                  <span>عدد الأصناف:</span>
                  <span className="font-bold text-[#1e1b18]">
                    {cart.summary.itemsCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>إجمالي القطع:</span>
                  <span className="font-bold text-[#1e1b18]">
                    {cart.summary.totalQuantity}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>عدد المتاجر:</span>
                  <span className="font-bold text-[#1e1b18]">
                    {cart.summary.storesCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>الشحن والتوصيل:</span>
                  <span className="font-bold text-[#1e1b18]">
                    يُحسب عند الدفع
                  </span>
                </div>

                <div className="mt-2 rounded-2xl bg-[#faf7f2] p-3 text-[11px] leading-relaxed text-[#4a443e]">
                  💡 <strong>ملاحظة:</strong> يتم تقسيم الطلب تلقائياً لكل متجر لضمان تجهيز وتوصيل المنتجات بأسرع وقت.
                </div>

                {/* Grand Total */}
                <div className="mt-4 flex items-baseline justify-between border-t border-[#ede5da] pt-4">
                  <span className="text-sm font-black text-[#1e1b18]">المجموع الإجمالي:</span>
                  <span className="ltr-nums text-2xl font-black text-[#7d1d29]">
                    {cart.summary.total} ₪
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7d1d29] py-3.5 text-center text-sm font-black text-white shadow-md transition duration-200 hover:bg-[#681822] hover:shadow-lg"
              >
                <span>متابعة إتمام الطلب</span>
                <ArrowRight className="size-4 rotate-180" />
              </button>

              {/* Badges */}
              <div className="mt-6 flex flex-col gap-2.5 border-t border-[#ede5da] pt-4 text-[11px] text-[#80766b]">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="size-4 text-[#7d1d29]" />
                  <span>دفع آمن وحماية كاملة للمشتريات</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Truck className="size-4 text-[#7d1d29]" />
                  <span>توصيل مباشر من المتاجر المعتمدة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Empty Cart State ─── */
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-[#ede5da] bg-white p-12 text-center shadow-2xs">
          <div className="grid size-20 place-items-center rounded-full bg-[#fdf0f2] text-[#7d1d29]">
            <ShoppingBag className="size-10" />
          </div>
          <h2 className="mt-5 text-xl font-black text-[#1e1b18]">
            سلة المشتريات فارغة
          </h2>
          <p className="mt-2 max-w-sm text-xs text-[#80766b] leading-relaxed">
            لم تقم بإضافة أي منتجات إلى سلتك بعد. استكشف أحدث الأزياء والمنتجات المميزة من أفضل المتاجر!
          </p>
          <Link
            href="/products"
            className="mt-6 flex items-center gap-2 rounded-2xl bg-[#7d1d29] px-6 py-3 text-xs font-black text-white shadow-md transition hover:bg-[#681822]"
          >
            <ShoppingBag className="size-4" />
            <span>ابدأ التسوق الآن</span>
          </Link>
        </div>
      )}
    </div>
  );
}
