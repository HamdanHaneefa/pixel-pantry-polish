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

/**
 * Food (heavy, low-margin products) is charged by weight instead of a flat tier:
 * ₹40 per started 5 kg of cart weight, capped at ₹800, and always charged — the
 * free-delivery amount does not apply.
 *
 * The website calculates it (food products only) and sends it to Fastrr as the
 * `food_delivery` cart attribute, matched by "Additional Charges" rules on Cart Attributes
 * (food_delivery = 160 / 320 / 480 / 640 / 800 for 20 kg bags → same amount). Fastrr does not receive product
 * weights, so it cannot calculate this itself.
 */
export const WEIGHT_SHIPPING_TAG = "ship-weight" as const;
export const FOOD_DELIVERY_ATTRIBUTE = "food_delivery";
export const FOOD_SLAB_KG = 5;
export const FOOD_SLAB_FEE = 40;
export const FOOD_FEE_CAP = 800;

/** Food delivery fee for a total food weight. Any food in the cart costs at least one slab. */
export function foodDeliveryFee(totalKg: number): number {
  const slabs = Math.max(1, Math.ceil(totalKg / FOOD_SLAB_KG));
  return Math.min(FOOD_FEE_CAP, slabs * FOOD_SLAB_FEE);
}

export type ShippingTag = (typeof SHIPPING_TIERS)[number]["tag"] | typeof WEIGHT_SHIPPING_TAG;

const SHIPPING_TAG_SET = new Set<string>([
  ...SHIPPING_TIERS.map((t) => t.tag),
  WEIGHT_SHIPPING_TAG,
]);

export function isShippingTag(tag: string): boolean {
  return SHIPPING_TAG_SET.has(tag.trim().toLowerCase());
}

/** The product's delivery tag, or null when it has none (ships free). */
export function getShippingTag(tags?: string[] | null): ShippingTag | null {
  const found = tags?.find((t) => isShippingTag(t));
  return found ? (found.trim().toLowerCase() as ShippingTag) : null;
}

/** Weight from a name like "Sun conur mix 20kg", "Pigeon breeding mix(20kg)" or "500 g". */
export function weightKgFromTitle(title?: string | null): number {
  const m = String(title || "").match(/(\d+(?:\.\d+)?)\s*(kgs?|kilograms?|g|gms?|grams?)\b/i);
  if (!m) return 0;
  const value = parseFloat(m[1]);
  return /^k/i.test(m[2]) ? value : value / 1000;
}
