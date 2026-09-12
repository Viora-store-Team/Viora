"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ChevronLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Package,
  RotateCcw,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";
import { apiFetch, getCustomerToken } from "@/lib/api";
import Alert from "@/components/ui/Alert";
import { useToast } from "@/context/ToastContext";
import { strings } from "@/lib/strings";

interface StoreOrder {
  id: number;
  orderNumber: string;
  storeName: string;
  productName: string;
  colorSizeInfo?: string;
  price: string;
  date: string;
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "SHIPPING" | "DELIVERED" | "CANCELLED";
  imageUrl?: string;
}

const mockOrders: StoreOrder[] = [
  {
    id: 10245,
    orderNumber: "#10245",
    storeName: "متجر العصر",
    productName: "قميص بولو رجالي كلاسيكي",
    colorSizeInfo: "اللون: نبيتي | المقاس: M | الكمية: 1",
    price: "60.00",
    date: "11 أغسطس 2026",
    status: "SHIPPING",
    imageUrl: "/images/auth_banner.jpg",
  },
  {
    id: 18863,
    orderNumber: "#18863",
    storeName: "متجر الفخامة",
    productName: "حذاء رياضي مريح",
    colorSizeInfo: "اللون: رمادي وأبيض | المقاس: 42",
    price: "120.00",
    date: "5 أغسطس 2026",
    status: "CANCELLED",
    imageUrl: "/images/auth_banner.jpg",
  },
  {
    id: 10495,
    orderNumber: "#10495",
    storeName: "بوتيك الأناقة",
    productName: "فستان مخملي راقي",
    colorSizeInfo: "اللون: نبيتي | المقاس: L",
    price: "215.00",
    date: "12 يوليو 2026",
    status: "DELIVERED",
    imageUrl: "/images/auth_banner.jpg",
  },
];

