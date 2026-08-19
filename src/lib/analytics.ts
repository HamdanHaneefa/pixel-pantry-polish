/**
 * Google Analytics 4 (GA4) Integration for Petpedia
 * Measurement ID: G-FJLTTPJCKL
 */

export const GA_MEASUREMENT_ID =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env["VITE_GA_MEASUREMENT_ID"]) ||
  "G-FJLTTPJCKL";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Ensures gtag is defined on the window object
 */
export function ensureGtag(): boolean {
  if (typeof window === "undefined") return false;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }
  return true;
}

/**
 * Tracks a pageview in GA4
 */
export function trackPageView(url: string, title?: string) {
  if (!ensureGtag()) return;
  window.gtag?.("config", GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

/**
 * Tracks a custom GA4 event
 */
export function trackEvent(
  action: string,
  params?: Record<string, any>
) {
  if (!ensureGtag()) return;
  window.gtag?.("event", action, params);
}

/**
 * Tracks an item view (view_item)
 */
export function trackViewItem(item: {
  id: string;
  name: string;
  price: number;
  category?: string | undefined;
  brand?: string | undefined;
  variant?: string | undefined;
}) {
  trackEvent("view_item", {
    currency: "INR",
    value: item.price,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
        item_brand: item.brand || "Petpedia",
        item_variant: item.variant,
      },
    ],
  });
}

/**
 * Tracks adding an item to the cart (add_to_cart)
 */
export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string | undefined;
  brand?: string | undefined;
  variant?: string | undefined;
}) {
  const qty = item.quantity || 1;
  trackEvent("add_to_cart", {
    currency: "INR",
    value: item.price * qty,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: qty,
        item_category: item.category,
        item_brand: item.brand || "Petpedia",
        item_variant: item.variant,
      },
    ],
  });
}

/**
 * Tracks removing an item from the cart (remove_from_cart)
 */
export function trackRemoveFromCart(item: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}) {
  const qty = item.quantity || 1;
  trackEvent("remove_from_cart", {
    currency: "INR",
    value: item.price * qty,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: qty,
      },
    ],
  });
}

/**
 * Tracks initiating checkout (begin_checkout)
 */
export function trackBeginCheckout(
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>,
  totalValue: number
) {
  trackEvent("begin_checkout", {
    currency: "INR",
    value: totalValue,
    items: items.map((it) => ({
      item_id: it.id,
      item_name: it.name,
      price: it.price,
      quantity: it.quantity,
    })),
  });
}

/**
 * Tracks a completed purchase (purchase)
 */
export function trackPurchase(
  transactionId: string,
  value: number,
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>,
  tax?: number,
  shipping?: number
) {
  trackEvent("purchase", {
    transaction_id: transactionId,
    currency: "INR",
    value,
    tax: tax || 0,
    shipping: shipping || 0,
    items: items.map((it) => ({
      item_id: it.id,
      item_name: it.name,
      price: it.price,
      quantity: it.quantity,
    })),
  });
}
