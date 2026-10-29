import { createServerFn } from "@tanstack/react-start";
import { computeDeliveryQuote } from "@/lib/cart/delivery";
import { allProductsCatalog, Product } from "@/data/catalog";
import { loadShippingSettings } from "@/lib/admin/shipping";
import { getAdminAccessToken, fetchWithRetry } from "@/lib/admin/shopify-admin";
import { ADMIN_CONFIG } from "@/lib/admin/config";
import { signOrderToken, cleanIndianPhone } from "@/lib/customer/auth";
import { dispatchOrderPushNotification } from "@/lib/admin/push-notifications";
import { checkPersistentRateLimit } from "@/lib/security/rate-limit";
import { storageGet, storageSet } from "@/lib/storage/adapter";

export interface CheckoutCustomerInput {
  firstName: string;
  lastName: string;
  email?: string | undefined;
  phone: string;
  address: string;
  city: string;
  country?: string | undefined;
  zipCode: string;
}

export interface CheckoutItemInput {
  id?: string | undefined;
  variantId: string;
  productId?: string | undefined;
  quantity: number;
  title?: string | undefined;
  price?: number | undefined; // Client price: will be verified/overridden by server
}

export interface CreateCheckoutOrderInput {
  customer: CheckoutCustomerInput;
  items: CheckoutItemInput[];
  paymentMethod: string;
  couponCode?: string | undefined;
}

export interface CheckoutOrderResponse {
  success: boolean;
  orderId?: string | undefined;
  orderName?: string | undefined;
  subtotal?: number | undefined;
  discount?: number | undefined;
  shippingFee?: number | undefined;
  total?: number | undefined;
  financialStatus?: "pending" | undefined;
  checkoutToken?: string | undefined;
  orderStatusUrl?: string | undefined;
  error?: string | undefined;
}

/**
 * Authoritative Server-Side Price Resolution
 * Validates requested item/variant against the canonical product catalog.
 */
