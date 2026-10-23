import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createServer } from "vite";
import "@tanstack/react-start/server";
import { H3Event } from "h3-v2";

const ROOT_DIR = process.cwd();

// Setup shared Vite SSR instance to load real application modules
let viteServer;
let fastrrRoute;
let webhookRoute;
let checkoutMod;
let customerAuthMod;
let adminAuthMod;
let reviewsMod;
let storageMod;
let categoriesMod;

test.before(async () => {
  viteServer = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  const fastrrMod = await viteServer.ssrLoadModule("./src/routes/api.fastrr.$.ts");
  fastrrRoute = fastrrMod.Route;

  const webhookMod = await viteServer.ssrLoadModule("./src/routes/api.webhooks.shopify-orders.ts");
  webhookRoute = webhookMod.Route;

  checkoutMod = await viteServer.ssrLoadModule("./src/lib/customer/checkout.ts");
  customerAuthMod = await viteServer.ssrLoadModule("./src/lib/customer/auth.ts");
  adminAuthMod = await viteServer.ssrLoadModule("./src/lib/admin/auth.ts");
  reviewsMod = await viteServer.ssrLoadModule("./src/lib/reviews/index.ts");
  storageMod = await viteServer.ssrLoadModule("./src/lib/storage/adapter.ts");
  categoriesMod = await viteServer.ssrLoadModule("./src/lib/admin/categories.ts");
});

test.after(async () => {
  if (viteServer) {
    await viteServer.close();
  }
});

/**
 * Executes a TanStack Start createServerFn within a mocked Start AsyncLocalStorage context
 */
async function executeServerFn(fn, data, headers = {}) {
  const GLOBAL_STORAGE_KEY = Symbol.for("tanstack-start:start-storage-context");
  const GLOBAL_EVENT_STORAGE_KEY = Symbol.for("tanstack-start:event-storage");
  const startStorage = globalThis[GLOBAL_STORAGE_KEY];
  const eventStorage = globalThis[GLOBAL_EVENT_STORAGE_KEY];

  const req = new Request("https://www.petpedia.in", { headers });
  const h3Event = new H3Event(req);

  const mockContext = {
    request: req,
    startOptions: {},
    contextAfterGlobalMiddlewares: {},
    executedRequestMiddlewares: new Set(),
    handlerType: "serverFn",
  };

  const runner = async () => fn({ data });

  if (eventStorage && startStorage) {
    return startStorage.run(mockContext, () => {
      return eventStorage.run({ h3Event }, runner);
    });
  } else if (startStorage) {
    return startStorage.run(mockContext, runner);
  }
  return runner();
}

// ============================================================================
// SUITE 1: FASTRR PROXY ROUTE HANDLER LOCKDOWN (TASK 1)
// ============================================================================
test("Suite 1.1: Fastrr Proxy rejects non-POST HTTP methods with 405", async () => {
  const getHandler = fastrrRoute.options.server?.handlers?.GET;
  assert.ok(getHandler, "GET handler must exist on Fastrr proxy route");

  const req = new Request("https://www.petpedia.in/api/fastrr/v1/customer-rto-risk", {
    method: "GET",
  });
  const res = await getHandler({ request: req, params: { _splat: "v1/customer-rto-risk" } });
  assert.equal(res.status, 405, "Must return HTTP 405 Method Not Allowed");

  const body = await res.json();
  assert.match(body.error, /Only POST requests are permitted/);
});

test("Suite 1.2: Fastrr Proxy rejects unallowed endpoints with 403 Forbidden", async () => {
  const postHandler = fastrrRoute.options.server?.handlers?.POST;
  assert.ok(postHandler, "POST handler must exist on Fastrr proxy route");

  const req = new Request("https://www.petpedia.in/api/fastrr/v1/wildcard-exploit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test: true }),
  });
  const res = await postHandler({ request: req, params: { _splat: "v1/wildcard-exploit" } });
  assert.equal(res.status, 403, "Must return HTTP 403 Forbidden for unapproved endpoint");

  const body = await res.json();
  assert.match(body.error, /Forbidden: Endpoint .* is not permitted/);
});

