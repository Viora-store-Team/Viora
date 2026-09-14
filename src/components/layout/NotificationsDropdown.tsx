"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Package,
  ShieldAlert,
  ShoppingBag,
  Store,
} from "lucide-react";
import { apiFetch, getCustomerToken } from "@/lib/api";

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any> | null;
  readAt?: string | null;
  createdAt: string;
}

export default function NotificationsDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch unread count on mount & interval
  const fetchCount = async () => {
    const token = getCustomerToken();
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await apiFetch("/notifications/count");
      if (res.success && typeof res.unread === "number") {
        setUnreadCount(res.unread);
      }
    } catch {}
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 45000); // 45s polling

    const onAuthChanged = () => fetchCount();
    window.addEventListener("viora_auth_changed", onAuthChanged);

    return () => {
      clearInterval(interval);
      window.removeEventListener("viora_auth_changed", onAuthChanged);
    };
  }, []);

  // 2. Fetch full list when opening dropdown
  const fetchList = async () => {
    const token = getCustomerToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await apiFetch("/notifications?limit=20");
      if (res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
        if (typeof res.unread === "number") {
          setUnreadCount(res.unread);
        }
      }
    } catch {}
    setLoading(false);
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchList();
    }
    setIsOpen(!isOpen);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Mark single notification as read
  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.readAt) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await apiFetch(`/notifications/${notif.id}/read`, { method: "PATCH" });
      } catch {}
    }

    setIsOpen(false);

    // Smart route navigation
    if (notif.data?.orderId || notif.type.startsWith("ORDER_")) {
      router.push("/profile");
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
    } catch {}
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "ORDER_ACCEPTED":
      case "ORDER_DELIVERED":
        return <Package className="size-4 text-green-600" />;
      case "ORDER_REJECTED":
      case "ORDER_CANCELLED":
        return <ShieldAlert className="size-4 text-red-600" />;
      case "STORE_APPROVED":
        return <Store className="size-4 text-[#7d1d29]" />;
      default:
        return <ShoppingBag className="size-4 text-[#c48b4e]" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("ar-EG", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="الإشعارات"
        aria-expanded={isOpen}
        className={`relative grid size-10 place-items-center rounded-2xl border transition-all active:scale-95 ${
          isOpen
            ? "border-[#7d1d29]/30 bg-[#fdf0f2] text-[#7d1d29] shadow-sm"
            : "border-[#ede5da] bg-white text-[#4a443e] hover:border-[#7d1d29]/40 hover:bg-[#fdf0f2] hover:text-[#7d1d29] hover:scale-105"
        }`}
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-5 h-5 items-center justify-center rounded-full border-2 border-[#faf7f2] bg-[#8d1f30] px-1 text-[9px] font-black text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <section
          aria-label="قائمة الإشعارات"
          className="fixed inset-x-3 top-[4.75rem] z-50 overflow-hidden rounded-[1.45rem] border border-[#eadfd4] bg-white shadow-[0_24px_60px_-30px_rgba(69,12,23,0.5)] animate-in fade-in zoom-in-95 duration-200 sm:absolute sm:inset-x-auto sm:left-0 sm:right-auto sm:top-full sm:mt-3 sm:w-80"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#ede5da] bg-[#fcf8f4] px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-[#f5e5e7] text-[#8d1f30]">
                <Bell className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-[#241d19]">الإشعارات</h2>
                <p className="mt-0.5 text-[10px] font-medium text-[#8b8177]">
                  {unreadCount > 0 ? "لديك تحديثات جديدة" : "تابعي آخر تحديثاتك"}
                </p>
              </div>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#8d1f30] px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-black text-[#7d1d29] transition hover:bg-[#f5e5e7]"
              >
                <CheckCheck className="size-3.5" />
                <span>قراءة الكل</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto p-2">
            {loading ? (
              <div className="space-y-2 px-1 py-2" aria-label="جاري تحميل الإشعارات">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl p-2.5">
                    <span className="size-9 animate-pulse rounded-xl bg-[#f4eee7]" />
                    <span className="flex-1 space-y-2">
                      <span className="block h-2.5 w-2/3 animate-pulse rounded-full bg-[#f4eee7]" />
                      <span className="block h-2 w-full animate-pulse rounded-full bg-[#f8f4ef]" />
                    </span>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => {
                const isUnread = !notif.readAt;
                return (
                  <button
                    type="button"
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`flex w-full items-start gap-3 rounded-2xl p-3 text-right transition ${
                      isUnread
                        ? "bg-[#fdf6f5] hover:bg-[#f8e9ea]"
                        : "hover:bg-[#faf7f2]"
                    }`}
                  >
                    <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-[#eadfd4] bg-white shadow-sm">
                      {getNotifIcon(notif.type)}
                    </div>

                    <div className="flex flex-1 flex-col overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-[#1e1b18] truncate">
                          {notif.title}
                        </span>
                        {isUnread && (
                          <span className="size-2 shrink-0 rounded-full bg-[#7d1d29]" />
                        )}
                      </div>

                      <p className="mt-1 text-[11px] leading-relaxed text-[#635a52] line-clamp-2">
                        {notif.body}
                      </p>

                      <span className="mt-1.5 text-[10px] font-medium text-[#9a9086]">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center px-7 py-8 text-center">
                <div className="relative mb-4 grid size-14 place-items-center rounded-2xl bg-[#f7eaeb] text-[#8d1f30] shadow-sm ring-8 ring-[#fcf7f3]">
                  <Bell className="size-6" strokeWidth={1.7} />
                </div>
                <p className="text-sm font-black text-[#241d19]">لا توجد إشعارات جديدة</p>
                <p className="mt-1.5 max-w-60 text-[11px] leading-6 text-[#8b8177]">
                  ستصل هنا تحديثات طلباتك وحالة التسليم فور صدورها.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
