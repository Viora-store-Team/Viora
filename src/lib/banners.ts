import { API_BASE_URL } from "@/lib/api";

export interface Banner {
  slot: 1 | 2 | 3;
  imageUrl: string;
}

export async function getPublishedBanners(): Promise<Banner[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/banners`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data.banners)) return [];
    return data.banners.filter((banner: unknown): banner is Banner => {
      if (!banner || typeof banner !== "object") return false;
      const value = banner as Record<string, unknown>;
      return [1, 2, 3].includes(value.slot as number) &&
        value.isPublished !== false && typeof value.imageUrl === "string" &&
        /^https?:\/\//i.test(value.imageUrl);
    }).sort((a: Banner, b: Banner) => a.slot - b.slot);
  } catch {
    return [];
  }
}