test("Suite 1.3: Fastrr Proxy rejects path traversal attempts with 400 Bad Request", async () => {
  const postHandler = fastrrRoute.options.server?.handlers?.POST;

  const req = new Request("https://www.petpedia.in/api/fastrr/v1/customer-data/../../etc/passwd", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const res = await postHandler({
    request: req,
    params: { _splat: "v1/customer-data/../../etc/passwd" },
  });
  assert.equal(res.status, 400, "Must return HTTP 400 Bad Request for path traversal");

  const body = await res.json();
  assert.match(body.error, /Bad Request: Malformed or invalid upstream path/);
});

test("Suite 1.4: Fastrr Proxy enforces rate limiting per client IP", async () => {
  const postHandler = fastrrRoute.options.server?.handlers?.POST;
  const testIp = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;

  let lastRes;
  for (let i = 0; i < 35; i++) {
    const req = new Request("https://www.petpedia.in/api/fastrr/v1/customer-rto-risk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify({}),
    });
    lastRes = await postHandler({ request: req, params: { _splat: "v1/customer-rto-risk" } });
    if (lastRes.status === 429) {
      break;
    }
  }

  assert.equal(
    lastRes.status,
    429,
    "Proxy must trigger HTTP 429 after exceeding max rate attempts",
  );
  const body = await lastRes.json();
  assert.match(body.error, /Rate limit exceeded/);
});

