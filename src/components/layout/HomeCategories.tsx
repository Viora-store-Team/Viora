"use client";

import { Layers } from "lucide-react";
import CategoryCards from "./CategoryCards";

type Category = { id: number; name: string; imageUrl?: string | null };

export default function HomeCategories({ categories }: { categories: Category[] }) {
  return <CategoryCards categories={categories} allIcon={<Layers className="size-7" />} getHref={(category) => category ? `/products?categoryId=${category.id}` : "/products"} />;
}