export default function OrdersPage() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<StoreOrder[]>(mockOrders);
  const [filter, setFilter] = useState<"ALL" | "CURRENT" | "PREVIOUS" | "CANCELLED">("ALL");

  // Selected Order for Modal View or Tracking
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("غيرت رأيي");
  const [cancelNotes, setCancelNotes] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      router.push("/login?returnUrl=/orders");
      return;
    }

    apiFetch("/orders")
      .then((res) => {
        if (res.success && Array.isArray(res.orders)) {
          // Transform backend orders format
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const filteredOrders = orders.filter((o) => {
    if (filter === "CURRENT") return o.status === "SHIPPING" || o.status === "PENDING" || o.status === "PREPARING";
    if (filter === "PREVIOUS") return o.status === "DELIVERED";
    if (filter === "CANCELLED") return o.status === "CANCELLED";
    return true;
  });

  const handleCancelSubmit = async () => {
    if (!selectedOrder) return;
    setSubmittingCancel(true);

    setTimeout(() => {
      setSubmittingCancel(false);
      setShowCancelModal(false);

      // Update order status to CANCELLED locally
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: "CANCELLED" } : o))
      );

      toast.success("تم إرسال طلب إلغاء الطلب بنجاح.");
      setSelectedOrder(null);
    }, 1000);
  };

  const getStatusBadge = (status: StoreOrder["status"]) => {
    switch (status) {
      case "SHIPPING":
      case "PREPARING":
      case "PENDING":
        return (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700 border border-amber-200">
            {strings.orders.statusShipping}
          </span>
        );
      case "DELIVERED":
        return (
          <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-black text-green-700 border border-green-200">
            {strings.orders.statusDelivered}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-black text-red-700 border border-red-200">
            {strings.orders.statusCancelled}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 font-cairo dir-rtl text-right">
      {/* Header & Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#80766b] hover:text-[#7d1d29] transition"
        >
          <ArrowRight className="size-4" />
          <span>العودة للحساب</span>
        </Link>
        <h1 className="text-xl font-black text-[#1e1b18]">{strings.orders.title}</h1>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#80766b]">جاري تحميل الطلبات...</div>
      ) : orders.length === 0 ? (
        /* Empty State (Matching Image 2 Screen 3) */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#ede5da] bg-white p-12 text-center shadow-xs my-8 space-y-4">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-red-50 text-red-600">
            <XCircle className="size-10" />
          </div>
          <h2 className="text-lg font-black text-[#1e1b18]">
            {strings.orders.emptyOrdersTitle}
          </h2>
          <p className="text-xs text-[#80766b] max-w-xs">
            {strings.orders.emptyOrdersDesc}
          </p>
          <Link
            href="/products"
            className="rounded-2xl bg-[#7d1d29] px-8 py-3 text-xs font-black text-white shadow hover:bg-[#681822] transition"
          >
            {strings.orders.shopNowButton}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs Filter Bar (Matching Image 2) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "ALL", label: strings.orders.filterAll },
              { id: "CURRENT", label: strings.orders.filterCurrent },
              { id: "PREVIOUS", label: strings.orders.filterPrevious },
              { id: "CANCELLED", label: strings.orders.filterCancelled },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`rounded-2xl px-5 py-2.5 text-xs font-black transition shrink-0 ${
                  filter === tab.id
                    ? "bg-[#7d1d29] text-white shadow-md"
                    : "bg-white text-[#80766b] border border-[#ede5da] hover:bg-[#faf7f2]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders Cards List */}
          <div className="space-y-4">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="rounded-3xl border border-[#ede5da] bg-white p-5 shadow-xs space-y-4 hover:border-[#7d1d29]/30 transition"
              >
                <div className="flex items-center justify-between border-b border-[#ede5da] pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#1e1b18] ltr-nums">{ord.orderNumber}</span>
                    <span className="text-[#80766b]">• {ord.date}</span>
                  </div>
                  {getStatusBadge(ord.status)}
                </div>

                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-2xl overflow-hidden bg-[#faf7f2] border border-[#ede5da] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ord.imageUrl} alt={ord.productName} className="size-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-[#7d1d29] block truncate">{ord.storeName}</span>
                    <h3 className="text-xs font-black text-[#1e1b18] truncate mt-0.5">{ord.productName}</h3>
                    {ord.colorSizeInfo && (
                      <p className="text-[11px] text-[#80766b] mt-0.5">{ord.colorSizeInfo}</p>
                    )}
                  </div>
                  <div className="text-left shrink-0">
                    <span className="ltr-nums text-sm font-black text-[#7d1d29]">{ord.price} ₪</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#ede5da]">
                  {ord.status === "SHIPPING" || ord.status === "PENDING" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(ord);
                        setShowCancelModal(true);
                      }}
                      className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      {strings.orders.cancelOrderButton}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(ord)}
                    className="rounded-xl bg-[#faf7f2] border border-[#ede5da] px-4 py-2 text-xs font-black text-[#1e1b18] hover:bg-[#7d1d29] hover:text-white transition"
                  >
                    {strings.orders.trackTitle}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Cancel Order Reason Modal (Matching Image 3 Modal) ─── */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 py-8 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#ede5da] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#ede5da] pb-3 mb-4">
              <h3 className="text-base font-black text-[#1e1b18]">
                {strings.orders.cancelModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="text-[#80766b] hover:text-[#1e1b18] p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs font-bold text-[#1e1b18] mb-3">
              {strings.orders.cancelReasonSelect}
            </p>

            <div className="space-y-2 text-xs">
              {[
                strings.orders.reasonChangedMind,
                strings.orders.reasonFoundBetterPrice,
                strings.orders.reasonDeliveryDelay,
                strings.orders.reasonProductIssues,
                strings.orders.reasonOther,
              ].map((reason) => (
                <label
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${
                    cancelReason === reason
                      ? "border-[#7d1d29] bg-[#fdf0f2]"
                      : "border-[#ede5da] bg-[#faf7f2]"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancelReason === reason}
                    onChange={() => {}}
                    className="accent-[#7d1d29]"
                  />
                  <span className="font-bold text-[#1e1b18]">{reason}</span>
                </label>
              ))}
            </div>

            <div className="mt-4">
              <textarea
                rows={3}
                maxLength={300}
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder={strings.orders.otherReasonPlaceholder}
                className="w-full rounded-2xl border border-[#ede5da] bg-[#faf7f2] p-3 text-xs outline-none focus:border-[#7d1d29]"
              />
              <span className="block text-[10px] text-[#80766b] text-left mt-1">
                {cancelNotes.length}/300
              </span>
            </div>

            <button
              type="button"
              disabled={submittingCancel}
              onClick={handleCancelSubmit}
              className="mt-4 w-full rounded-2xl bg-[#7d1d29] py-3.5 text-xs font-black text-white shadow hover:bg-[#681822] disabled:opacity-50"
            >
              {submittingCancel ? "جاري الإرسال..." : strings.orders.sendCancelReport}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
