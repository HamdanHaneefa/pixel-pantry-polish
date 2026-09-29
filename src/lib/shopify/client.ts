import { createStorefrontApiClient } from "@shopify/storefront-api-client";

// Retrieve env configuration safely across SSR and Client
function getEnvConfig() {
  const domain =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SHOPIFY_STORE_DOMAIN) ||
    (typeof process !== "undefined" && process.env?.VITE_SHOPIFY_STORE_DOMAIN) ||
    "1fcjnw-tz.myshopify.com";

  const publicToken =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN) ||
    (typeof process !== "undefined" && process.env?.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN) ||
    (typeof process !== "undefined" && process.env?.SHOPIFY_STOREFRONT_ACCESS_TOKEN) ||
    "4bd7d34c9c5c825654fda51b56da2b4f";

  const apiVersion =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SHOPIFY_API_VERSION) ||
    (typeof process !== "undefined" && process.env?.VITE_SHOPIFY_API_VERSION) ||
    "2026-01";

  const useMock =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_USE_MOCK_DATA === "true") ||
    (typeof process !== "undefined" && process.env?.VITE_USE_MOCK_DATA === "true") ||
    false;

  return { domain, publicToken, apiVersion, useMock };
}

export function isShopifyConfigured(): boolean {
  const { domain, publicToken, useMock } = getEnvConfig();
  if (useMock) return false;
  return Boolean(
    domain &&
      domain.trim() !== "" &&
      !domain.includes("your-shop-name") &&
      publicToken &&
      publicToken.trim() !== "" &&
      !publicToken.includes("your_public_storefront_access_token")
  );
}

export function getShopifyAccountUrl(): string {
  // Use Shopify's New Customer Accounts hosted portal
  return "https://shopify.com/77079314626/account";
}

let clientInstance: ReturnType<typeof createStorefrontApiClient> | null = null;

export function getShopifyClient() {
  if (!isShopifyConfigured()) {
    return null;
  }

  if (!clientInstance) {
    const { domain, publicToken, apiVersion } = getEnvConfig();
    clientInstance = createStorefrontApiClient({
      storeDomain: domain.includes("://") ? domain : `https://${domain}`,
      apiVersion: apiVersion,
      publicAccessToken: publicToken,
      retries: 2,
    });
  }

  return clientInstance;
}

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T | null> {
  const client = getShopifyClient();
  if (!client) {
    return null;
  }

  try {
    const response = await client.request(query, { variables });
    if (response.errors) {
      const errorMessage =
        response.errors.message ||
        (Array.isArray(response.errors.graphQLErrors)
          ? response.errors.graphQLErrors.map((e: { message?: string }) => e.message).join("; ")
          : "Shopify Storefront API Error");
      throw new Error(errorMessage);
    }
    return response.data as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[Shopify Fetch]: ${message}`);
    throw error;
  }
}
