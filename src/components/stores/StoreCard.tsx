import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Store as StoreIcon,
} from "lucide-react";
import { StoreDetail } from "@/types";

interface StoreCardProps {
  store: StoreDetail;
}

export default function StoreCard({ store }: StoreCardProps) {
  const isApproved = store.status === "APPROVED" || store.isVerified;
  const isPending = store.status === "PENDING";
  const isFeatured = Boolean(store.isFeatured);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#ede5da] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#7d1d29]/40 hover:shadow-lg">
      {/* ─── Top Banner/Cover ─── */}
      <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-[#7d1d29]/10 via-[#c48b4e]/10 to-[#7d1d29]/10">
        {store.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.coverUrl}
            alt=""
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}

        {/* Top Badges (Featured & Status) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isFeatured && (
            <span className="flex items-center gap-1 rounded-xl bg-[#c48b4e] px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
              <Sparkles className="size-3" />
              <span>مميز</span>
            </span>
          )}

          {isApproved ? (
            <span className="flex items-center gap-1 rounded-xl bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-black text-[#7d1d29] shadow-xs">
              <ShieldCheck className="size-3.5 text-[#7d1d29]" />
              <span>موثق</span>
            </span>
          ) : isPending ? (
            <span className="flex items-center gap-1 rounded-xl bg-amber-50/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-black text-amber-700 shadow-xs">
              <Clock className="size-3.5" />
              <span>قيد التوثيق</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="relative flex flex-1 flex-col px-5 pb-5 pt-0">
        {/* Logo floating over banner */}
        <div className="-mt-10 mb-3 flex items-end justify-between">
          <div className="relative grid size-20 place-items-center overflow-hidden rounded-2xl border-2 border-white bg-[#faf7f2] shadow-md">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="size-full object-cover"
              />
            ) : (
              <StoreIcon className="size-8 text-[#7d1d29]" />
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 rounded-xl bg-[#faf7f2] px-2.5 py-1 text-xs font-black text-[#1e1b18]">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span>
              {store.ratingAvg ? Number(store.ratingAvg).toFixed(1) : "جديد"}
            </span>
          </div>
        </div>

        {/* Store Name */}
        <Link
          href={`/stores/${store.id}`}
          className="text-base font-black text-[#1e1b18] group-hover:text-[#7d1d29] transition line-clamp-1"
        >
          {store.name}
        </Link>

        {/* Description */}
        {store.description ? (
          <p className="mt-1 text-xs text-[#80766b] line-clamp-2 leading-relaxed">
            {store.description}
          </p>
        ) : (
          <p className="mt-1 text-xs text-[#80766b]/60 italic">متجر مسجل على فيورا</p>
        )}

        {/* Categories Tags */}
        {store.categories && store.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {store.categories.slice(0, 3).map((cat) => (
              <span
                key={cat.id}
                className="rounded-lg bg-[#faf7f2] px-2.5 py-1 text-[11px] font-bold text-[#4a443e]"
              >
                {cat.name}
              </span>
            ))}
            {store.categories.length > 3 && (
              <span className="text-[10px] font-bold text-[#80766b]">
                +{store.categories.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer info & Link */}
        <div className="mt-4 flex items-center justify-between border-t border-[#ede5da]/50 pt-3 text-xs">
          {store.city ? (
            <span className="flex items-center gap-1 text-[#80766b] font-medium">
              <MapPin className="size-3.5 text-[#7d1d29]" />
              <span>{store.city}</span>
            </span>
          ) : (
            <span />
          )}

          <Link
            href={`/stores/${store.id}`}
            className="flex items-center gap-1 font-black text-[#7d1d29] hover:underline"
          >
            <span>زيارة المتجر</span>
            <ChevronLeft className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
