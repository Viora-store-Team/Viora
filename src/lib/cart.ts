import { apiFetch, getCustomerToken } from "./api";
import { CartData, CartItem, CartStore } from "@/types";

const GUEST_CART_KEY = "viora_guest_cart";

export interface GuestCartItem {
  variantSizeId: number;
  quantity: number;
  productId: number;
  productName: string;
  colorName?: string;
  sizeName?: string;
  price: string;
  image?: string | null;
  storeName?: string;
}

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: GuestCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("viora_cart_updated"));
  } catch {}
}

export async function fetchCartCount(): Promise<number> {
  const token = getCustomerToken();
  if (token) {
    try {
      const res = await apiFetch("/cart/count");
      if (res.success && typeof res.count === "number") {
        return res.count;
      }
    } catch {
      return 0;
    }
  }

  const guestItems = getGuestCart();
  return guestItems.reduce((sum, item) => sum + item.quantity, 0);
}

export async function addToCart(
  variantSizeId: number,
  quantity: number = 1,
  metadata?: {
    productId: number;
    productName: string;
    colorName?: string;
    sizeName?: string;
    price: string;
    image?: string | null;
    storeName?: string;
  }
): Promise<{ success: boolean; message?: string }> {
  const token = getCustomerToken();

  if (token) {
    const res = await apiFetch("/cart/items", {
      method: "POST",
      body: JSON.stringify({ variantSizeId, quantity }),
    });

    if (res.success) {
      window.dispatchEvent(new Event("viora_cart_updated"));
      return { success: true };
    }
    return { success: false, message: res.message || "فشلت إضافة المنتج إلى السلة" };
  }

  // Guest flow
  const cart = getGuestCart();
  const existingIdx = cart.findIndex((i) => i.variantSizeId === variantSizeId);

  if (existingIdx > -1) {
    cart[existingIdx].quantity += quantity;
  } else if (metadata) {
    cart.push({
      variantSizeId,
      quantity,
      productId: metadata.productId,
      productName: metadata.productName,
      colorName: metadata.colorName,
      sizeName: metadata.sizeName,
      price: metadata.price,
      image: metadata.image,
      storeName: metadata.storeName,
    });
  }

  saveGuestCart(cart);
  return { success: true };
}

export async function fetchFullCart(): Promise<CartData | null> {
  const token = getCustomerToken();

  if (token) {
    const res = await apiFetch("/cart");
    if (res.success && res.cart) {
      return res.cart as CartData;
    }
    return null;
  }

  // Build simulated CartData from guest cart
  const guestItems = getGuestCart();
  if (guestItems.length === 0) {
    return {
      stores: [],
      summary: {
        itemsCount: 0,
        totalQuantity: 0,
        total: "0.00",
        storesCount: 0,
        unavailableCount: 0,
      },
    };
  }

  // Group guest items by storeName
  const storeMap = new Map<string, CartItem[]>();

  guestItems.forEach((item, idx) => {
    const storeKey = item.storeName || "متجر فيورا";
    const lineTotal = (parseFloat(item.price) * item.quantity).toFixed(2);

    const cartItem: CartItem = {
      id: idx + 1, // simulated id
      variantSizeId: item.variantSizeId,
      quantity: item.quantity,
      product: {
        id: item.productId,
        name: item.productName,
        price: item.price,
        image: item.image,
      },
      color: item.colorName ? { hex: "#7d1d29", name: item.colorName } : null,
      size: item.sizeName ? { id: 0, name: item.sizeName } : null,
      lineTotal,
      isAvailable: true,
    };

    if (!storeMap.has(storeKey)) {
      storeMap.set(storeKey, []);
    }
    storeMap.get(storeKey)!.push(cartItem);
  });

  const stores: CartStore[] = [];
  let grandTotal = 0;
  let totalQty = 0;

  storeMap.forEach((items, storeName) => {
    const subtotal = items.reduce((sum, i) => sum + parseFloat(i.lineTotal), 0);
    grandTotal += subtotal;
    totalQty += items.reduce((sum, i) => sum + i.quantity, 0);

    stores.push({
      id: 1,
      name: storeName,
      items,
      subtotal: subtotal.toFixed(2),
    });
  });

  return {
    stores,
    summary: {
      itemsCount: guestItems.length,
      totalQuantity: totalQty,
      total: grandTotal.toFixed(2),
      storesCount: stores.length,
      unavailableCount: 0,
    },
  };
}

export async function updateCartItemQuantity(
  cartItemId: number,
  variantSizeId: number,
  newQuantity: number
): Promise<{ success: boolean; cart?: CartData; message?: string }> {
  const token = getCustomerToken();

  if (token) {
    const res = await apiFetch(`/cart/items/${cartItemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity: newQuantity }),
    });

    if (res.success && res.cart) {
      window.dispatchEvent(new Event("viora_cart_updated"));
      return { success: true, cart: res.cart };
    }
    return { success: false, message: res.message || "تعذر تعديل الكمية" };
  }

  // Guest
  const cart = getGuestCart();
  const target = cart.find((i) => i.variantSizeId === variantSizeId);
  if (target) {
    target.quantity = newQuantity;
    saveGuestCart(cart);
    const updated = await fetchFullCart();
    return { success: true, cart: updated || undefined };
  }

  return { success: false, message: "العنصر غير موجود" };
}

export async function removeCartItem(
  cartItemId: number,
  variantSizeId: number
): Promise<{ success: boolean; cart?: CartData; message?: string }> {
  const token = getCustomerToken();

  if (token) {
    const res = await apiFetch(`/cart/items/${cartItemId}`, {
      method: "DELETE",
    });

    if (res.success && res.cart) {
      window.dispatchEvent(new Event("viora_cart_updated"));
      return { success: true, cart: res.cart };
    }
    return { success: false, message: res.message || "تعذر حذف العنصر" };
  }

  // Guest
  const cart = getGuestCart();
  const nextCart = cart.filter((i) => i.variantSizeId !== variantSizeId);
  saveGuestCart(nextCart);
  const updated = await fetchFullCart();
  return { success: true, cart: updated || undefined };
}

export async function clearAllCart(): Promise<{ success: boolean; message?: string }> {
  const token = getCustomerToken();

  if (token) {
    const res = await apiFetch("/cart", { method: "DELETE" });
    if (res.success) {
      window.dispatchEvent(new Event("viora_cart_updated"));
      return { success: true };
    }
    return { success: false, message: res.message || "تعذر إفراغ السلة" };
  }

  saveGuestCart([]);
  return { success: true };
}
