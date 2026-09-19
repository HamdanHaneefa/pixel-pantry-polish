import { createServerFn } from "@tanstack/react-start";
import webpush from "web-push";

// VAPID Configuration for Web Push Notifications
export const VAPID_PUBLIC_KEY =
  process.env["VAPID_PUBLIC_KEY"] ||
  "BE8kikczcnAeljsDEKNanejGxuj_v3LWkfLhJBo8erNbb7_XCRP4eRBAFc3D4bmE4eY3_PiPxfwwLocHQXpGhCk";

export const VAPID_PRIVATE_KEY =
  process.env["VAPID_PRIVATE_KEY"] ||
  "sJjF07W1AadHEMJdg15urif9Aq_GbXkgQpdNEysBL5A";

export const VAPID_SUBJECT =
  process.env["VAPID_SUBJECT"] || "mailto:admin@petpedia.in";

// Configure web-push details
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (err) {
  console.warn("[WebPush] setVapidDetails warning:", err);
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
  if (inMemorySubscriptions.length > 0) {
    return inMemorySubscriptions;
  }

  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const filePath = path.resolve(process.cwd(), "src", "data", "push-subscriptions.json");
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        inMemorySubscriptions = JSON.parse(raw);
      }
    } catch {
      // Ignored in read-only / edge environments
    }
  }

  return inMemorySubscriptions;
}

async function persistSubscriptions(subs: PushSubscriptionData[]): Promise<void> {
  inMemorySubscriptions = [...subs];

  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const dataDir = path.resolve(process.cwd(), "src", "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const filePath = path.join(dataDir, "push-subscriptions.json");
      fs.writeFileSync(filePath, JSON.stringify(subs, null, 2), "utf-8");
    } catch {
      // Ignored in read-only environments
    }
  }
}

/**
 * Server function to get the public VAPID key needed by the browser
 */
export const getVapidPublicKeyFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return { publicKey: VAPID_PUBLIC_KEY };
  }
);

/**
 * Server function to save / register an admin device subscription
 */
export const savePushSubscriptionFn = createServerFn({ method: "POST" })
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
      console.log(`[WebPush] Registered device subscription. Total active devices: ${updated.length}`);

      return { success: true, totalActive: updated.length };
    } catch (err: any) {
      console.error("[WebPush] savePushSubscriptionFn error:", err);
      return { success: false, error: err.message || "Failed to save subscription" };
    }
  });

/**
 * Server function to send a test push alert from the Admin UI
 */
export const sendTestPushNotificationFn = createServerFn({ method: "POST" }).handler(
  async () => {
    try {
      const subs = await loadSubscriptions();
      if (subs.length === 0) {
        return {
          success: false,
          error: "No active device subscriptions found. Tap 'Enable Notifications' first!",
        };
      }

      const payload = JSON.stringify({
        title: "🎉 Petpedia Alert: Push Connected!",
        body: "Your phone is successfully paired to receive instant alerts when orders arrive.",
        url: "/admin/orders",
        tag: "petpedia-admin-order",
        icon: "/icon-192.png",
        badge: "/favicon-32x32.png",
        timestamp: Date.now(),
      });

      let sentCount = 0;
      const invalidEndpoints: string[] = [];

      for (const sub of subs) {
        try {
          await webpush.sendNotification(sub as any, payload);
          sentCount++;
        } catch (pushErr: any) {
          console.warn("[WebPush] Test alert send failed for endpoint:", sub.endpoint, pushErr.statusCode);
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
  }
);

/**
 * Dispatches an order push notification to all registered admin devices
 */
export async function dispatchOrderPushNotification(order: {
  id?: string | number;
  name?: string;
  orderNumber?: string | number;
  totalPrice?: string | number;
  customerName?: string;
  currency?: string;
  itemsCount?: number;
}): Promise<{ sentCount: number }> {
  try {
    const subs = await loadSubscriptions();
    if (subs.length === 0) {
      console.log("[WebPush] No admin subscriptions registered for order notification.");
      return { sentCount: 0 };
    }

    const orderTitle = order.name || (order.orderNumber ? `#${order.orderNumber}` : "New Order");
    const formattedPrice = order.totalPrice
      ? `${order.currency === "INR" || !order.currency ? "₹" : order.currency + " "}${order.totalPrice}`
      : "";
    const customer = order.customerName ? ` • ${order.customerName}` : "";
    const items = order.itemsCount ? ` • ${order.itemsCount} item${order.itemsCount > 1 ? "s" : ""}` : "";

    const payload = JSON.stringify({
      title: `🛍️ New Order: ${orderTitle} ${formattedPrice}`.trim(),
      body: `Customer: ${customer ? order.customerName : "Online Store"}${items}. Tap to review and process.`,
      url: "/admin/orders",
      tag: "petpedia-admin-order",
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
        console.warn("[WebPush] Send notification error for endpoint:", sub.endpoint, err.statusCode);
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