export function getAuthoritativePrice(variantId: string, productId?: string): number | null {
  if (!variantId && !productId) return null;

  const cleanVarId = String(variantId || "")
    .replace(/^gid:\/\/shopify\/(ProductVariant|Product)\//, "")
    .trim();
  const cleanProdId = productId
    ? String(productId)
        .replace(/^gid:\/\/shopify\/(ProductVariant|Product)\//, "")
        .trim()
    : "";

  for (const product of allProductsCatalog) {
    const pId = String(product.id)
      .replace(/^gid:\/\/shopify\/Product\//, "")
      .trim();

    // Match by product ID first if provided
    if (cleanProdId && pId === cleanProdId) {
      if (product.variants && product.variants.length > 0) {
        const matchedVariant = product.variants.find(
          (v) =>
            String(v.id)
              .replace(/^gid:\/\/shopify\/ProductVariant\//, "")
              .trim() === cleanVarId,
        );
        if (matchedVariant && typeof matchedVariant.price === "number") {
          return matchedVariant.price;
        }
      }
      return product.price;
    }

    // Match by variant ID across all catalog products
    if (product.variants && product.variants.length > 0) {
      const matchedVariant = product.variants.find(
        (v) =>
          String(v.id)
            .replace(/^gid:\/\/shopify\/ProductVariant\//, "")
            .trim() === cleanVarId,
      );
      if (matchedVariant && typeof matchedVariant.price === "number") {
        return matchedVariant.price;
      }
    }

    // Match variant ID against product ID (for non-variant items)
    if (pId === cleanVarId) {
      return product.price;
    }
  }

  return null;
}

/**
 * Authoritative asynchronous price resolver
 * Queries local catalog first; falls back to Shopify Admin GraphQL if available.
 */
export async function resolveAuthoritativePrice(
  variantId: string,
  productId?: string,
): Promise<number | null> {
  const localPrice = getAuthoritativePrice(variantId, productId);
  if (typeof localPrice === "number" && localPrice >= 0) {
    return localPrice;
  }

  // Attempt authoritative lookup from Shopify Admin API if configured
  try {
    const adminToken = await getAdminAccessToken().catch(() => null);
    if (adminToken && ADMIN_CONFIG.storeDomain) {
      const domain = ADMIN_CONFIG.storeDomain.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
      const cleanVarId = String(variantId || "")
        .replace(/^gid:\/\/shopify\/ProductVariant\//, "")
        .trim();
      const gid = `gid://shopify/ProductVariant/${cleanVarId}`;

      const res = await fetchWithRetry(
        `https://${domain}/admin/api/${ADMIN_CONFIG.apiVersion}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": adminToken,
          },
          body: JSON.stringify({
            query: `query getVariantPrice($id: ID!) {
              node(id: $id) {
                ... on ProductVariant {
                  price
                }
              }
            }`,
            variables: { id: gid },
          }),
        },
        5000,
        1,
      );

      if (res.ok) {
        const json = await res.json();
        const priceStr = json?.data?.node?.price;
        if (priceStr && !isNaN(Number(priceStr))) {
          return Number(priceStr);
        }
      }
    }
  } catch {
    // Fail closed if lookup fails
  }

  return null;
}

/**
 * Authoritative Coupon Discount Calculation
 * Validates against recognized coupon codes only; unrecognized codes yield 0 discount.
 */
export function calculateAuthoritativeDiscount(
  couponCode: string | undefined,
  subtotal: number,
): number {
  if (!couponCode || !couponCode.trim()) return 0;
  const code = couponCode.trim().toUpperCase();

  if (code === "FIRST30" || code === "WELCOME30") {
    return Math.round(subtotal * 0.3);
  }
  if (code === "GET10" || code === "PET10" || code === "WELCOME10" || code === "SAVE10" || code === "FASTRR10") {
    return Math.round(subtotal * 0.1);
  }
  if (code === "PET20" || code === "SAVE20") {
    return Math.min(Math.round(subtotal * 0.2), 500);
  }
  if (code === "PET50" || code === "FLAT50") {
    return Math.min(50, subtotal);
  }

  // Reject unrecognized coupon codes
  return 0;
}

/**
 * Secure Server Function: Create Checkout Order
 * - Authoritatively validates item prices against server catalog / Shopify
 * - Rejects any unknown or unverified variants
 * - Enforces Cash on Delivery while online payment gateway integration is pending
 * - Computes official shipping fees and coupon discounts
 * - Strictly enforces initial financial_status = "pending"
 * - Idempotency protection prevents duplicate orders upon client retries
 * - Fails safely closed on Shopify order creation failure (NO synthetic orders)
 * - Returns signed cryptographic checkoutToken for secure post-checkout authentication
 */
export const createCheckoutOrderFn = createServerFn({ method: "POST" })
  .validator((data: CreateCheckoutOrderInput) => data)
  .handler(async ({ data }): Promise<CheckoutOrderResponse> => {
    try {
      const cleanPhone = cleanIndianPhone(data.customer?.phone || "");
      if (!cleanPhone || cleanPhone.length !== 10) {
        return { success: false, error: "Please provide a valid 10-digit Indian phone number." };
      }

      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          error: "Your cart is empty. Please add items before checking out.",
        };
      }

      const rateCheck = await checkPersistentRateLimit({
        key: `checkout:${cleanPhone}`,
        maxAttempts: 10,
        windowSeconds: 60,
      });

      if (!rateCheck.allowed) {
        return {
          success: false,
          error: "Too many checkout requests. Please wait a minute and try again.",
        };
      }

      // Enforce verified payment gateway: Only Cash on Delivery is currently active
      const isCod =
        data.paymentMethod?.toLowerCase().includes("cod") ||
        data.paymentMethod?.toLowerCase().includes("cash on delivery");

      if (!isCod) {
        return {
          success: false,
          error:
            "Online payment gateway is temporarily disabled. Only Cash on Delivery orders are accepted at this time.",
        };
      }

      // 1. Authoritative Line Items & Subtotal Calculation (Zero trust in client prices)
      let authoritativeSubtotal = 0;
      const validatedLineItems: Array<{
        title: string;
        price: number;
        quantity: number;
        variant_id?: number | undefined;
      }> = [];

      for (const item of data.items) {
        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
        const canonicalPrice = await resolveAuthoritativePrice(item.variantId, item.productId);

        if (canonicalPrice === null || typeof canonicalPrice !== "number" || canonicalPrice < 0) {
          return {
            success: false,
            error: `Invalid or unverified product variant: "${item.title || item.variantId}". Please refresh your cart.`,
          };
        }

        const effectivePrice = canonicalPrice;
        authoritativeSubtotal += effectivePrice * qty;

        const variantMatch = String(item.variantId || "").match(/\d+$/);
        const numericVariantId = variantMatch ? parseInt(variantMatch[0], 10) : undefined;

        validatedLineItems.push({
          title: item.title || "Pet Product",
          price: effectivePrice,
          quantity: qty,
          variant_id: numericVariantId,
        });
      }

      // 2. Authoritative Shipping Fee Calculation
      const shippingSettings = await loadShippingSettings();
      // Per-product delivery charges (summed, capped, free above the threshold)
      const deliveryQuote = await computeDeliveryQuote(
        data.items.map((it) => ({
          variantId: String(it.variantId || ""),
          quantity: Math.max(1, Math.floor(Number(it.quantity) || 1)),
        })),
      );
      let shippingFee = deliveryQuote.fee;

      if (isCod && shippingSettings.codExtraFee > 0) {
        shippingFee += shippingSettings.codExtraFee;
      }

      // 3. Authoritative Coupon Discount Calculation
      const discount = calculateAuthoritativeDiscount(data.couponCode, authoritativeSubtotal);

      // 4. Authoritative Total Price Calculation
      const authoritativeTotal = Math.max(0, authoritativeSubtotal - discount + shippingFee);

      // 5. Payment Security Enforcement
      // Regardless of client input, initial status is ALWAYS "pending" until gateway webhook confirms
      const financialStatus: "pending" = "pending";
      const gatewayName = isCod
        ? "Cash on Delivery (COD)"
        : `Shiprocket Fastrr (${data.paymentMethod.toUpperCase()})`;

      // 6. Idempotency Check: Protect against accidental double-clicks and duplicate orders
      const itemsFingerprint = validatedLineItems
        .map((it) => `${it.variant_id || it.title}:${it.quantity}:${it.price}`)
        .sort()
        .join("|");
      const orderSignature = `${cleanPhone}:${itemsFingerprint}:${data.couponCode || ""}:${authoritativeTotal}`;
      const enc = new TextEncoder();
      const hashBuf = await crypto.subtle.digest("SHA-256", enc.encode(orderSignature));
      const hashHex = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 24);
      const idempotencyKey = `order:idempotency:${cleanPhone}:${hashHex}`;

      const existingOrder = await storageGet<CheckoutOrderResponse | null>(idempotencyKey, null);
      if (existingOrder && existingOrder.success && existingOrder.orderId) {
        console.info(
          `[createCheckoutOrderFn] Returning existing idempotent order confirmation for ${existingOrder.orderName}`,
        );
        return existingOrder;
      }

      // 7. Shopify Admin API Order Creation (Strictly Fail-Closed)
      let orderId = "";
      let orderName = "";
      let orderStatusUrl: string | undefined = undefined;

      try {
        const adminToken = await getAdminAccessToken();
        const domain = (ADMIN_CONFIG.storeDomain || "1fcjnw-tz.myshopify.com")
          .replace(/^https?:\/\//i, "")
          .replace(/\/+$/, "");

        const shopifyPayload = {
          order: {
            email: data.customer.email || undefined,
            phone: `+91${cleanPhone}`,
            financial_status: financialStatus,
            gateway: gatewayName,
            send_receipt: Boolean(data.customer.email),
            line_items: validatedLineItems.map((li) => ({
              title: li.title,
              price: li.price.toFixed(2),
              quantity: li.quantity,
              variant_id: li.variant_id,
            })),
            shipping_lines: [
              {
                title: shippingFee > 0 ? shippingSettings.shippingTitle : "Free Shipping",
                price: shippingFee.toFixed(2),
                code: shippingFee > 0 ? "standard" : "free",
              },
            ],
            customer: {
              first_name: data.customer.firstName || "Customer",
              last_name: data.customer.lastName || "Order",
              email: data.customer.email || undefined,
              phone: `+91${cleanPhone}`,
            },
            shipping_address: {
              first_name: data.customer.firstName || "Customer",
              last_name: data.customer.lastName || "Order",
              address1: data.customer.address || "Delivery Address",
              city: data.customer.city || "City",
              country: data.customer.country || "India",
              zip: data.customer.zipCode || "682022",
              phone: `+91${cleanPhone}`,
            },
            billing_address: {
              first_name: data.customer.firstName || "Customer",
              last_name: data.customer.lastName || "Order",
              address1: data.customer.address || "Delivery Address",
              city: data.customer.city || "City",
              country: data.customer.country || "India",
              zip: data.customer.zipCode || "682022",
              phone: `+91${cleanPhone}`,
            },
            note: `Placed via Petpedia Checkout (${gatewayName}) [Verified Total: ₹${authoritativeTotal}]`,
            tags: `Petpedia, In-App Checkout, Website${isCod ? ", COD, Cash on Delivery" : ""}`,
          },
        };

        const res = await fetchWithRetry(
          `https://${domain}/admin/api/${ADMIN_CONFIG.apiVersion}/orders.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": adminToken,
            },
            body: JSON.stringify(shopifyPayload),
          },
          15000,
          2,
        );

        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          console.error(
            "[createCheckoutOrderFn] Shopify Admin API order creation error:",
            res.status,
            errBody,
          );
          return {
            success: false,
            error:
              "Unable to confirm your order with the Shopify store. Please check your details and try again.",
          };
        }

        const shopifyData = await res.json();
        if (!shopifyData?.order?.id) {
          console.error(
            "[createCheckoutOrderFn] Shopify response missing valid order ID:",
            shopifyData,
          );
          return {
            success: false,
            error:
              "Shopify backend did not return a valid order confirmation. Your order was not placed.",
          };
        }

        orderId = String(shopifyData.order.id);
        orderName = shopifyData.order.name || `#${shopifyData.order.order_number}`;
        orderStatusUrl = shopifyData.order.order_status_url || undefined;
      } catch (shopifyErr: any) {
        console.error(
          "[createCheckoutOrderFn] Shopify creation exception (failing closed):",
          shopifyErr,
        );
        return {
          success: false,
          error:
            "Store checkout service is temporarily unavailable. Your order was not placed. Please try again.",
        };
      }

      // 8. Cryptographically Sign Order Verification Token
      const checkoutToken = await signOrderToken({
        orderId,
        phone: cleanPhone,
        total: authoritativeTotal,
        issuedAt: Date.now(),
      });

      // 9. Fire-and-forget Admin Web Push Notification
      dispatchOrderPushNotification({
        id: orderId,
        name: orderName,
        totalPrice: authoritativeTotal,
        customerName: `${data.customer.firstName} ${data.customer.lastName}`.trim(),
        city: data.customer.city,
      }).catch((pushErr) => {
        console.warn("[createCheckoutOrderFn] Push notification error:", pushErr);
      });

      const responsePayload: CheckoutOrderResponse = {
        success: true,
        orderId,
        orderName,
        subtotal: authoritativeSubtotal,
        discount,
        shippingFee,
        total: authoritativeTotal,
        financialStatus,
        checkoutToken,
        orderStatusUrl: orderStatusUrl || `/account#order`,
      };

      // 10. Cache in persistent storage for 10 minutes to support idempotent retries
      await storageSet(idempotencyKey, responsePayload, 600);

      return responsePayload;
    } catch (err: any) {
      console.error("[createCheckoutOrderFn] Internal Error:", err);
      return {
        success: false,
        error: err?.message || "Failed to process order securely. Please try again.",
      };
    }
  });
