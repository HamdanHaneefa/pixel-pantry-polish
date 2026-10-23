import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { queryShopifyAdmin } from "@/lib/admin/shopify-admin";
import { ADMIN_CONFIG } from "@/lib/admin/config";
import {
  FASTRR_CONFIG,
  calculateHmacSha256,
  getFastrrApiKey,
  getFastrrApiSecret,
} from "@/lib/shiprocket/fastrr";
import { sendMsg91Otp, verifyMsg91Otp, getMsg91Config } from "@/lib/sms/msg91";
import { storageGet, storageSet, storageDelete } from "@/lib/storage/adapter";
import { checkPersistentRateLimit, resetPersistentRateLimit } from "@/lib/security/rate-limit";

const CUSTOMER_SESSION_COOKIE = "petpedia_customer_session";

export function getCustomerSessionSecret(): string {
  const secret =
    (typeof process !== "undefined" && process?.env && process.env["CUSTOMER_SESSION_SECRET"]) ||
    (typeof process !== "undefined" && process?.env && process.env["ADMIN_SESSION_SECRET"]) ||
    ADMIN_CONFIG.adminPasscode;

  if (!secret || typeof secret !== "string" || secret.trim().length === 0) {
    throw new Error(
      "[SECURITY VIOLATION] Missing required customer session signing secret. Authentication fails closed.",
    );
  }
  return secret.trim();
}

export function maskIdentifier(identifier: string): string {
  if (!identifier) return "****";
  if (identifier.includes("@")) {
    const [user, domain] = identifier.split("@");
    const maskedUser = user.length > 2 ? `${user[0]}***${user.slice(-1)}` : `${user[0]}***`;
    return `${maskedUser}@${domain || "***"}`;
  }
  const clean = identifier.replace(/\D/g, "");
  if (clean.length < 4) return "****";
  return `******${clean.slice(-4)}`;
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

// Ephemeral in-memory OTP cache & rate limiting
interface OtpRecord {
  phone: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  fastrrToken?: string;
}

// In-memory stores (survives requests during server lifecycle)
const otpStore = new Map<string, OtpRecord>();

async function getOtpRecord(key: string): Promise<OtpRecord | null> {
  const local = otpStore.get(key) || null;
  return await storageGet<OtpRecord | null>(`otp_${key}`, local);
}

async function setOtpRecord(key: string, record: OtpRecord, ttlSeconds = 300): Promise<void> {
  otpStore.set(key, record);
  await storageSet(`otp_${key}`, record, ttlSeconds);
}

async function deleteOtpRecord(key: string): Promise<void> {
  otpStore.delete(key);
  await storageDelete(`otp_${key}`);
}

export interface CustomerSession {
  phone: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  addresses?: Array<{
    address1?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  }>;
}

// ----------------------------------------------------
// Security Helpers: HMAC-SHA256 Token Signing & Cookies
// ----------------------------------------------------

async function signPayload(payloadStr: string): Promise<string> {
  const secret = getCustomerSessionSecret();
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(payloadStr));
  const binary = String.fromCharCode(...new Uint8Array(signature));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyAndDecodeToken(token: string): Promise<CustomerSession | null> {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const payloadStr = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const expectedSig = await signPayload(payloadStr);

    if (!timingSafeCompare(signature, expectedSig)) {
      return null;
    }

    const data = JSON.parse(payloadStr);
    if (data.exp && Date.now() > data.exp) {
      return null; // Expired session
    }

    return data.customer;
  } catch (err) {
    return null;
  }
}

