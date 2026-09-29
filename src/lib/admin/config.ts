function sanitizeDomain(domain?: string): string {
  if (!domain) return "1fcjnw-tz.myshopify.com";
  return domain.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function getEnv(key: string, fallback = ""): string {
  if (typeof process !== "undefined" && process?.env && process.env[key]) {
    return process.env[key]!;
  }
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta?.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key]!;
  }
  return fallback;
}

// Admin Dashboard Configuration
export const ADMIN_CONFIG = {
  storeDomain: sanitizeDomain(
    getEnv("VITE_SHOPIFY_STORE_DOMAIN") ||
    getEnv("SHOPIFY_STORE_DOMAIN")
  ),
  storefrontToken: (
    getEnv("VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN") ||
    getEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN") ||
    "4bd7d34c9c5c825654fda51b56da2b4f"
  ).trim(),
  adminAccessToken: (
    getEnv("SHOPIFY_ADMIN_ACCESS_TOKEN") ||
    getEnv("VITE_SHOPIFY_ADMIN_ACCESS_TOKEN") ||
    ""
  ).trim(),
  clientId: (
    getEnv("SHOPIFY_CLIENT_ID") ||
    getEnv("VITE_SHOPIFY_CLIENT_ID") ||
    "9ba4f15c6da9766e9568e4e1c348031a"
  ).trim(),
  clientSecret: (
    getEnv("SHOPIFY_CLIENT_SECRET") ||
    getEnv("VITE_SHOPIFY_CLIENT_SECRET") ||
    "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"
  ).trim(),
  defaultLocationId: (
    getEnv("SHOPIFY_LOCATION_ID") || "gid://shopify/Location/86156607682"
  ).trim(),
  adminPasscode: (
    getEnv("ADMIN_PASSCODE") || "admin2026"
  ).trim(),
  sessionCookieName: "petpedia_admin_session",
  apiVersion: (
    getEnv("VITE_SHOPIFY_API_VERSION") ||
    getEnv("SHOPIFY_API_VERSION") ||
    "2026-01"
  ).trim(),
};

