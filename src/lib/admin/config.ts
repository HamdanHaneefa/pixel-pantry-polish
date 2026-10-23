function sanitizeDomain(domain?: string): string {
  if (!domain) return "1fcjnw-tz.myshopify.com";
  return domain
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
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
    getEnv("SHOPIFY_STORE_DOMAIN") || getEnv("VITE_SHOPIFY_STORE_DOMAIN"),
  ),
  storefrontToken: (
    getEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN") ||
    getEnv("VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN") ||
    ""
  ).trim(),
  adminAccessToken: (getEnv("SHOPIFY_ADMIN_ACCESS_TOKEN") || "").trim(),
  clientId: (getEnv("SHOPIFY_CLIENT_ID") || "").trim(),
  clientSecret: (getEnv("SHOPIFY_CLIENT_SECRET") || "").trim(),
  defaultLocationId: (getEnv("SHOPIFY_LOCATION_ID") || "gid://shopify/Location/86156607682").trim(),
  adminPasscode: (getEnv("ADMIN_PASSCODE") || "").trim(),
  sessionCookieName: "petpedia_admin_session",
  apiVersion: (
    getEnv("SHOPIFY_API_VERSION") ||
    getEnv("VITE_SHOPIFY_API_VERSION") ||
    "2026-01"
  ).trim(),
};
