import { useEffect, useState } from "react";
import { getDeliveryQuoteFn, type DeliveryQuote } from "@/lib/cart/delivery";
import { DELIVERY_FEE_ATTRIBUTE, FOOD_DELIVERY_ATTRIBUTE } from "@/data/shippingTiers";

interface QuoteItem {
  variantId: string;
  quantity?: number | undefined;
}

/** Server-calculated delivery quote for the given items (null while loading or on error). */
export function useDeliveryQuote(items: QuoteItem[] | undefined): DeliveryQuote | null {
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const key = (items || []).map((i) => `${i.variantId}:${i.quantity || 1}`).join(",");

  // Recalculate when the customer comes back to the tab, so a charge changed in the admin
  // (or a long-open page) never sends a stale fee to checkout.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") setRefreshTick((t) => t + 1);
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    if (!items || items.length === 0) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    getDeliveryQuoteFn({
      data: { lines: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity || 1 })) },
    })
      .then((q) => {
        if (!cancelled) setQuote(q);
      })
      .catch((err) => {
        console.warn("[delivery] Could not calculate delivery fee:", err);
        if (!cancelled) setQuote(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, refreshTick]);

  return quote;
}

/**
 * The delivery fees as Fastrr cart attributes, pre-fetched so the BUY NOW tap opens
 * checkout instantly. Empty until the fees are known.
 */
export function useDeliveryFeeAttribute(items: QuoteItem[] | undefined): Record<string, string> {
  return deliveryCartAttributes(useDeliveryQuote(items));
}

/**
 * Fastrr cart attributes for a quote: `delivery_fee` (Shipping Charge rules) and, when the
 * cart has food, `food_delivery` (Additional Charges rules on Cart Attributes).
 */
export function deliveryCartAttributes(quote: DeliveryQuote | null): Record<string, string> {
  if (!quote) return {};
  return {
    [DELIVERY_FEE_ATTRIBUTE]: String(quote.fee),
    ...(quote.foodFee > 0 ? { [FOOD_DELIVERY_ATTRIBUTE]: String(quote.foodFee) } : {}),
  };
}
