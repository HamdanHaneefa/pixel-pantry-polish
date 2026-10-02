import { ADMIN_CONFIG } from "./config";
import * as dns from "node:dns";

try {
  if (typeof dns !== "undefined" && typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch {
  // Ignore in environments where dns is not available
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;
const invalidTokens = new Set<string>();

export function clearCachedAdminToken(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}

/**
 * Resilient fetch with customizable timeout and automatic retry on transient network drops or DNS timeouts
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs = 25000,
  maxRetries = 3,
  backoffMs = 800
): Promise<Response> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      const errCode = err?.cause?.code || err?.code;
      const errMsg = err?.message || "";
      const isDnsError =
        errCode === "EAI_AGAIN" ||
        errCode === "ENOTFOUND" ||
        errMsg.includes("getaddrinfo");

      const isNetworkOrTimeout =
        isDnsError ||
        err?.name === "AbortError" ||
        errCode === "ETIMEDOUT" ||
        errCode === "ECONNRESET" ||
        errCode === "ECONNREFUSED" ||
        errCode === "UND_ERR_CONNECT_TIMEOUT" ||
        errCode === "UND_ERR_HEADERS_TIMEOUT" ||
        errCode === "UND_ERR_SOCKET" ||
        errMsg.includes("fetch failed") ||
        errMsg.includes("timeout");

      if (attempt < maxRetries && isNetworkOrTimeout) {
        // For DNS hiccups (like EAI_AGAIN), give the resolver a bit more time to recover
        const waitTime = isDnsError
          ? Math.max(backoffMs, 1000) * (attempt + 1)
          : backoffMs * (attempt + 1);

        console.warn(
          `[ShopifyFetch] Transient ${isDnsError ? "DNS resolution" : "network"} issue on attempt ${attempt + 1}/${maxRetries + 1} (${errCode || errMsg}), retrying in ${waitTime}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      break;
    }
  }

  throw lastError;
}

/**
 * Retrieves a valid Shopify Admin API Access Token using configured token or OAuth Client Credentials
 */
export async function getAdminAccessToken(forceRefresh = false): Promise<string> {
  const directToken = ADMIN_CONFIG.adminAccessToken?.trim();
  const clientId = ADMIN_CONFIG.clientId?.trim();
  const clientSecret = ADMIN_CONFIG.clientSecret?.trim();
  const storeDomain = (ADMIN_CONFIG.storeDomain || "1fcjnw-tz.myshopify.com")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

  const now = Date.now();
  if (!forceRefresh && cachedToken && !invalidTokens.has(cachedToken) && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  // 1. Try OAuth client credentials if configured
  if (clientId && clientSecret) {
    try {
      const res = await fetchWithRetry(`https://${storeDomain}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        }),
      }, 15000, 3, 1000);

      if (res.ok) {
        const data = (await res.json()) as { access_token: string; expires_in?: number };
        if (data.access_token) {
          cachedToken = data.access_token;
          tokenExpiresAt = now + (data.expires_in ? data.expires_in * 1000 : 86400 * 1000);
          return cachedToken;
        }
      } else {
        const errText = await res.text();
        console.warn(`[ShopifyAdmin] OAuth exchange returned status ${res.status}: ${errText.slice(0, 200)}`);
      }
    } catch (err) {
      console.warn("[ShopifyAdmin] OAuth exchange failed, checking direct token:", err);
    }
  }

  // 2. Fall back to static Admin Access Token if available and not previously marked invalid
  if (directToken && directToken.startsWith("shpat_") && !invalidTokens.has(directToken)) {
    cachedToken = directToken;
    tokenExpiresAt = now + 86400 * 1000;
    return directToken;
  }

  if (cachedToken && !invalidTokens.has(cachedToken)) {
    return cachedToken;
  }

  throw new Error("No valid Shopify Admin API credentials configured. Please check your SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET or SHOPIFY_ADMIN_ACCESS_TOKEN.");
}

/**
 * Execute a GraphQL query or mutation against Shopify Admin API
 */
export async function queryShopifyAdmin<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  let token = await getAdminAccessToken();
  const domain = (ADMIN_CONFIG.storeDomain || "1fcjnw-tz.myshopify.com")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  const endpoint = `https://${domain}/admin/api/${ADMIN_CONFIG.apiVersion}/graphql.json`;

  let res = await fetchWithRetry(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    },
    25000,
    3,
    800
  );

  // Auto-refresh token on 401 Unauthorized and retry once
  if (!res.ok && (res.status === 401 || res.status === 403)) {
    invalidTokens.add(token);
    clearCachedAdminToken();
    try {
      token = await getAdminAccessToken(true);
      res = await fetchWithRetry(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": token,
          },
          body: JSON.stringify({ query, variables }),
        },
        25000,
        2,
        1000
      );
    } catch {
      // If refresh or retry fails, continue to error throw below
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401 || res.status === 403) {
      invalidTokens.add(token);
      clearCachedAdminToken();
    }
    throw new Error(`Shopify Admin API HTTP error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    const msg = json.errors.map((e: any) => e.message).join(", ");
    if (msg.includes("Access denied") || msg.includes("write_products") || msg.includes("write_inventory")) {
      clearCachedAdminToken();
    }
    throw new Error(`Shopify Admin GraphQL error: ${msg}`);
  }

  return json.data as T;
}

/**
 * Execute a Storefront GraphQL query for catalog / collection reads
 */
export async function queryStorefront<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  const domain = (ADMIN_CONFIG.storeDomain || "1fcjnw-tz.myshopify.com")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  const endpoint = `https://${domain}/api/${ADMIN_CONFIG.apiVersion}/graphql.json`;

  const res = await fetchWithRetry(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": ADMIN_CONFIG.storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
    },
    25000,
    3,
    800
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Storefront API HTTP error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    const msg = json.errors.map((e: any) => e.message).join(", ");
    throw new Error(`Storefront GraphQL error: ${msg}`);
  }

  return json.data as T;
}

