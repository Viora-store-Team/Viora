"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  Clock,
  Home,
  LogOut,
  MapPin,
  Package,
  Plus,
  Save,
  ShoppingBag,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import {
  apiFetch,
  getCustomerToken,
  getCustomerUser,
  removeCustomerToken,
  setCustomerUser,
} from "@/lib/api";

interface OrderStore {
  id: number;
  orderNumber: string;
  status: string;
  total: string;
  store: {
    id: number;
    name: string;
    logoUrl?: string | null;
  };
}

interface OrderGroup {
  id: number;
  orderNumber: string;
  total: string;
  createdAt: string;
  stores: OrderStore[];
  summary?: {
    itemsCount: number;
    storesCount: number;
  };
}

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

export default function ProfilePage() {
  const router = useRouter();

  // Tab: "profile" | "orders" | "addresses"
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("orders");

  // User State
  const [user, setUser] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<OrderGroup[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // New Address inline form
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [addrLabel, setAddrLabel] = useState("البيت");
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrCity, setAddrCity] = useState("غزة");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrDetails, setAddrDetails] = useState("");
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      router.push("/login?returnUrl=/profile");
      return;
    }

    // Load Profile
    apiFetch("/auth/me").then((res) => {
      if (res.success && res.user) {
        setUser(res.user);
        setName(res.user.name || "");
        setPhone(res.user.phone || "");
        setCustomerUser(res.user);
      }
    });

    // Load Orders
    setLoadingOrders(true);
    apiFetch("/orders?limit=20").then((res) => {
      setLoadingOrders(false);
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      }
    });

    // Load Addresses
    setLoadingAddresses(true);
    apiFetch("/addresses").then((res) => {
      setLoadingAddresses(false);
      if (res.success && Array.isArray(res.addresses)) {
        setAddresses(res.addresses);
      }
    });
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSavingProfile(true);
    setProfileMsg(null);

    const res = await apiFetch("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim() || undefined,
      }),
    });

    setSavingProfile(false);

    if (res.success && res.user) {
      setUser(res.user);
      setCustomerUser(res.user);
      setProfileMsg("تم حفظ التعديلات بنجاح!");
      setTimeout(() => setProfileMsg(null), 3000);
    } else {
      alert(res.message || "تعذر حفظ التعديلات");
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName.trim() || !addrPhone.trim() || !addrCity.trim() || !addrStreet.trim()) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setSavingAddr(true);
    const addressPayload = {
      label: addrLabel.trim() || "البيت",
      fullName: addrName.trim(),
      phone: addrPhone.trim(),
      city: addrCity.trim(),
      street: addrStreet.trim(),
      ...(addrDetails.trim() ? { details: addrDetails.trim() } : {}),
    };

    const res = await apiFetch("/addresses", {
      method: "POST",
      body: JSON.stringify(addressPayload),
    });

    setSavingAddr(false);

    if (res.success && res.address) {
      setAddresses((prev) => [res.address, ...prev]);
      setShowAddAddr(false);
      setAddrName("");
      setAddrPhone("");
      setAddrStreet("");
      setAddrDetails("");
    } else {
      alert(res.message || "تعذر إضافة العنوان");
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنوان؟")) return;
    const res = await apiFetch(`/addresses/${id}`, { method: "DELETE" });
    if (res.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleLogout = () => {
    removeCustomerToken();
    router.push("/");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "قيد المراجعة", color: "bg-amber-100 text-amber-800" };
      case "ACCEPTED":
        return { label: "تم القبول والتجهيز", color: "bg-blue-100 text-blue-800" };
      case "PREPARING":
        return { label: "قيد التجهيز", color: "bg-blue-100 text-blue-800" };
      case "SHIPPING":
        return { label: "في الطريق إليك", color: "bg-violet-100 text-violet-800" };
      case "DELIVERED":
        return { label: "تم التوصيل بنجاح", color: "bg-green-100 text-green-800" };
      case "CANCELLED":
        return { label: "ملغي", color: "bg-red-100 text-red-800" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      {/* ─── Breadcrumbs ─── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="flex items-center gap-1 hover:text-brand transition">
          <Home className="size-3.5" />
          <span>الرئيسية</span>
        </Link>
        <ChevronLeft className="size-3 text-line" />
        <span className="font-bold text-ink">حسابي</span>
      </nav>

      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#681822] px-6 py-7 text-white shadow-[0_20px_45px_-28px_rgba(68,12,22,.65)] sm:px-8 sm:py-8">
        <div className="absolute -left-12 -top-16 -z-10 size-56 rounded-full bg-[#e5b47a]/15 blur-3xl" />
        <div className="absolute -bottom-24 right-[22%] -z-10 size-52 rounded-full border-[22px] border-white/10" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wide text-[#f4d4a2]">مساحتك الخاصة</p>
            <h1 className="mt-1.5 text-2xl font-black sm:text-3xl">أهلاً {user?.name || "بك"}</h1>
            <p className="mt-2 text-sm text-white/80">تابعي طلباتك، عناوين التوصيل وبيانات حسابك في مكان واحد.</p>
          </div>
          <div className="flex items-center gap-3 self-start rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:self-auto">
            <span className="grid size-12 place-items-center rounded-2xl bg-white text-lg font-black text-brand shadow-sm">{user?.name ? user.name[0] : "ز"}</span>
            <div><p className="text-sm font-black">{user?.name || "حسابي"}</p><p className="mt-0.5 text-[11px] text-white/70">عضو في فيورا</p></div>
          </div>
        </div>
      </section>

      <div className="mt-7 grid grid-cols-1 items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* ─── Sidebar Navigation ─── */}
        <aside className="rounded-[1.75rem] border border-line bg-white p-4 shadow-sm lg:sticky lg:top-24">
          {/* User Preview */}
          <div className="flex items-center gap-3 rounded-2xl bg-[#fbf6f1] p-3.5">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#f5e5e7] text-lg font-black text-brand">
              {user?.name ? user.name[0] : "ز"}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-black text-ink truncate">
                {user?.name || "حسابي"}
              </h2>
              <p className="mt-0.5 text-[11px] text-muted truncate ltr-nums text-left">{user?.email || "جاري تحميل بيانات الحساب…"}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-black transition ${
                activeTab === "orders"
                  ? "bg-brand text-white shadow-md shadow-brand/20"
                  : "text-copy hover:bg-[#fbf6f1] hover:text-brand"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="size-4" />
                <span>طلباتي</span>
              </div>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("addresses")}
              className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-black transition ${
                activeTab === "addresses"
                  ? "bg-brand text-white shadow-md shadow-brand/20"
                  : "text-copy hover:bg-[#fbf6f1] hover:text-brand"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4" />
                <span>دفتر العناوين</span>
              </div>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                {addresses.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-xs font-black transition ${
                activeTab === "profile"
                  ? "bg-brand text-white shadow-md shadow-brand/20"
                  : "text-copy hover:bg-[#fbf6f1] hover:text-brand"
              }`}
            >
              <User className="size-4" />
              <span>البيانات الشخصية</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50/50 px-3.5 py-3 text-xs font-black text-red-600 transition hover:bg-red-100"
            >
              <LogOut className="size-4" />
              <span>تسجيل الخروج</span>
            </button>
          </nav>
        </aside>

        {/* ─── Main Content (8 cols) ─── */}
        <main className="min-w-0">
          {/* ─── Tab: Orders ─── */}
          {activeTab === "orders" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between rounded-[1.5rem] border border-line bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#f5e5e7] text-brand"><ShoppingBag className="size-5" /></span>
                  <div>
                  <h1 className="text-xl font-black text-ink">طلباتي السابقة</h1>
                  <p className="mt-1 text-xs text-muted">متابعة وتفاصيل جميع طلبياتك على منصة فيورا</p>
                  </div>
                </div>
                <span className="rounded-xl bg-[#fbf6f1] px-3 py-2 text-xs font-black text-brand">{orders.length} طلب</span>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-muted">جاري جلب الطلبات...</div>
              ) : orders.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {orders.map((order) => (
                    <Link
                      href={`/orders/${order.id}`}
                      key={order.id}
                      className="group block overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-2xs transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-4">
                        <div className="flex items-center gap-2">
                          <Package className="size-4.5 text-brand" />
                          <span className="font-black text-sm text-ink ltr-nums">
                            {order.orderNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Clock className="size-3.5" />
                          <span>{new Date(order.createdAt).toLocaleDateString("ar-EG")}</span>
                        </div>
                      </div>

                      {/* Store-by-store details */}
                      <div className="mt-4 flex flex-col gap-3">
                        {order.stores.map((st) => {
                          const statusInfo = getStatusLabel(st.status);
                          return (
                            <div
                              key={st.id}
                              className="flex items-center justify-between rounded-2xl bg-canvas p-3 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-black text-ink">{st.store?.name}</span>
                                <span className="text-muted ltr-nums">({st.orderNumber})</span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className={`rounded-lg px-2.5 py-1 text-[11px] font-black ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                                <span className="ltr-nums font-black text-brand">
                                  {st.total} ₪
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total */}
                      <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-sm font-black">
                        <span className="text-muted text-xs">المجموع الكلي للطلبية:</span>
                        <span className="ltr-nums text-base text-brand">{order.total} ₪</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[#dfd2c5] bg-white p-12 text-center shadow-sm">
                  <span className="grid size-16 place-items-center rounded-2xl bg-[#f5e5e7] text-brand"><Package className="size-8" /></span>
                  <h3 className="mt-4 text-base font-black text-ink">لا توجد طلبات سابقة</h3>
                  <p className="mt-1 text-xs text-muted">لم تقم بعمل أي طلبات بعد.</p>
                  <Link
                    href="/products"
                    className="mt-6 rounded-2xl bg-brand px-6 py-2.5 text-xs font-black text-white shadow"
                  >
                    تصفح المنتجات
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ─── Tab: Addresses ─── */}
          {activeTab === "addresses" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between rounded-[1.5rem] border border-line bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#f5e5e7] text-brand"><MapPin className="size-5" /></span>
                  <div>
                  <h1 className="text-xl font-black text-ink">دفتر العناوين</h1>
                  <p className="mt-1 text-xs text-muted">إدارة عناوين التوصيل الخاصة بك</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAddr(!showAddAddr)}
                  className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-black text-white shadow"
                >
                  <Plus className="size-3.5" />
                  <span>إضافة عنوان جديد</span>
                </button>
              </div>

              {/* Add Address Form */}
              {showAddAddr && (
                <div className="rounded-3xl border-2 border-brand/30 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-black text-ink mb-4">إضافة عنوان جديد</h3>
                  <form onSubmit={handleCreateAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-ink mb-1">تسمية العنوان</label>
                      <input
                        type="text"
                        value={addrLabel}
                        onChange={(e) => setAddrLabel(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas p-2.5 outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-ink mb-1">اسم المستلم *</label>
                      <input
                        type="text"
                        required
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas p-2.5 outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-ink mb-1">رقم الجوال *</label>
                      <input
                        type="tel"
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        dir="ltr"
                        className="w-full rounded-xl border border-line bg-canvas p-2.5 outline-none focus:border-brand text-left"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-ink mb-1">المدينة *</label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas p-2.5 outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-ink mb-1">الشارع *</label>
                      <input
                        type="text"
                        required
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas p-2.5 outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-ink mb-1">تفاصيل إضافية</label>
                      <input
                        type="text"
                        value={addrDetails}
                        onChange={(e) => setAddrDetails(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas p-2.5 outline-none focus:border-brand"
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAddr(false)}
                        className="px-4 py-2 text-xs font-bold text-muted"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={savingAddr}
                        className="rounded-xl bg-brand px-6 py-2.5 text-xs font-black text-white shadow"
                      >
                        {savingAddr ? "جاري الحفظ..." : "حفظ العنوان"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Addresses List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex flex-col justify-between rounded-3xl border border-line bg-white p-5 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-ink">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="rounded-lg bg-brand-soft px-2 py-0.5 text-[10px] font-black text-brand">
                            الافتراضي
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs font-bold text-ink">{addr.fullName}</p>
                      <p className="mt-0.5 text-xs text-muted">{addr.city} - {addr.street}</p>
                      <p className="mt-0.5 text-xs text-muted ltr-nums text-left">{addr.phone}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-end border-t border-line/50 pt-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
                      >
                        <Trash2 className="size-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Tab: Profile Details ─── */}
          {activeTab === "profile" && (
            <div className="rounded-[1.75rem] border border-line bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 border-b border-line pb-5"><span className="grid size-11 place-items-center rounded-2xl bg-[#f5e5e7] text-brand"><User className="size-5" /></span><div><h1 className="text-xl font-black text-ink">تعديل البيانات الشخصية</h1><p className="mt-1 text-xs text-muted">حدّثي معلومات حسابك متى شئت.</p></div></div>

              {profileMsg && (
                <div className="mt-4 rounded-2xl bg-green-50 p-4 text-xs font-bold text-green-700 border border-green-200 flex items-center gap-2">
                  <Check className="size-4" />
                  <span>{profileMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="mt-6 flex flex-col gap-4 max-w-md text-xs">
                <div>
                  <label className="block font-bold text-ink mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-line bg-canvas p-3 text-xs outline-none focus:border-brand focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">البريد الإلكتروني (غير قابل للتعديل)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    dir="ltr"
                    className="w-full rounded-2xl border border-line bg-line/40 p-3 text-xs text-muted outline-none text-left cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">رقم الجوال</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0590000000"
                    dir="ltr"
                    className="w-full rounded-2xl border border-line bg-canvas p-3 text-xs outline-none focus:border-brand focus:bg-white text-left"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-xs font-black text-white shadow hover:bg-[#681822] disabled:opacity-50 w-fit px-8"
                >
                  <Save className="size-4" />
                  <span>{savingProfile ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
