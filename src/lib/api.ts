/**
 * Viora Customer API Client
 * يتصل بالسيرفر الخلفي https://viora-backend-tuqg.onrender.com/api
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://viora-backend-tuqg.onrender.com/api";

const TOKEN_KEY = "viora_customer_token";
const USER_KEY = "viora_customer_user";

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeCustomerToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
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

  if (token) {
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
