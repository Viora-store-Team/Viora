"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Package,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Store,
  X,
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
        className="relative grid size-9 place-items-center rounded-full text-[#4a443e] transition-all hover:bg-[#faf7f2] hover:text-[#7d1d29]"
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#7d1d29] text-[9px] font-black text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-[#ede5da] bg-white p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#ede5da] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#1e1b18]">الإشعارات</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#fdf0f2] px-2 py-0.5 text-[10px] font-black text-[#7d1d29]">
                  {unreadCount} جديد
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-bold text-[#7d1d29] hover:underline"
              >
                <CheckCheck className="size-3.5" />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#ede5da]/50">
            {loading ? (
              <div className="py-8 text-center text-xs text-[#80766b]">
                جاري جلب الإشعارات...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => {
                const isUnread = !notif.readAt;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition ${
                      isUnread
                        ? "bg-[#faf7f2]/80 hover:bg-[#fdf0f2]"
                        : "hover:bg-[#faf7f2]"
                    }`}
                  >
                    <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-white border border-[#ede5da] shadow-2xs mt-0.5">
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

                      <p className="mt-0.5 text-[11px] text-[#4a443e] leading-relaxed line-clamp-2">
                        {notif.body}
                      </p>

                      <span className="mt-1.5 text-[10px] text-[#80766b]">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="grid size-12 place-items-center rounded-full bg-[#faf7f2] text-[#80766b] mb-2">
                  <Bell className="size-6" />
                </div>
                <p className="text-xs font-bold text-[#1e1b18]">لا توجد إشعارات حالياً</p>
                <p className="text-[11px] text-[#80766b] mt-0.5">
                  ستصلك هنا تحديثات فورية عند قبول أو تجهيز أو توصيل طلباتك.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