export async function createSignedToken(customer: CustomerSession): Promise<string> {
  const payload = {
    customer,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days session
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = btoa(payloadStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const signature = await signPayload(payloadStr);
  return `${payloadB64}.${signature}`;
}

export const signCustomerSession = createSignedToken;

export function cleanIndianPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

export interface OrderVerificationPayload {
  orderId: string;
  phone: string;
  total: number;
  issuedAt: number;
}

export async function signOrderToken(payload: OrderVerificationPayload): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = btoa(payloadStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const signature = await signPayload(payloadStr);
  return `${payloadB64}.${signature}`;
}

export async function verifyOrderToken(token: string): Promise<OrderVerificationPayload | null> {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;
    const payloadStr = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const expectedSig = await signPayload(payloadStr);
    if (!timingSafeCompare(signature, expectedSig)) return null;
    const data: OrderVerificationPayload = JSON.parse(payloadStr);
    if (!data.issuedAt || Date.now() - data.issuedAt > 15 * 60 * 1000) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// Server Functions: Authentication & OTP
// ----------------------------------------------------

/**
 * 1. Initiate OTP login via Shiprocket Fastrr S2S
 * Branded SMS from Petpedia
 */
export const initiateCustomerOtpFn = createServerFn({ method: "POST" })
  .validator((data: { identifier: string }) => data)
  .handler(async ({ data }) => {
    const isEmail = data.identifier.includes("@");
    if (isEmail) {
      return {
        success: false,
        error:
          "Email OTP login is temporarily disabled. Please log in using your 10-digit mobile number or Google account.",
      };
    }

    const cleanPhone = cleanIndianPhone(data.identifier || "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return {
        success: false,
        error: "Please enter a valid 10-digit Indian mobile number.",
      };
    }

    const cacheKey = cleanPhone;
    const now = Date.now();

    const rateCheck = await checkPersistentRateLimit({
      key: `customer_otp:${cacheKey}`,
      maxAttempts: 4,
      windowSeconds: 10 * 60,
      lockoutSeconds: 10 * 60,
    });

    if (!rateCheck.allowed) {
      const waitMins = rateCheck.lockRemainingMinutes || 10;
      return {
        success: false,
        error: `Too many OTP requests. Please wait ${waitMins} minute(s) before trying again.`,
      };
    }

    // Generate secure 4-digit OTP for SMS and verification
    const secureOtp = Math.floor(1000 + Math.random() * 9000).toString();

    let fastrrToken: string | undefined = undefined;
    let otpProviderUsed = "local";

    const msg91Config = getMsg91Config();

    if (!isEmail) {
      // 1. Dispatch real SMS via MSG91 SendOTP API if configured
      if (msg91Config.authKey && msg91Config.templateId) {
        try {
          const msg91Result = await sendMsg91Otp({
            phone: cleanPhone,
            otp: secureOtp,
          });
          if (msg91Result.success) {
            otpProviderUsed = "msg91";
            console.log(`[MSG91 Live OTP] Sent successfully to +91${maskIdentifier(cleanPhone)}`);
          } else {
            console.warn(`[MSG91 Live OTP Warning] Provider returned:`, msg91Result.error);
          }
        } catch (msg91Err) {
          console.warn("[MSG91 Initiate Network Exception]:", msg91Err);
        }
      } else {
        // Fallback: Attempt Fastrr S2S Initiate if configured
        try {
          const requestBody = JSON.stringify({
            country_code: "91",
            phone: cleanPhone,
            timestamp: new Date().toISOString(),
            modes: ["sms", "whatsapp"],
          });
          const fastrrSecret = getFastrrApiSecret();
          const fastrrKey = getFastrrApiKey();
          const hmacHash = await calculateHmacSha256(requestBody, fastrrSecret);

          const fastrrRes = await fetch(
            "https://checkout-api.shiprocket.com/api/v1/access-token/s2s-login/initiate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Api-Key": fastrrKey,
                "X-Api-HMAC-SHA256": hmacHash,
                Origin: "https://www.petpedia.in",
              },
              body: requestBody,
            },
          );

          if (fastrrRes.ok) {
            const fastrrData = await fastrrRes.json();
            if (fastrrData?.ok && fastrrData.result?.token) {
              fastrrToken = fastrrData.result.token;
              otpProviderUsed = "fastrr";
              console.log(`[Fastrr S2S Live OTP] Sent to +91${maskIdentifier(cleanPhone)}`);
            }
          }
        } catch (e) {
          console.warn("[Fastrr S2S Initiate Network Warning]:", e);
        }
      }
    }

    // Cache record with 5-minute expiry
    await setOtpRecord(
      cacheKey,
      {
        phone: cacheKey,
        otp: secureOtp,
        expiresAt: now + 5 * 60 * 1000,
        attempts: 0,
        fastrrToken,
      },
      300,
    );

    console.log(
      `[Petpedia Auth OTP (${otpProviderUsed})]: OTP generated and dispatched for ${maskIdentifier(cleanPhone)}`,
    );

    return {
      success: true,
      phone: cacheKey,
      fastrrToken: fastrrToken || `msg91_${cacheKey}_${now}`,
      resendTimer: 30,
      otpLength: 4,
      provider: otpProviderUsed,
      testOtpHint: undefined, // Never expose OTP in response payload
      message: `OTP sent successfully to +91 ${maskIdentifier(cleanPhone)} from Petpedia`,
    };
  });

/**
 * 2. Verify OTP, find or create Shopify Customer, and issue secure session cookie
 */
