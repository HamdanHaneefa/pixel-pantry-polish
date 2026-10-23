import { createServerFn } from "@tanstack/react-start";
import { adminAuthMiddleware } from "./auth";
import { storageGet, storageSet } from "@/lib/storage/adapter";

// VAPID Configuration for Web Push Notifications
export const VAPID_PUBLIC_KEY = process.env["VAPID_PUBLIC_KEY"] || "";
const VAPID_PRIVATE_KEY = process.env["VAPID_PRIVATE_KEY"] || "";
export const VAPID_SUBJECT = process.env["VAPID_SUBJECT"] || "mailto:admin@petpedia.in";

let webPushInitialized = false;

/**
 * Lazy loads web-push ONLY on the server side to avoid Node.js prototype errors in the browser
 */
async function getWebPushInstance() {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("[WebPush] VAPID keys not configured in environment variables.");
    return null;
  }
  const mod = await import("web-push");
  const wp = (mod as any).default || mod;
  if (!webPushInitialized) {
    try {
      wp.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      webPushInitialized = true;
    } catch (err) {
      console.warn("[WebPush] setVapidDetails error:", err);
    }
  }
  return wp;
}

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: PushSubscriptionKeys;
  expirationTime?: number | null;
  createdAt?: number;
  userAgent?: string;
}

// In-memory subscriptions store with filesystem persistence fallback
let inMemorySubscriptions: PushSubscriptionData[] = [];

async function loadSubscriptions(): Promise<PushSubscriptionData[]> {
  const loaded = await storageGet<PushSubscriptionData[]>(
    "push-subscriptions",
    inMemorySubscriptions,
  );
  inMemorySubscriptions = loaded;
  return loaded;
}

async function persistSubscriptions(subs: PushSubscriptionData[]): Promise<void> {
  inMemorySubscriptions = [...subs];
  await storageSet("push-subscriptions", subs);
}

/**
 * Server function to get the public VAPID key needed by the browser
 */
export const getVapidPublicKeyFn = createServerFn({ method: "GET" }).handler(async () => {
  return { publicKey: VAPID_PUBLIC_KEY };
});

/**
 * Server function to save / register an admin device subscription
 */
export const savePushSubscriptionFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((data: PushSubscriptionData) => data)
  .handler(async ({ data }) => {
    try {
      if (!data.endpoint || !data.keys?.p256dh || !data.keys?.auth) {
        return { success: false, error: "Invalid subscription payload" };
      }

      const existing = await loadSubscriptions();
      const filtered = existing.filter((s) => s.endpoint !== data.endpoint);
      const updated: PushSubscriptionData[] = [
        ...filtered,
        {
          ...data,
          createdAt: Date.now(),
        },
      ];

      await persistSubscriptions(updated);
      console.log(
        `[WebPush] Registered device subscription. Total active devices: ${updated.length}`,
      );

      return { success: true, totalActive: updated.length };
    } catch (err: any) {
      console.error("[WebPush] savePushSubscriptionFn error:", err);
      return { success: false, error: err.message || "Failed to save subscription" };
    }
  });

/**
 * Server function to send a test push alert from the Admin UI
 */
/**
 * Server function to send a test push alert from the Admin UI
 */
export const sendTestPushNotificationFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(
    (data?: {
      orderName?: string;
      customerName?: string;
      city?: string;
      totalPrice?: string | number;
    }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const subs = await loadSubscriptions();
      if (subs.length === 0) {
        return {
          success: false,
          error: "No active device subscriptions found. Tap 'Enable Notifications' first!",
        };
      }

      const webpush = await getWebPushInstance();

      const orderTitle = data?.orderName || "#1024";
      const customer = data?.customerName || "Rahul Verma";
      const place = data?.city || "Bengaluru";
      const price = data?.totalPrice
        ? String(data.totalPrice).startsWith("₹")
          ? String(data.totalPrice)
          : `₹${data.totalPrice}`
        : "₹1,499.00";

      const payload = JSON.stringify({
        title: `🛍️ New Order ${orderTitle}: ${price}`,
        body: `Customer: ${customer} • Place: ${place} • Price: ${price}`,
        url: "/admin/orders",
        tag: `petpedia-admin-order-${Date.now()}`,
        icon: "/icon-192.png",
        badge: "/favicon-32x32.png",
        timestamp: Date.now(),
        requireInteraction: true,
        vibrate: [300, 100, 300, 100, 400],
      });

      let sentCount = 0;
      const invalidEndpoints: string[] = [];

      for (const sub of subs) {
        try {
          await webpush.sendNotification(sub as any, payload);
          sentCount++;
        } catch (pushErr: any) {
          console.warn(
            "[WebPush] Test alert send failed for endpoint:",
            sub.endpoint,
            pushErr.statusCode,
          );
          if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
            invalidEndpoints.push(sub.endpoint);
          }
        }
      }

      if (invalidEndpoints.length > 0) {
        const cleaned = subs.filter((s) => !invalidEndpoints.includes(s.endpoint));
        await persistSubscriptions(cleaned);
      }

      return { success: true, sentCount, totalActive: subs.length };
    } catch (err: any) {
      console.error("[WebPush] sendTestPushNotificationFn error:", err);
      return { success: false, error: err.message || "Failed to send test alert" };
    }
  });

/**
 * Dispatches an order push notification to all registered admin devices
 */
export async function dispatchOrderPushNotification(order: {
  id?: string | number;
  name?: string;
  orderNumber?: string | number;
  totalPrice?: string | number;
  customerName?: string;
  city?: string;
  currency?: string;
  itemsCount?: number;
}): Promise<{ sentCount: number }> {
  try {
    const subs = await loadSubscriptions();
    if (subs.length === 0) {
      console.log("[WebPush] No admin subscriptions registered for order notification.");
      return { sentCount: 0 };
    }

    const webpush = await getWebPushInstance();

    const orderTitle = order.name || (order.orderNumber ? `#${order.orderNumber}` : "New Order");
    const currencyPrefix = order.currency === "INR" || !order.currency ? "₹" : `${order.currency} `;
    const formattedPrice = order.totalPrice
      ? String(order.totalPrice).startsWith("₹")
        ? String(order.totalPrice)
        : `${currencyPrefix}${order.totalPrice}`
      : "";
    const customer = order.customerName || "Customer";
    const place = order.city || "Delivery";

    const payload = JSON.stringify({
      title: `🛍️ New Order ${orderTitle}: ${formattedPrice}`.trim(),
      body: `Customer: ${customer} • Place: ${place} • Price: ${formattedPrice}`,
      url: "/admin/orders",
      tag: `petpedia-admin-order-${order.id || Date.now()}`,
      icon: "/icon-192.png",
      badge: "/favicon-32x32.png",
      timestamp: Date.now(),
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 400],
    });

    let sentCount = 0;
    const invalidEndpoints: string[] = [];

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub as any, payload);
        sentCount++;
      } catch (err: any) {
        console.warn(
          "[WebPush] Send notification error for endpoint:",
          sub.endpoint,
          err.statusCode,
        );
        if (err.statusCode === 404 || err.statusCode === 410) {
          invalidEndpoints.push(sub.endpoint);
        }
      }
    }

    if (invalidEndpoints.length > 0) {
      const cleaned = subs.filter((s) => !invalidEndpoints.includes(s.endpoint));
      await persistSubscriptions(cleaned);
    }

    console.log(`[WebPush] Order notification dispatched to ${sentCount}/${subs.length} devices.`);
    return { sentCount };
  } catch (err) {
    console.error("[WebPush] dispatchOrderPushNotification error:", err);
    return { sentCount: 0 };
  }
}
