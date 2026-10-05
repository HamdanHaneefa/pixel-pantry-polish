import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optimizeShopifyImage(url?: string | null, width = 480): string {
  if (!url || typeof url !== "string") return "/placeholder-product.png";
  const trimmed = url.trim();
  if (!trimmed) return "/placeholder-product.png";
  if (!trimmed.includes("cdn.shopify.com")) return trimmed;

  try {
    const parsed = new URL(trimmed, "https://cdn.shopify.com");
    parsed.searchParams.set("width", String(width));
    parsed.searchParams.delete("format");
    return parsed.toString();
  } catch {
    const separator = trimmed.includes("?") ? "&" : "?";
    return `${trimmed}${separator}width=${width}`;
  }
}