export const verifyCustomerOtpFn = createServerFn({ method: "POST" })
  .validator((data: { identifier: string; otp: string; token?: string }) => data)
  .handler(async ({ data }) => {
    const isEmail = data.identifier.includes("@");
    if (isEmail) {
      return {
        success: false,
        error:
          "Email OTP login is temporarily disabled. Please log in using your 10-digit mobile number or Google account.",
      };
    }

    const cacheKey = cleanIndianPhone(data.identifier || "");
    const cleanOtp = (data.otp || "").trim();

    if (!cacheKey || cleanOtp.length < 4) {
      return { success: false, error: "Please enter the valid OTP." };
    }

    const cached = await getOtpRecord(cacheKey);
    const now = Date.now();

    let isOtpValid = false;

    // 1. Check local secure server OTP store
    if (cached) {
      if (now > cached.expiresAt) {
        await deleteOtpRecord(cacheKey);
        return { success: false, error: "OTP expired. Please request a new OTP." };
      }
      if (cached.attempts >= 5) {
        await deleteOtpRecord(cacheKey);
        return { success: false, error: "Too many failed attempts. Please request a new OTP." };
      }

      if (timingSafeCompare(cleanOtp, cached.otp)) {
        isOtpValid = true;
        await deleteOtpRecord(cacheKey);
      } else {
        cached.attempts += 1;
        await setOtpRecord(
          cacheKey,
          cached,
          Math.max(10, Math.round((cached.expiresAt - now) / 1000)),
        );
        return { success: false, error: "Invalid OTP. Please check the code sent to your mobile." };
      }
    }

    // 2. If not found in cache (e.g. server restart), verify directly via MSG91 API
    if (!isOtpValid && !isEmail) {
      const msg91Config = getMsg91Config();
      if (msg91Config.authKey) {
        try {
          const verifyResult = await verifyMsg91Otp({
            phone: cacheKey,
            otp: cleanOtp,
          });
          if (verifyResult.success) {
            isOtpValid = true;
          }
        } catch (mErr) {
          console.warn("[MSG91 Verify Fallback Warning]:", mErr);
        }
      }
    }

    // 3. Fallback: Check Fastrr S2S Verify if token exists
    if (!isOtpValid && data.token && data.token.startsWith("hFcFc") && cleanOtp) {
      try {
        const verifyRes = await fetch(
          "https://checkout-api.shiprocket.com/api/v1/access-token/s2s-login/verify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: data.token,
              otp: cleanOtp,
              user_address_consent: true,
            }),
          },
        );
        if (verifyRes.ok) {
          const vData = await verifyRes.json();
          if (vData?.ok) {
            isOtpValid = true;
          }
        }
      } catch (e) {
        console.warn("[Fastrr S2S Verify Fallback]:", e);
      }
    }

    if (!isOtpValid) {
      return { success: false, error: "Invalid OTP. Please try again." };
    }

    // ----------------------------------------------------
    // Find or Auto-Create Customer Profile in Shopify Admin
    // ----------------------------------------------------
    let customer: CustomerSession = {
      phone: isEmail ? "" : `+91${cacheKey}`,
      email: isEmail ? cacheKey : "",
      firstName: "Pet",
      lastName: "Parent",
    };

    const searchQueryParam = isEmail ? `email:${cacheKey}` : `phone:*${cacheKey}*`;

    try {
      const searchRes = await queryShopifyAdmin<{
        customers: {
          edges: Array<{
            node: {
              id: string;
              firstName?: string;
              lastName?: string;
              displayName?: string;
              email?: string;
              phone?: string;
              defaultAddress?: {
                address1?: string;
                city?: string;
                province?: string;
                zip?: string;
                country?: string;
              };
            };
          }>;
        };
      }>(
        `query searchCustomer($query: String!) {
          customers(first: 1, query: $query) {
            edges {
              node {
                id
                firstName
                lastName
                displayName
                email
                phone
                defaultAddress {
                  address1
                  city
                  province
                  zip
                  country
                }
              }
            }
          }
        }`,
        { query: searchQueryParam },
      );

      const foundCustomer = searchRes?.customers?.edges?.[0]?.node;

      if (foundCustomer) {
        customer = {
          phone: foundCustomer.phone || (isEmail ? "" : `+91${cacheKey}`),
          customerId: foundCustomer.id,
          firstName: foundCustomer.firstName || foundCustomer.displayName || "Pet Parent",
          lastName: foundCustomer.lastName || "",
          email: foundCustomer.email || (isEmail ? cacheKey : ""),
          addresses: foundCustomer.defaultAddress ? [foundCustomer.defaultAddress] : [],
        };
      } else {
        // Automatically create new Customer in Shopify
        const createRes = await queryShopifyAdmin<{
          customerCreate: {
            customer?: {
              id: string;
              firstName?: string;
              lastName?: string;
              phone?: string;
              email?: string;
            };
            userErrors?: Array<{ field: string[]; message: string }>;
          };
        }>(
          `mutation createCustomer($input: CustomerInput!) {
            customerCreate(input: $input) {
              customer {
                id
                firstName
                lastName
                phone
                email
              }
              userErrors {
                field
                message
              }
            }
          }`,
          {
            input: {
              firstName: "Pet",
              lastName: "Parent",
              phone: isEmail ? undefined : `+91${cacheKey}`,
              email: isEmail ? cacheKey : undefined,
              note: "Created via Petpedia In-App OTP Login",
              tags: ["Petpedia", "OTP-Verified", "Website"],
            },
          },
        );

        if (createRes?.customerCreate?.customer) {
          const newCust = createRes.customerCreate.customer;
          customer = {
            phone: newCust.phone || (isEmail ? "" : `+91${cacheKey}`),
            customerId: newCust.id,
            firstName: newCust.firstName || "Pet Parent",
            lastName: newCust.lastName || "",
            email: newCust.email || (isEmail ? cacheKey : ""),
          };
        }
      }
    } catch (err) {
      console.warn("[Shopify Customer Lookup/Create Warning]:", err);
      // Still proceed with phone session so user is never locked out
    }

    // Set 100% Secure HttpOnly Cookie
    const signedSessionToken = await createSignedToken(customer);

    setCookie(CUSTOMER_SESSION_COOKIE, signedSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    await resetPersistentRateLimit(`customer_otp:${cacheKey}`);

    return {
      success: true,
      customer,
      message: "Verification successful! Welcome to Petpedia.",
    };
  });

