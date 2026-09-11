"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { apiFetch, getCustomerToken } from "@/lib/api";
import NotificationsDropdown from "./NotificationsDropdown";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "المنتجات" },
  { href: "/stores", label: "المتاجر" },
  { href: "/products/offers", label: "العروض" },
];

export default function Header() {
  const pathname = usePathname(); const [cartCount, setCartCount] = useState(0); const [loggedIn, setLoggedIn] = useState(false); const [searchOpen, setSearchOpen] = useState(false); const [query, setQuery] = useState(""); const [menuOpen, setMenuOpen] = useState(false); const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const refresh = () => { const token = getCustomerToken(); setLoggedIn(Boolean(token)); if (token) apiFetch("/cart/count").then((result) => result.success && typeof result.count === "number" && setCartCount(result.count)); else { try { const items = JSON.parse(localStorage.getItem("viora_guest_cart") || "[]"); setCartCount(items.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 1), 0)); } catch { setCartCount(0); } } }; refresh(); window.addEventListener("viora_cart_updated", refresh); window.addEventListener("viora_auth_changed", refresh); return () => { window.removeEventListener("viora_cart_updated", refresh); window.removeEventListener("viora_auth_changed", refresh); }; }, []);
  useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); if (query.trim()) window.location.href = `/products?q=${encodeURIComponent(query.trim())}`; };
  return <><header className="sticky top-0 z-50 border-b border-[#eadfd4] bg-[#fffdfa]/95 backdrop-blur-xl"><div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
    <Link href="/" aria-label="فيورا - الصفحة الرئيسية" className="flex shrink-0 items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-[#f7ecec] p-1.5"><img src="/viora-mark.png" alt="" className="size-full object-contain" /></span><span className="text-xl font-black tracking-[0.15em] text-[#7d1d29]">VIORA</span></Link>
    <nav className="hidden items-center gap-1 lg:flex">{links.map((link) => <Link key={link.href} href={link.href} className={`rounded-xl px-4 py-2 text-xs font-bold transition ${active(link.href) ? "bg-[#7d1d29] text-white shadow-[0_6px_14px_-8px_rgba(125,29,41,.8)]" : "text-[#675d56] hover:bg-[#f8f1ea] hover:text-[#7d1d29]"}`}>{link.label}</Link>)}</nav>
    <div className="flex items-center gap-1"><button type="button" onClick={() => setSearchOpen(true)} aria-label="بحث" className="grid size-9 place-items-center rounded-xl text-[#554b44] transition hover:bg-[#f8f1ea] hover:text-[#7d1d29]"><Search className="size-4" /></button><Link href="/favorites" aria-label="المفضلة" className="grid size-9 place-items-center rounded-xl text-[#554b44] transition hover:bg-[#f8f1ea] hover:text-[#7d1d29]"><Heart className="size-4" /></Link>{loggedIn && <NotificationsDropdown />}<Link href="/cart" aria-label="السلة" className="relative grid size-9 place-items-center rounded-xl text-[#554b44] transition hover:bg-[#f8f1ea] hover:text-[#7d1d29]"><ShoppingBag className="size-4" />{cartCount > 0 && <span className="absolute -left-1 -top-1 grid size-4 place-items-center rounded-full bg-[#7d1d29] text-[9px] font-black text-white">{cartCount}</span>}</Link>{loggedIn ? <Link href="/profile" className="hidden items-center gap-1.5 rounded-xl border border-[#e7dcd2] px-3 py-2 text-xs font-bold text-[#554b44] transition hover:border-[#7d1d29] hover:text-[#7d1d29] sm:flex"><User className="size-3.5" />حسابي</Link> : <Link href="/login" className="hidden rounded-xl bg-[#7d1d29] px-4 py-2 text-xs font-black text-white transition hover:bg-[#651720] sm:block">دخول</Link>}<button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="القائمة" className="grid size-9 place-items-center rounded-xl text-[#554b44] lg:hidden"><Menu className="size-4" /></button></div>
  </div>{menuOpen && <div className="border-t border-[#eadfd4] bg-[#fffdfa] px-4 py-3 lg:hidden"><nav className="mx-auto grid max-w-7xl grid-cols-2 gap-2">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={`rounded-xl px-4 py-3 text-center text-sm font-bold ${active(link.href) ? "bg-[#7d1d29] text-white" : "bg-[#f8f1ea] text-[#554b44]"}`}>{link.label}</Link>)}</nav></div>}</header>
  {searchOpen && <div className="fixed inset-0 z-[100] grid place-items-start bg-[#2b0d13]/60 px-4 pt-24 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && setSearchOpen(false)}><form onSubmit={submitSearch} className="w-full max-w-xl rounded-[1.5rem] bg-white p-4 shadow-2xl"><div className="flex items-center gap-3"><div className="relative flex-1"><Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#80766b]" /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحثي عن منتج أو متجر..." className="h-12 w-full rounded-xl bg-[#faf6f1] pr-11 pl-4 text-sm outline-none ring-1 ring-transparent focus:ring-[#7d1d29]" /></div><button type="button" onClick={() => setSearchOpen(false)} aria-label="إغلاق البحث" className="grid size-10 place-items-center rounded-xl bg-[#f8f1ea] text-[#7d1d29]"><X className="size-4" /></button></div></form></div>}</>;
}
