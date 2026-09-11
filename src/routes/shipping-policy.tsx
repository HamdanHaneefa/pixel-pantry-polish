import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { Home } from "lucide-react";

export const Route = createFileRoute("/shipping-policy")({
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
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
          <span className="text-[#FF5B00] font-medium">Shipping Policy</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-[1440px] w-full px-4 md:px-8 py-10 md:py-16">
        <div className="flex-1 text-muted-foreground text-[14px] leading-relaxed max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-[32px] font-bold text-foreground mb-8 tracking-tight text-center">
            Shipping Policy
          </h1>

          <div className="space-y-8 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-[#FFE4C4]">
            
            <p className="font-medium text-foreground">
              At Petpedia, we work to get your order to you safely and as quickly as possible.
            </p>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">1. Order Processing</h2>
              <p>Orders are usually processed within 1–2 business days after payment is confirmed. You’ll receive an order confirmation once your order is placed.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">2. Delivery Time</h2>
              <p className="mb-2">Delivery usually takes 3–7 business days, depending on your location and the courier service.</p>
              <p>Please note that delivery times are estimates and may vary due to weather, holidays, courier delays, or other circumstances beyond our control.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">3. Shipping Charges</h2>
              <p>Shipping charges, if applicable, will be shown at checkout before you complete your purchase.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">4. Order Tracking</h2>
              <p>Once your order has been shipped, we’ll provide tracking information when available so you can follow your delivery.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">5. Delayed or Lost Orders</h2>
              <p>If your order is significantly delayed or appears to be lost, please contact us and we’ll help you check its status with the courier.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">6. Damaged or Incorrect Orders</h2>
              <p>Please check your order when it arrives. If you receive a damaged, defective, or incorrect product, contact us as soon as possible with your order details and photos of the issue.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">7. Contact Us</h2>
              <p>For shipping-related questions, contact us:</p>
              <p>Phone: +91 9061333733</p>
              <p>Email: <a href="mailto:support@petpedia.in" className="text-[#FF5B00] hover:underline">support@petpedia.in</a></p>
            </section>

          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