/**
 * Shared helper to find or create Shopify customer and establish signed session cookie
 */
async function syncGoogleCustomerSession(data: {
  email: string;
  firstName: string;
  lastName: string;
}): Promise<CustomerSession> {
  const cleanEmail = data.email.trim().toLowerCase();

  let customer: CustomerSession = {
    phone: "",
    email: cleanEmail,
    firstName: data.firstName || "Google",
    lastName: data.lastName || "User",
  };

  try {
    const searchRes = await queryShopifyAdmin<{
      customers: {
        edges: Array<{
          node: {
            id: string;
            firstName?: string;
            lastName?: string;
            displayName?: string;
            email?: string;
            phone?: string;
            defaultAddress?: {
              address1?: string;
              city?: string;
              province?: string;
              zip?: string;
              country?: string;
            };
          };
        }>;
      };
    }>(
      `query searchCustomer($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              firstName
              lastName
              displayName
              email
              phone
              defaultAddress {
                address1
                city
                province
                zip
                country
              }
            }
          }
        }
      }`,
      { query: `email:${cleanEmail}` },
    );

    const foundCustomer = searchRes?.customers?.edges?.[0]?.node;

    if (foundCustomer) {
      customer = {
        phone: foundCustomer.phone || "",
        customerId: foundCustomer.id,
        firstName: foundCustomer.firstName || foundCustomer.displayName || data.firstName,
        lastName: foundCustomer.lastName || data.lastName,
        email: foundCustomer.email || cleanEmail,
        addresses: foundCustomer.defaultAddress ? [foundCustomer.defaultAddress] : [],
      };
    } else {
      const createRes = await queryShopifyAdmin<{
        customerCreate: {
          customer?: {
            id: string;
            firstName?: string;
            lastName?: string;
            phone?: string;
            email?: string;
          };
        };
      }>(
        `mutation createCustomer($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer {
              id
              firstName
              lastName
              phone
              email
            }
          }
        }`,
        {
          input: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: cleanEmail,
            note: "Created via Petpedia Google Login",
            tags: ["Petpedia", "Google-Auth", "Website"],
          },
        },
      );

      if (createRes?.customerCreate?.customer) {
        const newCust = createRes.customerCreate.customer;
        customer = {
          phone: newCust.phone || "",
          customerId: newCust.id,
          firstName: newCust.firstName || data.firstName,
          lastName: newCust.lastName || data.lastName,
          email: newCust.email || cleanEmail,
        };
      }
    }
  } catch (err) {
    console.warn("[Shopify Google Customer Lookup/Create Warning]:", err);
  }

  const signedSessionToken = await createSignedToken(customer);
  setCookie(CUSTOMER_SESSION_COOKIE, signedSessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return customer;
}

/**
 * Verify Google ID Token (JWT) against Google tokeninfo endpoint
 */
