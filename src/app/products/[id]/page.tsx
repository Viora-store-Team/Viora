import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Product, ProductDetail, RatingItem } from "@/types";
import ProductDetailView from "@/components/products/ProductDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProductData(id: string) {
  try {
    const [prodRes, ratingsRes] = await Promise.all([
      apiFetch(`/products/${id}`),
      apiFetch(`/products/${id}/ratings?limit=10`),
    ]);

    if (!prodRes.success || !prodRes.product) {
      return null;
    }

    const product = prodRes.product as ProductDetail;
    const ratings = (ratingsRes.ratings || []) as RatingItem[];

    // Fetch related products from same category if available
    let related: Product[] = [];
    if (product.category?.id) {
      const relRes = await apiFetch(`/products?categoryId=${product.category.id}&limit=5`);
      if (relRes.success && Array.isArray(relRes.products)) {
        related = (relRes.products as Product[]).filter((p) => p.id !== product.id);
      }
    }

    return {
      product,
      ratings,
      related,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await apiFetch(`/products/${id}`);
    if (res.success && res.product) {
      const p = res.product as ProductDetail;
      return {
        title: `${p.name} | فيورا (Viora)`,
        description: p.description || `تسوّق ${p.name} من متجر ${p.store?.name || "فيورا"} بأفضل الأسعار.`,
      };
    }
  } catch {}

  return {
    title: "تفاصيل المنتج | فيورا (Viora)",
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getProductData(id);

  if (!data) {
    notFound();
  }

  return (
    <ProductDetailView
      product={data.product}
      initialRatings={data.ratings}
      relatedProducts={data.related}
    />
  );
}
