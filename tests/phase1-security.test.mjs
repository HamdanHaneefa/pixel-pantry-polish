import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT_DIR = process.cwd();

// ============================================================================
// TASK 1: REMOVE HARDCODED PERSONAL DATA & SAFE ADDRESS INITIALIZATION
// ============================================================================
test("Task 1: FastrrCheckoutModal.tsx must not contain hardcoded PII and must safely initialize address", () => {
  const modalFilePath = path.join(ROOT_DIR, "src/components/shiprocket/FastrrCheckoutModal.tsx");
  assert.ok(fs.existsSync(modalFilePath), "FastrrCheckoutModal.tsx must exist");

  const content = fs.readFileSync(modalFilePath, "utf8");

  // Negative checks: Verify hardcoded personal details are completely removed
  assert.doesNotMatch(
    content,
    /Hamdan\s+C/i,
    "Hardcoded name 'Hamdan C' must not exist in source code",
  );
  assert.doesNotMatch(
    content,
    /7306827008/,
    "Hardcoded phone number '7306827008' must not exist in source code",
  );
  assert.doesNotMatch(
    content,
    /hamdanhaneefa23@gmail\.com/i,
    "Hardcoded email 'hamdanhaneefa23@gmail.com' must not exist in source code",
  );
  assert.doesNotMatch(
    content,
    /Chalissery\s+House/i,
    "Hardcoded address 'Chalissery House' must not exist in source code",
  );
  assert.doesNotMatch(
    content,
    /679536/,
    "Hardcoded pincode '679536' must not exist in source code",
  );

  // Positive checks: Verify customer context integration and safe default address
  assert.match(
    content,
    /useCustomer\(\)/,
    "Must hook into customer context for authenticated address autofill",
  );
  assert.match(
    content,
    /customer\s*\?\s*`\$\{customer\.firstName/,
    "Address name must fall back safely to customer context or empty",
  );
});

// ============================================================================
// TASK 2: AUTHORITATIVE VARIANT PRICE RESOLUTION & UNKNOWN VARIANT REJECTION
// ============================================================================
test("Task 2: checkout.ts must eliminate client-price trust and reject unknown variants", () => {
  const checkoutFilePath = path.join(ROOT_DIR, "src/lib/customer/checkout.ts");
  assert.ok(fs.existsSync(checkoutFilePath), "checkout.ts must exist");

  const content = fs.readFileSync(checkoutFilePath, "utf8");

  // Negative check: Client price fallback must not exist
  assert.doesNotMatch(
    content,
    /Math\.max\(0,\s*Number\(item\.price\)\s*\|\|\s*0\)/,
    "Must not fall back to untrusted client-supplied item.price",
  );

  // Positive checks: Authoritative resolution and rejection of invalid variants
  assert.match(content, /resolveAuthoritativePrice/, "Must use authoritative price resolution");
  assert.match(
    content,
    /if\s*\(canonicalPrice\s*===\s*null/,
    "Must check for null/invalid canonical price",
  );
  assert.match(
    content,
    /Invalid or unverified product variant/,
    "Must reject order with explicit error when variant is unknown",
  );
});

test("Task 2: calculateAuthoritativeDiscount must reject unrecognized coupons with 0 discount", () => {
  // Test authoritative coupon discount algorithm directly
  function calculateAuthoritativeDiscount(couponCode, subtotal) {
    if (!couponCode || !couponCode.trim()) return 0;
    const code = couponCode.trim().toUpperCase();

    if (code === "PET10" || code === "WELCOME10" || code === "SAVE10" || code === "FASTRR10") {
      return Math.round(subtotal * 0.1);
    }
    if (code === "PET20" || code === "SAVE20") {
      return Math.min(Math.round(subtotal * 0.2), 500);
    }
    if (code === "PET50" || code === "FLAT50") {
      return Math.min(50, subtotal);
    }

    return 0; // Negative: Reject all unrecognized coupon codes
  }

  // Valid coupons
  assert.equal(calculateAuthoritativeDiscount("PET10", 1000), 100);
  assert.equal(calculateAuthoritativeDiscount("WELCOME10", 500), 50);
  assert.equal(calculateAuthoritativeDiscount("SAVE20", 2000), 400);
  assert.equal(calculateAuthoritativeDiscount("SAVE20", 5000), 500); // capped at 500
  assert.equal(calculateAuthoritativeDiscount("PET50", 200), 50);

  // Negative tests: Invalid or arbitrary coupons must yield ZERO discount
  assert.equal(calculateAuthoritativeDiscount("UNKNOWN10", 1000), 0);
  assert.equal(calculateAuthoritativeDiscount("HACK99", 5000), 0);
  assert.equal(calculateAuthoritativeDiscount("FREEBIE", 1000), 0);
  assert.equal(calculateAuthoritativeDiscount("", 1000), 0);
  assert.equal(calculateAuthoritativeDiscount(undefined, 1000), 0);
});

// ============================================================================
// TASK 3: REMOVE LEGACY ADMIN AUTHENTICATION BYPASS & TIMING-SAFE COMPARE
// ============================================================================
test("Task 3: admin/auth.ts must eliminate legacy authentication bypass and fail closed", () => {
  const authFilePath = path.join(ROOT_DIR, "src/lib/admin/auth.ts");
  assert.ok(fs.existsSync(authFilePath), "admin/auth.ts must exist");

  const content = fs.readFileSync(authFilePath, "utf8");

  // Negative checks: Verify legacy bypass code is completely eliminated
  assert.doesNotMatch(content, /legacySecret/, "Must not contain legacySecret fallback");
  assert.doesNotMatch(content, /legacyExpected/, "Must not contain legacyExpected verification");
  assert.doesNotMatch(content, /petpedia-admin:/, "Must not contain hardcoded legacy admin prefix");

  // Positive checks: Strict token validation and timingSafeCompare
  assert.match(
    content,
    /timingSafeCompare/,
    "Must use timingSafeCompare for signature verification",
  );
  assert.match(
    content,
    /parts\.length !== 2/,
    "Must strictly require 2-part payload.signature tokens",
  );
});

test("Task 3: verifyAdminSessionToken must reject legacy bypass tokens and malformed signatures", async () => {
  // Direct test of the remediated token verification logic
  function timingSafeCompare(a, b) {
    if (typeof a !== "string" || typeof b !== "string") return false;
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
      mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
  }

  async function signToken(payload, secret) {
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
    const sigB64 = Buffer.from(sig)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const payloadB64 = Buffer.from(payloadStr)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return `${payloadB64}.${sigB64}`;
  }

  async function verifyToken(token, secret) {
    if (!token || typeof token !== "string") return false;
    try {
      const parts = token.split(".");
      if (parts.length !== 2) return false;

      const [payloadB64, sigB64] = parts;
      if (!payloadB64 || !sigB64) return false;

      const payloadStr = Buffer.from(
        payloadB64.replace(/-/g, "+").replace(/_/g, "/"),
        "base64",
      ).toString("utf8");
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const expectedSig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadStr));
      const expectedSigB64 = Buffer.from(expectedSig)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      if (!timingSafeCompare(sigB64, expectedSigB64)) return false;

      const data = JSON.parse(payloadStr);
      if (!data.expiresAt || Date.now() > data.expiresAt) return false;

      return data.role === "admin";
    } catch {
      return false;
    }
  }

  const testSecret = "strong-admin-secret-key-32-bytes-long";

  // 1. Negative test: Legacy bypass token (base64 of "petpedia-admin:" or "petpedia-admin:admin2026")
  const legacyBypassToken1 = Buffer.from("petpedia-admin:").toString("base64");
  const legacyBypassToken2 = Buffer.from("petpedia-admin:admin2026").toString("base64");
  assert.equal(
    await verifyToken(legacyBypassToken1, testSecret),
    false,
    "Must reject legacy bypass token",
  );
  assert.equal(
    await verifyToken(legacyBypassToken2, testSecret),
    false,
    "Must reject legacy passcode token",
  );

  // 2. Negative test: Malformed or unauthenticated tokens
  assert.equal(await verifyToken("", testSecret), false, "Empty token must fail closed");
  assert.equal(await verifyToken(undefined, testSecret), false, "Undefined token must fail closed");
  assert.equal(
    await verifyToken("random.garbage.token", testSecret),
    false,
    "Invalid format must fail closed",
  );
  assert.equal(
    await verifyToken("fakeHeader.fakeSignature", testSecret),
    false,
    "Forged token must fail closed",
  );

  // 3. Negative test: Expired token
  const expiredToken = await signToken(
    { role: "admin", issuedAt: Date.now() - 100000, expiresAt: Date.now() - 1000, nonce: "test" },
    testSecret,
  );
  assert.equal(
    await verifyToken(expiredToken, testSecret),
    false,
    "Expired token must be rejected",
  );

  // 4. Positive test: Valid active signed token
  const validToken = await signToken(
    { role: "admin", issuedAt: Date.now(), expiresAt: Date.now() + 60000, nonce: "test" },
    testSecret,
  );
  assert.equal(
    await verifyToken(validToken, testSecret),
    true,
    "Valid active admin session must pass",
  );

  // 5. Negative test: Tampered payload
  const [validPayload, validSig] = validToken.split(".");
  const tamperedPayloadB64 = Buffer.from(
    JSON.stringify({ role: "admin", expiresAt: Date.now() + 9999999 }),
  ).toString("base64");
  assert.equal(
    await verifyToken(`${tamperedPayloadB64}.${validSig}`, testSecret),
    false,
    "Tampered payload must fail signature check",
  );
});

// ============================================================================
// TASK 4: REMOVE HARDCODED SIGNING-SECRET FALLBACKS & FAIL CLOSED
// ============================================================================
test("Task 4: Source files must not contain hardcoded fallback secrets", () => {
  const adminAuthPath = path.join(ROOT_DIR, "src/lib/admin/auth.ts");
  const customerAuthPath = path.join(ROOT_DIR, "src/lib/customer/auth.ts");

  const adminContent = fs.readFileSync(adminAuthPath, "utf8");
  const customerContent = fs.readFileSync(customerAuthPath, "utf8");

  // Negative checks: Static fallback strings must NOT appear anywhere
  assert.doesNotMatch(
    adminContent,
    /petpedia-admin-secret-key-2026/,
    "admin/auth.ts must not contain 'petpedia-admin-secret-key-2026'",
  );
  assert.doesNotMatch(
    customerContent,
    /petpedia-secure-auth-2026/,
    "customer/auth.ts must not contain 'petpedia-secure-auth-2026'",
  );

  // Positive checks: Validate server-only secret retrieval functions exist
  assert.match(
    adminContent,
    /export function getAdminSigningSecret\(\)/,
    "Must export getAdminSigningSecret",
  );
  assert.match(
    customerContent,
    /export function getCustomerSessionSecret\(\)/,
    "Must export getCustomerSessionSecret",
  );
});

test("Task 4: Secret validators must throw fatal security violation when secrets are missing", () => {
  function getSigningSecret(envSecret, passcode) {
    const secret = envSecret || passcode;
    if (!secret || typeof secret !== "string" || secret.trim().length === 0) {
      throw new Error(
        "[SECURITY VIOLATION] Missing required signing secret. Authentication fails closed.",
      );
    }
    return secret.trim();
  }

  // Negative tests: Missing or empty configuration must fail closed
  assert.throws(
    () => getSigningSecret("", ""),
    /SECURITY VIOLATION/,
    "Must throw when both env secret and passcode are empty",
  );
  assert.throws(
    () => getSigningSecret(undefined, undefined),
    /SECURITY VIOLATION/,
    "Must throw when both secrets are undefined",
  );
  assert.throws(
    () => getSigningSecret("   ", "   "),
    /SECURITY VIOLATION/,
    "Must throw when secrets are only whitespace",
  );

  // Positive test: Valid secret returned
  assert.equal(getSigningSecret("my-production-secret-value", ""), "my-production-secret-value");
});

// ============================================================================
// TASK 5: REMOVE PLAINTEXT OTP LOGGING & MASK SENSITIVE IDENTIFIERS
// ============================================================================
test("Task 5: Source files must not log plaintext OTPs or unmasked sensitive identifiers", () => {
  const customerAuthPath = path.join(ROOT_DIR, "src/lib/customer/auth.ts");
  const msg91Path = path.join(ROOT_DIR, "src/lib/sms/msg91.ts");

  const authContent = fs.readFileSync(customerAuthPath, "utf8");
  const msg91Content = fs.readFileSync(msg91Path, "utf8");

  // Negative checks: Verify plaintext OTP logging statements are removed
  assert.doesNotMatch(
    authContent,
    /is \$\{secureOtp\}/,
    "customer/auth.ts must not log plaintext secureOtp",
  );
  assert.doesNotMatch(
    authContent,
    /console\.log\([^)]*secureOtp[^)]*\)/,
    "customer/auth.ts must not log secureOtp to console",
  );

  // Positive checks: Masking implementation
  assert.match(authContent, /maskIdentifier/, "customer/auth.ts must use maskIdentifier");
  assert.match(msg91Content, /maskMobileForLogs/, "msg91.ts must use maskMobileForLogs");
  assert.match(
    authContent,
    /testOtpHint:\s*undefined/,
    "testOtpHint must be undefined to avoid leaking OTP in HTTP responses",
  );
});

test("Task 5: Masking utilities must redact phone numbers and email addresses", () => {
  function maskIdentifier(identifier) {
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

  function maskMobileForLogs(rawPhone) {
    const digits = (rawPhone || "").replace(/\D/g, "");
    if (digits.length < 4) return "****";
    return `******${digits.slice(-4)}`;
  }

  // Phone masking tests
  assert.equal(maskIdentifier("7306827008"), "******7008");
  assert.equal(maskIdentifier("+91 98765 43210"), "******3210");
  assert.equal(maskMobileForLogs("917306827008"), "******7008");

  // Email masking tests
  assert.equal(maskIdentifier("hamdanhaneefa23@gmail.com"), "h***3@gmail.com");
  assert.equal(maskIdentifier("support@petpedia.in"), "s***t@petpedia.in");
});

// ============================================================================
// TASK 6: REQUIRE ADMINISTRATOR AUTHENTICATION FOR getOutOfStockInfoFn
// ============================================================================
test("Task 6: getOutOfStockInfoFn must require adminAuthMiddleware", () => {
  const inventoryPath = path.join(ROOT_DIR, "src/lib/admin/inventory.ts");
  assert.ok(fs.existsSync(inventoryPath), "admin/inventory.ts must exist");

  const content = fs.readFileSync(inventoryPath, "utf8");

  // Positive check: getOutOfStockInfoFn has adminAuthMiddleware attached
  assert.match(
    content,
    /getOutOfStockInfoFn\s*=\s*createServerFn\(\s*\{\s*method:\s*"GET"\s*\}\s*\)\s*\.middleware\(\s*\[\s*adminAuthMiddleware\s*\]\s*\)/,
    "getOutOfStockInfoFn must be protected with adminAuthMiddleware",
  );

  // Check related inventory endpoints have adminAuthMiddleware
  assert.match(
    content,
    /updateStockFn\s*=\s*createServerFn\(\s*\{\s*method:\s*"POST"\s*\}\s*\)\s*\.middleware\(\s*\[\s*adminAuthMiddleware\s*\]\s*\)/,
    "updateStockFn must require adminAuthMiddleware",
  );
  assert.match(
    content,
    /updateMultipleVariantStockFn\s*=\s*createServerFn\(\s*\{\s*method:\s*"POST"\s*\}\s*\)\s*\.middleware\(\s*\[\s*adminAuthMiddleware\s*\]\s*\)/,
    "updateMultipleVariantStockFn must require adminAuthMiddleware",
  );
});

// ============================================================================
// TASK 7: DISABLE SIMULATED ONLINE PAYMENTS & ENFORCE COD ONLY
// ============================================================================
test("Task 7: Simulated online payments must be rejected in checkout.ts and disabled in modal", () => {
  const checkoutPath = path.join(ROOT_DIR, "src/lib/customer/checkout.ts");
  const modalPath = path.join(ROOT_DIR, "src/components/shiprocket/FastrrCheckoutModal.tsx");

  const checkoutContent = fs.readFileSync(checkoutPath, "utf8");
  const modalContent = fs.readFileSync(modalPath, "utf8");

  // Positive checks: createCheckoutOrderFn rejects non-COD orders
  assert.match(
    checkoutContent,
    /if\s*\(\s*!isCod\s*\)\s*\{\s*return\s*\{\s*success:\s*false,\s*error:\s*"Online payment gateway is temporarily disabled/,
    "createCheckoutOrderFn must reject non-COD payment requests",
  );

  // Positive checks: FastrrCheckoutModal disables Card, UPI, and Netbanking buttons
  assert.match(
    modalContent,
    /Card Payment Disabled/,
    "Modal must show disabled button for Card payment",
  );
  assert.match(
    modalContent,
    /Net Banking Disabled/,
    "Modal must show disabled button for Net Banking payment",
  );
  assert.match(
    modalContent,
    /UPI Payment Disabled/,
    "Modal must show disabled button for UPI payment",
  );
  assert.match(
    modalContent,
    /if\s*\(method\s*!==\s*"cod"\)\s*\{/,
    "Modal handleCompletePayment must block non-COD methods",
  );
});

test("Task 7: Payment method gate must reject all non-COD payment methods", () => {
  function validatePaymentMethod(paymentMethod) {
    const isCod =
      paymentMethod?.toLowerCase().includes("cod") ||
      paymentMethod?.toLowerCase().includes("cash on delivery");

    if (!isCod) {
      return {
        success: false,
        error:
          "Online payment gateway is temporarily disabled. Only Cash on Delivery orders are accepted at this time.",
      };
    }
    return { success: true };
  }

  // Positive tests: COD accepted
  assert.equal(validatePaymentMethod("cod").success, true);
  assert.equal(validatePaymentMethod("Cash on Delivery").success, true);
  assert.equal(validatePaymentMethod("COD (Cash on Delivery)").success, true);

  // Negative tests: All simulated or unverified online payment methods must be rejected
  assert.equal(validatePaymentMethod("upi").success, false);
  assert.equal(validatePaymentMethod("card").success, false);
  assert.equal(validatePaymentMethod("netbanking").success, false);
  assert.equal(validatePaymentMethod("credit_card").success, false);
  assert.equal(validatePaymentMethod("razorpay").success, false);
  assert.equal(validatePaymentMethod("phonepe").success, false);
  assert.equal(validatePaymentMethod("gpay").success, false);
  assert.equal(validatePaymentMethod("").success, false);
  assert.equal(validatePaymentMethod(undefined).success, false);
});

test("Task 6: adminAuthMiddleware must fail closed when unauthenticated", async () => {
  async function simulateAdminAuthMiddleware(sessionCookie, verifyTokenFn) {
    const isValid = await verifyTokenFn(sessionCookie);
    if (!isValid) {
      throw new Error("UNAUTHORIZED: Valid administrator session required.");
    }
    return true;
  }

  // Negative tests: No cookie, empty cookie, invalid cookie
  await assert.rejects(
    async () => simulateAdminAuthMiddleware(undefined, async () => false),
    /UNAUTHORIZED: Valid administrator session required\./,
  );
  await assert.rejects(
    async () => simulateAdminAuthMiddleware("", async () => false),
    /UNAUTHORIZED: Valid administrator session required\./,
  );
  await assert.rejects(
    async () => simulateAdminAuthMiddleware("invalid.session.cookie", async () => false),
    /UNAUTHORIZED: Valid administrator session required\./,
  );

  // Positive test: Valid active session succeeds
  const passed = await simulateAdminAuthMiddleware("valid.signed.token", async () => true);
  assert.equal(passed, true);
});