export async function verifyGoogleIdToken(idToken: string): Promise<{
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
} | null> {
  if (!idToken || !idToken.trim()) return null;
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`,
    );
    if (!res.ok) return null;
    const payload = (await res.json()) as any;
    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    if (clientId && payload.aud && payload.aud !== clientId) {
      console.warn(
        "[Google ID Token Verify] Audience mismatch:",
        payload.aud,
        "expected:",
        clientId,
      );
      return null;
    }
    const isEmailVerified = payload.email_verified === "true" || payload.email_verified === true;
    if (!payload.email || !isEmailVerified) {
      return null;
    }
    return {
      email: payload.email,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
    };
  } catch (err) {
    console.error("[verifyGoogleIdToken Exception]:", err);
    return null;
  }
}

/**
 * Handle Google Sign-in Payload (Requires verified Google ID Token or credential)
 */
export const googleLoginCustomerFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      idToken?: string;
      credential?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const token = data.idToken || data.credential;
    if (!token) {
      return {
        success: false,
        error:
          "Missing Google ID token or verification credential. Direct unverified email login is disabled.",
      };
    }

    const verified = await verifyGoogleIdToken(token);
    if (!verified) {
      return { success: false, error: "Invalid or expired Google authentication credential." };
    }

    const customer = await syncGoogleCustomerSession({
      email: verified.email,
      firstName: verified.given_name || verified.name || data.firstName || "Customer",
      lastName: verified.family_name || data.lastName || "",
    });

    return {
      success: true,
      customer,
      message: "Signed in with Google successfully!",
    };
  });

/**
 * Retrieve configured Google Client ID from server environment
 */
export const getGoogleClientIdFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<string> => {
    return process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
  },
);

const OAUTH_STATE_COOKIE = "petpedia_oauth_state";

export interface GoogleOAuthStatePayload {
  nonce: string;
  timestamp: number;
  redirect?: string;
  redirectUri: string;
}

export async function createSignedOAuthState(params: {
  redirect?: string;
  redirectUri: string;
}): Promise<string> {
  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  const payload: GoogleOAuthStatePayload = {
    nonce,
    timestamp,
    redirect: params.redirect || "/account",
    redirectUri: params.redirectUri,
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = btoa(payloadStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const signature = await signPayload(payloadStr);
  return `${payloadB64}.${signature}`;
}

export async function verifySignedOAuthState(
  stateToken: string,
): Promise<GoogleOAuthStatePayload | null> {
  if (!stateToken || typeof stateToken !== "string") return null;
  const parts = stateToken.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  try {
    const payloadStr = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const expectedSig = await signPayload(payloadStr);
    if (!timingSafeCompare(signature, expectedSig)) {
      return null;
    }
    const payload = JSON.parse(payloadStr) as GoogleOAuthStatePayload;
    // Check 10-minute expiry
    if (!payload.timestamp || Date.now() - payload.timestamp > 10 * 60 * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Generate cryptographically secure signed CSRF state and set HTTP-only cookie
 */
export const generateGoogleOAuthStateFn = createServerFn({ method: "POST" })
  .validator((data: { redirect?: string; redirectUri: string }) => data)
  .handler(async ({ data }) => {
    const stateToken = await createSignedOAuthState({
      redirect: data.redirect,
      redirectUri: data.redirectUri,
    });
    setCookie(OAUTH_STATE_COOKIE, stateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600, // 10 minutes
    });
    return { stateToken };
  });

/**
 * Exchange Google OAuth Authorization Code for tokens and complete customer login with CSRF verification
 */
export const exchangeGoogleAuthCodeFn = createServerFn({ method: "POST" })
  .validator((data: { code: string; redirectUri: string; state?: string }) => data)
  .handler(async ({ data }) => {
    const { code, redirectUri, state } = data;
    if (!code) {
      return { success: false, error: "No authorization code provided." };
    }

    // Cryptographic CSRF state validation
    const cookieState = getCookie(OAUTH_STATE_COOKIE);
    if (!state || !cookieState) {
      return {
        success: false,
        error:
          "Missing OAuth CSRF security state. Sign-in must be initiated from this browser session.",
      };
    }

    if (!timingSafeCompare(state, cookieState)) {
      deleteCookie(OAUTH_STATE_COOKIE);
      return {
        success: false,
        error: "OAuth state mismatch (potential CSRF attempt). Please initiate sign-in again.",
      };
    }

    const verifiedState = await verifySignedOAuthState(state);
    deleteCookie(OAUTH_STATE_COOKIE); // Consume state token immediately

    if (!verifiedState) {
      return {
        success: false,
        error: "Expired or invalid OAuth state token. Please initiate sign-in again.",
      };
    }

    if (verifiedState.redirectUri && verifiedState.redirectUri !== redirectUri) {
      return {
        success: false,
        error: "Redirect URI mismatch against authorized OAuth state.",
      };
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
    const clientSecret =
      process.env.GOOGLE_CLIENT_SECRET || process.env.VITE_GOOGLE_CLIENT_SECRET || "";

    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("[Google OAuth Code Exchange Error]:", errText);
        return {
          success: false,
          error: "Failed to exchange Google authorization code: " + errText,
        };
      }

      const tokenData = (await tokenRes.json()) as { access_token?: string };
      const accessToken = tokenData.access_token;
      if (!accessToken) {
        return { success: false, error: "No access token received from Google." };
      }

      const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userRes.ok) {
        return { success: false, error: "Failed to fetch user profile from Google." };
      }

      const userData = (await userRes.json()) as {
        email?: string;
        given_name?: string;
        name?: string;
        family_name?: string;
      };

      const email = (userData.email || "").trim().toLowerCase();
      const firstName = userData.given_name || userData.name || "Pet";
      const lastName = userData.family_name || "Parent";

      if (!email) {
        return { success: false, error: "No email address found in Google profile." };
      }

      const customer = await syncGoogleCustomerSession({ email, firstName, lastName });

      return {
        success: true,
        customer,
        message: "Signed in with Google successfully!",
      };
    } catch (err: any) {
      console.error("[exchangeGoogleAuthCodeFn Error]:", err);
      return { success: false, error: err?.message || "Failed to process Google sign-in." };
    }
  });

/**
 * 3. Retrieve Current Customer Session
 */
export const getCustomerSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const cookieVal = getCookie(CUSTOMER_SESSION_COOKIE);
  if (!cookieVal) {
    return { authenticated: false, customer: null };
  }

  const customer = await verifyAndDecodeToken(cookieVal);
  if (!customer) {
    return { authenticated: false, customer: null };
  }

  return { authenticated: true, customer };
});

/**
 * 4. Get Customer Orders (from Shopify Admin GraphQL by phone / customer ID)
 */
export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  name: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  itemCount: number;
  tags: string[];
  isReturnRequested?: boolean;
  returnReason?: string;
  items: Array<{
    id: string;
    title: string;
    variantTitle?: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress?: {
    name?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  };
  billingAddress?: {
    name?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  };
}

interface ReturnRequestRecord {
  reason: string;
  notes?: string;
  resolution?: string;
  date: string;
}

const localReturnRequestsCache = new Map<string, ReturnRequestRecord>();

async function getReturnRequest(orderKey: string): Promise<ReturnRequestRecord | null> {
  const local = localReturnRequestsCache.get(orderKey) || null;
  return await storageGet<ReturnRequestRecord | null>(`return_req:${orderKey}`, local);
}

async function setReturnRequest(orderKey: string, record: ReturnRequestRecord): Promise<void> {
  localReturnRequestsCache.set(orderKey, record);
  await storageSet(`return_req:${orderKey}`, record, 365 * 24 * 3600);
}

export const getCustomerOrdersFn = createServerFn({ method: "GET" }).handler(async () => {
  const cookieVal = getCookie(CUSTOMER_SESSION_COOKIE);
  if (!cookieVal) {
    return { success: false, error: "Not authenticated", orders: [] };
  }

  const customer = await verifyAndDecodeToken(cookieVal);
  if (!customer || (!customer.phone && !customer.email)) {
    return { success: false, error: "Invalid session", orders: [] };
  }

  const cleanPhone = customer.phone ? cleanIndianPhone(customer.phone) : "";

  try {
    const searchTerms = [];
    if (customer.customerId) {
      searchTerms.push(`customer_id:${customer.customerId.replace(/\D/g, "")}`);
    }
    if (cleanPhone) {
      searchTerms.push(`phone:*${cleanPhone}*`);
    }
    if (customer.email) {
      searchTerms.push(`email:${customer.email}`);
    }

    const searchQuery = searchTerms.length > 0 ? searchTerms.join(" OR ") : "tag:impossible";

    const data = await queryShopifyAdmin<{
      orders: {
        edges: Array<{
          node: {
            id: string;
            name: string;
            createdAt: string;
            tags?: string[];
            note?: string;
            displayFinancialStatus: string;
            displayFulfillmentStatus: string;
            paymentGatewayNames?: string[];
            totalPriceSet: {
              shopMoney: {
                amount: string;
                currencyCode: string;
              };
            };
            subtotalPriceSet?: {
              shopMoney: {
                amount: string;
                currencyCode: string;
              };
            };
            totalShippingPriceSet?: {
              shopMoney: {
                amount: string;
                currencyCode: string;
              };
            };
            lineItems: {
              edges: Array<{
                node: {
                  id: string;
                  title: string;
                  variantTitle?: string;
                  quantity: number;
                  originalUnitPriceSet: {
                    shopMoney: {
                      amount: string;
                      currencyCode: string;
                    };
                  };
                  image?: {
                    url: string;
                    altText?: string;
                  };
                };
              }>;
            };
            shippingAddress?: {
              name?: string;
              phone?: string;
              address1?: string;
              address2?: string;
              city?: string;
              province?: string;
              zip?: string;
              country?: string;
            };
            billingAddress?: {
              name?: string;
              phone?: string;
              address1?: string;
              address2?: string;
              city?: string;
              province?: string;
              zip?: string;
              country?: string;
            };
          };
        }>;
      };
    }>(
      `query getCustomerOrders($query: String!) {
        orders(first: 30, sortKey: CREATED_AT, reverse: true, query: $query) {
          edges {
            node {
              id
              name
              createdAt
              tags
              note
              displayFinancialStatus
              displayFulfillmentStatus
              paymentGatewayNames
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              subtotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalShippingPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 20) {
                edges {
                  node {
                    id
                    title
                    variantTitle
                    quantity
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    image {
                      url
                      altText
                    }
                  }
                }
              }
              shippingAddress {
                name
                phone
                address1
                address2
                city
                province
                zip
                country
              }
              billingAddress {
                name
                phone
                address1
                address2
                city
                province
                zip
                country
              }
            }
          }
        }
      }`,
      { query: searchQuery },
    );

    const orders: CustomerOrderSummary[] = await Promise.all(
      (data?.orders?.edges || []).map(async ({ node }) => {
        const lineItems = (node.lineItems?.edges || []).map((e) => ({
          id: e.node.id,
          title: e.node.title,
          variantTitle:
            e.node.variantTitle && e.node.variantTitle !== "Default Title"
              ? e.node.variantTitle
              : undefined,
          quantity: e.node.quantity,
          price: parseFloat(e.node.originalUnitPriceSet?.shopMoney?.amount || "0"),
          image: e.node.image?.url || "/placeholder-product.png",
        }));

        const totalQuantity = lineItems.reduce((acc, it) => acc + it.quantity, 0);
        const totalAmount = parseFloat(node.totalPriceSet?.shopMoney?.amount || "0");
        const subtotalAmount = parseFloat(
          node.subtotalPriceSet?.shopMoney?.amount ||
            (totalAmount > 0 ? (totalAmount - (totalAmount > 500 ? 0 : 105)).toString() : "0"),
        );
        const shippingAmount = parseFloat(
          node.totalShippingPriceSet?.shopMoney?.amount || (totalAmount > 500 ? "0" : "105"),
        );

        const orderNumber = node.name.replace(/^#/, "");
        const orderTags = node.tags || [];
        const localReturn =
          (await getReturnRequest(node.id)) || (await getReturnRequest(orderNumber));
        const isReturnRequested = Boolean(
          localReturn ||
          orderTags.some(
            (t) => t.toLowerCase().includes("return") || t.toLowerCase().includes("cancelled"),
          ),
        );

        const paymentMethod =
          (node.paymentGatewayNames && node.paymentGatewayNames[0]) || "Cash on delivery (cod)";

        return {
          id: node.id,
          name: node.name,
          orderNumber,
          createdAt: node.createdAt,
          financialStatus: node.displayFinancialStatus || "PAID",
          fulfillmentStatus: node.displayFulfillmentStatus || "UNFULFILLED",
          paymentMethod,
          subtotal: subtotalAmount,
          shippingFee: shippingAmount,
          total: totalAmount,
          currency: node.totalPriceSet?.shopMoney?.currencyCode || "INR",
          itemCount: totalQuantity || lineItems.length || 1,
          tags: orderTags,
          isReturnRequested,
          returnReason: localReturn?.reason,
          items: lineItems,
          shippingAddress: node.shippingAddress,
          billingAddress: node.billingAddress || node.shippingAddress,
        };
      }),
    );

    return { success: true, orders };
  } catch (err: any) {
    console.error("[getCustomerOrdersFn Error]:", err);
    return { success: false, error: err.message || "Failed to load orders", orders: [] };
  }
});

/**
 * Request Order Return / Cancellation
 */
export const requestOrderReturnFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      orderId: string;
      orderNumber?: string;
      reason: string;
      notes?: string;
      resolution?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const cookieVal = getCookie(CUSTOMER_SESSION_COOKIE);
    if (!cookieVal) {
      return { success: false, error: "Not authenticated" };
    }

    const customer = await verifyAndDecodeToken(cookieVal);
    if (!customer) {
      return { success: false, error: "Invalid session" };
    }

    const { orderId, orderNumber, reason, notes, resolution } = data;

    // Verify order ownership to prevent Insecure Direct Object References (IDOR)
    try {
      const gid = orderId.startsWith("gid://")
        ? orderId
        : `gid://shopify/Order/${orderId.replace(/\D/g, "")}`;
      const orderCheck = await queryShopifyAdmin<{
        order: {
          id: string;
          customer?: { id: string; email?: string; phone?: string };
          shippingAddress?: { phone?: string };
          billingAddress?: { phone?: string };
        } | null;
      }>(
        `query checkOrderOwner($id: ID!) {
          order(id: $id) {
            id
            customer { id email phone }
            shippingAddress { phone }
            billingAddress { phone }
          }
        }`,
        { id: gid },
      );

      if (!orderCheck?.order) {
        return {
          success: false,
          error: "Order not found. Return requests can only be placed for valid Shopify orders.",
        };
      }

      const oCust = orderCheck.order.customer;
      const oCustPhone = oCust?.phone ? cleanIndianPhone(oCust.phone) : "";
      const shipPhone = orderCheck.order.shippingAddress?.phone
        ? cleanIndianPhone(orderCheck.order.shippingAddress.phone)
        : "";
      const billPhone = orderCheck.order.billingAddress?.phone
        ? cleanIndianPhone(orderCheck.order.billingAddress.phone)
        : "";
      const userPhone = customer.phone ? cleanIndianPhone(customer.phone) : "";
      const userEmail = (customer.email || "").toLowerCase().trim();
      const oEmail = (oCust?.email || "").toLowerCase().trim();

      const phoneMatches =
        userPhone &&
        (userPhone === oCustPhone || userPhone === shipPhone || userPhone === billPhone);
      const emailMatches = userEmail && userEmail === oEmail;
      const idMatches =
        customer.customerId &&
        oCust?.id &&
        customer.customerId.replace(/\D/g, "") === oCust.id.replace(/\D/g, "");

      if (!phoneMatches && !emailMatches && !idMatches) {
        return {
          success: false,
          error: "Unauthorized: You do not have permission to request a return for this order.",
        };
      }
    } catch (checkErr) {
      console.error("[requestOrderReturnFn Ownership Check Error]:", checkErr);
      return {
        success: false,
        error:
          "Unable to verify order ownership at this time. Please try again later or contact customer support.",
      };
    }

    // Save in persistent store
    const returnRecord: ReturnRequestRecord = {
      reason,
      notes,
      resolution: resolution || "Refund to Original Payment Mode",
      date: new Date().toISOString(),
    };
    await setReturnRequest(orderId, returnRecord);
    if (orderNumber) {
      await setReturnRequest(orderNumber, returnRecord);
    }

    // Update Shopify order with tags and note
    try {
      const tag = `Return Requested: ${reason}`;
      await queryShopifyAdmin(
        `mutation addOrderTags($id: ID!, $tags: [String!]!) {
          tagsAdd(id: $id, tags: $tags) {
            node {
              id
            }
            userErrors {
              field
              message
            }
          }
        }`,
        {
          id: orderId.startsWith("gid://") ? orderId : `gid://shopify/Order/${orderId}`,
          tags: ["Return Requested", tag, "Website Return"],
        },
      );
    } catch (e) {
      console.warn("[requestOrderReturnFn Shopify Sync Warning]:", e);
    }

    return {
      success: true,
      message: "Return request submitted successfully. Our support team will process it shortly.",
    };
  });

