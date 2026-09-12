"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Home,
  MapPin,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wallet as WalletIcon,
} from "lucide-react";
import { apiFetch, getCustomerToken } from "@/lib/api";
import { CartData } from "@/types";
import { fetchFullCart } from "@/lib/cart";
import Alert from "@/components/ui/Alert";
import { useToast } from "@/context/ToastContext";
import { strings } from "@/lib/strings";

interface Address {
  id: number;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  area?: string | null;
  street: string;
  details?: string | null;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Payment Method State: "COD" | "WALLET" (Matching Image 4)
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "WALLET">("WALLET");
  const [walletBalance, setWalletBalance] = useState(500.0);

  // New Address Form State
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [newLabel, setNewLabel] = useState("البيت");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCity, setNewCity] = useState("غزة");
  const [newArea, setNewArea] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  // Order Submission State
  const [placingOrder, setPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      router.push("/login?returnUrl=/checkout");
      return;
    }

    // Load Cart and Addresses simultaneously
    Promise.all([fetchFullCart(), apiFetch("/addresses")])
      .then(([cartData, addrRes]) => {
        setCart(cartData);

        if (addrRes.success && Array.isArray(addrRes.addresses)) {
          const list = addrRes.addresses as Address[];
          setAddresses(list);
          if (list.length > 0) {
            const defaultAddr = list.find((a) => a.isDefault) || list[0];
            setSelectedAddressId(defaultAddr.id);
          } else {
            setShowNewAddressModal(true);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newPhone.trim() || !newCity.trim() || !newStreet.trim()) {
      const msg = strings.auth.errors.requiredFields;
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setSavingAddress(true);

    const res = await apiFetch("/addresses", {
      method: "POST",
      body: JSON.stringify({
        label: newLabel,
        fullName: newFullName.trim(),
        phone: newPhone.trim(),
        city: newCity.trim(),
        area: newArea.trim() || null,
        street: newStreet.trim(),
        details: newDetails.trim() || null,
        isDefault: addresses.length === 0,
      }),
    });

    setSavingAddress(false);

    if (res.success && res.address) {
      const created = res.address as Address;
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddressId(created.id);
      setShowNewAddressModal(false);
      toast.success("تم إضافة عنوان التوصيل بنجاح!");

      setNewFullName("");
      setNewPhone("");
      setNewStreet("");
      setNewArea("");
      setNewDetails("");
    } else {
      const msg = res.message || "تعذر حفظ العنوان الجديد";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      const msg = strings.checkout.selectAddressPrompt;
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const cartTotal = parseFloat(cart?.summary.total || "0");
    if (paymentMethod === "WALLET" && walletBalance < cartTotal) {
      const msg = "رصيد المحفظة لا يكفي لشحن الطلب. يرجى شحن رصيد المحفظة أو اختيار الدفع عند الاستلام.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setPlacingOrder(true);
    setErrorMessage(null);

    const res = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
      }),
    });

    setPlacingOrder(false);

    if (res.success && res.order) {
      setPlacedOrder(res.order);
      if (paymentMethod === "WALLET") {
        setWalletBalance((prev) => prev - cartTotal);
      }
      toast.success(strings.checkout.orderConfirmedTitle);
      window.dispatchEvent(new Event("viora_cart_updated"));
    } else {
      const msg = res.message || "تعذر إتمام الطلب، يرجى مراجعة السلة وإعادة المحاولة.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // ─── Render Placed Order Success Screen ───
  if (placedOrder) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center font-cairo dir-rtl">
        <div className="grid size-20 place-items-center rounded-full bg-green-100 text-green-600 shadow-lg animate-in zoom-in-95">
          <CheckCircle2 className="size-12" />
        </div>

        <h1 className="mt-6 text-2xl font-black text-[#1e1b18]">
          {strings.checkout.orderConfirmedTitle}
        </h1>
        <p className="mt-2 text-xs text-[#80766b] leading-relaxed max-w-sm">
          {strings.checkout.orderConfirmedDesc}
        </p>

        {/* Order Details Summary Box */}
        <div className="mt-8 w-full rounded-3xl border border-[#ede5da] bg-white p-6 shadow-sm text-right">
          <div className="flex items-center justify-between border-b border-[#ede5da] pb-3 text-xs">
            <span className="text-[#80766b]">رقم الطلبية:</span>
            <span className="font-black text-[#7d1d29] ltr-nums text-sm">
              {placedOrder.orderNumber}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#ede5da] py-3 text-xs">
            <span className="text-[#80766b]">عدد المتاجر:</span>
            <span className="font-bold text-[#1e1b18]">
              {placedOrder.stores?.length || 1} متاجر
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#ede5da] py-3 text-xs">
            <span className="text-[#80766b]">طريقة الدفع:</span>
            <span className="font-bold text-[#1e1b18]">
              {paymentMethod === "WALLET" ? "المحفظة" : "الدفع عند الاستلام (COD)"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 text-sm font-black">
            <span className="text-[#1e1b18]">المجموع الإجمالي:</span>
            <span className="ltr-nums text-lg text-[#7d1d29]">
              {placedOrder.total} ₪
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="flex items-center gap-2 rounded-2xl bg-[#7d1d29] px-6 py-3.5 text-xs font-black text-white shadow hover:bg-[#681822] transition"
          >
            <ShoppingBag className="size-4" />
            <span>{strings.checkout.continueShopping}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 font-cairo dir-rtl text-right">
      {/* ─── Breadcrumbs ─── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#80766b]">
        <Link href="/" className="flex items-center gap-1 hover:text-[#7d1d29] transition">
          <Home className="size-3.5" />
          <span>{strings.nav.home}</span>
        </Link>
        <ChevronLeft className="size-3 text-[#ede5da]" />
        <Link href="/cart" className="hover:text-[#7d1d29] transition">
          {strings.nav.cart}
        </Link>
        <ChevronLeft className="size-3 text-[#ede5da]" />
        <span className="font-bold text-[#1e1b18]">{strings.checkout.title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#1e1b18] sm:text-3xl">
          {strings.checkout.title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#80766b]">
          {strings.checkout.subtitle}
        </p>
      </div>

      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage(null)}
          className="mb-6"
        />
      )}

      {loading ? (
        <div className="py-20 text-center text-xs text-[#80766b]">
          جاري مراجعة العناوين والسلة...
        </div>
      ) : !cart || cart.stores.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-[#ede5da] bg-white p-12 text-center shadow-xs">
          <ShoppingBag className="size-12 text-[#7d1d29]" />
          <h2 className="mt-4 text-lg font-black text-[#1e1b18]">
            سلة المشتريات فارغة
          </h2>
          <Link
            href="/products"
            className="mt-6 rounded-2xl bg-[#7d1d29] px-6 py-3 text-xs font-black text-white shadow"
          >
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Section: Shipping Address & Payment Selection */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Address Selection Card */}
            <div className="rounded-3xl border border-[#ede5da] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#ede5da] pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4.5 text-[#7d1d29]" />
                  <h2 className="text-base font-black text-[#1e1b18]">
                    {strings.checkout.shippingAddress}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewAddressModal(true)}
                  className="flex items-center gap-1 text-xs font-black text-[#7d1d29] hover:underline"
                >
                  <Plus className="size-3.5" />
                  <span>{strings.checkout.addNewAddress}</span>
                </button>
              </div>

              {/* Addresses List */}
              {addresses.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <label
                        key={addr.id}
                        className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition ${
                          isSelected
                            ? "border-[#7d1d29] bg-[#fdf0f2] shadow-xs"
                            : "border-[#ede5da] bg-white hover:border-[#80766b]"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="address"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="accent-[#7d1d29]"
                            />
                            <span className="text-xs font-black text-[#1e1b18]">
                              {addr.label || "عنوان"}
                            </span>
                          </div>
                          {addr.isDefault && (
                            <span className="rounded-lg bg-[#ede5da]/60 px-2 py-0.5 text-[10px] font-bold text-[#4a443e]">
                              الافتراضي
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-[#4a443e] leading-relaxed">
                          <p className="font-bold">{addr.fullName}</p>
                          <p className="text-[#80766b] mt-0.5">
                            {addr.city} - {addr.street} {addr.details ? `(${addr.details})` : ""}
                          </p>
                          <p className="text-[#80766b] mt-0.5 ltr-nums text-left">{addr.phone}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-[#ede5da] p-6 text-center text-xs text-[#80766b]">
                  {strings.checkout.noAddressNotice}
                </div>
              )}
            </div>

            {/* New Address Modal */}
            {showNewAddressModal && (
              <div className="rounded-3xl border-2 border-[#7d1d29]/30 bg-[#faf7f2] p-6 shadow-sm">
                <h3 className="text-sm font-black text-[#1e1b18] mb-4">
                  {strings.checkout.addNewAddress}
                </h3>
                <form onSubmit={handleCreateAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#1e1b18] mb-1">تسمية العنوان (البيت / العمل)</label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="البيت"
                      className="w-full rounded-xl border border-[#ede5da] bg-white p-2.5 outline-none focus:border-[#7d1d29]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1e1b18] mb-1">اسم المستلم الكامل *</label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="يوسف نعيم"
                      className="w-full rounded-xl border border-[#ede5da] bg-white p-2.5 outline-none focus:border-[#7d1d29]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1e1b18] mb-1">رقم جوال المستلم *</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="0590000000"
                      dir="ltr"
                      className="w-full rounded-xl border border-[#ede5da] bg-white p-2.5 outline-none focus:border-[#7d1d29] text-left"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1e1b18] mb-1">المدينة *</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="غزة / رام الله / القدس"
                      className="w-full rounded-xl border border-[#ede5da] bg-white p-2.5 outline-none focus:border-[#7d1d29]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1e1b18] mb-1">الشارع / المنطقة *</label>
                    <input
                      type="text"
                      required
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="شارع الشهداء / الرمال"
                      className="w-full rounded-xl border border-[#ede5da] bg-white p-2.5 outline-none focus:border-[#7d1d29]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1e1b18] mb-1">تفاصيل إضافية (رقم البناية / الطابق)</label>
                    <input
                      type="text"
                      value={newDetails}
                      onChange={(e) => setNewDetails(e.target.value)}
                      placeholder="عمارة النور - طابق 3"
                      className="w-full rounded-xl border border-[#ede5da] bg-white p-2.5 outline-none focus:border-[#7d1d29]"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-end gap-2 mt-2">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressModal(false)}
                        className="rounded-xl px-4 py-2 text-xs font-bold text-[#80766b] hover:bg-[#ede5da]/50"
                      >
                        إلغاء
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="rounded-xl bg-[#7d1d29] px-6 py-2.5 text-xs font-black text-white shadow hover:bg-[#681822] disabled:opacity-50"
                    >
                      {savingAddress ? "جاري الحفظ..." : "حفظ العنوان"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Payment Method Selector Card (Matching Image 4) */}
            <div className="rounded-3xl border border-[#ede5da] bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#ede5da] pb-4 mb-4">
                <CreditCard className="size-4.5 text-[#7d1d29]" />
                <h2 className="text-base font-black text-[#1e1b18]">
                  {strings.checkout.paymentMethodTitle}
                </h2>
              </div>
              <p className="text-xs text-[#80766b] mb-4">
                {strings.checkout.selectPaymentPrompt}
              </p>

              <div className="space-y-3">
                {/* Option 1: Wallet Payment */}
                <label
                  onClick={() => setPaymentMethod("WALLET")}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                    paymentMethod === "WALLET"
                      ? "border-[#7d1d29] bg-[#fdf0f2] shadow-xs"
                      : "border-[#ede5da] bg-white hover:border-[#80766b]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "WALLET"}
                      onChange={() => {}}
                      className="accent-[#7d1d29]"
                    />
                    <div className="grid size-10 place-items-center rounded-2xl bg-[#7d1d29] text-white">
                      <WalletIcon className="size-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-[#1e1b18]">
                        {strings.checkout.walletPaymentTitle}
                      </span>
                      <span className="text-[11px] text-[#80766b]">
                        {strings.checkout.walletPaymentSub}
                      </span>
                    </div>
                  </div>

                  <div className="text-left bg-white px-3 py-1.5 rounded-xl border border-[#ede5da]">
                    <span className="block text-[10px] text-[#80766b]">
                      {strings.checkout.availableBalance}
                    </span>
                    <span className="ltr-nums text-xs font-black text-[#7d1d29]">
                      {walletBalance.toFixed(2)} ₪
                    </span>
                  </div>
                </label>

                {/* Option 2: Cash On Delivery */}
                <label
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                    paymentMethod === "COD"
                      ? "border-[#7d1d29] bg-[#fdf0f2] shadow-xs"
                      : "border-[#ede5da] bg-white hover:border-[#80766b]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "COD"}
                      onChange={() => {}}
                      className="accent-[#7d1d29]"
                    />
                    <div className="grid size-10 place-items-center rounded-2xl bg-white border border-[#ede5da] text-[#7d1d29]">
                      <Truck className="size-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-[#1e1b18]">
                        {strings.checkout.codPaymentTitle}
                      </span>
                      <span className="text-[11px] text-[#80766b]">
                        {strings.checkout.codPaymentSub}
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Section: Order Summary (4 cols) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="rounded-3xl border border-[#ede5da] bg-white p-6 shadow-xs">
              <h2 className="text-base font-black text-[#1e1b18] border-b border-[#ede5da] pb-4">
                {strings.checkout.orderSummary}
              </h2>

              <div className="mt-4 flex flex-col gap-3 text-xs text-[#80766b]">
                <div className="flex items-center justify-between">
                  <span>{strings.checkout.itemsCount}</span>
                  <span className="font-bold text-[#1e1b18]">
                    {cart.summary.itemsCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>{strings.checkout.storesCount}</span>
                  <span className="font-bold text-[#1e1b18]">
                    {cart.summary.storesCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>{strings.checkout.deliveryFee}</span>
                  <span className="font-bold text-green-700">
                    {strings.checkout.freeDelivery}
                  </span>
                </div>

                {/* Grand Total */}
                <div className="mt-4 flex items-baseline justify-between border-t border-[#ede5da] pt-4">
                  <span className="text-sm font-black text-[#1e1b18]">{strings.checkout.grandTotal}</span>
                  <span className="ltr-nums text-2xl font-black text-[#7d1d29]">
                    {cart.summary.total} ₪
                  </span>
                </div>
              </div>

              {/* Confirm Order Button */}
              <button
                type="button"
                disabled={placingOrder || !selectedAddressId}
                onClick={handlePlaceOrder}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7d1d29] to-[#580b1e] py-3.5 text-center text-sm font-black text-white shadow-md transition duration-200 hover:opacity-95 hover:shadow-lg disabled:opacity-50"
              >
                <span>
                  {placingOrder
                    ? strings.checkout.confirmingOrder
                    : strings.checkout.confirmOrderButton}
                </span>
                <Check className="size-4.5" />
              </button>

              <div className="mt-6 flex flex-col gap-2 border-t border-[#ede5da] pt-4 text-[11px] text-[#80766b]">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="size-4 text-[#7d1d29]" />
                  <span>بياناتك وعنوانك محمية ومؤمنة بالكامل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
