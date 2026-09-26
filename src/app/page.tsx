import Link from "next/link";
import { ArrowLeft, ChevronLeft, Store as StoreIcon, Truck, ShieldCheck, Heart, ShoppingBag } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getPublishedBanners } from "@/lib/banners";
import HeroBannerSlider from "@/components/layout/HeroBannerSlider";
import HomeCategories from "@/components/layout/HomeCategories";
import GuestJoinBanner from "@/components/layout/GuestJoinBanner";
import ProductCard from "@/components/products/ProductCard";
import StoreCard from "@/components/stores/StoreCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { Product, StoreDetail } from "@/types";

interface Category { id: number; name: string; slug: string; imageUrl?: string | null; children?: Category[]; }
async function getHomeData() {
  const results = await Promise.allSettled([apiFetch("/categories"), apiFetch("/stores/featured?limit=6"), apiFetch("/products/best-selling?limit=8")]);
  const data = results.map((result) => result.status === "fulfilled" ? result.value : null);
  return { categories: (data[0]?.categories || []) as Category[], featuredStores: (data[1]?.stores || []) as StoreDetail[], bestSelling: (data[2]?.products || []) as Product[], productsUnavailable: !data[2] || data[2].success === false };
}
const benefits = [
  { icon: StoreIcon, title: "من متاجرنا المحلية", copy: "اكتشفي متاجر وأذواق جديدة" },
  { icon: Truck, title: "لحدّ باب بيتك", copy: "تابعي طلباتك في مكان واحد" },
  { icon: ShieldCheck, title: "تسوّقي براحة", copy: "تفاصيل واضحة قبل الطلب" },
  { icon: Heart, title: "على ذوقك", copy: "احفظي القطع اللي بتحبيها" },
];
export default async function HomePage() {
  const [{ categories, featuredStores, bestSelling, productsUnavailable }, banners] = await Promise.all([getHomeData(), getPublishedBanners()]);
  return <div className="v-home">
    <section className="v-container" aria-labelledby="home-heading">
      <div className="v-hero">
        <div className="v-hero-copy">
          <p className="v-eyebrow">فيورا · أزياء من متاجر قريبة منك</p>
          <h1 id="home-heading">ذوقك، حكايتك.<br /><span>اكتشفي اللي بيشبهك.</span></h1>
          <p>كل قطعة بتحكي عنك. اكتشفي الأزياء والإكسسوارات من المتاجر المحلية، واجمعي مفضّلاتك في مكان واحد.</p>
          <div className="v-hero-actions"><Link href="/products" className="v-button">اكتشفي المنتجات <ArrowLeft size={18} /></Link><Link href="/stores" className="v-button v-button-secondary">تصفّحي المتاجر</Link></div>
        </div>
        <div className="v-hero-art"><img src="/images/auth_banner.jpg" alt="إطلالة من عالم أزياء فيورا" fetchPriority="high" /></div>
      </div>
      <div className="v-benefits">{benefits.map(({ icon: Icon, title, copy }) => <div className="v-benefit" key={title}><Icon aria-hidden="true" /><div><h2>{title}</h2><p>{copy}</p></div></div>)}</div>
    </section>
    {categories.length > 0 && <section className="v-container"><SectionHeading eyebrow="لكل يوم، ولكل مناسبة" title="من وين نبدأ؟" description="اختاري القسم، واتركي الباقي لذوقك." href="/products" linkLabel="كل الأقسام" /><HomeCategories categories={categories} /></section>}
    <section className="v-container">
      <SectionHeading eyebrow="اختيارات تستحق الاكتشاف" title="الأكثر طلبًا" description="قطع محبوبة من متاجر فيورا." href="/products" linkLabel="كل المنتجات" />
      {bestSelling.length > 0 ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">{bestSelling.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="v-empty"><ShoppingBag className="size-8 text-brand" /><h3>{productsUnavailable ? "تعذّر تحميل المنتجات الآن" : "المنتجات الجديدة في الطريق"}</h3><p>{productsUnavailable ? "يمكنك المحاولة من صفحة المنتجات." : "تصفّحي المتاجر لاكتشاف التشكيلات المتاحة."}</p><Link href={productsUnavailable ? "/products" : "/stores"} className="v-text-link">{productsUnavailable ? "عرض المنتجات" : "اكتشفي المتاجر"}<ChevronLeft size={16} /></Link></div>}
    </section>
    {banners.length > 0 && <HeroBannerSlider banners={banners} />}
    {featuredStores.length > 0 && <section className="v-container"><SectionHeading eyebrow="قريبة منك، وقريبة من ذوقك" title="متاجر تستاهل زيارة" description="تعرّفي على المتاجر المميزة وتصفّحي تشكيلاتها." href="/stores" linkLabel="كل المتاجر" /><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{featuredStores.map((store) => <StoreCard key={store.id} store={{ ...store, isFeatured: true }} />)}</div></section>}
    <GuestJoinBanner />
  </div>;
}
