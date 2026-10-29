/**
 * Per-product delivery charge tiers.
 *
 * Each tier is stored as a Shopify product tag. At checkout the server sums the tiers of the
 * products in the cart (see src/lib/cart/delivery.ts) and the BUY NOW button passes the total
 * to Shiprocket Fastrr as the `delivery_fee` cart attribute, which Fastrr's "Shipping Charge"
 * rules (criteria: Cart Attributes) turn into the shipping line.
 */
export const SHIPPING_TIERS = [
  { tag: "ship-free", label: "Free delivery", amount: 0 },
  { tag: "ship-50", label: "₹50", amount: 50 },
  { tag: "ship-100", label: "₹100", amount: 100 },
  { tag: "ship-150", label: "₹150", amount: 150 },
  { tag: "ship-200", label: "₹200", amount: 200 },
] as const;

/**
 * Highest delivery fee a cart can be charged (sum of per-product charges is capped here).
 * Fastrr needs one "Shipping Charge" rule per possible total: Cart Attributes
 * delivery_fee = 0 / 50 / 100 / 150 / 200 → same amount.
 */
export const DELIVERY_FEE_CAP = 200;

/** Cart attribute key read by the Fastrr shipping rules. */
export const DELIVERY_FEE_ATTRIBUTE = "delivery_fee";

export type ShippingTag = (typeof SHIPPING_TIERS)[number]["tag"];

const SHIPPING_TAG_SET = new Set<string>(SHIPPING_TIERS.map((t) => t.tag));

export function isShippingTag(tag: string): boolean {
  return SHIPPING_TAG_SET.has(tag.trim().toLowerCase());
}

/** The product's delivery tier tag, or null when it uses the store default. */
export function getShippingTag(tags?: string[] | null): ShippingTag | null {
  const found = tags?.find((t) => isShippingTag(t));
  return found ? (found.trim().toLowerCase() as ShippingTag) : null;
}
