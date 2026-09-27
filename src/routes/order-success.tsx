import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { CheckCircle2, ArrowRight, ExternalLink, Loader2 } from "lucide-react";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Petpedia" },
      { name: "description", content: "Redirecting to your Shopify order confirmation." },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const [redirectUrl, setRedirectUrl] = useState<string>(
    "https://shopify.com/77079314626/account/orders?buyer_token_attempted=1&locale=en"
  );
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const oid = params.get("order_number") || params.get("oid") || params.get("order_id");
      if (oid) {
        setOrderNumber(oid);
      }

      // Check saved order from localStorage for exact Shopify status URL
      const saved = localStorage.getItem("petpedia_last_order");
      let targetUrl = "https://shopify.com/77079314626/account/orders?buyer_token_attempted=1&locale=en";

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.orderStatusUrl) {
            targetUrl = parsed.orderStatusUrl;
          }
        } catch (e) {
          console.error("Failed to parse saved order:", e);
        }
      }

      setRedirectUrl(targetUrl);

      // Instant redirect to Shopify order page
      window.location.replace(targetUrl);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF9F3] flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-border/60 shadow-lg p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h1 className="text-xl font-bold text-foreground mb-2">
            Order Confirmed{orderNumber ? ` #${orderNumber}` : ""}!
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Redirecting to your official Shopify Order Status page...
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-[#FF5B00] font-medium mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Opening Shopify...</span>
          </div>

          <a
            href={redirectUrl}
            className="w-full h-12 bg-[#FF5B00] hover:bg-[#E55200] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Order on Shopify</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
