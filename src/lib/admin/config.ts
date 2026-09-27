function sanitizeDomain(domain?: string): string {
  if (!domain) return "1fcjnw-tz.myshopify.com";
  return domain.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

// Admin Dashboard Configuration
export const ADMIN_CONFIG = {
  storeDomain: sanitizeDomain(
    process.env['VITE_SHOPIFY_STORE_DOMAIN'] ||
    process.env['SHOPIFY_STORE_DOMAIN']
  ),
  storefrontToken: (
    process.env['VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN'] ||
    process.env['SHOPIFY_STOREFRONT_ACCESS_TOKEN'] ||
    "4bd7d34c9c5c825654fda51b56da2b4f"
  ).trim(),
  adminAccessToken: (
    process.env['SHOPIFY_ADMIN_ACCESS_TOKEN'] ||
    process.env['VITE_SHOPIFY_ADMIN_ACCESS_TOKEN'] ||
    "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"
  ).trim(),
  clientId: (
    process.env['SHOPIFY_CLIENT_ID'] ||
    process.env['VITE_SHOPIFY_CLIENT_ID'] ||
    "9ba4f15c6da9766e9568e4e1c348031a"
  ).trim(),
  clientSecret: (
    process.env['SHOPIFY_CLIENT_SECRET'] ||
    process.env['VITE_SHOPIFY_CLIENT_SECRET'] ||
    "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"
  ).trim(),
  defaultLocationId: (
    process.env['SHOPIFY_LOCATION_ID'] || "gid://shopify/Location/86156607682"
  ).trim(),
  adminPasscode: (
    process.env['ADMIN_PASSCODE'] || "admin2026"
  ).trim(),
  sessionCookieName: "petpedia_admin_session",
  apiVersion: (
    (typeof process !== "undefined" && (process.env['VITE_SHOPIFY_API_VERSION'] || process.env['SHOPIFY_API_VERSION'])) ||
    "2026-01"
  ).trim(),
};

