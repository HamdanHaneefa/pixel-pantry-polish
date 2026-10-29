import { createFileRoute } from "@tanstack/react-router";

/**
 * Shiprocket's checkout script (shopify.js) is written for Shopify-hosted stores and asks
 * `https://<seller domain>/api/<version>/graphql.json` for a product's collections. This
 * site is not hosted on Shopify, so forward those Storefront API requests to the real store
 * (with the public Storefront token) instead of letting them fail.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, X-Shopify-Storefront-Access-Token",
  "Access-Control-Max-Age": "86400",
};

function env(key: string): string {
  return (
    (typeof process !== "undefined" && process.env?.[key]) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) ||
    ""
  ).trim();
}

async function proxyStorefront(request: Request): Promise<Response> {
  const domain = (env("VITE_SHOPIFY_STORE_DOMAIN") || "1fcjnw-tz.myshopify.com")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  const token =
    env("VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN") || env("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  const apiVersion = env("VITE_SHOPIFY_API_VERSION") || "2026-01";

  const body = await request.text();
  if (body.length > 20_000) {
    return Response.json(
      { errors: [{ message: "Request too large" }] },
      { status: 413, headers: CORS_HEADERS },
    );
  }

  try {
    const upstream = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { "X-Shopify-Storefront-Access-Token": token } : {}),
      },
      body,
    });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch {
    return Response.json(
      { errors: [{ message: "Storefront unavailable" }] },
      { status: 502, headers: CORS_HEADERS },
    );
  }
}

export const Route = createFileRoute("/api/$version/graphql.json")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => proxyStorefront(request),
    },
  },
});
