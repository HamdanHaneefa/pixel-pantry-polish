import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { formatPrice } from "@/data/home";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  Printer,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Petpedia" },
      { name: "description", content: "Thank you for your order on Petpedia!" },
    ],
  }),
  component: OrderSuccessPage,
});

interface SavedOrder {
  orderId: string;
  date: string;
  items: Array<{
    id: string;
    title: string;
    productTitle?: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  tax: number;
  total: number;
  customer: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
  paymentStatus: string;
}

function OrderSuccessPage() {
  const [order, setOrder] = useState<SavedOrder | null>(null);
  const [urlOrderId, setUrlOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const oid = params.get("order_number") || params.get("oid") || params.get("order_id");
      const phone = params.get("phone");
      if (oid) {
        setUrlOrderId(oid);
      }

      const saved = localStorage.getItem("petpedia_last_order");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (oid && !parsed.orderId) {
            parsed.orderId = oid;
          }
          if (phone && !parsed.customer?.phone) {
            parsed.customer = { ...parsed.customer, phone };
          }
          setOrder(parsed);
        } catch (e) {
          console.error("Failed to parse saved order:", e);
        }
      }
    }
  }, []);

  const orderId = urlOrderId || order?.orderId || "SR-FST-829104";
  const orderDate = order?.date
    ? new Date(order.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return (
    <div className="min-h-screen bg-[#FDF9F3] flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100/90 rounded-full flex items-center justify-center mx-auto mb-5">
            <div className="w-12 h-12 bg-[#00A859] rounded-full flex items-center justify-center shadow-lg text-white">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
            Thank you! Your order is confirmed
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
            We've received your order and our pet care specialists are packing your pet's essentials!
            A confirmation receipt has been sent to{" "}
            <span className="font-semibold text-foreground">
              {order?.customer?.email || "your registered email"}
            </span>.
          </p>
        </div>

        {/* Order Meta Bar */}
        <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5 md:p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
              Order Number
            </span>
            <span className="text-lg font-bold text-[#FF5B00] font-mono">
              #{orderId}
            </span>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
              Date & Time
            </span>
            <span className="text-sm font-semibold text-foreground">
              {orderDate}
            </span>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
              Payment Method
            </span>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              {order?.paymentMethod || "Shopify Secure Payment / COD"}
            </span>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
              Estimated Delivery
            </span>
            <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> 2 - 4 Business Days
            </span>
          </div>
        </div>

        {/* Tracking Stepper */}
        <div className="bg-white rounded-xl border border-border/60 shadow-sm p-6 mb-8">
          <h2 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#FF5B00]" />
            Delivery Status Tracking
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            <div className="flex sm:flex-col items-center sm:text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00A859] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                ✓
              </div>
              <div>
                <span className="text-sm font-bold text-foreground block">Order Placed</span>
                <span className="text-xs text-muted-foreground">Payment verified</span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF5B00] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                2
              </div>
              <div>
                <span className="text-sm font-bold text-foreground block">Processing</span>
                <span className="text-xs text-muted-foreground">Packing with love</span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:text-center gap-3 opacity-60">
              <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <span className="text-sm font-bold text-foreground block">Shipped</span>
                <span className="text-xs text-muted-foreground">In transit</span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:text-center gap-3 opacity-60">
              <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm shrink-0">
                4
              </div>
              <div>
                <span className="text-sm font-bold text-foreground block">Delivered</span>
                <span className="text-xs text-muted-foreground">At your door</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Column Details: Items & Delivery Address */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Order items */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-border/60 shadow-sm p-6">
            <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FF5B00]" />
              Items in this shipment
            </h3>

            {order?.items && order.items.length > 0 ? (
              <div className="space-y-4 divide-y divide-border/40">
                {order.items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-[#FAF8F5] border border-border/60 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                        {item.productTitle || item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="font-bold text-sm text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-4">
                Items packed and ready for dispatch.
              </div>
            )}

            {/* Totals Breakdown */}
            <div className="border-t border-border/60 mt-6 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatPrice(order?.subtotal || 1600)}
                </span>
              </div>
              {order?.discountAmount ? (
                <div className="flex justify-between text-green-600">
                  <span>Discount Applied</span>
                  <span className="font-medium">-{formatPrice(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-foreground">
                  {order?.shippingFee ? formatPrice(order.shippingFee) : "Free"}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes</span>
                <span className="font-medium text-foreground">
                  {formatPrice(order?.tax || 0)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base text-foreground pt-3 border-t border-border/60">
                <span>Grand Total</span>
                <span className="text-[#FF5B00] text-lg">
                  {formatPrice(order?.total || 1600)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-border/60 shadow-sm p-6">
              <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF5B00]" />
                Delivery Address
              </h3>
              <div className="text-sm text-foreground leading-relaxed">
                <p className="font-bold">
                  {order?.customer?.firstName || "Valued"} {order?.customer?.lastName || "Customer"}
                </p>
                <p className="text-muted-foreground mt-1">
                  {order?.customer?.address || "Address provided during checkout"}
                </p>
                <p className="text-muted-foreground">
                  {order?.customer?.city ? `${order.customer.city}, ` : ""}
                  {order?.customer?.zipCode || ""}
                </p>
                <p className="text-muted-foreground">{order?.customer?.country || "India"}</p>
                {order?.customer?.phone && (
                  <p className="text-muted-foreground mt-2 font-medium">
                    Phone: {order.customer.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.print()}
                className="w-full h-11 bg-white border border-border/80 text-foreground font-semibold text-xs rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-muted-foreground" />
                PRINT / SAVE RECEIPT
              </button>

              <Link
                to="/shop"
                className="w-full h-11 bg-[#FF5B00] text-white font-bold text-xs rounded-lg hover:bg-[#E55200] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                CONTINUE SHOPPING
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}

