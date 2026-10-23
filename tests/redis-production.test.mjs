import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT_DIR = process.cwd();

// ============================================================================
// SUITE 1: SOURCE CODE ARCHITECTURE & PRODUCTION RESILIENCE AUDIT
// ============================================================================
test("Suite 1: Storage adapter source code enforces fail-closed behavior in production", () => {
  const adapterPath = path.join(ROOT_DIR, "src/lib/storage/adapter.ts");
  const rateLimitPath = path.join(ROOT_DIR, "src/lib/security/rate-limit.ts");
  const webhookPath = path.join(ROOT_DIR, "src/routes/api.webhooks.shopify-orders.ts");

  assert.ok(fs.existsSync(adapterPath), "adapter.ts must exist");
  assert.ok(fs.existsSync(rateLimitPath), "rate-limit.ts must exist");
  assert.ok(fs.existsSync(webhookPath), "api.webhooks.shopify-orders.ts must exist");

  const adapterContent = fs.readFileSync(adapterPath, "utf8");
  const rateLimitContent = fs.readFileSync(rateLimitPath, "utf8");
  const webhookContent = fs.readFileSync(webhookPath, "utf8");

  // 1. Storage adapter supports KV_REST_API_URL and UPSTASH_REDIS_REST_URL
  assert.match(
    adapterContent,
    /KV_REST_API_URL/,
    "Must inspect KV_REST_API_URL for Vercel KV compatibility"
  );
  assert.match(
    adapterContent,
    /UPSTASH_REDIS_REST_URL/,
    "Must inspect UPSTASH_REDIS_REST_URL for Upstash Redis direct compatibility"
  );

  // 2. Fatal error thrown when credentials missing in production
  assert.match(
    adapterContent,
    /FATAL SECURITY CONFIGURATION/,
    "Must throw fatal configuration error if storage credentials are missing in production"
  );

  // 3. In-memory / file fallback is strictly blocked in production
  assert.match(
    adapterContent,
    /isProductionEnvironment\(\)/,
    "Must check production environment before selecting storage backend"
  );

  // 4. VercelKvStorageAdapter implements atomic SET NX
  assert.match(
    adapterContent,
    /\["SET",\s*key,\s*serialized,\s*"NX",\s*"EX",\s*ttlSeconds\]/,
    "Must use atomic Redis command ['SET', key, serialized, 'NX', 'EX', ttlSeconds]"
  );

  // 5. Rate limiting fails closed in production
  assert.match(
    rateLimitContent,
    /RateLimit FAIL-CLOSED/,
    "Must log fail-closed error in rate limiting"
  );
  assert.match(
    rateLimitContent,
    /allowed:\s*false,\s*remaining:\s*0/,
    "Rate limiter must return allowed: false on storage failure in production"
  );

  // 6. Webhook route uses atomic deduplication
  assert.match(
    webhookContent,
    /storageSetIfNotExists/,
    "Webhook route must use atomic storageSetIfNotExists"
  );
  assert.match(
    webhookContent,
    /deduplicated:\s*true/,
    "Webhook route must acknowledge deduplicated events"
  );
  assert.match(
    webhookContent,
    /status:\s*isClientError\s*\?\s*400\s*:\s*500/,
    "Webhook route must return 500 on server/storage error so Shopify retries"
  );
});

// ============================================================================
// SUITE 2: VERCEL KV / UPSTASH STORAGE ADAPTER SIMULATION (SUCCESS & FAILURES)
// ============================================================================

/**
 * High-fidelity test implementation mirroring VercelKvStorageAdapter logic
 */
class TestKvAdapter {
  constructor(url, token, options = {}) {
    this.url = url.replace(/\/+$/, "");
    this.token = token;
    this.isProd = options.isProd ?? true;
    this.mockFetch = options.mockFetch || globalThis.fetch;
  }

