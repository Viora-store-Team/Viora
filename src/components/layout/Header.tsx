"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User, X, Sparkles, Wallet } from "lucide-react";
import { apiFetch, getCustomerToken } from "@/lib/api";
import NotificationsDropdown from "./NotificationsDropdown";
import { strings } from "@/lib/strings";

const links = [
  { href: "/", label: strings.nav.home },
  { href: "/products", label: strings.nav.products },
  { href: "/stores", label: strings.nav.stores },
  { href: "/products/offers", label: strings.nav.offers },
];

export default function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refresh = () => {
      const token = getCustomerToken();
      setLoggedIn(Boolean(token));
      if (token) {
        apiFetch("/cart/count").then((result) => {
          if (result.success && typeof result.count === "number") {
            setCartCount(result.count);
          }
        });
      } else {
        try {
          const items = JSON.parse(localStorage.getItem("viora_guest_cart") || "[]");
          setCartCount(
            items.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 1), 0)
          );
        } catch {
          setCartCount(0);
        }
      }
    };
    refresh();
    window.addEventListener("viora_cart_updated", refresh);
    window.addEventListener("viora_auth_changed", refresh);
    return () => {
      window.removeEventListener("viora_cart_updated", refresh);
      window.removeEventListener("viora_auth_changed", refresh);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const active = (href: string) =>
    pathname ? (href === "/" ? pathname === "/" : pathname.startsWith(href)) : false;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#ede5da]/80 bg-[#faf7f2]/90 backdrop-blur-xl shadow-xs transition-all font-cairo dir-rtl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo & Brand */}
          <Link
            href="/"
            aria-label="فيورا - الصفحة الرئيسية"
            className="flex shrink-0 items-center gap-3 group"
          >
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-tr from-[#580b1e] via-[#7d1d29] to-[#c48b4e] p-2 text-white shadow-md shadow-[#7d1d29]/20 transition-transform group-hover:scale-105">
              <ShoppingBag className="size-6 text-[#fbf4ea]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-[#580b1e] via-[#7d1d29] to-[#c48b4e] bg-clip-text text-transparent drop-shadow-xs">
                {strings.brandEnglish}
              </span>
              <span className="text-[10px] font-bold text-[#80766b] -mt-1 tracking-wider">
                {strings.appName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1.5 lg:flex rounded-full bg-white/70 p-1.5 border border-[#ede5da] shadow-xs backdrop-blur-md">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-5 py-2 text-xs font-black transition-all duration-200 ${
                  active(link.href)
                    ? "bg-gradient-to-r from-[#7d1d29] to-[#580b1e] text-white shadow-md shadow-[#7d1d29]/25 scale-102"
                    : "text-[#4a443e] hover:bg-[#fdf0f2] hover:text-[#7d1d29]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Actions Bar */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="بحث"
              className="grid size-10 place-items-center rounded-2xl border border-[#ede5da] bg-white text-[#4a443e] transition-all hover:border-[#7d1d29]/40 hover:bg-[#fdf0f2] hover:text-[#7d1d29] hover:scale-105 active:scale-95"
            >
              <Search className="size-4.5" />
            </button>

            {/* Favorites Link */}
            <Link
              href="/favorites"
              aria-label="المفضلة"
              className="grid size-10 place-items-center rounded-2xl border border-[#ede5da] bg-white text-[#4a443e] transition-all hover:border-[#7d1d29]/40 hover:bg-[#fdf0f2] hover:text-[#7d1d29] hover:scale-105 active:scale-95"
            >
              <Heart className="size-4.5" />
            </Link>

            {/* Wallet Link */}
            <Link
              href="/wallet"
              aria-label={strings.nav.wallet}
              title={strings.nav.wallet}
              className="grid size-10 place-items-center rounded-2xl border border-[#ede5da] bg-white text-[#4a443e] transition-all hover:border-[#7d1d29]/40 hover:bg-[#fdf0f2] hover:text-[#7d1d29] hover:scale-105 active:scale-95"
            >
              <Wallet className="size-4.5 text-[#7d1d29]" />
            </Link>

            {/* Notifications Dropdown if Logged In */}
            {loggedIn && <NotificationsDropdown />}

            {/* Cart Link with Animated Badge */}
            <Link
              href="/cart"
              aria-label="السلة"
              className="relative grid size-10 place-items-center rounded-2xl border border-[#ede5da] bg-white text-[#4a443e] transition-all hover:border-[#7d1d29]/40 hover:bg-[#fdf0f2] hover:text-[#7d1d29] hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="size-4.5" />
              {cartCount > 0 && (
                <span className="absolute -left-1 -top-1 grid size-5 place-items-center rounded-full bg-[#7d1d29] text-[10px] font-black text-white ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Action */}
            {loggedIn ? (
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-2xl border border-[#ede5da] bg-white px-4 py-2 text-xs font-black text-[#1e1b18] shadow-2xs transition hover:border-[#7d1d29] hover:text-[#7d1d29] sm:flex hover:scale-102"
              >
                <User className="size-4 text-[#7d1d29]" />
                <span>{strings.nav.profile}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-2xl bg-gradient-to-r from-[#7d1d29] to-[#580b1e] px-5 py-2.5 text-xs font-black text-white shadow-md shadow-[#7d1d29]/20 transition duration-200 hover:opacity-95 hover:shadow-lg sm:block hover:scale-102 active:scale-98"
              >
                {strings.nav.login}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="القائمة"
              className="grid size-10 place-items-center rounded-2xl border border-[#ede5da] bg-white text-[#4a443e] lg:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {menuOpen && (
          <div className="border-t border-[#ede5da] bg-white px-4 py-4 lg:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-center text-xs font-black transition ${
                    active(link.href)
                      ? "bg-[#7d1d29] text-white shadow-md"
                      : "bg-[#faf7f2] text-[#4a443e] hover:bg-[#fdf0f2] hover:text-[#7d1d29]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Full Screen Search Modal Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-start bg-black/60 px-4 pt-20 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <form
            onSubmit={submitSearch}
            className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl border border-[#ede5da] animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#80766b]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={strings.nav.searchPlaceholder}
                  className="h-13 w-full rounded-2xl bg-[#faf7f2] pr-12 pl-4 text-xs font-semibold text-[#1e1b18] outline-none border border-[#ede5da] transition focus:border-[#7d1d29] focus:bg-white text-right dir-rtl"
                />
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="إغلاق"
                className="grid size-11 place-items-center rounded-2xl bg-[#faf7f2] text-[#7d1d29] border border-[#ede5da] hover:bg-[#fdf0f2]"
              >
                <X className="size-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
