/**
 * Analytics Integration for Petpedia
 * - Google Analytics 4 (GA4): G-FJLTTPJCKL
 * - Meta Pixel (Facebook & Instagram): 1103413499119873
 */

export const GA_MEASUREMENT_ID =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env["VITE_GA_MEASUREMENT_ID"]) ||
  "G-FJLTTPJCKL";

export const META_PIXEL_ID =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env["VITE_META_PIXEL_ID"]) ||
  "1103413499119873";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
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
 * Tracks a pageview in GA4 and Meta Pixel
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window !== "undefined") {
    try {
      window.fbq?.("track", "PageView");
    } catch {
      // Non-fatal
    }
  }

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
export function trackEvent(action: string, params?: Record<string, any>) {
  if (!ensureGtag()) return;
  window.gtag?.("event", action, params);
}

/**
 * Tracks an item view (view_item & ViewContent)
 */
export function trackViewItem(item: {
  id: string;
  name: string;
  price: number;
  category?: string | undefined;
  brand?: string | undefined;
  variant?: string | undefined;
}) {
  if (typeof window !== "undefined") {
    try {
      window.fbq?.("track", "ViewContent", {
        content_ids: [item.id],
        content_name: item.name,
        content_type: "product",
        value: item.price,
        currency: "INR",
      });
    } catch {
      // Non-fatal
    }
  }

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
 * Tracks adding an item to the cart (add_to_cart & AddToCart)
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

  if (typeof window !== "undefined") {
    try {
      window.fbq?.("track", "AddToCart", {
        content_ids: [item.id],
        content_name: item.name,
        content_type: "product",
        value: item.price * qty,
        currency: "INR",
      });
    } catch {
      // Non-fatal
    }
  }

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
 * Tracks initiating checkout (begin_checkout & InitiateCheckout)
 */
export function trackBeginCheckout(
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>,
  totalValue: number,
) {
  if (typeof window !== "undefined") {
    try {
      window.fbq?.("track", "InitiateCheckout", {
        content_ids: items.map((it) => it.id),
        num_items: items.reduce((acc, it) => acc + (it.quantity || 1), 0),
        value: totalValue,
        currency: "INR",
      });
    } catch {
      // Non-fatal
    }
  }

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
 * Tracks a completed purchase (purchase & Purchase)
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
  shipping?: number,
) {
  if (typeof window !== "undefined") {
    try {
      window.fbq?.("track", "Purchase", {
        content_ids: items.map((it) => it.id),
        value,
        currency: "INR",
        num_items: items.reduce((acc, it) => acc + (it.quantity || 1), 0),
      });
    } catch {
      // Non-fatal
    }
  }

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
