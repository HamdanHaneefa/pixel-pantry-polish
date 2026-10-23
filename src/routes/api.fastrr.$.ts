import { createFileRoute } from "@tanstack/react-router";
import { checkPersistentRateLimit } from "@/lib/security/rate-limit";

const FASTRR_UPSTREAM_DEFAULT = "https://apigateway.pickrr.com";

/**
 * Strict allowlist of permitted Fastrr/Shiprocket upstream subpaths.
 * Wildcard forwarding of arbitrary endpoints is strictly prohibited to prevent API abuse.
 */
export const ALLOWED_FASTRR_SUBPATHS = [
  "/api/v1/customer-rto-risk",
  "/api/v1/customer-data",
  "/api/v1/access-token/s2s-login/verify",
] as const;

/**
 * Validated server-side proxy route for Fastrr/Shiprocket API endpoints.
 * Enforces:
 * 1. Strict subpath allowlisting (rejects arbitrary upstream paths with 403)
 * 2. Method gating (only POST is allowed; GET/PUT/DELETE return 405)
 * 3. Persistent IP-scoped rate-limiting to mitigate brute-force and quota exhaustion
 * 4. Path traversal protection
 * 5. Sanitized header forwarding without client token overriding
 */
export async function handleFastrrProxy(
  request: Request,
  params?: { _splat?: string },
): Promise<Response> {
  // 1. Method restriction: Fastrr integration endpoints only use POST
  if (request.method !== "POST") {
    return Response.json(
      { ok: false, error: "Method Not Allowed. Only POST requests are permitted on this route." },
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  try {
    // 2. Persistent Rate Limiting (per client IP) evaluated before upstream or allowlist handling
    const clientIp = (
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1"
    ).replace(/[^a-zA-Z0-9:._-]/g, "");

    const rateCheck = await checkPersistentRateLimit({
      key: `fastrr_proxy:${clientIp}`,
      maxAttempts: 30,
      windowSeconds: 60,
    });

    if (!rateCheck.allowed) {
      return Response.json(
        {
          ok: false,
          error:
            "Rate limit exceeded: Too many proxy requests. Please wait a minute before retrying.",
        },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }

    const rawUrl = request.url || "";
    const splat = params?._splat || "";
    if (
      splat.includes("..") ||
      splat.includes("//") ||
      splat.includes("@") ||
      splat.includes("\\") ||
      rawUrl.includes("..") ||
      rawUrl.toLowerCase().includes("%2e%2e") ||
      rawUrl.includes("\\")
    ) {
      return Response.json(
        { ok: false, error: "Bad Request: Malformed or invalid upstream path traversal detected." },
        { status: 400 },
      );
    }

    const url = new URL(request.url);
    // Strip the leading /api/fastrr prefix
    const upstreamSubpath = url.pathname.replace(/^\/api\/fastrr/, "").replace(/\/+$/, "");

    // 3. Path traversal and malformed path protection
    if (
      !upstreamSubpath ||
      upstreamSubpath.includes("..") ||
      upstreamSubpath.includes("//") ||
      upstreamSubpath.includes("@") ||
      upstreamSubpath.includes("\\")
    ) {
      return Response.json(
        { ok: false, error: "Bad Request: Malformed or invalid upstream path." },
        { status: 400 },
      );
    }

    // 4. Strict endpoint allowlist check
    const isAllowed = ALLOWED_FASTRR_SUBPATHS.some((allowed) => allowed === upstreamSubpath);
    if (!isAllowed) {
      console.warn(
        `[Fastrr Proxy Security Alert] Blocked unauthorized endpoint attempt: ${upstreamSubpath}`,
      );
      return Response.json(
        {
          ok: false,
          error: `Forbidden: Endpoint '${upstreamSubpath}' is not permitted through proxy.`,
        },
        { status: 403 },
      );
    }

    const upstreamBase = (process.env.FASTRR_API_BASE || FASTRR_UPSTREAM_DEFAULT).replace(
      /\/$/,
      "",
    );
    const targetUrl = `${upstreamBase}${upstreamSubpath}${url.search}`;

    // 5. Header sanitization: only forward safe, necessary headers
    const forwardHeaders = new Headers();
    const allowedHeaders = [
      "content-type",
      "accept",
      "x-api-hmac-sha256",
      "authorization",
      "user-agent",
    ];

    for (const [key, value] of request.headers.entries()) {
      if (allowedHeaders.includes(key.toLowerCase())) {
        forwardHeaders.set(key, value);
      }
    }

    // Attach server-configured Fastrr API Key securely
    if (process.env.FASTRR_API_KEY) {
      forwardHeaders.set("x-api-key", process.env.FASTRR_API_KEY);
    }

    const body = await request.text();

    const upstreamResponse = await fetch(targetUrl, {
      method: "POST",
      headers: forwardHeaders,
      body: body || undefined,
      signal: AbortSignal.timeout(8000),
    });

    const responseHeaders = new Headers();
    responseHeaders.set(
      "Content-Type",
      upstreamResponse.headers.get("Content-Type") || "application/json",
    );
    responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");

    const responseBody = await upstreamResponse.text();

    return new Response(responseBody, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("[Fastrr Proxy Error]:", error);
    return Response.json(
      {
        ok: false,
        error: "Failed to communicate with Fastrr upstream gateway",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 502 },
    );
  }
}

export const Route = createFileRoute("/api/fastrr/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => handleFastrrProxy(request, params),
      POST: async ({ request, params }) => handleFastrrProxy(request, params),
      PUT: async ({ request, params }) => handleFastrrProxy(request, params),
      DELETE: async ({ request, params }) => handleFastrrProxy(request, params),
    },
  },
});
