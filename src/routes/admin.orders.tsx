import { useState, useMemo, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrdersFn, AdminOrder } from "@/lib/admin/orders";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import {
  Search,
  ShoppingCart,
  Phone,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Bell,
  BellRing,
  Volume2,
  Sparkles,
  X,
  HelpCircle,
  Radio,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { OrdersSkeleton } from "@/components/admin/AdminSkeletons";

export const Route = createFileRoute("/admin/orders")({
  loader: async () => {
    const res = await getAdminOrdersFn();
    return {
      orders: res.orders || [],
      missingScope: !!res.missingScope,
      errorMessage: res.error,
    };
  },
  pendingComponent: OrdersSkeleton,
  component: AdminOrdersPage,
});

function playOrderChime() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (G5 -> C6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(783.99, now);
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second celebratory chime tone (E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1318.51, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.warn("[playOrderChime] Web Audio notice:", e);
  }
}

function triggerOrderNotification(order: AdminOrder) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const customerName = order.customer?.name || order.shippingAddress?.name || "Customer";
  const place = order.shippingAddress?.city || order.shippingAddress?.province || "Delivery";
  const formattedPrice = `₹${order.total.toFixed(2)}`;

  const title = `🛍️ New Order ${order.name}: ${formattedPrice}`;
  const body = `Customer: ${customerName} • Place: ${place} • Price: ${formattedPrice}`;

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/favicon.ico",
        tag: `order-${order.id}`,
        data: { url: "/admin/orders" },
      });
    });
  } else {
    try {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
      });
    } catch {
      // Fallback
    }
  }
}