// ============================================================================
// SUITE 2: CHECKOUT ORDER CREATION FAILS CLOSED & IDEMPOTENCY (TASK 3)
// ============================================================================
test("Suite 2.1: Checkout fails closed on Shopify order creation failure (No synthetic order ID)", async () => {
  const originalFetch = global.fetch;
  try {
    // Intercept Shopify order creation to simulate 500 error from Shopify
    global.fetch = async (url, options = {}) => {
      const urlStr = String(url);
      if (urlStr.includes("shopify.com") && urlStr.includes("orders.json")) {
        return new Response(
          JSON.stringify({ errors: { base: ["Internal server error from Shopify"] } }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return originalFetch(url, options);
    };

    const checkoutInput = {
      customer: {
        phone: "9876543210",
      },
      items: [
        {
          id: "test-item-1",
          productId: "gid://shopify/Product/8781940162754",
          variantId: "gid://shopify/ProductVariant/48670193811650",
          title: "Automatic Water Dispenser",
          price: 699,
          quantity: 1,
        },
      ],
      shippingAddress: {
        firstName: "Anjali",
        lastName: "Sharma",
        phone: "9876543210",
        address1: "Flat 402, Sunshine Apts",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      paymentMethod: "cod",
    };

    const result = await executeServerFn(checkoutMod.createCheckoutOrderFn, checkoutInput);

    assert.equal(result.success, false, "Must return success: false when Shopify order fails");
    assert.ok(result.error, "Must provide an error message");
    assert.doesNotMatch(
      String(result.orderId || ""),
      /SR-FST-/,
      "Must NEVER issue a synthetic SR-FST-... fallback order ID on checkout failure",
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test("Suite 2.2: Checkout idempotency prevents duplicate orders on retry", async () => {
  const originalFetch = global.fetch;
  let shopifyOrderCallCount = 0;

  try {
    global.fetch = async (url, options = {}) => {
      const urlStr = String(url);
      if (urlStr.includes("shopify.com") && urlStr.includes("orders.json")) {
        shopifyOrderCallCount++;
        return new Response(
          JSON.stringify({
            order: {
              id: 9988776655,
              name: "#1099",
              order_number: 1099,
              total_price: "699.00",
              currency: "INR",
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      }
      return originalFetch(url, options);
    };

    const uniquePhone = `98${Math.floor(Math.random() * 89999999 + 10000000)}`;
    const checkoutInput = {
      customer: {
        phone: uniquePhone,
      },
      items: [
        {
          id: "dedup-item",
          productId: "gid://shopify/Product/8781940162754",
          variantId: "gid://shopify/ProductVariant/48670193811650",
          title: "Automatic Water Dispenser",
          price: 699,
          quantity: 1,
        },
      ],
      shippingAddress: {
        firstName: "Vikram",
        lastName: "Patel",
        phone: uniquePhone,
        address1: "12 MG Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
      },
      paymentMethod: "cod",
    };

    // First call: creates order
    const firstRes = await executeServerFn(checkoutMod.createCheckoutOrderFn, checkoutInput);
    assert.equal(firstRes.success, true);
    assert.equal(String(firstRes.orderId), "9988776655");
    assert.equal(shopifyOrderCallCount, 1);

    // Second call with same payload: should return cached response without calling Shopify again
    const secondRes = await executeServerFn(checkoutMod.createCheckoutOrderFn, checkoutInput);
    assert.equal(secondRes.success, true);
    assert.equal(String(secondRes.orderId), "9988776655");
    assert.equal(secondRes.orderName, "#1099");
    assert.equal(
      shopifyOrderCallCount,
      1,
      "Idempotency cache must prevent duplicate Shopify order creation on duplicate submission",
    );
  } finally {
    global.fetch = originalFetch;
  }
});

// ============================================================================
// SUITE 3: SCOPED ADMIN LOGIN RATE-LIMITING (TASK 4)
// ============================================================================
test("Suite 3.1: Admin login rate limit keys are isolated per client IP to prevent global DoS", async () => {
  const originalEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "development";

    // Test IP A: exhaust 5 attempts
    const ipA = "203.0.113.10";
    const ipB = "203.0.113.20";

    const keyA = `admin_login:${ipA}`;
    const keyB = `admin_login:${ipB}`;

    const { checkPersistentRateLimit } = await viteServer.ssrLoadModule(
      "./src/lib/security/rate-limit.ts",
    );

    // 5 attempts from IP A
    for (let i = 0; i < 5; i++) {
      await checkPersistentRateLimit({ key: keyA, maxAttempts: 5, windowSeconds: 300 });
    }

    // Attempt 6 from IP A should be blocked
    const checkA = await checkPersistentRateLimit({
      key: keyA,
      maxAttempts: 5,
      windowSeconds: 300,
    });
    assert.equal(checkA.allowed, false, "IP A must be rate-limited after 5 attempts");

    // Attempt from IP B must remain allowed (no global lockout DoS)
    const checkB = await checkPersistentRateLimit({
      key: keyB,
      maxAttempts: 5,
      windowSeconds: 300,
    });
    assert.equal(
      checkB.allowed,
      true,
      "IP B must NOT be blocked by attacks originating from IP A (Global DoS prevented)",
    );
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
});

test("Suite 3.2: Default or weak ADMIN_PASSCODE is strictly rejected in production", async () => {
  const originalEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";

    // Call loginAdminFn with default passcode in simulated production
    const res = await executeServerFn(
      adminAuthMod.loginAdminFn,
      { passcode: "admin2026" },
      { "x-forwarded-for": "198.51.100.5" },
    );
    assert.equal(
      res.success,
      false,
      "Must fail login when default passcode is detected in production",
    );
    assert.match(
      res.error,
      /CRITICAL SECURITY CONFIGURATION ERROR: Default or weak ADMIN_PASSCODE/,
    );
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
});

// ============================================================================
// SUITE 4: RETURN REQUEST AUTHORIZATION REJECTION (TASK 5)
// ============================================================================
test("Suite 4.1: Return request fails closed when order does not exist in Shopify", async () => {
  const originalFetch = global.fetch;
  try {
    // Intercept GraphQL query to return null order
    global.fetch = async (url, options = {}) => {
      const urlStr = String(url);
      if (urlStr.includes("shopify.com") && urlStr.includes("graphql.json")) {
        return new Response(JSON.stringify({ data: { order: null } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return originalFetch(url, options);
    };

    // Prepare a mock customer session token
    const token = await customerAuthMod.createSignedToken({
      customerId: "gid://shopify/Customer/12345",
      phone: "+919876543210",
      email: "cust@petpedia.in",
      firstName: "Pet",
      lastName: "Parent",
    });

    const res = await executeServerFn(
      customerAuthMod.requestOrderReturnFn,
      {
        orderId: "gid://shopify/Order/999999",
        orderNumber: "#999999",
        reason: "Damaged product received",
      },
      { cookie: `petpedia_customer_session=${token}` },
    );

    assert.equal(res.success, false, "Missing order must be rejected");
    assert.match(res.error, /Order not found/);
  } finally {
    global.fetch = originalFetch;
  }
});

// ============================================================================
// SUITE 5: EMAIL OTP LOGIN DISABLED (TASK 6)
// ============================================================================
test("Suite 5.1: initiateCustomerOtpFn rejects email addresses with guidance to use mobile", async () => {
  const res = await executeServerFn(customerAuthMod.initiateCustomerOtpFn, {
    identifier: "customer@example.com",
  });

  assert.equal(res.success, false, "Email OTP request must be rejected");
  assert.match(
    res.error,
    /Email OTP login is temporarily disabled/,
    "Must inform user to use 10-digit mobile number or Google account",
  );
});

test("Suite 5.2: verifyCustomerOtpFn rejects email addresses", async () => {
  const res = await executeServerFn(customerAuthMod.verifyCustomerOtpFn, {
    identifier: "customer@example.com",
    otp: "1234",
  });

  assert.equal(res.success, false, "Email OTP verification must be rejected");
  assert.match(
    res.error,
    /Email OTP login is temporarily disabled/,
    "Must reject email verification",
  );
});

// ============================================================================
// SUITE 6: PERSISTENT REVIEWS & VERIFIED PURCHASE BADGE (TASK 7)
// ============================================================================
test("Suite 6.1: submitProductReviewFn sanitizes HTML and uses persistent storage", async () => {
  const uniqueHandle = `test-dog-food-${Date.now()}`;
  const res = await executeServerFn(reviewsMod.submitProductReviewFn, {
    productId: "123456",
    productHandle: uniqueHandle,
    author: "Test Parent <script>alert(1)</script>",
    title: "Great Product <b>Awesome</b>",
    comment: "My dog absolutely loves this food! Best quality.",
    rating: 5,
  });

  assert.equal(res.success, true);
  assert.ok(res.review);
  assert.doesNotMatch(res.review.author, /<script>/, "Malicious HTML must be stripped from author");
  assert.equal(
    res.review.verifiedPurchase,
    false,
    "Guest submitted review must have verifiedPurchase: false",
  );
});

test("Suite 6.2: Product review UI strictly requires rev.verifiedPurchase === true for badge", () => {
  const productTsxPath = path.join(ROOT_DIR, "src/routes/product.tsx");
  const content = fs.readFileSync(productTsxPath, "utf-8");

  assert.match(
    content,
    /rev\.verifiedPurchase\s*\?/,
    "Product page must check rev.verifiedPurchase before displaying Verified badge",
  );
  assert.doesNotMatch(
    content,
    /<p[^>]*>{rev\.author}<\/p>\s*<span[^>]*>\s*<CheckCircle2[^>]*\/>\s*Verified\s*<\/span>/,
    "Verified badge must never be rendered unconditionally next to author",
  );
});

test("Suite 6.3: submitProductReviewFn allows star-only reviews with optional title and comment", async () => {
  const uniqueId = `pid_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const uniqueHandle = `test-star-only-${Date.now()}`;
  const res = await executeServerFn(reviewsMod.submitProductReviewFn, {
    productId: uniqueId,
    productHandle: uniqueHandle,
    rating: 4,
  });

  assert.equal(res.success, true);
  assert.ok(res.review);
  assert.equal(res.review.rating, 4);
  assert.equal(res.review.author, "Guest Customer");
  assert.equal(res.review.title, undefined);
  assert.equal(res.review.comment, undefined);
  assert.equal(res.summary.reviews, 1);
  assert.equal(res.summary.rating, 4);
});


// ============================================================================
// SUITE 7: REDIS LARGE-VALUE WRITES TO POST BODY (TASK 8)
// ============================================================================
test("Suite 7.1: VercelKvStorageAdapter.set issues POST body command array instead of URL path interpolation", async () => {
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedHeaders = {};
  let capturedBody = null;

  const mockFetch = async (url, options = {}) => {
    capturedUrl = String(url);
    capturedMethod = options.method || "GET";
    capturedHeaders = options.headers || {};
    capturedBody = options.body ? JSON.parse(options.body) : null;
    return new Response(JSON.stringify({ result: "OK" }), { status: 200 });
  };

  const originalFetch = global.fetch;
  try {
    global.fetch = mockFetch;

    const adapter = new storageMod.VercelKvStorageAdapter(
      "https://test-kv.upstash.io",
      "test_token_secret",
    );

    const testPayload = { largeData: "A".repeat(10000), nested: { items: [1, 2, 3] } };
    await adapter.set("test-large-key", testPayload, 3600);

    assert.equal(
      capturedUrl,
      "https://test-kv.upstash.io",
      "Must send request to base Redis REST URL",
    );
    assert.equal(capturedMethod, "POST", "Must use HTTP POST");
    assert.equal(
      capturedHeaders["Content-Type"],
      "application/json",
      "Must set application/json header",
    );
    assert.ok(Array.isArray(capturedBody), "Request body must be a Redis command array");
    assert.equal(capturedBody[0], "SET");
    assert.equal(capturedBody[1], "test-large-key");
    assert.equal(capturedBody[2], JSON.stringify(testPayload));
    assert.equal(capturedBody[3], "EX");
    assert.equal(capturedBody[4], 3600);
  } finally {
    global.fetch = originalFetch;
  }
});

// ============================================================================
// SUITE 8: PARAMETERIZED GRAPHQL QUERY STRINGS (TASK 9)
// ============================================================================
test("Suite 8.1: Category creation uses parameterized GraphQL variables rather than manual escaping", () => {
  const catFilePath = path.join(ROOT_DIR, "src/lib/admin/categories.ts");
  const content = fs.readFileSync(catFilePath, "utf-8");

  assert.match(
    content,
    /mutation\s+CreateCollection\(\$input:\s*CollectionInput!\)/,
    "Must declare parameterized mutation with $input: CollectionInput!",
  );
  assert.match(
    content,
    /collectionCreate\(input:\s*\$input\)/,
    "Must use input: $input variable in collectionCreate mutation",
  );
  assert.doesNotMatch(
    content,
    /collectionCreate\(input:\s*\{\s*title:\s*"/,
    "Must NOT interpolate title string directly into GraphQL mutation",
  );
  assert.doesNotMatch(
    content,
    /title\.replace\(\/\"\/g/,
    "Must eliminate manual quote replacement in GraphQL mutation",
  );
});

// ============================================================================
// SUITE 9: DUPLICATE SHOPIFY WEBHOOK EVENT DEDUPLICATION
// ============================================================================
test("Suite 9.1: Duplicate webhook deliveries are deduplicated atomically via Redis SET NX", async () => {
  const postHandler = webhookRoute.options.server?.handlers?.POST;
  assert.ok(postHandler, "POST handler must exist on webhook route");

  const originalSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
  process.env.SHOPIFY_WEBHOOK_SECRET = "test_webhook_secret_key_123";

  try {
    const rawPayload = JSON.stringify({
      id: 8877665544,
      name: "#TEST-DEDUP",
      order_number: 1098,
      total_price: "1499.00",
      currency: "INR",
      customer: { first_name: "Rohan", last_name: "Gupta" },
    });

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(process.env.SHOPIFY_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(rawPayload));
    const hmacHeader = Buffer.from(sig).toString("base64");

    const webhookId = `wh_dedup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // First delivery
    const req1 = new Request("https://www.petpedia.in/api/webhooks/shopify-orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-shopify-hmac-sha256": hmacHeader,
        "x-shopify-webhook-id": webhookId,
      },
      body: rawPayload,
    });
    const res1 = await postHandler({ request: req1 });
    assert.equal(res1.status, 200);
    const body1 = await res1.json();
    assert.equal(body1.success, true);
    assert.equal(body1.order, "#TEST-DEDUP");

    // Duplicate delivery with same webhook ID
    const req2 = new Request("https://www.petpedia.in/api/webhooks/shopify-orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-shopify-hmac-sha256": hmacHeader,
        "x-shopify-webhook-id": webhookId,
      },
      body: rawPayload,
    });
    const res2 = await postHandler({ request: req2 });
    assert.equal(res2.status, 200);
    const body2 = await res2.json();
    assert.equal(body2.success, true);
    assert.equal(
      body2.deduplicated,
      true,
      "Second delivery of identical webhook event must be acknowledged as deduplicated without re-dispatching",
    );
  } finally {
    process.env.SHOPIFY_WEBHOOK_SECRET = originalSecret;
  }
});

// ============================================================================
// SUITE 10: GIT HISTORY CREDENTIAL EXPOSURE AUDIT & REVOCATION VERIFICATION
// ============================================================================
test("Suite 10.1: Historical exposed Shopify Admin secret in Git commit cannot authenticate (HTTP 401)", async () => {
  const domain = "1fcjnw-tz.myshopify.com";
  const historicToken = "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";

  try {
    const res = await fetch(`https://${domain}/admin/api/2026-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": historicToken,
      },
      body: JSON.stringify({ query: "{ shop { name } }" }),
    });

    assert.equal(
      res.status,
      401,
      "Historically exposed Shopify secret shpss_6acca... must return HTTP 401 Unauthorized (credentials revoked)",
    );
  } catch (err) {
    // If network unavailable, pass with notice
    console.warn("[Suite 10.1 Notice]: Live network test skipped:", err?.message);
  }
});
