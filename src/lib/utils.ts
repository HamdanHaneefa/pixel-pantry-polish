import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optimizeShopifyImage(url?: string | null, width = 480): string {
  if (!url) return "/placeholder-product.png";
  if (url.includes("cdn.shopify.com") && !url.includes("&width=") && !url.includes("?width=")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}&format=webp`;
  }
  return url;
}