/**
 * 5. Update Customer Profile in Shopify Admin
 */
export const updateCustomerProfileFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      firstName: string;
      lastName: string;
      email?: string;
      dob?: string;
      gender?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const cookieVal = getCookie(CUSTOMER_SESSION_COOKIE);
    if (!cookieVal) {
      return { success: false, error: "Not authenticated" };
    }

    const currentCustomer = await verifyAndDecodeToken(cookieVal);
    if (!currentCustomer) {
      return { success: false, error: "Invalid session" };
    }

    const updatedCustomer: CustomerSession = {
      ...currentCustomer,
      firstName: data.firstName.trim() || currentCustomer.firstName,
      lastName: data.lastName.trim() || currentCustomer.lastName,
      email: data.email?.trim() || currentCustomer.email,
    };

    // If Shopify customer ID is known, sync with Shopify Admin API
    if (currentCustomer.customerId) {
      try {
        await queryShopifyAdmin(
          `mutation customerUpdate($input: CustomerInput!) {
            customerUpdate(input: $input) {
              customer {
                id
                firstName
                lastName
                email
              }
              userErrors {
                field
                message
              }
            }
          }`,
          {
            input: {
              id: currentCustomer.customerId,
              firstName: updatedCustomer.firstName,
              lastName: updatedCustomer.lastName,
              email: updatedCustomer.email || undefined,
            },
          },
        );
      } catch (e) {
        console.warn("[Shopify Customer Update Sync Warning]:", e);
      }
    }

    // Refresh Session Cookie with updated customer profile
    const token = await createSignedToken(updatedCustomer);
    setCookie(CUSTOMER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return { success: true, customer: updatedCustomer };
  });

