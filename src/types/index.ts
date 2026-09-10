export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  sizeGroup?: string | null;
  children?: Category[];
}

export interface ProductColor {
  hex: string;
  name: string;
}

export interface VariantSize {
  id: number;
  sizeId: number;
  name: string;
  stock: number;
  sku?: string | null;
}

export interface ProductVariant {
  id: number;
  colorHex: string;
  colorName: string;
  images: string[];
  sizes: VariantSize[];
}

export interface StoreSummary {
  id: number;
  name: string;
  logoUrl?: string | null;
  city?: string | null;
  ratingAvg?: number | string | null;
  ratingCount?: number;
}

export interface StoreDetail {
  id: number;
  ownerId?: number;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  ratingAvg?: number | string | null;
  ratingCount?: number;
  isActive?: boolean;
  status?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  categories?: {
    id: number;
    name: string;
    slug?: string;
    imageUrl?: string | null;
  }[];
}

export interface Product {
  id: number;
  name: string;
  price: string;
  compareAtPrice?: string | null;
  ratingAvg?: number | string | null;
  ratingCount?: number;
  isActive?: boolean;
  createdAt?: string;
  category?: {
    id: number;
    name: string;
    slug?: string;
    sizeGroup?: string | null;
  } | null;
  store?: StoreSummary | null;
  discountPercent?: number | null;
  image?: string | null;
  imageUrl?: string | null;
  colors?: ProductColor[];
  totalStock?: number;
  isFavorite?: boolean;
  favoritedAt?: string;
}

export interface ProductDetail extends Product {
  description?: string | null;
  brand?: string | null;
  material?: string | null;
  updatedAt?: string;
  variants: ProductVariant[];
}

export interface RatingItem {
  id: number;
  stars: number;
  comment?: string | null;
  createdAt: string;
  user?: {
    name: string;
    avatarUrl?: string | null;
  } | null;
}

export interface RatingsResponse {
  success: boolean;
  ratingAvg?: number | string | null;
  ratingCount: number;
  ratings: RatingItem[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: Pagination;
}

export interface StoresResponse {
  success: boolean;
  stores: StoreDetail[];
  pagination: Pagination;
}

/* ─── Cart Types ─── */

export interface CartProduct {
  id: number;
  name: string;
  price: string;
  image?: string | null;
}

export interface CartItem {
  id: number;
  variantSizeId: number;
  quantity: number;
  product: CartProduct;
  color?: {
    hex: string;
    name: string;
  } | null;
  size?: {
    id: number;
    name: string;
  } | null;
  stock?: number;
  lineTotal: string;
  isAvailable: boolean;
  issue?: string | null;
  issueMessage?: string | null;
}

export interface CartStore {
  id: number;
  name: string;
  logoUrl?: string | null;
  items: CartItem[];
  subtotal: string;
}

export interface CartSummary {
  itemsCount: number;
  totalQuantity: number;
  total: string;
  storesCount: number;
  unavailableCount: number;
}

export interface CartData {
  stores: CartStore[];
  summary: CartSummary;
}

export interface CartResponse {
  success: boolean;
  cart: CartData;
}
