"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Store as StoreIcon } from "lucide-react";
import { Product } from "@/types";
import { apiFetch, getCustomerToken } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFav, setIsFav] = useState<boolean>(Boolean(product.isFavorite));
  const [favLoading, setFavLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const prodImg = imageError ? null : product.image || product.imageUrl;
  const store = product.store;
  const isOutOfStock = product.totalStock !== undefined && product.totalStock <= 0;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getCustomerToken();
    if (!token) {
      alert("يرجى تسجيل الدخول لإضافة المنتج إلى المفضلة");
      return;
    }

    if (favLoading) return;
    setFavLoading(true);

    const nextState = !isFav;
    setIsFav(nextState);

    try {
      if (nextState) {
        await apiFetch(`/favorites/${product.id}`, { method: "POST" });
      } else {
        await apiFetch(`/favorites/${product.id}`, { method: "DELETE" });
      }
    } catch {
      // Rollback on error
      setIsFav(!nextState);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#ede5da] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#7d1d29]/40 hover:shadow-lg">
      {/* ─── Image Container ─── */}
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square w-full overflow-hidden bg-[#faf7f2]"
      >
        {prodImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={prodImg}
            alt={product.name}
            onError={() => setImageError(true)}
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center p-4 text-center text-xs text-[#80766b]">
            لا توجد صورة
          </div>
        )}

        {/* Discount Badge */}
        {product.discountPercent && product.discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 rounded-lg bg-[#7d1d29] px-2.5 py-1 text-xs font-black text-white shadow-sm">
            %{product.discountPercent} خصم
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-2xs">
            <span className="rounded-xl bg-white/90 px-3 py-1 text-xs font-black text-[#7d1d29] shadow">
              نفدت الكمية
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={favLoading}
          aria-label={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          className="absolute top-2.5 left-2.5 grid size-9 place-items-center rounded-full bg-white/90 text-[#4a443e] backdrop-blur-md shadow-xs transition duration-200 hover:scale-110 hover:bg-white hover:text-[#7d1d29]"
        >
          <Heart
            className={`size-4.5 transition-colors ${
              isFav ? "fill-[#7d1d29] text-[#7d1d29]" : "text-[#4a443e]"
            }`}
          />
        </button>
      </Link>

      {/* ─── Content ─── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Store badge */}
        {store && (
          <div className="mb-1 flex items-center gap-1.5">
            <StoreIcon className="size-3 text-[#c48b4e]" />
            <Link
              href={`/stores/${store.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold text-[#80766b] transition-colors hover:text-[#7d1d29] truncate"
            >
              {store.name}
            </Link>
          </div>
        )}

        {/* Product Title */}
        <Link
          href={`/products/${product.id}`}
          className="text-sm font-black text-[#1e1b18] line-clamp-1 transition-colors group-hover:text-[#7d1d29]"
        >
          {product.name}
        </Link>

        {/* Category name if available */}
        {product.category && (
          <span className="mt-0.5 text-[11px] text-[#80766b] line-clamp-1">
            {product.category.name}
          </span>
        )}

        {/* Colors preview */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1">
            {product.colors.slice(0, 4).map((c, i) => (
              <span
                key={i}
                title={c.name}
                className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-[#80766b]">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price & Action */}
        <div className="mt-3 flex items-baseline justify-between border-t border-[#ede5da]/50 pt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="ltr-nums text-base font-black text-[#7d1d29]">
              {product.price} ₪
            </span>
            {product.compareAtPrice && (
              <span className="ltr-nums text-xs text-[#80766b] line-through">
                {product.compareAtPrice} ₪
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
