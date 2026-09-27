import { createServerFn } from "@tanstack/react-start";
import { queryShopifyAdmin, getAdminAccessToken, clearCachedAdminToken, fetchWithRetry } from "./shopify-admin";
import { ADMIN_CONFIG } from "./config";

export interface AdminOrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
}

export interface AdminOrder {
  id: string;
  name: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  total: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    name: string;
    address1: string;
    city: string;
    province: string;
    zip: string;
    phone: string;
  };
  items: AdminOrderItem[];
  itemCount: number;
}

const ORDERS_QUERY = `{
  orders(first: 50, sortKey: CREATED_AT, reverse: true) {
    edges {
      node {
        id
        name
        createdAt
        displayFinancialStatus
        displayFulfillmentStatus
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        customer {
          firstName
          lastName
          email
          phone
        }
        shippingAddress {
          name
          address1
          city
          province
          zip
          phone
        }
        lineItems(first: 20) {
          edges {
            node {
              id
              title
              quantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                }
              }
            }
          }
        }
      }
    }
  }
}`;

export interface AdminOrdersResult {
  orders: AdminOrder[];
  missingScope?: boolean;
  error?: string;
}

export const getAdminOrdersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminOrdersResult> => {
    try {
      const data = await queryShopifyAdmin<{
        orders: {
          edges: Array<{
            node: any;
          }>;
        };
      }>(ORDERS_QUERY);

      const orders: AdminOrder[] = (data?.orders?.edges || []).map((edge) => {
        const o = edge.node;
        const cust = o.customer || {};
        const customerName =
          [cust.firstName, cust.lastName].filter(Boolean).join(" ") ||
          o.shippingAddress?.name ||
          "Guest Customer";

        const items: AdminOrderItem[] = (o.lineItems?.edges || []).map((li: any) => ({
          id: li.node.id,
          title: li.node.title,
          quantity: li.node.quantity,
          price: parseFloat(li.node.originalUnitPriceSet?.shopMoney?.amount || "0"),
        }));

        const totalItemsCount = items.reduce((acc, it) => acc + it.quantity, 0);

        return {
          id: o.id,
          name: o.name,
          createdAt: o.createdAt,
          financialStatus: o.displayFinancialStatus || "PENDING",
          fulfillmentStatus: o.displayFulfillmentStatus || "UNFULFILLED",
          total: parseFloat(o.totalPriceSet?.shopMoney?.amount || "0"),
          currency: o.totalPriceSet?.shopMoney?.currencyCode || "INR",
          customer: {
            name: customerName,
            email: cust.email || "",
            phone: cust.phone || o.shippingAddress?.phone || "",
          },
          shippingAddress: {
            name: o.shippingAddress?.name || customerName,
            address1: o.shippingAddress?.address1 || "",
            city: o.shippingAddress?.city || "",
            province: o.shippingAddress?.province || "",
            zip: o.shippingAddress?.zip || "",
            phone: o.shippingAddress?.phone || cust.phone || "",
          },
          items,
          itemCount: totalItemsCount,
        };
      });

      return { orders, missingScope: false };
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isScopeDenied =
        msg.includes("Access denied") ||
        msg.includes("read_orders") ||
        msg.includes("ACCESS_DENIED") ||
        msg.includes("requires merchant approval");

      if (isScopeDenied) {
        clearCachedAdminToken();
        console.warn("[getAdminOrdersFn] Waiting for Shopify 'read_orders' access scope approval.");
      } else {
        console.error("[getAdminOrdersFn] Error:", err);
      }

      return {
        orders: [],
        missingScope: isScopeDenied,
        error: isScopeDenied
          ? "Shopify App requires the 'read_orders' access scope."
          : msg,
      };
    }
  }
);

interface CreateManualOrderInput {
  customer: {
    firstName: string;
    lastName: string;
    email?: string | undefined;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    state?: string | undefined;
  };
  items: Array<{
    title: string;
    price: number;
    quantity: number;
    variantId?: string | undefined;
  }>;
  paymentMethod: string;
  financialStatus?: "paid" | "pending" | undefined;
  note?: string | undefined;
}

