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
    "";

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
    !publicToken.includes("your_public_storefront_access_token"),
  );
}

export function getShopifyAccountUrl(): string {
  // Internal customer account portal
  return "/account";
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

// In-memory SWR cache for Storefront GraphQL queries
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const storefrontCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

const SWR_FRESH_MS = 60 * 1000; // 60 seconds fresh
const SWR_STALE_MS = 300 * 1000; // 5 minutes stale allowed

export function clearStorefrontCache(): void {
  storefrontCache.clear();
  inFlightRequests.clear();
}

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options?: { bypassCache?: boolean; ttlMs?: number },
): Promise<T | null> {
  const client = getShopifyClient();
  if (!client) {
    return null;
  }

  const cacheKey = JSON.stringify({ query: query.trim(), variables });
  const now = Date.now();
  const cached = storefrontCache.get(cacheKey);

  // 1. Fresh cache hit: return immediately without network round-trip
  if (
    !options?.bypassCache &&
    cached &&
    now - cached.timestamp < (options?.ttlMs || SWR_FRESH_MS)
  ) {
    return cached.data as T;
  }

  // 2. In-flight deduplication: if identical query is in flight, piggyback onto it (stampede protection)
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
  }

  // 3. Stale cache hit: return stale data immediately and revalidate in background
  if (!options?.bypassCache && cached && now - cached.timestamp < SWR_STALE_MS) {
    const backgroundPromise = (async () => {
      try {
        const response = await client.request(query, { variables });
        if (response.data) {
          storefrontCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        }
      } catch {
        // Silently preserve stale cache on transient background failure
      } finally {
        inFlightRequests.delete(cacheKey);
      }
    })();
    inFlightRequests.set(cacheKey, backgroundPromise);
    return cached.data as T;
  }

  // 4. Cache miss or expired: fetch synchronously
  const fetchPromise = (async () => {
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
      const resultData = response.data as T;
      storefrontCache.set(cacheKey, { data: resultData, timestamp: Date.now() });
      return resultData;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Shopify Fetch]: ${message}`);
      if (cached) return cached.data as T;
      throw error;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}
