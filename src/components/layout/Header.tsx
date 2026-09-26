"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User, X, Wallet as WalletIcon } from "lucide-react";
import { apiFetch, getCustomerToken } from "@/lib/api";
import NotificationsDropdown from "./NotificationsDropdown";
import { strings } from "@/lib/strings";

const links = [
  { href: "/", label: strings.nav.home },
  { href: "/products", label: strings.nav.products },
  { href: "/stores", label: strings.nav.stores },
  { href: "/products/offers", label: strings.nav.offers },
];

const popularSearches = ["ملابس نسائية", "حقائب", "عطور", "أحذية"];

export default function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
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
        apiFetch("/favorites?limit=1").then((result) => {
          if (result.success && typeof result.pagination?.total === "number") {
            setFavoritesCount(result.pagination.total);
          } else {
            setFavoritesCount(0);
          }
        });
      } else {
        try {
          const items = JSON.parse(localStorage.getItem("viora_guest_cart") || "[]");
          setCartCount(
            Array.isArray(items)
              ? items.reduce((sum: number, i: any) => sum + (Number(i?.quantity) || 0), 0)
              : 0
          );
        } catch {
          setCartCount(0);
        }
        setFavoritesCount(0);
      }
    };

    refresh();
    window.addEventListener("viora_cart_updated", refresh);
    window.addEventListener("viora_favorites_updated", refresh);
    window.addEventListener("viora_auth_changed", refresh);
    return () => {
      window.removeEventListener("viora_cart_updated", refresh);
      window.removeEventListener("viora_favorites_updated", refresh);
      window.removeEventListener("viora_auth_changed", refresh);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const active = (href: string) =>
    pathname ? (href === "/" ? pathname === "/" : (href === "/products" ? pathname === "/products" || /^\/products\/\d/.test(pathname) : pathname.startsWith(href))) : false;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <>
      <header className="v-header sticky top-0 z-50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between gap-1.5 sm:gap-4 px-2.5 sm:px-6">
          {/* Logo & Brand */}
          <Link
            href="/"
            aria-label="فيورا - الصفحة الرئيسية"
            className="flex shrink-0 items-center gap-1.5 sm:gap-3 group"
          >
            <div className="grid size-9 sm:size-11 place-items-center rounded-xl sm:rounded-2xl bg-[#fdf7f5] p-1.5 sm:p-2 shadow-md shadow-brand/20 ring-1 ring-line transition-transform group-hover:scale-105">
              <img src="/viora-mark.png" alt="" className="size-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-[.15em] text-brand leading-tight">
                {strings.brandEnglish}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-muted -mt-0.5 sm:-mt-1 tracking-wider">
                {strings.appName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="التنقل الرئيسي" className="hidden items-center lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active(link.href) ? "page" : undefined}
                className="v-nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Actions Bar */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="بحث"
              className="grid size-8.5 sm:size-10 place-items-center rounded-xl sm:rounded-2xl border border-line bg-white text-copy transition-all hover:border-brand/40 hover:bg-brand-soft hover:text-brand hover:scale-105 active:scale-95"
            >
              <Search className="size-4 sm:size-4.5" />
            </button>

            {/* Favorites Link */}
            <Link
              href="/favorites"
              aria-label="المفضلة"
              className="relative grid size-8.5 sm:size-10 place-items-center rounded-xl sm:rounded-2xl border border-line bg-white text-copy transition-all hover:border-brand/40 hover:bg-brand-soft hover:text-brand hover:scale-105 active:scale-95"
            >
              <Heart className="size-4 sm:size-4.5" />
              {favoritesCount > 0 && (
                <span className="absolute -left-1 -top-1 grid min-w-4.5 h-4.5 place-items-center rounded-full bg-brand px-1 text-[9px] sm:text-[10px] font-black text-white ring-2 ring-canvas shadow-sm">
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              )}
            </Link>

            {/* Wallet Link */}
            <Link
              href="/wallet"
              aria-label="المحفظة"
              className="relative grid size-8.5 sm:size-10 place-items-center rounded-xl sm:rounded-2xl border border-line bg-white text-copy transition-all hover:border-brand/40 hover:bg-brand-soft hover:text-brand hover:scale-105 active:scale-95"
            >
              <WalletIcon className="size-4 sm:size-4.5 text-gold" />
            </Link>

            {/* Notifications Dropdown if Logged In */}
            {loggedIn && <NotificationsDropdown />}

            {/* Cart Link with Animated Badge */}
            <Link
              href="/cart"
              aria-label="السلة"
              className="relative grid size-8.5 sm:size-10 place-items-center rounded-xl sm:rounded-2xl border border-line bg-white text-copy transition-all hover:border-brand/40 hover:bg-brand-soft hover:text-brand hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="size-4 sm:size-4.5" />
              {cartCount > 0 && (
                <span className="absolute -left-1 -top-1 grid size-4.5 sm:size-5 place-items-center rounded-full bg-brand text-[9px] sm:text-[10px] font-black text-white ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Action */}
            {loggedIn ? (
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2 text-xs font-black text-ink shadow-2xs transition hover:border-brand hover:text-brand sm:flex hover:scale-102"
              >
                <User className="size-4 text-brand" />
                <span>{strings.nav.profile}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="v-button hidden sm:inline-flex"
              >
                {strings.nav.login}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="القائمة"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="grid size-8.5 sm:size-10 place-items-center rounded-xl sm:rounded-2xl border border-line bg-white text-copy lg:hidden"
            >
              {menuOpen ? <X className="size-4.5 sm:size-5" /> : <Menu className="size-4.5 sm:size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {menuOpen && (
          <div className="border-t border-line bg-white px-4 py-4 lg:hidden animate-in slide-in-from-top-2 duration-200">
            <nav id="mobile-navigation" aria-label="التنقل على الهاتف" className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-center text-xs font-black transition ${
                    active(link.href)
                      ? "bg-brand text-white shadow-md"
                      : "bg-canvas text-copy hover:bg-brand-soft hover:text-brand"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/wallet"
                onClick={() => setMenuOpen(false)}
                className={`rounded-2xl px-4 py-3 text-center text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  active("/wallet")
                    ? "bg-brand text-white shadow-md"
                    : "bg-canvas text-copy hover:bg-brand-soft hover:text-brand"
                }`}
              >
                <WalletIcon className="size-4 text-gold" />
                <span>{strings.nav.wallet}</span>
              </Link>
              <Link
                href={loggedIn ? "/profile" : "/login"}
                onClick={() => setMenuOpen(false)}
                className={`rounded-2xl px-4 py-3 text-center text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  active("/profile") || active("/login")
                    ? "bg-brand text-white shadow-md"
                    : "bg-canvas text-copy hover:bg-brand-soft hover:text-brand"
                }`}
              >
                <User className="size-4 text-brand" />
                <span>{loggedIn ? strings.nav.profile : strings.nav.login}</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Full Screen Search Modal Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#200509]/55 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <form
            onSubmit={submitSearch}
            role="search"
            className="w-full max-w-2xl rounded-[2rem] border border-line bg-[#fffdfb] p-5 shadow-[0_28px_80px_-24px_rgba(31,3,8,.65)] animate-in zoom-in-95 duration-200 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f5e5e7] text-brand">
                  <Search className="size-5" />
                </span>
                <div>
                  <h2 className="text-base font-black text-[#241d19] sm:text-lg">ابحثي عن كل ما يعجبك</h2>
                  <p className="mt-0.5 text-[11px] text-[#8b8177]">منتجات، متاجر أو أقسام فيورا</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="إغلاق البحث"
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-white text-brand transition hover:bg-brand-soft"
              >
                <X className="size-4.5" />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#dcc9c6] bg-white p-1.5 shadow-sm transition focus-within:border-brand focus-within:ring-4 focus-within:ring-[#f5e5e7]">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-[#8b8177]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="ابحثي عن منتج، متجر أو قسم"
                  placeholder="ابحثي عن منتج، متجر أو قسم..."
                  className="h-12 w-full bg-transparent pr-10 pl-2 text-right text-sm font-medium text-ink outline-none placeholder:text-[#a69b91]"
                />
              </div>
              <button
                type="submit"
                disabled={!query.trim()}
                className="h-12 rounded-xl bg-brand px-5 text-xs font-black text-white shadow-sm transition hover:bg-[#711624] disabled:cursor-not-allowed disabled:opacity-45"
              >
                بحث
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="ml-1 text-[11px] font-bold text-[#8b8177]">اقتراحات:</span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-full bg-[#f8f3ee] px-3 py-1.5 text-[11px] font-bold text-[#635a52] transition hover:bg-[#f5e5e7] hover:text-brand"
                >
                  {term}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