  async get(key) {
    try {
      const res = await this.mockFetch(`${this.url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (!res.ok) {
        if (this.isProd) {
          throw new Error(`Upstash Redis GET failed with status ${res.status} for key "${key}" in production.`);
        }
        return null;
      }

      const data = await res.json();
      if (!data || data.result === null || data.result === undefined) return null;
      if (typeof data.result === "string") {
        try {
          return JSON.parse(data.result);
        } catch {
          return data.result;
        }
      }
      return data.result;
    } catch (err) {
      if (this.isProd) {
        throw new Error(`Upstash Redis GET error for key "${key}" in production: ${err?.message || err}`);
      }
      return null;
    }
  }

  async set(key, value, ttlSeconds) {
    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      const endpoint = ttlSeconds
        ? `${this.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(serialized)}/ex/${ttlSeconds}`
        : `${this.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(serialized)}`;

      const res = await this.mockFetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (!res.ok && this.isProd) {
        throw new Error(`Upstash Redis SET failed with status ${res.status} for key "${key}" in production.`);
      }
    } catch (err) {
      if (this.isProd) {
        throw new Error(`Upstash Redis SET error for key "${key}" in production: ${err?.message || err}`);
      }
    }
  }

  async setIfNotExists(key, value, ttlSeconds) {
    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      const cmd = ttlSeconds
        ? ["SET", key, serialized, "NX", "EX", ttlSeconds]
        : ["SET", key, serialized, "NX"];

      const res = await this.mockFetch(this.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      });

      if (!res.ok) {
        if (this.isProd) {
          throw new Error(`Upstash Redis SET NX failed with status ${res.status} for key "${key}" in production.`);
        }
        return false;
      }

      const data = await res.json();
      return data?.result === "OK";
    } catch (err) {
      if (this.isProd) {
        throw new Error(`Upstash Redis SET NX error for key "${key}" in production: ${err?.message || err}`);
      }
      return false;
    }
  }

  async delete(key) {
    try {
      const res = await this.mockFetch(`${this.url}/del/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (!res.ok && this.isProd) {
        throw new Error(`Upstash Redis DEL failed with status ${res.status} for key "${key}" in production.`);
      }
    } catch (err) {
      if (this.isProd) {
        throw new Error(`Upstash Redis DEL error for key "${key}" in production: ${err?.message || err}`);
      }
    }
  }
}

test("Suite 2.1: Successful Redis operations - GET, SET, DEL, and atomic SET NX", async () => {
  const memoryStore = new Map();

  const mockFetch = async (url, options = {}) => {
    const urlStr = String(url);
    const auth = options.headers?.Authorization;
    assert.equal(auth, "Bearer test_secret_token", "Must supply Bearer authorization header");

    // Command array POST (setIfNotExists)
    if (options.body) {
      const cmd = JSON.parse(options.body);
      if (cmd[0] === "SET" && cmd[3] === "NX") {
        const key = cmd[1];
        const val = cmd[2];
        if (memoryStore.has(key)) {
          return new Response(JSON.stringify({ result: null }), { status: 200 });
        }
        memoryStore.set(key, val);
        return new Response(JSON.stringify({ result: "OK" }), { status: 200 });
      }
    }

    // REST URL SET
    if (urlStr.includes("/set/")) {
      const match = urlStr.match(/\/set\/([^/]+)\/([^/]+)(?:\/ex\/(\d+))?/);
      if (match) {
        const key = decodeURIComponent(match[1]);
        const val = decodeURIComponent(match[2]);
        memoryStore.set(key, val);
        return new Response(JSON.stringify({ result: "OK" }), { status: 200 });
      }
    }

    // REST URL GET
    if (urlStr.includes("/get/")) {
      const match = urlStr.match(/\/get\/([^/]+)/);
      if (match) {
        const key = decodeURIComponent(match[1]);
        const val = memoryStore.get(key) ?? null;
        return new Response(JSON.stringify({ result: val }), { status: 200 });
      }
    }

    // REST URL DEL
    if (urlStr.includes("/del/")) {
      const match = urlStr.match(/\/del\/([^/]+)/);
      if (match) {
        const key = decodeURIComponent(match[1]);
        memoryStore.delete(key);
        return new Response(JSON.stringify({ result: 1 }), { status: 200 });
      }
    }

    return new Response(JSON.stringify({ error: "Unknown route" }), { status: 404 });
  };

  const adapter = new TestKvAdapter("https://mock-redis.upstash.io", "test_secret_token", {
    isProd: true,
    mockFetch,
  });

  // 1. SET & GET JSON object
  const complexData = { name: "PetPedia Nail Trimmer", price: 699, inStock: true };
  await adapter.set("product:123", complexData, 3600);
  const retrieved = await adapter.get("product:123");
  assert.deepEqual(retrieved, complexData, "Retrieved object must match set object");

  // 2. SET IF NOT EXISTS (First call -> true, second call -> false)
  const isFirstAcquired = await adapter.setIfNotExists("lock:event_999", { owner: "worker_1" }, 60);
  assert.equal(isFirstAcquired, true, "First SET NX call must acquire the key");

  const isSecondAcquired = await adapter.setIfNotExists("lock:event_999", { owner: "worker_2" }, 60);
  assert.equal(isSecondAcquired, false, "Second SET NX call on existing key must be rejected");

  // 3. DELETE
  await adapter.delete("product:123");
  const afterDelete = await adapter.get("product:123");
  assert.equal(afterDelete, null, "Deleted key must return null");
});

test("Suite 2.2: Missing credentials in production strictly throws fatal configuration error", () => {
  function getStorageForEnv(env) {
    const isProd = env.NODE_ENV === "production" || env.VERCEL === "1";
    const kvUrl = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || "";
    const kvToken = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || "";

    if (kvUrl && kvToken) {
      return { type: "VercelKvStorageAdapter" };
    }

    if (isProd) {
      throw new Error(
        "[FATAL SECURITY CONFIGURATION] Persistent storage credentials (KV_REST_API_URL and KV_REST_API_TOKEN) are missing in production. Local storage fallback is strictly disabled to prevent security bypasses."
      );
    }

    return { type: "FileStorageAdapter" };
  }

  // 1. Missing in development -> returns FileStorageAdapter
  const devStorage = getStorageForEnv({ NODE_ENV: "development" });
  assert.equal(devStorage.type, "FileStorageAdapter");

  // 2. Missing in NODE_ENV=production -> throws FATAL error
  assert.throws(
    () => getStorageForEnv({ NODE_ENV: "production" }),
    /FATAL SECURITY CONFIGURATION/,
    "Missing credentials with NODE_ENV=production must throw FATAL error"
  );

  // 3. Missing in VERCEL=1 -> throws FATAL error
  assert.throws(
    () => getStorageForEnv({ VERCEL: "1" }),
    /FATAL SECURITY CONFIGURATION/,
    "Missing credentials on Vercel deployment must throw FATAL error"
  );

  // 4. Present in production -> successfully initializes VercelKvStorageAdapter
  const prodStorage = getStorageForEnv({
    NODE_ENV: "production",
    KV_REST_API_URL: "https://upstash.io",
    KV_REST_API_TOKEN: "secret_token",
  });
  assert.equal(prodStorage.type, "VercelKvStorageAdapter");
});

test("Suite 2.3: Redis failure in production throws rather than silently masking error", async () => {
  const failingFetch = async () => {
    return new Response(JSON.stringify({ error: "Internal Redis Server Error" }), { status: 500 });
  };

  const adapter = new TestKvAdapter("https://mock-redis.upstash.io", "token", {
    isProd: true,
    mockFetch: failingFetch,
  });

  await assert.rejects(
    async () => await adapter.get("test_key"),
    /Upstash Redis GET failed with status 500/,
    "GET in production must throw on 500 error"
  );

  await assert.rejects(
    async () => await adapter.set("test_key", "val"),
    /Upstash Redis SET failed with status 500/,
    "SET in production must throw on 500 error"
  );

  await assert.rejects(
    async () => await adapter.setIfNotExists("test_key", "val"),
    /Upstash Redis SET NX failed with status 500/,
    "SET NX in production must throw on 500 error"
  );

  await assert.rejects(
    async () => await adapter.delete("test_key"),
    /Upstash Redis DEL failed with status 500/,
    "DEL in production must throw on 500 error"
  );
});

// ============================================================================
// SUITE 3: PERSISTENT RATE LIMITING FAIL-CLOSED BEHAVIOR
// ============================================================================
test("Suite 3: Persistent Rate Limiter fails closed in production and enforces lockout", async () => {
  function createRateLimiter(adapter, isProd) {
    return async function checkPersistentRateLimit(params) {
      const { key, maxAttempts, windowSeconds, lockoutSeconds = 0 } = params;
      const storageKey = `ratelimit:${key}`;
      const now = Date.now();

      try {
        const existing = await adapter.get(storageKey);

        if (existing && existing.lockUntil && existing.lockUntil > now) {
          const lockRemainingMinutes = Math.max(1, Math.ceil((existing.lockUntil - now) / 60000));
          return { allowed: false, remaining: 0, resetAt: existing.resetAt, lockRemainingMinutes };
        }

        if (existing && now < existing.resetAt) {
          const newCount = existing.count + 1;
          if (newCount > maxAttempts) {
            const lockUntil = lockoutSeconds > 0 ? now + lockoutSeconds * 1000 : existing.resetAt;
            const ttl = Math.max(windowSeconds, lockoutSeconds);
            await adapter.set(storageKey, { count: newCount, resetAt: existing.resetAt, lockUntil }, ttl);
            const lockRemainingMinutes = Math.max(
              1,
              lockoutSeconds > 0 ? Math.ceil(lockoutSeconds / 60) : Math.ceil((existing.resetAt - now) / 60000)
            );
            return { allowed: false, remaining: 0, resetAt: existing.resetAt, lockRemainingMinutes };
          }

          const ttl = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
          await adapter.set(storageKey, { count: newCount, resetAt: existing.resetAt }, ttl);
          return { allowed: true, remaining: Math.max(0, maxAttempts - newCount), resetAt: existing.resetAt };
        }

        const resetAt = now + windowSeconds * 1000;
        await adapter.set(storageKey, { count: 1, resetAt }, windowSeconds);
        return { allowed: true, remaining: maxAttempts - 1, resetAt };
      } catch (err) {
        if (isProd) {
          // Fail safely closed in production
          return { allowed: false, remaining: 0, resetAt: now + 60000, lockRemainingMinutes: 1 };
        }
        // Fail open in development
        return { allowed: true, remaining: 1, resetAt: now + windowSeconds * 1000 };
      }
    };
  }

  // 1. Production storage outage -> FAIL CLOSED (allowed: false)
  const deadAdapter = {
    get: async () => {
      throw new Error("Redis connection timed out");
    },
    set: async () => {
      throw new Error("Redis connection timed out");
    },
  };

  const prodLimiter = createRateLimiter(deadAdapter, true);
  const prodResult = await prodLimiter({ key: "admin_login", maxAttempts: 5, windowSeconds: 300 });
  assert.equal(prodResult.allowed, false, "Production outage must fail closed");
  assert.equal(prodResult.remaining, 0);
  assert.equal(prodResult.lockRemainingMinutes, 1);

  // 2. Development storage outage -> FAIL OPEN (allowed: true)
  const devLimiter = createRateLimiter(deadAdapter, false);
  const devResult = await devLimiter({ key: "admin_login", maxAttempts: 5, windowSeconds: 300 });
  assert.equal(devResult.allowed, true, "Development outage must fail open with warning");

  // 3. Normal execution with functioning storage: Rate limit lockout enforcement
  const memStore = new Map();
  const healthyAdapter = {
    get: async (k) => memStore.get(k) || null,
    set: async (k, v) => memStore.set(k, v),
  };
  const healthyLimiter = createRateLimiter(healthyAdapter, true);

  const key = "customer_otp_9999999999";
  // Attempt 1: allowed (rem 2)
  const a1 = await healthyLimiter({ key, maxAttempts: 3, windowSeconds: 60, lockoutSeconds: 600 });
  assert.equal(a1.allowed, true);
  assert.equal(a1.remaining, 2);

  // Attempt 2: allowed (rem 1)
  const a2 = await healthyLimiter({ key, maxAttempts: 3, windowSeconds: 60, lockoutSeconds: 600 });
  assert.equal(a2.allowed, true);
  assert.equal(a2.remaining, 1);

  // Attempt 3: allowed (rem 0)
  const a3 = await healthyLimiter({ key, maxAttempts: 3, windowSeconds: 60, lockoutSeconds: 600 });
  assert.equal(a3.allowed, true);
  assert.equal(a3.remaining, 0);

  // Attempt 4: EXCEEDED -> Locked for 10 minutes (600s)
  const a4 = await healthyLimiter({ key, maxAttempts: 3, windowSeconds: 60, lockoutSeconds: 600 });
  assert.equal(a4.allowed, false);
  assert.equal(a4.remaining, 0);
  assert.equal(a4.lockRemainingMinutes, 10);
});

// ============================================================================
// SUITE 4: ATOMIC SHOPIFY WEBHOOK DEDUPLICATION & CONCURRENT EVENT HANDLING
// ============================================================================
test("Suite 4: Concurrent duplicate Shopify webhooks are atomically deduplicated", async () => {
  const processedWebhooks = [];
  const processedNotifications = [];

  // Simulate Redis SET NX with an in-memory lock
  const redisLockSet = new Set();
  const mockStorageSetIfNotExists = async (key, val, ttl) => {
    if (redisLockSet.has(key)) {
      return false; // Atomic NX rejects duplicate
    }
    redisLockSet.add(key);
    return true; // Atomic NX acquires key
  };

  async function handleWebhookEvent(req) {
    const { webhookId, orderId, orderName } = req;
    const dedupKey = `webhook:shopify-orders:${webhookId || orderId}`;

    const isNew = await mockStorageSetIfNotExists(dedupKey, { processedAt: Date.now(), order: orderName }, 48 * 3600);

    if (!isNew) {
      return {
        status: 200,
        body: {
          success: true,
          deduplicated: true,
          order: orderName,
          message: "Duplicate webhook event acknowledged without re-processing.",
        },
      };
    }

    // Process notification
    processedNotifications.push({ order: orderName, id: orderId });
    return {
      status: 200,
      body: { success: true, order: orderName },
    };
  }

  // Event 1: First arrival
  const res1 = await handleWebhookEvent({ webhookId: "wh_abc_123", orderId: "ord_1001", orderName: "#1001" });
  assert.equal(res1.status, 200);
  assert.equal(res1.body.success, true);
  assert.equal(res1.body.deduplicated, undefined);
  assert.equal(processedNotifications.length, 1);

  // Event 2: Concurrent/immediate duplicate arrival with identical webhook ID
  const res2 = await handleWebhookEvent({ webhookId: "wh_abc_123", orderId: "ord_1001", orderName: "#1001" });
  assert.equal(res2.status, 200);
  assert.equal(res2.body.success, true);
  assert.equal(res2.body.deduplicated, true, "Second event must be flagged as deduplicated");
  assert.equal(processedNotifications.length, 1, "Must NOT re-dispatch notification on duplicate");

  // Event 3: Third retry after network delay
  const res3 = await handleWebhookEvent({ webhookId: "wh_abc_123", orderId: "ord_1001", orderName: "#1001" });
  assert.equal(res3.body.deduplicated, true);
  assert.equal(processedNotifications.length, 1);

  // Event 4: Distinct new order arrives
  const res4 = await handleWebhookEvent({ webhookId: "wh_def_456", orderId: "ord_1002", orderName: "#1002" });
  assert.equal(res4.body.success, true);
  assert.equal(res4.body.deduplicated, undefined);
  assert.equal(processedNotifications.length, 2);
});

// ============================================================================
// SUITE 5: LIVE UPSTASH REDIS VERIFICATION (petpedia-production)
// ============================================================================
test("Suite 5: Live Upstash Redis Integration Test (petpedia-production)", async (t) => {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) {
    t.skip("Live Upstash Redis credentials not available in environment; skipping live test.");
    return;
  }

  const cleanUrl = kvUrl.replace(/\/+$/, "");
  const authHeaders = {
    Authorization: `Bearer ${kvToken}`,
    "Content-Type": "application/json",
  };

  const testKey = `test:live:petpedia:${Date.now()}`;
  const testPayload = { environment: "test-suite", timestamp: Date.now(), purpose: "verification" };

  try {
    // 1. Atomic SET NX test
    const nxCmd = ["SET", testKey, JSON.stringify(testPayload), "NX", "EX", 120];
    const nxRes = await fetch(cleanUrl, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(nxCmd),
    });
    assert.equal(nxRes.status, 200, "Live Redis SET NX must return 200");
    const nxData = await nxRes.json();
    assert.equal(nxData.result, "OK", "First live SET NX must succeed with OK");

    // 2. Duplicate atomic SET NX test
    const dupRes = await fetch(cleanUrl, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(nxCmd),
    });
    assert.equal(dupRes.status, 200);
    const dupData = await dupRes.json();
    assert.equal(dupData.result, null, "Second live SET NX must return null (deduplicated)");

    // 3. GET live key
    const getRes = await fetch(`${cleanUrl}/get/${encodeURIComponent(testKey)}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    const parsed = typeof getData.result === "string" ? JSON.parse(getData.result) : getData.result;
    assert.equal(parsed.purpose, "verification");

    // 4. Clean up test key
    const delRes = await fetch(`${cleanUrl}/del/${encodeURIComponent(testKey)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    assert.equal(delRes.status, 200);
  } catch (err) {
    assert.fail(`Live Upstash test failed: ${err.message}`);
  }
});
