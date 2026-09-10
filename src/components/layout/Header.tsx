"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Heart, Search, ShoppingBag, User, X, Menu } from "lucide-react";
import { apiFetch, getCustomerToken } from "@/lib/api";
import NotificationsDropdown from "./NotificationsDropdown";

export default function Header() {
  const [cartCount, setCartCount] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuthAndCart = () => {
      const token = getCustomerToken();
      setIsLoggedIn(!!token);

      if (token) {
        apiFetch("/cart/count")
          .then((res) => {
            if (res.success && typeof res.count === "number") {
              setCartCount(res.count);
            }
          })
          .catch(() => {});
      } else {
        try {
          const raw = localStorage.getItem("viora_guest_cart");
          const items = raw ? JSON.parse(raw) : [];
          setCartCount(items.reduce((s: number, i: any) => s + (i.quantity || 1), 0));
        } catch {
          setCartCount(0);
        }
      }
    };

    checkAuthAndCart();
    window.addEventListener("viora_cart_updated", checkAuthAndCart);
    window.addEventListener("viora_auth_changed", checkAuthAndCart);

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("viora_cart_updated", checkAuthAndCart);
      window.removeEventListener("viora_auth_changed", checkAuthAndCart);
    };
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navLinks = [
    { href: "/", label: "الرئيسية", active: true },
    { href: "/products", label: "المنتجات" },
    { href: "/stores", label: "المتاجر" },
    { href: "/products/offers", label: "العروض", highlight: true },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(255,255,255,0.97)"
            : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: scrolled
            ? "0 1px 40px rgba(125,29,41,0.08), 0 1px 0 rgba(237,229,218,0.8)"
            : "0 1px 0 rgba(237,229,218,0.6)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 shrink-0"
            aria-label="فيورا - الصفحة الرئيسية"
          >
            <span
              className="text-2xl font-black tracking-[0.2em] transition-all duration-300 group-hover:tracking-[0.25em]"
              style={{
                background: "linear-gradient(135deg, #7d1d29 0%, #c48b4e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              VIORA
            </span>
            <span
              className="hidden sm:block h-5 w-px"
              style={{ background: "linear-gradient(to bottom, transparent, #ede5da, transparent)" }}
            />
            <span className="hidden sm:block text-[10px] font-medium text-[#80766b] tracking-widest">
              منصة الأزياء
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  link.highlight
                    ? "text-[#7d1d29]"
                    : link.active
                    ? "text-[#1e1b18]"
                    : "text-[#6b6257] hover:text-[#1e1b18]"
                } hover:bg-[#faf7f2]`}
              >
                {link.label}
                {link.highlight && (
                  <span
                    className="absolute -top-1 -right-1 flex size-2 rounded-full"
                    style={{ background: "#7d1d29" }}
                  >
                    <span
                      className="absolute inline-flex size-full animate-ping rounded-full opacity-75"
                      style={{ background: "#7d1d29" }}
                    />
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(true)}
              className="grid size-9 place-items-center rounded-full text-[#4a443e] transition-all hover:bg-[#faf7f2] hover:text-[#7d1d29]"
              aria-label="بحث"
              suppressHydrationWarning
            >
              <Search className="size-4" />
            </button>

            {/* Favorites */}
            <Link
              href="/favorites"
              title="المفضلة"
              className="grid size-9 place-items-center rounded-full text-[#4a443e] transition-all hover:bg-[#faf7f2] hover:text-[#7d1d29]"
            >
              <Heart className="size-4" />
            </Link>

            {/* Notifications (if logged in) */}
            {isLoggedIn && <NotificationsDropdown />}

            {/* Cart */}
            <Link
              href="/cart"
              title="السلة"
              className="relative grid size-9 place-items-center rounded-full text-[#4a443e] transition-all hover:bg-[#faf7f2] hover:text-[#7d1d29]"
            >
              <ShoppingBag className="size-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 flex size-4 items-center justify-center rounded-full bg-[#7d1d29] text-[9px] font-black text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Button */}
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#ede5da] px-3 py-1.5 text-xs font-bold text-[#1e1b18] transition-all hover:border-[#7d1d29] hover:bg-[#fdf0f2] hover:text-[#7d1d29]"
              >
                <User className="size-3.5 text-[#7d1d29]" />
                <span>حسابي</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:block rounded-full px-5 py-2 text-xs font-black text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #7d1d29 0%, #9e2233 100%)",
                  boxShadow: "0 2px 12px rgba(125,29,41,0.3)",
                }}
              >
                دخول
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid size-9 place-items-center rounded-full text-[#4a443e] transition-all hover:bg-[#faf7f2] md:hidden"
              aria-label="القائمة"
              suppressHydrationWarning
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-[#ede5da] bg-white/98 px-4 pb-4 md:hidden">
            <nav className="flex flex-col gap-1 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    link.highlight
                      ? "text-[#7d1d29] bg-[#fdf0f2]"
                      : "text-[#1e1b18] hover:bg-[#faf7f2]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 rounded-xl px-4 py-3 text-center text-sm font-black text-[#7d1d29] bg-[#fdf0f2]"
                >
                  حسابي
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 rounded-xl px-4 py-3 text-center text-sm font-black text-white"
                  style={{ background: "linear-gradient(135deg, #7d1d29, #9e2233)" }}
                >
                  دخول
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Full-Screen Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
          style={{ background: "rgba(30,27,24,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl p-6 shadow-2xl"
            style={{ background: "#ffffff" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#1e1b18]">البحث في فيورا</h2>
              <button
                onClick={() => setSearchOpen(false)}
                className="grid size-9 place-items-center rounded-full bg-[#faf7f2] text-[#4a443e] hover:bg-[#fdf0f2] hover:text-[#7d1d29] transition"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحثي عن منتج أو متجر..."
                suppressHydrationWarning
                className="h-14 w-full rounded-2xl border-2 border-[#ede5da] bg-[#faf7f2] pr-5 pl-14 text-base text-[#1e1b18] placeholder:text-[#9c9184] focus:border-[#7d1d29] focus:bg-white focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-xl text-white transition hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7d1d29, #9e2233)" }}
              >
                <Search className="size-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
