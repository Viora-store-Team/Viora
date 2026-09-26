"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Clock, Home, MapPin, Package, ShoppingBag, Store as StoreIcon, Truck } from "lucide-react";
import { apiFetch, getCustomerToken } from "@/lib/api";

const statusLabels: Record<string, string> = {
  PENDING: "قيد المراجعة",
  ACCEPTED: "تم قبول الطلب",
  PREPARING: "قيد التجهيز",
  SHIPPING: "في الطريق إليك",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
  REJECTED: "مرفوض",
};

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  ACCEPTED: "bg-blue-50 text-blue-700",
  PREPARING: "bg-blue-50 text-blue-700",
  SHIPPING: "bg-violet-50 text-violet-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
  REJECTED: "bg-red-50 text-red-700",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getCustomerToken()) {
      router.replace(`/login?returnUrl=/orders/${params.id}`);
      return;
    }

    apiFetch(`/orders/${params.id}`)
      .then((result) => {
        if (result.success && result.order) setOrder(result.order);
        else setError(result.message || "تعذر تحميل تفاصيل الطلب.");
      })
      .catch(() => setError("تعذر تحميل تفاصيل الطلب."))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) return <div className="py-24 text-center text-sm text-muted">جاري تحميل تفاصيل الطلب…</div>;
  if (error || !order) return <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-4 text-center"><Package className="size-10 text-brand" /><h1 className="mt-4 text-lg font-black text-[#241d19]">تعذر فتح الطلب</h1><p className="mt-2 text-sm text-muted">{error}</p><Link href="/profile" className="mt-5 rounded-xl bg-brand px-4 py-2.5 text-xs font-black text-white">العودة لطلباتي</Link></div>;

  const stores = Array.isArray(order.stores) ? order.stores : [];
  const address = order.address || {};

  return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
    <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-xs text-muted"><Link href="/" className="flex items-center gap-1 hover:text-brand"><Home className="size-3.5" />الرئيسية</Link><ChevronLeft className="size-3" /><Link href="/profile" className="hover:text-brand">حسابي</Link><ChevronLeft className="size-3" /><span className="font-bold text-[#241d19]">تفاصيل الطلب</span></nav>

    <section className="rounded-[1.75rem] border border-line bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-[#f5e5e7] text-brand"><ShoppingBag className="size-5" /></span><div><p className="text-[11px] font-bold text-[#8b8177]">تفاصيل الطلب</p><h1 className="mt-0.5 text-xl font-black text-[#241d19] ltr-nums">{order.orderNumber}</h1></div></div><div className="flex items-center gap-2 text-xs text-muted"><Clock className="size-4 text-brand" />{order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }) : ""}</div></div>

      <div className="mt-6 space-y-4">{stores.map((store: any) => { const items = Array.isArray(store.items) ? store.items : []; const status = store.status || "PENDING"; return <article key={store.id} className="overflow-hidden rounded-2xl border border-line"><div className="flex flex-wrap items-center justify-between gap-3 bg-[#fbf6f1] px-4 py-3"><div className="flex items-center gap-2"><StoreIcon className="size-4 text-brand" /><span className="text-sm font-black text-[#241d19]">{store.store?.name || store.storeName || "المتجر"}</span><span className="text-[10px] text-[#8b8177] ltr-nums">{store.orderNumber}</span></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusStyle[status] || "bg-gray-100 text-gray-700"}`}>{statusLabels[status] || status}</span></div><div className="divide-y divide-[#f0e8df] px-4">{items.map((item: any, index: number) => { const productName = item.productName || item.name || item.product?.name || "منتج"; const color = item.colorName || item.color?.name; const size = item.sizeName || item.size?.name; return <div key={item.id || index} className="flex items-center justify-between gap-4 py-3.5"><div className="min-w-0"><p className="truncate text-xs font-black text-[#241d19]">{productName}</p>{(color || size) && <p className="mt-1 text-[11px] text-muted">{[color, size].filter(Boolean).join(" · ")}</p>}<p className="mt-1 text-[10px] text-[#8b8177]">الكمية: {item.quantity || 1}</p></div><span className="shrink-0 text-xs font-black text-brand ltr-nums">{item.lineTotal || item.unitPrice || item.price || "0.00"} ₪</span></div>; })}</div><div className="flex items-center justify-between border-t border-line px-4 py-3 text-xs font-black"><span className="text-muted">إجمالي المتجر</span><span className="text-brand ltr-nums">{store.total} ₪</span></div></article>; })}</div>

      {(address.city || address.street) && <div className="mt-6 rounded-2xl bg-[#fbf6f1] p-4"><div className="flex items-center gap-2 text-xs font-black text-[#241d19]"><MapPin className="size-4 text-brand" />عنوان التوصيل</div><p className="mt-2 text-xs leading-6 text-[#746a63]">{[address.fullName, address.city, address.area, address.street, address.details].filter(Boolean).join(" - ")}</p></div>}

      <div className="mt-6 flex items-center justify-between border-t border-line pt-5"><Link href="/profile" className="text-xs font-bold text-brand hover:underline">العودة لطلباتي</Link><div className="flex items-center gap-2"><Truck className="size-4 text-brand" /><span className="text-lg font-black text-brand ltr-nums">{order.total} ₪</span></div></div>
    </section>
  </main>;
}
