import { createServerFn } from "@tanstack/react-start";
import { queryShopifyAdmin } from "@/lib/admin/shopify-admin";
import { loadShippingSettings } from "@/lib/admin/shipping";
import {
  DELIVERY_FEE_CAP,
  SHIPPING_TIERS,
  WEIGHT_SHIPPING_TAG,
  foodDeliveryFee,
  getShippingTag,
  weightKgFromTitle,
} from "@/data/shippingTiers";

export interface DeliveryQuote {
  /** Shipping for flat-tier products: summed, capped, zeroed above the free-delivery amount. */
  fee: number;
  /** Flat-tier charges before the free-delivery amount is applied. */
  baseFee: number;
  /** Weight-based food delivery charge (always charged; 0 when the cart has no food). */
  foodFee: number;
  /** Total food weight in kg. */
  foodWeightKg: number;
  /** fee + foodFee — the full delivery amount the customer pays. */
  total: number;
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

const KG_PER_UNIT: Record<string, number> = {
  KILOGRAMS: 1,
  GRAMS: 0.001,
  POUNDS: 0.45359237,
  OUNCES: 0.028349523,
};

/**
 * Delivery for a cart (server only).
 * - Flat-tier products: their ship-* charge (untagged ship free), counted once per product,
 *   summed, capped at DELIVERY_FEE_CAP, and waived at the free-delivery amount.
 * - Food (ship-weight): ₹40 per started 5 kg of food weight, always charged. Weight is the
 *   variant's Shopify weight, or the size in its name ("20kg") when that is not set.
 */
export async function computeDeliveryQuote(lines: DeliveryQuoteLine[]): Promise<DeliveryQuote> {
  const settings = await loadShippingSettings();
  const freeThreshold = settings.enableFreeShipping ? settings.freeShippingThreshold : null;
  const empty: DeliveryQuote = {
    fee: 0,
    baseFee: 0,
    foodFee: 0,
    foodWeightKg: 0,
    total: 0,
    subtotal: 0,
    isFree: true,
    freeThreshold,
  };

  const qtyByGid = new Map<string, number>();
  for (const line of lines) {
    const gid = toVariantGid(line.variantId);
    if (gid) qtyByGid.set(gid, (qtyByGid.get(gid) || 0) + line.quantity);
  }
  if (qtyByGid.size === 0) return empty;

  const res = await queryShopifyAdmin<{
    nodes: Array<{
      id: string;
      price: string;
      title?: string | null;
      product: { id: string; title?: string | null; tags: string[] };
      inventoryItem?: { measurement?: { weight?: { unit: string; value: number } | null } };
    } | null>;
  }>(
    `query deliveryQuote($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on ProductVariant {
          id
          price
          title
          product { id title tags }
          inventoryItem { measurement { weight { unit value } } }
        }
      }
    }`,
    { ids: Array.from(qtyByGid.keys()) },
  );

  let subtotal = 0;
  let foodWeightKg = 0;
  let hasFood = false;
  const chargeByProduct = new Map<string, number>();
  for (const node of res.nodes || []) {
    if (!node?.product) continue;
    const qty = qtyByGid.get(node.id) || 0;
    subtotal += (parseFloat(node.price) || 0) * qty;

    const tag = getShippingTag(node.product.tags);
    if (tag === WEIGHT_SHIPPING_TAG) {
      hasFood = true;
      const w = node.inventoryItem?.measurement?.weight;
      const shopifyKg = w ? (Number(w.value) || 0) * (KG_PER_UNIT[w.unit] ?? 1) : 0;
      const unitKg =
        shopifyKg > 0
          ? shopifyKg
          : weightKgFromTitle(node.title) || weightKgFromTitle(node.product.title);
      foodWeightKg += unitKg * qty;
    } else {
      const tier = SHIPPING_TIERS.find((t) => t.tag === tag);
      chargeByProduct.set(node.product.id, tier ? tier.amount : 0);
    }
  }

  const baseFee = Math.min(
    DELIVERY_FEE_CAP,
    Array.from(chargeByProduct.values()).reduce((a, b) => a + b, 0),
  );
  const freeByThreshold = freeThreshold !== null && subtotal >= freeThreshold;
  const fee = freeByThreshold ? 0 : baseFee;
  const foodFee = hasFood ? foodDeliveryFee(foodWeightKg) : 0;
  const total = fee + foodFee;

  return {
    fee,
    baseFee,
    foodFee,
    foodWeightKg: Math.round(foodWeightKg * 100) / 100,
    total,
    subtotal,
    isFree: total === 0,
    freeThreshold,
  };
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
