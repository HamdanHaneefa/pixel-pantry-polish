/**
 * Unified Serverless-Friendly Storage Provider Adapter
 *
 * Supports:
 * 1. Vercel KV / Upstash Redis REST (Production multi-lambda shared state)
 * 2. Local JSON Filesystem (Development environment only)
 * 3. In-Memory fallback with TTL (Ephemeral / Edge runtime)
 *
 * In production (NODE_ENV=production or VERCEL=1), in-memory and local file fallbacks
 * are strictly disabled to prevent security bypasses in rate-limiting and webhook deduplication.
 */

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  setIfNotExists<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean>;
  delete(key: string): Promise<void>;
}

export function isProductionEnvironment(): boolean {
  if (typeof process === "undefined" || !process.env) return false;
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

// ----------------------------------------------------
// 1. In-Memory Storage Adapter (with TTL)
// ----------------------------------------------------
interface MemoryRecord {
  value: any;
  expiresAt?: number;
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, MemoryRecord>();

  async get<T>(key: string): Promise<T | null> {
    const record = this.store.get(key);
    if (!record) return null;
    if (record.expiresAt && Date.now() > record.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return record.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async setIfNotExists<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    const existing = await this.get<T>(key);
    if (existing !== null && existing !== undefined) {
      return false;
    }
    await this.set(key, value, ttlSeconds);
    return true;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// ----------------------------------------------------
// 2. Local Filesystem Storage Adapter (Safe for Node.js Dev)
// ----------------------------------------------------
export class FileStorageAdapter implements StorageAdapter {
  private memoryFallback = new MemoryStorageAdapter();

  private getFilePath(key: string, pathMod: any): string {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
    // Standard data files mapping
    const standardFiles: Record<string, string> = {
      "product-stock": "product-stock.json",
      "shipping-settings": "shipping-settings.json",
      "trust-badge-settings": "trust-badge-settings.json",
      "product-payment-rules": "product-payment-rules.json",
      "payment-rules": "product-payment-rules.json",
      sponsors: "sponsors.json",
      "custom-categories": "custom-categories.json",
      "push-subscriptions": "push-subscriptions.json",
      "hidden-products": "hidden-products.json",
      "product-reviews": "product-reviews.json",
    };

    const fileName = standardFiles[safeKey] || `${safeKey}.json`;
    return pathMod.resolve(process.cwd(), "src", "data", fileName);
  }

  async get<T>(key: string): Promise<T | null> {
    if (typeof process === "undefined" || !process.versions?.node) {
      return this.memoryFallback.get<T>(key);
    }

    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const filePath = this.getFilePath(key, path);

      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw) as T;
      }
    } catch {
      // Fall through to memory fallback
    }

    return this.memoryFallback.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.memoryFallback.set(key, value, ttlSeconds);

    if (typeof process === "undefined" || !process.versions?.node) {
      return;
    }

    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const filePath = this.getFilePath(key, path);
      const dir = path.dirname(filePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf-8");
    } catch (err: any) {
      // If filesystem is read-only (e.g. AWS Lambda / Vercel Serverless EROFS), memoryFallback holds state
      console.warn(
        `[FileStorageAdapter] Read-only filesystem notice for key "${key}":`,
        err?.code || err?.message,
      );
    }
  }

  async setIfNotExists<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    const existing = await this.get<T>(key);
    if (existing !== null && existing !== undefined) {
      return false;
    }
    await this.set(key, value, ttlSeconds);
    return true;
  }

  async delete(key: string): Promise<void> {
    await this.memoryFallback.delete(key);

    if (typeof process === "undefined" || !process.versions?.node) {
      return;
    }

    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const filePath = this.getFilePath(key, path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Ignore
    }
  }
}

