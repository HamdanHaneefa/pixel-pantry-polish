import { InvoiceData, InvoiceLineItem } from "./types";
import { storageGet, storageSet } from "@/lib/storage/adapter";
import { queryShopifyAdmin } from "@/lib/admin/shopify-admin";

/**
 * Standardizes order ID strings by stripping any gid:// or .pdf suffix.
 */
export function cleanOrderId(rawId: string | number): string {
  const str = String(rawId || "").trim();
  return str.replace(/^gid:\/\/shopify\/Order\//, "").replace(/\.pdf$/i, "");
}

/**
 * Persists an order's invoice snapshot into the storage database.
 */
export async function saveInvoiceSnapshot(
  orderId: string | number,
  invoiceData: InvoiceData,
): Promise<void> {
  const id = cleanOrderId(orderId);
  if (!id) return;
  // Store for 365 days (1 year)
  await storageSet(`invoice:${id}`, invoiceData, 365 * 24 * 3600);
}

/**
 * Retrieves invoice data from database, with fallback to Shopify Admin GraphQL API.
 */
export async function getInvoiceData(orderId: string | number): Promise<InvoiceData | null> {
  const id = cleanOrderId(orderId);
  if (!id) return null;

  // Shopify is the source of truth (order edits, tracking, HSN codes); the stored snapshot
  // is the fallback when Shopify can't be reached.
  try {
    const orderGid = id.startsWith("gid://") ? id : `gid://shopify/Order/${id}`;
    const query = `
      query GetOrderForInvoice($id: ID!) {
        order(id: $id) {
          id
          name
          createdAt
          displayFinancialStatus
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
            }
          }
          totalDiscountsSet {
            shopMoney {
              amount
            }
          }
          totalShippingPriceSet {
            shopMoney {
              amount
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
            address2
            city
            province
            zip
            country
            phone
          }
          billingAddress {
            name
            address1
            address2
            city
            province
            zip
            country
            phone
          }
          #optional:start
          fulfillments(first: 5) {
            trackingInfo {
              company
              number
            }
          }
          #optional:end
          lineItems(first: 50) {
            edges {
              node {
                id
                title
                variantTitle
                sku
                quantity
                #optional:start
                variant {
                  inventoryItem {
                    harmonizedSystemCode
                  }
                  product {
                    tags
                  }
                }
                #optional:end
                originalUnitPriceSet {
                  shopMoney {
                    amount
                  }
                }
                discountedTotalSet {
                  shopMoney {
                    amount
                  }
                }
              }
            }
          }
        }
      }
    `;

    let data: { order: any } | null = null;
    try {
      data = await queryShopifyAdmin<{ order: any }>(query, { id: orderGid });
    } catch (err) {
      // HS codes and tracking need extra API scopes; retry without them
      console.warn(`[Invoice Service] Full order query failed for ${id}, retrying basic:`, err);
      data = await queryShopifyAdmin<{ order: any }>(stripOptionalFields(query), { id: orderGid });
    }
    if (!data?.order) return cachedInvoice(id);

    const o = data.order;
    const cust = o.customer || {};
    const ship = o.shippingAddress || {};

    const customerName =
      [cust.firstName, cust.lastName].filter(Boolean).join(" ") ||
      ship.name ||
      "Customer";

    const items: InvoiceLineItem[] = (o.lineItems?.edges || []).map((edge: any) => {
      const item = edge.node;
      const unitPrice = parseFloat(item.originalUnitPriceSet?.shopMoney?.amount || "0");
      const total = parseFloat(
        item.discountedTotalSet?.shopMoney?.amount || String(unitPrice * (item.quantity || 1)),
      );
      return {
        id: item.id,
        title: item.title,
        variantTitle: item.variantTitle,
        sku: item.sku,
        quantity: item.quantity || 1,
        price: unitPrice,
        total: total,
        hsn: item.variant?.inventoryItem?.harmonizedSystemCode || undefined,
        gstRate: gstRateFromTags(item.variant?.product?.tags),
      };
    });

    const tracking = (o.fulfillments || [])
      .flatMap((f: any) => f?.trackingInfo || [])
      .filter((t: any) => t?.number)
      .pop();
    const bill = o.billingAddress || null;

    const subtotal = parseFloat(o.subtotalPriceSet?.shopMoney?.amount || "0");
    const discount = parseFloat(o.totalDiscountsSet?.shopMoney?.amount || "0");
    const shipping = parseFloat(o.totalShippingPriceSet?.shopMoney?.amount || "0");
    const totalAmount = parseFloat(o.totalPriceSet?.shopMoney?.amount || "0");

    const orderDateStr = new Date(o.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const paymentMethod =
      Array.isArray(o.paymentGatewayNames) && o.paymentGatewayNames.length > 0
        ? o.paymentGatewayNames.join(", ")
        : "Prepaid";

    const invoiceData: InvoiceData = {
      invoiceNumber: `INV-${o.name ? o.name.replace(/#/g, "") : id}`,
      orderId: id,
      orderName: o.name || `#${id}`,
      orderDate: orderDateStr,
      customer: {
        name: customerName,
        email: cust.email || undefined,
        phone: cust.phone || ship.phone || undefined,
        address: {
          line1: ship.address1 || undefined,
          line2: ship.address2 || undefined,
          city: ship.city || undefined,
          state: ship.province || undefined,
          pincode: ship.zip || undefined,
          country: ship.country || "India",
        },
        billingAddress: bill
          ? {
              name: bill.name || undefined,
              line1: bill.address1 || undefined,
              line2: bill.address2 || undefined,
              city: bill.city || undefined,
              state: bill.province || undefined,
              pincode: bill.zip || undefined,
              country: bill.country || "India",
              phone: bill.phone || undefined,
            }
          : undefined,
      },
      items,
      subtotal: subtotal || totalAmount,
      discount,
      shippingFee: shipping,
      courier: tracking ? { company: tracking.company || undefined, awb: tracking.number } : undefined,
      totalAmount,
      paymentMethod,
      financialStatus: o.displayFinancialStatus || "PAID",
      createdAt: o.createdAt,
    };

    // Cache in background for future requests
    await saveInvoiceSnapshot(id, invoiceData);

    return invoiceData;
  } catch (err) {
    console.error(`[Invoice Service] Failed to fetch order ${id} from Shopify Admin:`, err);
    return cachedInvoice(id);
  }
}

async function cachedInvoice(id: string): Promise<InvoiceData | null> {
  try {
    const cached = await storageGet<InvoiceData | null>(`invoice:${id}`, null);
    return cached && cached.items && cached.items.length > 0 ? cached : null;
  } catch (err) {
    console.warn(`[Invoice Service] Failed to retrieve cached invoice for ${id}:`, err);
    return null;
  }
}

function stripOptionalFields(query: string): string {
  return query.replace(/#optional:start[\s\S]*?#optional:end/g, "");
}

/** GST % from a product tag such as "gst-5" or "gst-12". */
export function gstRateFromTags(tags?: string[] | null): number | undefined {
  for (const tag of tags || []) {
    const m = String(tag).trim().match(/^gst[-_ ]?(\d+(?:\.\d+)?)%?$/i);
    if (m) return parseFloat(m[1]!);
  }
  return undefined;
}

/**
 * Transforms Shopify order webhook JSON payload into a structured InvoiceData model.
 */
export function buildInvoiceFromWebhook(body: any): InvoiceData {
  const id = cleanOrderId(body.id);
  const orderName = body.name || (body.order_number ? `#${body.order_number}` : `#${id}`);

  const customerName =
    body.customer?.first_name || body.customer?.last_name
      ? `${body.customer?.first_name || ""} ${body.customer?.last_name || ""}`.trim()
      : body.shipping_address?.name || body.billing_address?.name || "Customer";

  const items: InvoiceLineItem[] = Array.isArray(body.line_items)
    ? body.line_items.map((li: any) => {
        const qty = Number(li.quantity || 1);
        const price = parseFloat(li.price || "0");
        const total = li.total_discount
          ? price * qty - parseFloat(li.total_discount || "0")
          : price * qty;

        return {
          id: String(li.id || ""),
          title: li.title || li.name || "Item",
          variantTitle: li.variant_title || undefined,
          sku: li.sku || undefined,
          quantity: qty,
          price: price,
          total: total,
        };
      })
    : [];

  const subtotal = parseFloat(body.subtotal_price || body.current_subtotal_price || "0");
  const discount = parseFloat(body.total_discounts || "0");
  const shippingFee = parseFloat(
    Array.isArray(body.shipping_lines) && body.shipping_lines.length > 0
      ? body.shipping_lines[0]?.price || "0"
      : "0",
  );
  const totalAmount = parseFloat(body.total_price || body.current_total_price || "0");

  const orderDate = new Date(body.created_at || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const paymentGateways = Array.isArray(body.payment_gateway_names)
    ? body.payment_gateway_names.join(", ")
    : body.gateway || "Prepaid";

  const shippingAddr = body.shipping_address || body.billing_address || {};
  const billingAddr = body.billing_address || null;

  return {
    invoiceNumber: `INV-${orderName.replace(/#/g, "")}`,
    orderId: id,
    orderName,
    orderDate,
    customer: {
      name: customerName,
      email: body.email || body.customer?.email || undefined,
      phone: body.phone || body.customer?.phone || shippingAddr.phone || undefined,
      address: {
        line1: shippingAddr.address1 || undefined,
        line2: shippingAddr.address2 || undefined,
        city: shippingAddr.city || undefined,
        state: shippingAddr.province || undefined,
        pincode: shippingAddr.zip || undefined,
        country: shippingAddr.country || "India",
      },
      billingAddress: billingAddr
        ? {
            name: billingAddr.name || undefined,
            line1: billingAddr.address1 || undefined,
            line2: billingAddr.address2 || undefined,
            city: billingAddr.city || undefined,
            state: billingAddr.province || undefined,
            pincode: billingAddr.zip || undefined,
            country: billingAddr.country || "India",
            phone: billingAddr.phone || undefined,
          }
        : undefined,
    },
    items,
    subtotal: subtotal || totalAmount,
    discount,
    shippingFee,
    totalAmount,
    paymentMethod: paymentGateways,
    financialStatus: (body.financial_status || "paid").toUpperCase(),
    createdAt: body.created_at || new Date().toISOString(),
  };
}

/**
 * Appends the invoice PDF URL to the Shopify order's timeline note
 * so managers can view the invoice right inside the Shopify Admin order page.
 */
export async function syncInvoiceToShopifyOrder(
  orderId: string | number,
  invoiceUrl: string,
): Promise<void> {
  const id = cleanOrderId(orderId);
  const orderGid = `gid://shopify/Order/${id}`;

  try {
    // 1. Fetch current note to preserve existing content
    const getNoteQuery = `
      query GetOrderNote($id: ID!) {
        order(id: $id) {
          id
          note
        }
      }
    `;
    const res = await queryShopifyAdmin<{ order: { id: string; note: string | null } }>(
      getNoteQuery,
      { id: orderGid },
    );

    const existingNote = res?.order?.note || "";
    const invoiceTag = `🧾 Petpedia Invoice: ${invoiceUrl}`;

    // If note already contains this invoice link, skip
    if (existingNote.includes(invoiceUrl)) {
      return;
    }

    const updatedNote = existingNote ? `${existingNote}\n\n${invoiceTag}` : invoiceTag;

    const updateMutation = `
      mutation UpdateOrderNote($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
            note
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    await queryShopifyAdmin(updateMutation, {
      input: {
        id: orderGid,
        note: updatedNote,
      },
    });

    console.log(`[Invoice Service] Successfully synced invoice URL to Shopify Order ${id} note.`);
  } catch (err) {
    console.warn(`[Invoice Service] Note sync to Shopify order ${id} failed (non-critical):`, err);
  }
}
