"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Store as StoreIcon } from "lucide-react";
import { Product } from "@/types";
import { apiFetch, getCustomerToken } from "@/lib/api";
import VioraToast from "@/components/layout/VioraToast";

export default function ProductCard({ product }: { product: Product }) {
  const [isFav, setIsFav] = useState(Boolean(product.isFavorite));
  const [favLoading, setFavLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const image = imageError ? null : product.image || product.imageUrl;
  const outOfStock = product.totalStock !== undefined && product.totalStock <= 0;

  const showToast = (message: string, type: "success" | "error") => { setToast({ message, type }); window.setTimeout(() => setToast(null), 3500); };
  const toggleFavorite = async (event: React.MouseEvent) => {
    event.preventDefault(); event.stopPropagation();
    if (!getCustomerToken()) { showToast("يرجى تسجيل الدخول لإضافة المنتج إلى المفضلة", "error"); return; }
    if (favLoading) return;
    const next = !isFav; setFavLoading(true); setIsFav(next);
    try {
      const result = await apiFetch(`/favorites/${product.id}`, { method: next ? "POST" : "DELETE" });
      if (!result.success) { setIsFav(!next); showToast(result.message || "تعذر تحديث المفضلة، حاولي مرة أخرى", "error"); } else { showToast(next ? "تمت إضافة المنتج إلى المفضلة" : "تمت إزالة المنتج من المفضلة", "success"); }
    } catch { setIsFav(!next); showToast("تعذر تحديث المفضلة، حاولي مرة أخرى", "error"); } finally { setFavLoading(false); }
  };

  return <><article className="group relative min-w-0 overflow-hidden rounded-[1.35rem] bg-white ring-1 ring-[#e9e1d7] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_-22px_rgba(45,24,26,.55)]">
    <Link href={`/products/${product.id}`} className="relative block aspect-[4/4.35] overflow-hidden bg-[#f3eee8]">
      {image ? <img src={image} alt={product.name} onError={() => setImageError(true)} className="size-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" /> : <div className="grid size-full place-items-center text-xs text-[#80766b]">لا توجد صورة</div>}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />
      {product.discountPercent && product.discountPercent > 0 && <span className="absolute right-3 top-3 rounded-full bg-[#7d1d29] px-2.5 py-1 text-[10px] font-black text-white">خصم {product.discountPercent}%</span>}
      {outOfStock && <span className="absolute inset-x-4 bottom-3 rounded-xl bg-white/90 py-2 text-center text-[11px] font-black text-[#7d1d29] backdrop-blur">نفدت الكمية</span>}
    </Link>
    <button type="button" onClick={toggleFavorite} disabled={favLoading} aria-label={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"} className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-[#4a443e] shadow-sm transition hover:scale-105 hover:text-[#7d1d29] disabled:opacity-60"><Heart className={`size-4.5 ${isFav ? "fill-[#7d1d29] text-[#7d1d29]" : ""}`} /></button>
    <div className="p-3.5 sm:p-4">
      {product.store && <Link href={`/stores/${product.store.id}`} className="flex items-center gap-1 text-[11px] font-bold text-[#9b7140] hover:text-[#7d1d29]"><StoreIcon className="size-3" /><span className="truncate">{product.store.name}</span></Link>}
      <Link href={`/products/${product.id}`} className="mt-1.5 block truncate text-sm font-black text-[#1e1b18] transition group-hover:text-[#7d1d29]">{product.name}</Link>
      <div className="mt-3 flex min-h-4 items-center justify-between gap-2">{product.colors?.length ? <div className="flex -space-x-1.5 rtl:space-x-reverse">{product.colors.slice(0, 4).map((color) => <span key={`${color.hex}-${color.name}`} title={color.name} style={{ backgroundColor: color.hex }} className="size-3.5 rounded-full border-2 border-white" />)}{product.colors.length > 4 && <span className="mr-1 text-[10px] text-[#80766b]">+{product.colors.length - 4}</span>}</div> : <span className="text-[11px] text-[#80766b]">{product.category?.name || ""}</span>}<div className="flex items-baseline gap-1"><span className="ltr-nums text-base font-black text-[#7d1d29]">{product.price} ₪</span>{product.compareAtPrice && <span className="ltr-nums text-[10px] text-[#9b9289] line-through">{product.compareAtPrice}</span>}</div></div>
    </div>
  </article>{toast && <VioraToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</>;
}
