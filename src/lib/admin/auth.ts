import { createServerFn, createMiddleware } from "@tanstack/react-start";
import {
  getCookie,
  setCookie,
  deleteCookie,
  getRequestIP,
  getRequestHeader,
} from "@tanstack/react-start/server";
import { ADMIN_CONFIG } from "./config";
import { checkPersistentRateLimit, resetPersistentRateLimit } from "@/lib/security/rate-limit";

function getClientIp(): string {
  try {
    const directIp = getRequestIP();
    if (directIp && directIp !== "127.0.0.1" && directIp !== "::1") {
      return directIp;
    }
    const forwarded = getRequestHeader("x-forwarded-for");
    if (forwarded) {
      const parts = forwarded.split(",");
      const first = parts[0]?.trim();
      if (first) return first;
    }
    const realIp = getRequestHeader("x-real-ip");
    if (realIp) return realIp.trim();
    return directIp || "unknown_ip";
  } catch {
    return "unknown_ip";
  }
}

export function getAdminSigningSecret(): string {
  const secret =
    (typeof process !== "undefined" && process?.env && process.env["ADMIN_SESSION_SECRET"]) ||
    (typeof process !== "undefined" && process?.env && process.env["ADMIN_PASSCODE"]) ||
    ADMIN_CONFIG.adminPasscode;

  if (!secret || typeof secret !== "string" || secret.trim().length === 0) {
    throw new Error(
      "[SECURITY VIOLATION] Missing required administrator signing secret. Authentication fails closed.",
    );
  }
  return secret.trim();
}

export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export interface AdminSessionPayload {
  role: "admin";
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

export async function signAdminSession(payload: AdminSessionPayload): Promise<string> {
  const secret = getAdminSigningSecret();
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const payloadStr = JSON.stringify(payload);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadStr));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const payloadB64 = btoa(payloadStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${payloadB64}.${sigB64}`;
}

export async function verifyAdminSessionToken(token?: string): Promise<boolean> {
  if (!token || typeof token !== "string") return false;

  try {
    const parts = token.split(".");
    // Strictly require payload.signature format (2 parts) - legacy bypass completely removed
    if (parts.length !== 2) {
      return false;
    }

    const [payloadB64, sigB64] = parts;
    if (!payloadB64 || !sigB64) return false;

    const secret = getAdminSigningSecret();
    const payloadStr = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const expectedSig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadStr));
    const expectedSigB64 = btoa(String.fromCharCode(...new Uint8Array(expectedSig)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (!timingSafeCompare(sigB64, expectedSigB64)) {
      return false;
    }

    const data: AdminSessionPayload = JSON.parse(payloadStr);
    if (!data.expiresAt || Date.now() > data.expiresAt) {
      return false; // Expired
    }

    return data.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Server middleware that strictly verifies an active administrator session
 * before allowing server function execution.
 */
export const adminAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const session = getCookie(ADMIN_CONFIG.sessionCookieName);
  const isValid = await verifyAdminSessionToken(session);
  if (!isValid) {
    throw new Error("UNAUTHORIZED: Valid administrator session required.");
  }
  return next();
});

export const checkAdminAuthFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = getCookie(ADMIN_CONFIG.sessionCookieName);
  const authenticated = await verifyAdminSessionToken(session);
  return { authenticated };
});

export const loginAdminFn = createServerFn({ method: "POST" })
  .validator((data: { passcode: string }) => data)
  .handler(async ({ data }) => {
    const clientIp = getClientIp();
    const rateLimitKey = `admin_login:${clientIp}`;

    const rateCheck = await checkPersistentRateLimit({
      key: rateLimitKey,
      maxAttempts: 5,
      windowSeconds: 15 * 60,
      lockoutSeconds: 15 * 60,
    });

    if (!rateCheck.allowed) {
      const remainingMins = rateCheck.lockRemainingMinutes || 15;
      return {
        success: false,
        error: `Too many failed attempts. Account locked for ${remainingMins} minute(s).`,
      };
    }

    const adminPasscode = ADMIN_CONFIG.adminPasscode?.trim();
    if (!adminPasscode) {
      return {
        success: false,
        error: "Administrator login is disabled: ADMIN_PASSCODE is not configured on this server.",
      };
    }


    const cleanPasscode = (data.passcode || "").trim();
    if (!timingSafeCompare(cleanPasscode, adminPasscode)) {
      return {
        success: false,
        error: "Invalid admin passcode.",
      };
    }

    // Reset rate limit on success for this client IP
    await resetPersistentRateLimit(rateLimitKey);

    const now = Date.now();
    const token = await signAdminSession({
      role: "admin",
      issuedAt: now,
      expiresAt: now + 1000 * 60 * 60 * 24 * 7, // 7 days
      nonce: Math.random().toString(36).substring(2, 10),
    });

    setCookie(ADMIN_CONFIG.sessionCookieName, token, {
      httpOnly: true,
      secure:
        typeof process !== "undefined" &&
        Boolean(process.env && process.env["NODE_ENV"] === "production"),
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  });

export const logoutAdminFn = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(ADMIN_CONFIG.sessionCookieName);
  return { success: true };
});