// ----------------------------------------------------
// 3. Vercel KV / Upstash Redis REST Adapter (Zero-dep HTTP)
// ----------------------------------------------------
export class VercelKvStorageAdapter implements StorageAdapter {
  private url: string;
  private token: string;
  private memoryFallback = new MemoryStorageAdapter();
  private fileFallback = new FileStorageAdapter();

  constructor(url: string, token: string) {
    this.url = url.replace(/\/+$/, "");
    this.token = token;
  }

  private isProd(): boolean {
    return isProductionEnvironment();
  }

  async get<T>(key: string): Promise<T | null> {
    const isSecuritySensitive =
      key.startsWith("ratelimit_") ||
      key.startsWith("wh_dedup_") ||
      key.startsWith("order_idempotency_");

    if (!isSecuritySensitive) {
      const cached = await this.memoryFallback.get<T>(key);
      if (cached !== null && cached !== undefined) {
        return cached;
      }
    }

    try {
      const timeoutMs = this.isProd() ? 4000 : 6000;
      const res = await fetch(`${this.url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${this.token}` },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!res.ok) {
        if (this.isProd()) {
          throw new Error(
            `[VercelKvStorageAdapter] Upstash Redis GET failed with status ${res.status} for key "${key}" in production.`,
          );
        }
        const fileVal = await this.fileFallback.get<T>(key);
        const resolved = fileVal !== null && fileVal !== undefined ? fileVal : await this.memoryFallback.get<T>(key);
        if (resolved !== null && resolved !== undefined && !isSecuritySensitive) {
          await this.memoryFallback.set(key, resolved, 60);
        }
        return resolved;
      }

      const data = await res.json();
      if (!data || data.result === null || data.result === undefined) {
        return null;
      }

      let parsed: T;
      if (typeof data.result === "string") {
        try {
          parsed = JSON.parse(data.result) as T;
        } catch {
          parsed = data.result as unknown as T;
        }
      } else {
        parsed = data.result as T;
      }

      if (!isSecuritySensitive) {
        await this.memoryFallback.set(key, parsed, 60);
      }

      return parsed;
    } catch (err: any) {
      if (this.isProd()) {
        throw new Error(
          `[VercelKvStorageAdapter] Upstash Redis GET error for key "${key}" in production: ${err?.message || err}`,
        );
      }
      console.warn(`[VercelKvStorageAdapter] Upstash request timed out for "${key}", using local fallback.`);
      const fileVal = await this.fileFallback.get<T>(key);
      const fallbackVal =
        fileVal !== null && fileVal !== undefined ? fileVal : await this.memoryFallback.get<T>(key);
      if (fallbackVal !== null && fallbackVal !== undefined && !isSecuritySensitive) {
        await this.memoryFallback.set(key, fallbackVal, 60);
      }
      return fallbackVal;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const isSecuritySensitive =
      key.startsWith("ratelimit_") ||
      key.startsWith("wh_dedup_") ||
      key.startsWith("order_idempotency_");

    if (!isSecuritySensitive) {
      await this.memoryFallback.set(key, value, ttlSeconds || 60);
    }

    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      const cmd = ttlSeconds
        ? ["SET", key, serialized, "EX", ttlSeconds]
        : ["SET", key, serialized];

      const timeoutMs = this.isProd() ? 4000 : 6000;
      const res = await fetch(this.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!res.ok && this.isProd()) {
        throw new Error(
          `[VercelKvStorageAdapter] Upstash Redis SET failed with status ${res.status} for key "${key}" in production.`,
        );
      }
      if (!this.isProd()) {
        await this.fileFallback.set(key, value, ttlSeconds);
      }
    } catch (err: any) {
      if (this.isProd()) {
        throw new Error(
          `[VercelKvStorageAdapter] Upstash Redis SET error for key "${key}" in production: ${err?.message || err}`,
        );
      }
      console.warn(`[VercelKvStorageAdapter] Upstash set timed out for "${key}", saved to local files.`);
      await this.fileFallback.set(key, value, ttlSeconds);
      await this.memoryFallback.set(key, value, ttlSeconds);
    }
  }

  async setIfNotExists<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      const cmd = ttlSeconds
        ? ["SET", key, serialized, "NX", "EX", ttlSeconds]
        : ["SET", key, serialized, "NX"];

      const res = await fetch(this.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) {
        if (this.isProd()) {
          throw new Error(
            `[VercelKvStorageAdapter] Upstash Redis SET NX failed with status ${res.status} for key "${key}" in production.`,
          );
        }
        return false;
      }

      const data = (await res.json()) as { result?: string | null };
      return data?.result === "OK";
    } catch (err: any) {
      if (this.isProd()) {
        throw new Error(
          `[VercelKvStorageAdapter] Upstash Redis SET NX error for key "${key}" in production: ${err?.message || err}`,
        );
      }
      console.warn(`[VercelKvStorageAdapter] Fetch setIfNotExists error for "${key}":`, err);
      const existing = await this.memoryFallback.get<T>(key);
      if (existing !== null && existing !== undefined) return false;
      await this.memoryFallback.set(key, value, ttlSeconds);
      return true;
    }
  }

  async delete(key: string): Promise<void> {
    await this.memoryFallback.delete(key);
    if (!this.isProd()) {
      await this.fileFallback.delete(key);
    }

    try {
      const res = await fetch(`${this.url}/del/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` },
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok && this.isProd()) {
        throw new Error(
          `[VercelKvStorageAdapter] Upstash Redis DEL failed with status ${res.status} for key "${key}" in production.`,
        );
      }
    } catch (err: any) {
      if (this.isProd()) {
        throw new Error(
          `[VercelKvStorageAdapter] Upstash Redis DEL error for key "${key}" in production: ${err?.message || err}`,
        );
      }
      console.warn(`[VercelKvStorageAdapter] Fetch del error for "${key}":`, err);
    }
  }
}

