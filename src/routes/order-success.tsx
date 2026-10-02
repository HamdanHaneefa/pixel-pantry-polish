import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { useCustomer } from "@/context/CustomerContext";
import { CheckCircle2, ArrowRight, Package, ShoppingBag, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Petpedia" },
      { name: "description", content: "Your Petpedia order has been placed successfully." },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const { autoLoginAfterCheckout } = useCustomer();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const oid = params.get("order_number") || params.get("oid") || params.get("order_id");
      if (oid) {
        setOrderNumber(oid);
      }

      // Check saved order from localStorage for phone number auto-authentication
      const saved = localStorage.getItem("petpedia_last_order");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.name && !oid) {
            setOrderNumber(parsed.name.replace(/^#/, ""));
          }
          if (parsed?.customer?.phone) {
            setCustomerPhone(parsed.customer.phone);
            autoLoginAfterCheckout({
              phone: parsed.customer.phone,
              firstName: parsed.customer.firstName || "Customer",
              lastName: parsed.customer.lastName || "",
              email: parsed.customer.email,
              orderId: oid || parsed.orderId,
            });
          }
        } catch (e) {
          console.error("Failed to parse saved order:", e);
        }
      }
    }
  }, [autoLoginAfterCheckout]);

  return (
    <div className="min-h-screen bg-[#FDF9F3] flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 p-8 text-center animate-in fade-in zoom-in-95 duration-200 space-y-5">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900">
              Order Confirmed{orderNumber ? ` #${orderNumber}` : ""}!
            </h1>
            <p className="text-sm text-slate-500">
              Thank you for shopping at Petpedia! We have received your order and are preparing it with love.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5 border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-slate-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Linked to Your Account</span>
            </div>
            <p className="text-[11px] text-slate-500">
              This order has been linked to your phone profile{customerPhone ? ` (${customerPhone})` : ""}. You can view live tracking and updates anytime.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/account"
              hash="order"
              className="w-full h-12 bg-[#1E3A8A] hover:bg-[#152B6B] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>View My Orders & Tracking</span>
            </Link>

            <Link
              to="/shop"
              className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
