import { createFileRoute } from "@tanstack/react-router";
import { dispatchOrderPushNotification } from "@/lib/admin/push-notifications";

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
          const body = await request.json();

          // Extract details from Shopify orders/create webhook payload
          const id = body.id;
          const orderNumber = body.order_number || body.name;
          const name = body.name || (orderNumber ? `#${orderNumber}` : "Order");
          const totalPrice = body.current_total_price || body.total_price || "";
          const currency = body.currency || "INR";
          const customerName =
            body.customer?.first_name || body.customer?.last_name
              ? `${body.customer?.first_name || ""} ${body.customer?.last_name || ""}`.trim()
              : body.shipping_address?.name || "Customer";
          const itemsCount = Array.isArray(body.line_items) ? body.line_items.length : 1;

          console.log(`[Shopify Webhook] Received orders/create for ${name} (${totalPrice} ${currency})`);

          await dispatchOrderPushNotification({
            id,
            name,
            orderNumber,
            totalPrice,
            customerName,
            currency,
            itemsCount,
          });

          return Response.json({ success: true, order: name });
        } catch (err: any) {
          console.error("[Shopify Webhook] Error processing orders/create:", err);
          return Response.json({ error: err.message }, { status: 400 });
        }
      },
    },
  },
});
