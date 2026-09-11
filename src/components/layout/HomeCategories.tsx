"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import HorizontalScroller from "./HorizontalScroller";

type Category = { id: number; name: string; imageUrl?: string | null };

export default function HomeCategories({ categories }: { categories: Category[] }) {
  return <HorizontalScroller className="cursor-grab active:cursor-grabbing"><Link href="/products" className="group flex w-20 shrink-0 snap-start flex-col items-center gap-2 text-[#7d1d29]"><span className="grid size-16 place-items-center rounded-2xl bg-[#7d1d29] text-white"><Layers className="size-6" /></span><span className="w-full truncate text-center text-[11px] font-bold">الكل</span></Link>{categories.map((category) => <Link key={category.id} href={`/products?categoryId=${category.id}`} className="group flex w-20 shrink-0 snap-start flex-col items-center gap-2 text-[#4a443e] hover:text-[#7d1d29]"><span className="size-16 overflow-hidden rounded-2xl bg-[#f1e8dc] ring-2 ring-transparent transition group-hover:ring-[#d9cdbd]">{category.imageUrl ? <img src={category.imageUrl} alt={category.name} className="size-full object-cover" /> : <span className="grid size-full place-items-center text-lg font-black text-[#7d1d29]">{category.name.slice(0, 1)}</span>}</span><span className="w-full truncate text-center text-[11px] font-bold">{category.name}</span></Link>)}</HorizontalScroller>;
}
