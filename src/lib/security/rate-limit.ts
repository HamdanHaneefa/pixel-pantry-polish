import {
  storageGet,
  storageSet,
  storageDelete,
  isProductionEnvironment,
} from "@/lib/storage/adapter";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp ms
  lockRemainingMinutes?: number;
}

interface StoredRateLimit {
  count: number;
  resetAt: number;
  lockUntil?: number;
}

/**
 * Shared persistent rate limiter suitable for multi-instance serverless deployments (Vercel KV / Upstash Redis REST).
 * Fails closed in production if Redis storage is degraded or unavailable to prevent unmetered brute-force attacks.
 */
export async function checkPersistentRateLimit(params: {
  key: string;
  maxAttempts: number;
  windowSeconds: number;
  lockoutSeconds?: number;
}): Promise<RateLimitResult> {
  const { key, maxAttempts, windowSeconds, lockoutSeconds = 0 } = params;
  const storageKey = `ratelimit:${key}`;
  const now = Date.now();

  try {
    const existing = await storageGet<StoredRateLimit | null>(storageKey, null);

    // 1. Check if currently locked out
    if (existing && existing.lockUntil && existing.lockUntil > now) {
      const lockRemainingMinutes = Math.max(1, Math.ceil((existing.lockUntil - now) / 60000));
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.resetAt,
        lockRemainingMinutes,
      };
    }

    // 2. Check if within active window
    if (existing && now < existing.resetAt) {
      const newCount = existing.count + 1;
      if (newCount > maxAttempts) {
        const lockUntil = lockoutSeconds > 0 ? now + lockoutSeconds * 1000 : existing.resetAt;
        const ttl = Math.max(windowSeconds, lockoutSeconds);
        await storageSet(
          storageKey,
          {
            count: newCount,
            resetAt: existing.resetAt,
            lockUntil,
          },
          ttl,
        );
        const lockRemainingMinutes = Math.max(
          1,
          lockoutSeconds > 0
            ? Math.ceil(lockoutSeconds / 60)
            : Math.ceil((existing.resetAt - now) / 60000),
        );
        return {
          allowed: false,
          remaining: 0,
          resetAt: existing.resetAt,
          lockRemainingMinutes,
        };
      }

      const ttl = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      await storageSet(
        storageKey,
        {
          count: newCount,
          resetAt: existing.resetAt,
        },
        ttl,
      );

      return {
        allowed: true,
        remaining: Math.max(0, maxAttempts - newCount),
        resetAt: existing.resetAt,
      };
    }

    // 3. First attempt in new window
    const resetAt = now + windowSeconds * 1000;
    await storageSet(
      storageKey,
      {
        count: 1,
        resetAt,
      },
      windowSeconds,
    );

    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt,
    };
  } catch (error: any) {
    if (isProductionEnvironment()) {
      console.error(
        `[RateLimit FAIL-CLOSED] Persistent rate limiting storage failure in production for key "${key}":`,
        error?.message || error,
      );
      // Fail safely closed in production: reject request to prevent brute force attacks during storage outage
      return {
        allowed: false,
        remaining: 0,
        resetAt: now + 60000,
        lockRemainingMinutes: 1,
      };
    }

    console.warn(
      `[RateLimit Dev Warning] Rate limit storage error, failing open for local dev on key "${key}":`,
      error?.message || error,
    );
    return {
      allowed: true,
      remaining: 1,
      resetAt: now + windowSeconds * 1000,
    };
  }
}

/**
 * Resets the rate limit counter for a specific key (e.g. after successful authentication).
 */
export async function resetPersistentRateLimit(key: string): Promise<void> {
  try {
    await storageDelete(`ratelimit:${key}`);
  } catch (err: any) {
    if (isProductionEnvironment()) {
      console.error(
        `[RateLimit resetPersistentRateLimit] Failed to reset key "${key}" in production:`,
        err?.message || err,
      );
    }
  }
}