export const createManualOrderFn = createServerFn({ method: "POST" })
  .validator((data: CreateManualOrderInput) => data)
  .handler(async ({ data }) => {
    try {
      const adminToken = await getAdminAccessToken();

      const lineItems = data.items.map((it) => {
        const variantMatch = it.variantId?.match(/\d+$/);
        const numericVariantId = variantMatch ? parseInt(variantMatch[0], 10) : undefined;
        return {
          title: it.title,
          price: it.price.toString(),
          quantity: it.quantity,
          variant_id: numericVariantId,
        };
      });

      const orderPayload = {
        order: {
          email: data.customer.email || undefined,
          phone: data.customer.phone || undefined,
          financial_status: data.financialStatus || "pending",
          gateway: data.paymentMethod || "Cash on Delivery (Manual)",
          send_receipt: Boolean(data.customer.email),
          line_items: lineItems,
          customer: {
            first_name: data.customer.firstName || "Customer",
            last_name: data.customer.lastName || "Order",
            email: data.customer.email || undefined,
            phone: data.customer.phone,
          },
          shipping_address: {
            first_name: data.customer.firstName || "Customer",
            last_name: data.customer.lastName || "Order",
            address1: data.customer.address || "Direct Order",
            city: data.customer.city || "Local",
            province: data.customer.state || "Kerala",
            country: "India",
            zip: data.customer.zipCode || "682001",
            phone: data.customer.phone,
          },
          billing_address: {
            first_name: data.customer.firstName || "Customer",
            last_name: data.customer.lastName || "Order",
            address1: data.customer.address || "Direct Order",
            city: data.customer.city || "Local",
            province: data.customer.state || "Kerala",
            country: "India",
            zip: data.customer.zipCode || "682001",
            phone: data.customer.phone,
          },
          note: data.note || `Manual order placed via Admin Portal (${data.paymentMethod})`,
          tags: "Admin Portal, Manual Order, WhatsApp",
        },
      };

      const url = `https://${ADMIN_CONFIG.storeDomain}/admin/api/${ADMIN_CONFIG.apiVersion}/orders.json`;
      const res = await fetchWithRetry(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
        body: JSON.stringify(orderPayload),
      }, 25000, 2);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Shopify Order Creation failed (${res.status}): ${errorText}`);
      }

      const json = await res.json();
      return {
        success: true,
        orderId: json.order?.id?.toString(),
        orderName: json.order?.name || `#${json.order?.order_number}`,
        total: json.order?.total_price,
      };
    } catch (err: any) {
      console.error("[createManualOrderFn] Error:", err);
      return {
        success: false,
        error: err.message || "Failed to create manual order",
      };
    }
  });

interface UpdateOrderInput {
  orderId: string;
  fulfillmentStatus?: string | undefined;
  financialStatus?: string | undefined;
  trackingNumber?: string | undefined;
  courierName?: string | undefined;
  note?: string | undefined;
}

export const updateOrderDetailsFn = createServerFn({ method: "POST" })
  .validator((data: UpdateOrderInput) => data)
  .handler(async ({ data }) => {
    try {
      const adminToken = await getAdminAccessToken();
      const match = data.orderId.match(/\d+$/);
      const numericId = match ? match[0] : data.orderId;

      const updates: Record<string, any> = {};
      if (data.note) updates['note'] = data.note;
      if (data.trackingNumber) updates['tags'] = `Tracking: ${data.trackingNumber} (${data.courierName || 'Standard'})`;

      if (Object.keys(updates).length > 0) {
        const url = `https://${ADMIN_CONFIG.storeDomain}/admin/api/${ADMIN_CONFIG.apiVersion}/orders/${numericId}.json`;
        await fetchWithRetry(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": adminToken,
          },
          body: JSON.stringify({ order: { id: numericId, ...updates } }),
        }, 25000, 2);
      }

      return {
        success: true,
        orderId: data.orderId,
        fulfillmentStatus: data.fulfillmentStatus,
        financialStatus: data.financialStatus,
        trackingNumber: data.trackingNumber,
      };
    } catch (err: any) {
      console.error("[updateOrderDetailsFn] Error:", err);
      return {
        success: false,
        error: err.message || "Failed to update order",
      };
    }
  });
