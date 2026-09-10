/**
 * Viora Customer API Client
 * يتصل بالسيرفر الخلفي https://viora-backend-tuqg.onrender.com/api
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://viora-backend-tuqg.onrender.com/api";

const TOKEN_KEY = "viora_customer_token";
const USER_KEY = "viora_customer_user";
const PENDING_TOKEN_KEY = "viora_pending_token";

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getCustomerUser(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCustomerUser(user: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getPendingToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PENDING_TOKEN_KEY);
}

export function setPendingToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_TOKEN_KEY, token);
}

export function removeCustomerToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PENDING_TOKEN_KEY);
  window.dispatchEvent(new Event("viora_auth_changed"));
  window.dispatchEvent(new Event("viora_cart_updated"));
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getCustomerToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get("content-type");
    let data: any = {};
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = { message: await res.text() };
    }

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: data.message || `خطأ في الاتصال بالسيرفر (${res.status})`,
        ...data,
      };
    }

    return {
      success: true,
      status: res.status,
      ...data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "تعذر الاتصال بالسيرفر، تأكد من اتصال الإنترنت.",
    };
  }
}

/**
 * Merge local guest cart into customer server cart after successful login
 */
export async function syncGuestCartOnLogin() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("viora_guest_cart");
    const guestItems = raw ? JSON.parse(raw) : [];

    if (Array.isArray(guestItems) && guestItems.length > 0) {
      const itemsToMerge = guestItems.map((i) => ({
        variantSizeId: i.variantSizeId,
        quantity: i.quantity,
      }));

      await apiFetch("/cart/merge", {
        method: "POST",
        body: JSON.stringify({ items: itemsToMerge }),
      });

      localStorage.removeItem("viora_guest_cart");
      window.dispatchEvent(new Event("viora_cart_updated"));
    }
  } catch {}
}