function AdminOrdersPage() {
  const { orders: initialOrders, missingScope: initialMissingScope } = Route.useLoaderData();
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [missingScope, setMissingScope] = useState(initialMissingScope);
  const [isCheckingOrders, setIsCheckingOrders] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNFULFILLED" | "FULFILLED">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Live order dynamic sync states
  const knownOrderIdsRef = useRef<Set<string>>(
    new Set(initialOrders.map((o) => o.id))
  );
  const [latestNewOrder, setLatestNewOrder] = useState<AdminOrder | null>(null);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");
  const [showPushGuide, setShowPushGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("Browser notifications are not supported in this browser.");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === "granted") {
        playOrderChime();
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          try {
            const { getVapidPublicKeyFn, savePushSubscriptionFn } = await import("@/lib/admin/push-notifications");
            const { publicKey } = await getVapidPublicKeyFn();
            const padding = "=".repeat((4 - (publicKey.length % 4)) % 4);
            const base64 = (publicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
            const rawData = window.atob(base64);
            const appServerKey = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
              appServerKey[i] = rawData.charCodeAt(i);
            }
            let sub = await reg.pushManager.getSubscription();
            if (!sub) {
              sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: appServerKey,
              });
            }
            const subJson = sub.toJSON();
            if (subJson.endpoint && subJson.keys) {
              await savePushSubscriptionFn({
                data: {
                  endpoint: subJson.endpoint,
                  keys: {
                    p256dh: subJson.keys.p256dh || "",
                    auth: subJson.keys.auth || "",
                  },
                  userAgent: navigator.userAgent,
                },
              });
            }
          } catch (pushErr) {
            console.warn("[Orders] PushManager registration error:", pushErr);
          }

          reg.showNotification("🎉 Petpedia Notifications Enabled!", {
            body: "You will receive notifications here whenever a new customer order is placed.",
            icon: "/icon-192.png",
            badge: "/favicon-32x32.png",
            tag: "petpedia-admin-order",
          });
        }
      }
    } catch (e) {
      console.warn("Notification request failed:", e);
    }
  };

  const testOrderNotification = () => {
    playOrderChime();

    // Pick latest real order from store if available, otherwise dynamic realistic order
    const realOrder = orders && orders.length > 0 ? orders[0] : null;

    const sampleOrder: AdminOrder = realOrder
      ? {
          ...realOrder,
          id: `sample-${Date.now()}`,
        }
      : {
          id: `sample-${Date.now()}`,
          name: `#${Math.floor(1015 + Math.random() * 8980)}`,
          createdAt: new Date().toISOString(),
          financialStatus: "PAID",
          fulfillmentStatus: "UNFULFILLED",
          total: Number((650 + Math.floor(Math.random() * 18) * 120).toFixed(2)),
          currency: "INR",
          customer: {
            name: "Rahul Verma",
            email: "rahul.verma@example.com",
            phone: "+91 98201 23456",
          },
          shippingAddress: {
            name: "Rahul Verma",
            address1: "42 Indiranagar 100ft Rd",
            city: "Bengaluru",
            province: "Karnataka",
            zip: "560038",
            phone: "+91 98201 23456",
          },
          items: [{ id: "item-1", title: "Premium Pet Product", quantity: 1, price: 890.0 }],
          itemCount: 1,
        };

    setLatestNewOrder(sampleOrder);
    triggerOrderNotification(sampleOrder);

    // Also dispatch server push alert if permission is granted
    if (notificationPermission === "granted") {
      import("@/lib/admin/push-notifications")
        .then(({ sendTestPushNotificationFn }) => {
          sendTestPushNotificationFn({
            data: {
              orderName: sampleOrder.name,
              customerName: sampleOrder.customer?.name || "Customer",
              city: sampleOrder.shippingAddress?.city || "Bengaluru",
              totalPrice: sampleOrder.total.toFixed(2),
            },
          }).catch((err) => console.warn("[testOrderNotification] Push trigger notice:", err));
        })
        .catch(() => {});
    }
  };

  const handleRefreshOrders = async () => {
    setIsCheckingOrders(true);
    try {
      const res = await getAdminOrdersFn();
      setMissingScope(!!res.missingScope);
      if (res.orders) {
        setOrders(res.orders);
        res.orders.forEach((o) => knownOrderIdsRef.current.add(o.id));
      }
    } finally {
      setIsCheckingOrders(false);
    }
  };

  // Poll for new orders every 12 seconds
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        setIsLiveSyncing(true);
        const res = await getAdminOrdersFn();
        if (!isMounted || !res) return;

        setMissingScope(!!res.missingScope);

        if (!res.missingScope && res.orders) {
          const freshOrders = res.orders;
          const known = knownOrderIdsRef.current;
          const brandNewOrders = freshOrders.filter((o) => !known.has(o.id));

          if (brandNewOrders.length > 0 && brandNewOrders[0]) {
            const firstNew = brandNewOrders[0];
            brandNewOrders.forEach((o) => known.add(o.id));
            setOrders(freshOrders);
            setLatestNewOrder(firstNew);
            playOrderChime();
            triggerOrderNotification(firstNew);
          } else if (freshOrders.length !== orders.length) {
            setOrders(freshOrders);
          }
        }
      } catch (err) {
        console.warn("[admin.orders] Polling check notice:", err);
      } finally {
        if (isMounted) setIsLiveSyncing(false);
      }
    }, 12000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orders.length]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        order.name.toLowerCase().includes(q) ||
        order.customer.name.toLowerCase().includes(q) ||
        order.customer.phone.toLowerCase().includes(q) ||
        order.shippingAddress.city.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === "UNFULFILLED") matchesStatus = order.fulfillmentStatus === "UNFULFILLED";
      else if (statusFilter === "FULFILLED") matchesStatus = order.fulfillmentStatus === "FULFILLED";

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Customer Orders
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                isLiveSyncing
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
              title="Orders poll automatically every 12 seconds"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isLiveSyncing ? "bg-amber-500 animate-spin" : "bg-emerald-500 animate-pulse"}`} />
              {isLiveSyncing ? "Syncing..." : "Live Sync Active"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time customer orders with dynamic auto-update, audio chime, and push notifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Notification Controls */}
          {notificationPermission !== "granted" ? (
            <button
              onClick={requestNotificationPermission}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-orange-500/20 hover:bg-orange-600 transition-colors cursor-pointer"
            >
              <Bell className="h-3.5 w-3.5 animate-bounce" />
              Enable PWA Notifications
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Push Alerts On
            </div>
          )}

          {/* Test Chime / Notification Button */}
          <button
            onClick={testOrderNotification}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            title="Test notification sound and popup"
          >
            <Volume2 className="h-3 w-3 text-orange-500" />
            Test Chime
          </button>

          {/* Guide Help Button */}
          <button
            onClick={() => setShowPushGuide(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            title="How Push Notifications work for PWA"
          >
            <HelpCircle className="h-3 w-3 text-indigo-500" />
            Push Guide
          </button>

          <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs">
            {orders.length} Orders
          </div>
        </div>
      </div>

      {/* Missing Shopify Order Permission Banner */}
      {missingScope && (
        <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
                    Shopify Permission Required:
                    <span className="font-mono text-xs bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 font-bold">
                      read_orders & write_orders
                    </span>
                  </h2>
                  <p className="text-xs text-amber-900/90 mt-0.5 font-medium">
                    Shopify blocked access to your customer orders because your custom app credentials only have <code className="font-mono bg-amber-200/60 px-1 py-0.5 rounded">write_products</code> enabled.
                  </p>
                </div>
                <button
                  onClick={handleRefreshOrders}
                  disabled={isCheckingOrders}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isCheckingOrders ? "animate-spin" : ""}`} />
                  {isCheckingOrders ? "Checking Shopify..." : "Check Orders Again"}
                </button>
              </div>

              <div className="bg-white/90 border border-amber-200 rounded-xl p-3.5 text-xs text-slate-800 space-y-1.5 shadow-2xs">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🛠️ Quick 1-Minute Fix in Shopify Admin:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed pl-1">
                  <li>
                    Open Shopify Admin &rarr; <strong>Settings</strong> (bottom-left gear) &rarr; <strong>Apps and sales channels</strong> &rarr; <strong>Develop apps</strong>.
                  </li>
                  <li>
                    Click on your custom app (e.g. <strong>Petpedia Setup</strong>).
                  </li>
                  <li>
                    Go to the <strong>Configuration</strong> tab &rarr; Click <strong>Edit</strong> under <em>Admin API integration</em>.
                  </li>
                  <li>
                    In the search filter box, type <strong>Orders</strong> and check:
                    <span className="font-bold text-amber-950 ml-1">✅ read_orders</span> and <span className="font-bold text-amber-950">✅ write_orders</span>
                    <span className="text-slate-500 text-[11px] block ml-4">(Recommended: Also search <strong>Customers</strong> and check <strong>read_customers</strong> for address/phone info)</span>
                  </li>
                  <li>
                    Click <strong>Save</strong> at the top-right (and click <strong>Update app</strong> if prompted).
                  </li>
                  <li>
                    Click the <strong>&quot;Check Orders Again&quot;</strong> button above, and your Shopify orders will instantly load!
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic New Order Alert Toast Banner */}
      {latestNewOrder && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs text-white shrink-0">
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs uppercase tracking-wide">
                  New Order Received!
                </span>
                <span className="bg-white/25 text-white text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                  {latestNewOrder.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/95 mt-1 font-medium flex-wrap">
                <span className="inline-flex items-center gap-1 font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">
                  ₹{latestNewOrder.total.toFixed(2)}
                </span>
                <span>•</span>
                <span className="font-semibold text-white">
                  {latestNewOrder.customer?.name || latestNewOrder.shippingAddress?.name || "Customer"}
                </span>
                <span>•</span>
                <span className="text-amber-100 font-medium">
                  {latestNewOrder.shippingAddress?.city || latestNewOrder.shippingAddress?.province || "Delivery"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedOrder(latestNewOrder)}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer shadow-xs"
            >
              View Order
            </button>
            <button
              onClick={() => setLatestNewOrder(null)}
              className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white cursor-pointer"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-y-3">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 h-3.5 w-3.5 my-auto" />
            <input
              type="text"
              placeholder="Search by order number (#1015), customer name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter("UNFULFILLED")}
              className={`shrink-0 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === "UNFULFILLED"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              <Clock className="h-3 w-3" />
              Pending ({orders.filter((o) => o.fulfillmentStatus === "UNFULFILLED").length})
            </button>
            <button
              onClick={() => setStatusFilter("FULFILLED")}
              className={`shrink-0 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === "FULFILLED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              Fulfilled ({orders.filter((o) => o.fulfillmentStatus === "FULFILLED").length})
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Touch-friendly Order Cards (< 768px) */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
            No orders matching your criteria.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const rawPhone = (order.customer.phone || order.shippingAddress.phone || "").replace(/\D/g, "");
            const waPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

            return (
              <div
                key={`mob-${order.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
              >
                {/* Top: Order #, Date, Total */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="font-extrabold text-base text-slate-900">
                      {order.name}
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">
                      ₹{order.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {order.itemCount} item{order.itemCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Customer info & Quick Contact */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">
                      {order.customer.name}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {order.shippingAddress.city || "Kerala"}
                      {order.shippingAddress.zip ? ` (${order.shippingAddress.zip})` : ""}
                    </p>
                  </div>

                  {order.customer.phone && (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Call Customer"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="WhatsApp Customer"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Badges: Payment & Fulfillment */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      order.financialStatus === "PAID"
                        ? "bg-blue-50 text-blue-700"
                        : order.financialStatus === "REFUNDED"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {order.financialStatus}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      order.fulfillmentStatus === "FULFILLED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {order.fulfillmentStatus === "FULFILLED" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {order.fulfillmentStatus}
                  </span>
                </div>

                {/* Bottom Action: View Order Details */}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View & Update Order Details
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW: Full Data Table (≥ 768px) */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 sticky top-0 z-20 shadow-xs">
              <tr>
                <th scope="col" className="px-3.5 py-2.5 bg-slate-50 whitespace-nowrap">Order</th>
                <th scope="col" className="px-3.5 py-2.5 bg-slate-50 whitespace-nowrap">Date</th>
                <th scope="col" className="px-3.5 py-2.5 bg-slate-50">Customer & Contact</th>
                <th scope="col" className="px-3.5 py-2.5 bg-slate-50 whitespace-nowrap">Delivery City</th>
                <th scope="col" className="px-3.5 py-2.5 bg-slate-50 whitespace-nowrap">Items</th>
                <th scope="col" className="px-3.5 py-2.5 bg-slate-50 whitespace-nowrap">Payment</th>
                <th scope="col" className="px-3.5 py-2.5 bg-slate-50 whitespace-nowrap">Fulfillment</th>
                <th scope="col" className="px-3.5 py-2.5 bg-slate-50 whitespace-nowrap">Total</th>
                <th scope="col" className="px-3.5 py-2.5 bg-slate-50 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3.5 py-10 text-center text-slate-400 text-xs">
                    No orders matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const rawPhone = (order.customer.phone || order.shippingAddress.phone || "").replace(/\D/g, "");
                  const waPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Order Number */}
                      <td className="px-3.5 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                        {order.name}
                      </td>

                      {/* Date */}
                      <td className="px-3.5 py-2.5 text-slate-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Customer */}
                      <td className="px-3.5 py-2.5">
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{order.customer.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {order.customer.phone ? (
                              <>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {order.customer.phone}
                                </span>
                                <a
                                  href={`tel:${order.customer.phone}`}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Call Customer"
                                >
                                  <Phone className="h-2.5 w-2.5" />
                                </a>
                                <a
                                  href={`https://wa.me/${waPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-800"
                                  title="WhatsApp Customer"
                                >
                                  <MessageSquare className="h-2.5 w-2.5" />
                                </a>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400">No phone</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Delivery City */}
                      <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>
                            {order.shippingAddress.city || "Kerala"}
                            {order.shippingAddress.zip ? ` (${order.shippingAddress.zip})` : ""}
                          </span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-3.5 py-2.5 font-medium text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3 text-slate-400" />
                          {order.itemCount} item(s)
                        </div>
                      </td>

                      {/* Financial Status */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            order.financialStatus === "PAID"
                              ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {order.financialStatus}
                        </span>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            order.fulfillmentStatus === "FULFILLED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-amber-50 text-amber-700 border border-amber-200/60"
                          }`}
                        >
                          {order.fulfillmentStatus === "FULFILLED" ? (
                            <CheckCircle2 className="h-2.5 w-2.5" />
                          ) : (
                            <Clock className="h-2.5 w-2.5" />
                          )}
                          {order.fulfillmentStatus}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-3.5 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                        ₹{order.total.toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={(updated) => {
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            setSelectedOrder(updated);
          }}
        />
      )}

      {/* PWA Push Notification Architecture Guide Modal */}
      {showPushGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <BellRing className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">PWA & Push Notification Setup</h3>
                  <p className="text-xs text-slate-500">How dynamic orders and device notifications work</p>
                </div>
              </div>
              <button
                onClick={() => setShowPushGuide(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="rounded-xl bg-orange-50 border border-orange-200/70 p-3 space-y-1.5">
                <p className="font-bold text-orange-900 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                  1. Dynamic Live Orders (Active Now!)
                </p>
                <p className="text-orange-800">
                  This Orders portal automatically checks for fresh Shopify orders every <strong>12 seconds</strong> in the background. As soon as a customer completes checkout, the new order dynamically prepends to the top with a sound chime and toast banner.
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-200/70 p-3 space-y-1.5">
                <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  2. PWA Device Notifications (Active Now!)
                </p>
                <p className="text-emerald-800">
                  When you install Petpedia as a PWA on your phone (Android/iOS) or PC (Chrome/Edge/macOS), clicking <strong>"Enable PWA Notifications"</strong> registers your service worker (<code>/sw.js</code>) with the operating system. You will receive native system alerts whenever orders arrive!
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-slate-700" />
                  3. Background Web Push When App is Completely Closed
                </p>
                <p className="text-slate-600">
                  To wake up a phone/laptop when the browser and PWA are completely terminated, Web Push uses <strong>VAPID keys</strong> and a <strong>Shopify Webhook</strong>:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600 font-mono text-[11px]">
                  <li><strong>Generate VAPID keys</strong>: Run <code>npx web-push generate-vapid-keys</code>.</li>
                  <li><strong>Subscribe client</strong>: Store the browser push subscription endpoint in your database.</li>
                  <li><strong>Shopify Webhook</strong>: In Shopify Admin &rarr; <em>Settings &rarr; Notifications &rarr; Webhooks</em>, add an <code>orders/create</code> webhook pointing to your API endpoint.</li>
                  <li>When Shopify triggers the webhook, your server dispatches the push packet via <code>web-push</code>, which wakes up the device!</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowPushGuide(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