// ----------------------------------------------------
// Global Storage Singleton Provider
// ----------------------------------------------------
let globalStorageInstance: StorageAdapter | null = null;

export function resetStorageInstanceForTesting(): void {
  globalStorageInstance = null;
}

export function getStorage(): StorageAdapter {
  if (globalStorageInstance) {
    return globalStorageInstance;
  }

  const env = typeof process !== "undefined" ? process.env : {};
  const kvUrl = env["KV_REST_API_URL"] || env["UPSTASH_REDIS_REST_URL"] || "";
  const kvToken = env["KV_REST_API_TOKEN"] || env["UPSTASH_REDIS_REST_TOKEN"] || "";

  if (kvUrl && kvToken) {
    globalStorageInstance = new VercelKvStorageAdapter(kvUrl, kvToken);
    return globalStorageInstance;
  }

  // Strictly fail-closed in production: local file/memory fallback is prohibited in production
  if (isProductionEnvironment()) {
    throw new Error(
      "[FATAL SECURITY CONFIGURATION] Persistent storage credentials (KV_REST_API_URL and KV_REST_API_TOKEN) are missing in production. Local storage fallback is strictly disabled to prevent security bypasses.",
    );
  }

  // Local File Storage is ONLY permitted during non-production development
  globalStorageInstance = new FileStorageAdapter();
  return globalStorageInstance;
}

export async function storageGet<T>(key: string, fallback: T): Promise<T> {
  const adapter = getStorage();
  const val = await adapter.get<T>(key);
  return val !== null && val !== undefined ? val : fallback;
}

export async function storageSet<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  const adapter = getStorage();
  await adapter.set<T>(key, value, ttlSeconds);
}

export async function storageSetIfNotExists<T>(
  key: string,
  value: T,
  ttlSeconds?: number,
): Promise<boolean> {
  const adapter = getStorage();
  return await adapter.setIfNotExists<T>(key, value, ttlSeconds);
}

export async function storageDelete(key: string): Promise<void> {
  const adapter = getStorage();
  await adapter.delete(key);
}
