import { Metadata } from "next";
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
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-[#fdf0f2] text-[#7d1d29]">
          <Package className="size-8" />
        </div>
        <h1 className="mt-4 text-xl font-black text-[#1e1b18]">
          المنتج غير موجود أو غير متاح حالياً
        </h1>
        <p className="mt-2 text-xs text-[#80766b] leading-relaxed">
          عذراً، قد يكون هذا المنتج تم حذفه من قبل المتجر أو لم يعد متوفراً للبيع.
        </p>
        <Link
          href="/products"
          className="mt-6 flex items-center gap-2 rounded-xl bg-[#7d1d29] px-5 py-2.5 text-xs font-black text-white shadow hover:bg-[#681822] transition"
        >
          <ArrowRight className="size-4" />
          <span>تصفح باقي المنتجات</span>
        </Link>
      </div>
    );
  }

  return (
    <ProductDetailView
      product={data.product}
      initialRatings={data.ratings}
      relatedProducts={data.related}
    />
  );
}