/**
 * 6. Logout Customer
 */
export const logoutCustomerFn = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(CUSTOMER_SESSION_COOKIE);
  return { success: true };
});

/**
 * 7. Auto-Authenticate After Checkout (Seamless No-Login Redirect)
 * Call this when a guest user finishes paying for an order
 */
export const autoAuthenticateAfterOrderFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      phone: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      orderId?: string;
      orderToken?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const cleanPhone = cleanIndianPhone(data.phone || "");
    if (!cleanPhone) {
      return { success: false, error: "Missing phone number" };
    }

    // Require and verify order verification token to prevent privilege escalation
    if (!data.orderToken) {
      return {
        success: false,
        error: "Missing order verification token. Authentication requires a verified order.",
      };
    }

    const verified = await verifyOrderToken(data.orderToken);
    if (!verified) {
      return {
        success: false,
        error: "Invalid or expired order verification token.",
      };
    }

    const verifiedPhoneClean = cleanIndianPhone(verified.phone || "");
    if (verifiedPhoneClean !== cleanPhone) {
      return {
        success: false,
        error: "Phone number mismatch with verified order.",
      };
    }

    if (data.orderId && verified.orderId !== data.orderId) {
      return {
        success: false,
        error: "Order ID mismatch with verified order.",
      };
    }

    // Provision or verify customer session
    const customer: CustomerSession = {
      phone: `+91${cleanPhone}`,
      firstName: data.firstName || "Customer",
      lastName: data.lastName || "",
      email: data.email || "",
    };

    const token = await createSignedToken(customer);
    setCookie(CUSTOMER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return { success: true, customer };
  });
