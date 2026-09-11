import Link from "next/link";
import { ArrowUpLeft, MapPin, ShieldCheck, Sparkles, Star, Store as StoreIcon } from "lucide-react";
import { StoreDetail } from "@/types";

const brandSurfaces = [
  "bg-gradient-to-b from-[#8f2638] to-[#4a0e18] text-white",
  "bg-gradient-to-b from-[#2e557d] to-[#172d49] text-white",
  "bg-gradient-to-b from-[#b46135] to-[#71331d] text-white",
  "bg-gradient-to-b from-[#5b7865] to-[#294634] text-white",
  "bg-gradient-to-b from-[#6e4266] to-[#3d203a] text-white",
];

export default function StoreCard({ store }: { store: StoreDetail }) {
  const verified = store.status === "APPROVED" || store.isVerified;
  const surface = brandSurfaces[store.id % brandSurfaces.length];
  const categories = store.categories?.slice(0, 2) || [];

  return <article className="group grid min-h-44 grid-cols-[6.5rem_1fr] overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-[#e6ded4] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_38px_-25px_rgba(62,27,31,.55)] sm:grid-cols-[7.5rem_1fr]">
    <Link href={`/stores/${store.id}`} aria-label={`زيارة متجر ${store.name}`} className={`relative flex items-center justify-center p-4 ${surface}`}>
      <div className="grid size-16 place-items-center overflow-hidden rounded-[1.2rem] bg-white p-1 text-[#7d1d29] shadow-[0_10px_20px_-12px_rgba(41,25,21,.45)] sm:size-[4.5rem]">
        {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="size-full rounded-[1rem] object-contain" /> : <StoreIcon className="size-8 stroke-[2.25]" aria-label="شعار متجر افتراضي" />}
      </div>
      {store.isFeatured && <span className="absolute bottom-3 flex items-center gap-1 text-[10px] font-black text-[#ffe0a3]"><Sparkles className="size-3" />مميز</span>}
    </Link>
    <div className="flex min-w-0 flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-1.5"><Link href={`/stores/${store.id}`} className="truncate text-base font-black text-[#231f1c] transition group-hover:text-[#7d1d29]">{store.name}</Link>{verified && <ShieldCheck className="size-4 shrink-0 text-[#9f2735]" aria-label="متجر موثق" />}</div><p className="mt-1 h-9 text-xs leading-relaxed text-[#81766e] line-clamp-2">{store.description || "تسوّقي مختارات هذا المتجر على فيورا."}</p></div>{store.ratingAvg ? <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#514941]"><Star className="size-3.5 fill-[#c48b4e] text-[#c48b4e]" />{Number(store.ratingAvg).toFixed(1)}</span> : null}</div>
      <div className="mt-auto flex items-end justify-between gap-3 pt-3"><div className="flex min-w-0 flex-wrap gap-1.5">{categories.length ? categories.map((category) => <span key={category.id} className="max-w-24 truncate rounded-md bg-[#f8f5f1] px-2 py-1 text-[10px] font-bold text-[#746a63]">{category.name}</span>) : <span className="text-[11px] text-[#9b9289]">متجر محلي</span>}</div><div className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#8a6a45]">{store.city && <MapPin className="size-3.5" />}<span>{store.city || "فلسطين"}</span></div></div>
      <Link href={`/stores/${store.id}`} className="mt-3 flex items-center gap-1 border-t border-[#eee8e1] pt-3 text-xs font-black text-[#7d1d29]">اكتشفي المتجر <ArrowUpLeft className="size-3.5" /></Link>
    </div>
  </article>;
}
