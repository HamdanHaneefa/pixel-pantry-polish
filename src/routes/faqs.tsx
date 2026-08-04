import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { Home } from "lucide-react";

export const Route = createFileRoute("/faqs")({
  component: FAQsPage,
});

const FAQ_ITEMS = [
  {
    q: "1. How long does delivery take?",
    a: "Most orders are delivered within 2–5 business days, depending on your location. Delivery timelines may vary during holidays or peak seasons."
  },
  {
    q: "2. Do you offer free shipping?",
    a: "Yes. We offer free shipping on orders above a specified amount. Shipping charges for smaller orders are calculated at checkout."
  },
  {
    q: "3. How can I track my order?",
    a: "Once your order is shipped, you'll receive a tracking link via email or SMS."
  },
  {
    q: "4. Can I change my delivery address after placing an order?",
    a: "Yes, if your order hasn't been dispatched. Contact our support team as soon as possible."
  },
  {
    q: "5. Do you deliver across India?",
    a: "Yes, we deliver to most locations across India."
  },
  {
    q: "6. What is your return policy?",
    a: "Unused products in their original packaging can usually be returned within the return window mentioned in our policy."
  },
  {
    q: "7. What if I receive a damaged or incorrect product?",
    a: "Contact us within 48 hours with photos of the product, and we'll arrange a replacement or refund."
  },
  {
    q: "8. How long do refunds take?",
    a: "Refunds are processed within 5–10 business days after approval."
  }
];

function FAQsPage() {
  return (
    <div className="min-h-screen bg-[#FDF9F3] pb-20 md:pb-0 flex flex-col">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-[#FFF5EB] border-b border-[#FFE4C4] py-3 shrink-0">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 flex items-center gap-2 text-[13px]">
          <Link to="/" className="text-muted-foreground hover:text-[#FF5B00] transition-colors flex items-center gap-1.5">
            <Home className="w-4 h-4" /> Home
          </Link>
          <span className="text-muted-foreground/60 mx-1">{'>'}</span>
          <span className="text-[#FF5B00] font-medium">FAQs</span>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 md:px-8 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
          Frequently Asked Questions
        </h1>

        <div className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-xl border border-border/60 p-6 shadow-sm hover:border-border transition-colors"
            >
              <h3 className="text-[15px] font-bold text-foreground mb-3">
                {item.q}
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
