import { AppCartItem } from "./normalize";

interface CreateOrderParams {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
  };
  items: AppCartItem[];
  paymentMethod: string;
  financialStatus?: "paid" | "pending";
  total: number;
}

export interface ShopifyOrderResult {
  success: boolean;
  orderId: string;
  orderName: string;
  totalPrice: string;
  createdAt: string;
  error?: string;
}

/**
 * Retrieves or refreshes the Shopify Admin API Access Token
 */
let cachedAdminToken =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SHOPIFY_ADMIN_ACCESS_TOKEN) ||
  (typeof process !== "undefined" && process.env?.VITE_SHOPIFY_ADMIN_ACCESS_TOKEN) ||
  "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";

async function getValidAdminToken(): Promise<string> {
  if (cachedAdminToken && cachedAdminToken.startsWith("shpat_")) {
    return cachedAdminToken;
  }

  const clientId =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SHOPIFY_CLIENT_ID) ||
    "b63d7412a9300c7fcc647897bc8fc9ae";
  const clientSecret =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SHOPIFY_CLIENT_SECRET) ||
    "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";

  try {
    const res = await fetch("/api/shopify-admin/admin/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.access_token) {
        cachedAdminToken = data.access_token;
        return data.access_token;
      }
    }
  } catch (err) {
    console.error("[Shopify Admin Token Refresh Error]:", err);
  }

  return cachedAdminToken;
}

/**
 * Creates an official order directly in Shopify Admin API
 * without redirecting the customer away from the Petpedia website.
 */
export async function createShopifyAdminOrder({
  customer,
  items,
  paymentMethod,
  financialStatus = "paid",
}: CreateOrderParams): Promise<ShopifyOrderResult | null> {
  const adminToken = await getValidAdminToken();

  // Build the line items for Shopify
  const lineItems = items.map((it) => {
    const variantMatch = it.variantId?.match(/\d+$/);
    const numericVariantId = variantMatch ? parseInt(variantMatch[0], 10) : undefined;

    return {
      title: it.productTitle || it.title,
      price: it.price.toString(),
      quantity: it.quantity,
      variant_id: numericVariantId || undefined,
    };
  });

  const orderPayload = {
    order: {
      email: customer.email || "petbey.in@gmail.com",
      phone: customer.phone || undefined,
      financial_status: financialStatus,
      gateway: paymentMethod,
      send_receipt: Boolean(customer.email),
      line_items: lineItems,
      customer: {
        first_name: customer.firstName || "Customer",
        last_name: customer.lastName || "Order",
        email: customer.email || undefined,
        phone: customer.phone || undefined,
      },
      shipping_address: {
        first_name: customer.firstName || "Customer",
        last_name: customer.lastName || "Order",
        address1: customer.address || "Main Street",
        city: customer.city || "Kochi",
        country: customer.country || "India",
        zip: customer.zipCode || "682022",
        phone: customer.phone,
      },
      billing_address: {
        first_name: customer.firstName || "Customer",
        last_name: customer.lastName || "Order",
        address1: customer.address || "Main Street",
        city: customer.city || "Kochi",
        country: customer.country || "India",
        zip: customer.zipCode || "682022",
        phone: customer.phone,
      },
      note: `Placed directly via Petpedia In-App Checkout (${paymentMethod})`,
      tags: "Petpedia, In-App Checkout, Website",
    },
  };

  try {
    const url = "/api/shopify-admin/admin/api/2026-01/orders.json";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn("[Shopify Admin API Order Creation Error]:", res.status, errorText);
      return null;
    }

    const data = await res.json();
    if (data?.order) {
      return {
        success: true,
        orderId: data.order.id.toString(),
        orderName: data.order.name || `#${data.order.order_number}`,
        totalPrice: data.order.total_price,
        createdAt: data.order.created_at,
      };
    }
  } catch (err) {
    console.error("[createShopifyAdminOrder Exception]:", err);
  }

  return null;
}

