// Admin Dashboard Configuration
export const ADMIN_CONFIG = {
  storeDomain:
    process.env['VITE_SHOPIFY_STORE_DOMAIN'] ||
    process.env['SHOPIFY_STORE_DOMAIN'] ||
    "1fcjnw-tz.myshopify.com",
  storefrontToken:
    process.env['VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN'] ||
    process.env['SHOPIFY_STOREFRONT_ACCESS_TOKEN'] ||
    "4bd7d34c9c5c825654fda51b56da2b4f",
  adminAccessToken:
    process.env['SHOPIFY_ADMIN_ACCESS_TOKEN'] ||
    process.env['VITE_SHOPIFY_ADMIN_ACCESS_TOKEN'] ||
    "",
  clientId:
    process.env['SHOPIFY_CLIENT_ID'] ||
    process.env['VITE_SHOPIFY_CLIENT_ID'] ||
    "9ba4f15c6da9766e9568e4e1c348031a",
  clientSecret:
    process.env['SHOPIFY_CLIENT_SECRET'] ||
    process.env['VITE_SHOPIFY_CLIENT_SECRET'] ||
    "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",
  defaultLocationId:
    process.env['SHOPIFY_LOCATION_ID'] || "gid://shopify/Location/86156607682",
  adminPasscode:
    process.env['ADMIN_PASSCODE'] || "admin2026",
  sessionCookieName: "petpedia_admin_session",
  apiVersion: "2025-04",
};
