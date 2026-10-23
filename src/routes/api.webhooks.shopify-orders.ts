import { createFileRoute } from "@tanstack/react-router";
import { dispatchOrderPushNotification } from "@/lib/admin/push-notifications";
import { storageSetIfNotExists } from "@/lib/storage/adapter";

export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Validates the X-Shopify-Hmac-Sha256 signature using HMAC-SHA256 and Web Crypto API.
 * Uses timing-safe string comparison to protect against timing side-channel attacks.
 */
export async function verifyShopifyWebhookHmac(
  rawBody: string,
  hmacHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!hmacHeader || !secret) return false;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
    const generatedHmac = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    return timingSafeCompare(generatedHmac, hmacHeader);
  } catch (err) {
    console.error("[verifyShopifyWebhookHmac Error]:", err);
    return false;
  }
}

export const Route = createFileRoute("/api/webhooks/shopify-orders")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          status: "active",
          service: "Petpedia Shopify Webhook Handler",
          instructions:
            "In Shopify Admin -> Settings -> Notifications -> Webhooks, add webhook for 'Order creation' pointing to this endpoint.",
        });
      },
      POST: async ({ request }) => {
        try {
          const rawBody = await request.text();
          const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
          const webhookIdHeader = request.headers.get("x-shopify-webhook-id");
          const webhookSecret =
            process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_CLIENT_SECRET || "";

          // Strictly enforce webhook secret configuration and signature in EVERY environment
          if (!webhookSecret) {
            console.error(
              "[Shopify Webhook] Rejected: Server missing SHOPIFY_WEBHOOK_SECRET configuration.",
            );
            return Response.json(
              { error: "Server configuration error: Webhook verification secret missing" },
              { status: 500 },
            );
          }

          if (!hmacHeader) {
            console.warn("[Shopify Webhook] Rejected: Missing X-Shopify-Hmac-Sha256 header.");
            return Response.json(
              { error: "Unauthorized: Missing X-Shopify-Hmac-Sha256 signature header" },
              { status: 401 },
            );
          }

          const isValid = await verifyShopifyWebhookHmac(rawBody, hmacHeader, webhookSecret);
          if (!isValid) {
            console.warn("[Shopify Webhook] Rejected: Invalid X-Shopify-Hmac-Sha256 signature.");
            return Response.json(
              { error: "Unauthorized: Invalid X-Shopify-Hmac-Sha256 signature" },
              { status: 401 },
            );
          }

          const body = JSON.parse(rawBody);

          // Extract details from Shopify orders/create webhook payload
          const id = body.id;
          const orderNumber = body.order_number || body.name;
          const name = body.name || (orderNumber ? `#${orderNumber}` : "Order");

          // Webhook Event Deduplication:
          // Atomically acquire processing lock for this event (via x-shopify-webhook-id or order id)
          // Uses Redis SET NX EX to eliminate race conditions from concurrent duplicate webhooks.
          const dedupKey = `webhook:shopify-orders:${webhookIdHeader || id}`;
          const isNewEvent = await storageSetIfNotExists(
            dedupKey,
            {
              processedAt: Date.now(),
              order: name,
              webhookId: webhookIdHeader || null,
            },
            48 * 3600,
          );

          if (!isNewEvent) {
            console.info(
              `[Shopify Webhook Deduplicated] Event ${webhookIdHeader || id} for ${name} already processed or currently in-flight. Skipping duplicate dispatch.`,
            );
            return Response.json({
              success: true,
              deduplicated: true,
              order: name,
              message: "Duplicate webhook event acknowledged without re-processing.",
            });
          }

          const totalPrice = body.current_total_price || body.total_price || "";
          const currency = body.currency || "INR";
          const customerName =
            body.customer?.first_name || body.customer?.last_name
              ? `${body.customer?.first_name || ""} ${body.customer?.last_name || ""}`.trim()
              : body.shipping_address?.name || body.billing_address?.name || "Customer";
          const city =
            body.shipping_address?.city ||
            body.shipping_address?.province ||
            body.billing_address?.city ||
            body.billing_address?.province ||
            "India";
          const itemsCount = Array.isArray(body.line_items) ? body.line_items.length : 1;

          console.log(
            `[Shopify Webhook Verified] Received orders/create for ${name} (${totalPrice} ${currency}) from ${customerName}, ${city}`,
          );

          await dispatchOrderPushNotification({
            id,
            name,
            orderNumber,
            totalPrice,
            customerName,
            city,
            currency,
            itemsCount,
          });

          return Response.json({ success: true, order: name });
        } catch (err: any) {
          console.error("[Shopify Webhook] Error processing orders/create:", err);
          const isClientError = err instanceof SyntaxError;
          return Response.json(
            { error: err?.message || "Webhook processing failure" },
            { status: isClientError ? 400 : 500 },
          );
        }
      },
    },
  },
});
