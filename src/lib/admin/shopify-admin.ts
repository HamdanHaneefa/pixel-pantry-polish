import { ADMIN_CONFIG } from "./config";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export function clearCachedAdminToken(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}

/**
 * Retrieves a valid Shopify Admin API Access Token using configured token or OAuth Client Credentials
 */
export async function getAdminAccessToken(): Promise<string> {
  // If a direct admin access token is provided (starts with shpat_), use it
  if (ADMIN_CONFIG.adminAccessToken && ADMIN_CONFIG.adminAccessToken.startsWith("shpat_")) {
    return ADMIN_CONFIG.adminAccessToken;
  }

  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    const res = await fetch(`https://${ADMIN_CONFIG.storeDomain}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: ADMIN_CONFIG.clientId,
        client_secret: ADMIN_CONFIG.clientSecret,
        grant_type: "client_credentials",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to obtain Shopify admin access token: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in?: number };
    cachedToken = data.access_token;
    tokenExpiresAt = now + (data.expires_in ? data.expires_in * 1000 : 86400 * 1000);
    return cachedToken;
  } catch (err) {
    console.error("[ShopifyAdmin] Auth Error:", err);
    throw err;
  }
}

/**
 * Execute a GraphQL query or mutation against Shopify Admin API
 */
export async function queryShopifyAdmin<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  const token = await getAdminAccessToken();
  const endpoint = `https://${ADMIN_CONFIG.storeDomain}/admin/api/${ADMIN_CONFIG.apiVersion}/graphql.json`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401 || res.status === 403) {
      clearCachedAdminToken();
    }
    throw new Error(`Shopify Admin API HTTP error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    const msg = json.errors.map((e: any) => e.message).join(", ");
    if (msg.includes("Access denied") || msg.includes("write_products")) {
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
  const endpoint = `https://${ADMIN_CONFIG.storeDomain}/api/${ADMIN_CONFIG.apiVersion}/graphql.json`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": ADMIN_CONFIG.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

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
