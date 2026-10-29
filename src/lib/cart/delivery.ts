import { createServerFn } from "@tanstack/react-start";
import { queryShopifyAdmin } from "@/lib/admin/shopify-admin";
import { loadShippingSettings } from "@/lib/admin/shipping";
import { DELIVERY_FEE_CAP, SHIPPING_TIERS, getShippingTag } from "@/data/shippingTiers";

export interface DeliveryQuote {
  /** Delivery fee to charge: summed, capped, and zeroed above the free-delivery amount. */
  fee: number;
  /** Summed and capped product charges before the free-delivery amount is applied. */
  baseFee: number;
  /** Cart subtotal as priced by Shopify (not trusted from the browser). */
  subtotal: number;
  isFree: boolean;
  freeThreshold: number | null;
}

export interface DeliveryQuoteLine {
  variantId: string;
  quantity: number;
}

function toVariantGid(id: string): string | null {
  const numeric = String(id).match(/(\d+)$/)?.[1];
  return numeric ? `gid://shopify/ProductVariant/${numeric}` : null;
}

/**
 * Delivery fee for a cart (server only). Each product's delivery charge comes from its
 * ship-* tag (untagged products ship free), is counted once per product, summed, capped at
 * DELIVERY_FEE_CAP, and waived when the subtotal reaches the free-delivery amount.
 */
export async function computeDeliveryQuote(lines: DeliveryQuoteLine[]): Promise<DeliveryQuote> {
  const settings = await loadShippingSettings();
  const freeThreshold = settings.enableFreeShipping ? settings.freeShippingThreshold : null;

  const qtyByGid = new Map<string, number>();
  for (const line of lines) {
    const gid = toVariantGid(line.variantId);
    if (gid) qtyByGid.set(gid, (qtyByGid.get(gid) || 0) + line.quantity);
  }
  if (qtyByGid.size === 0) {
    return { fee: 0, baseFee: 0, subtotal: 0, isFree: true, freeThreshold };
  }

  const res = await queryShopifyAdmin<{
    nodes: Array<{ id: string; price: string; product: { id: string; tags: string[] } } | null>;
  }>(
    `query deliveryQuote($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on ProductVariant { id price product { id tags } }
      }
    }`,
    { ids: Array.from(qtyByGid.keys()) },
  );

  let subtotal = 0;
  const chargeByProduct = new Map<string, number>();
  for (const node of res.nodes || []) {
    if (!node?.product) continue;
    subtotal += (parseFloat(node.price) || 0) * (qtyByGid.get(node.id) || 0);
    const tier = SHIPPING_TIERS.find((t) => t.tag === getShippingTag(node.product.tags));
    chargeByProduct.set(node.product.id, tier ? tier.amount : 0);
  }

  const baseFee = Math.min(
    DELIVERY_FEE_CAP,
    Array.from(chargeByProduct.values()).reduce((a, b) => a + b, 0),
  );
  const freeByThreshold = freeThreshold !== null && subtotal >= freeThreshold;
  const fee = freeByThreshold ? 0 : baseFee;
  return { fee, baseFee, subtotal, isFree: fee === 0, freeThreshold };
}

export const getDeliveryQuoteFn = createServerFn({ method: "POST" })
  .validator((data: { lines: DeliveryQuoteLine[] }) => {
    if (!Array.isArray(data?.lines)) throw new Error("lines must be an array");
    return {
      lines: data.lines.slice(0, 100).map((l) => ({
        variantId: String(l.variantId || ""),
        quantity: Math.max(1, Math.min(999, Math.floor(Number(l.quantity) || 1))),
      })),
    };
  })
  .handler(async ({ data }): Promise<DeliveryQuote> => computeDeliveryQuote(data.lines));
