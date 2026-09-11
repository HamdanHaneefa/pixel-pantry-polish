import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { Home } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
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
          <span className="text-[#FF5B00] font-medium">Terms of Service</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-[1440px] w-full px-4 md:px-8 py-10 md:py-16">
        <div className="flex-1 text-muted-foreground text-[14px] leading-relaxed max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-[32px] font-bold text-foreground mb-8 tracking-tight text-center">
            Terms of Service
          </h1>

          <div className="space-y-8 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-[#FFE4C4]">
            
            <p className="font-medium text-foreground">
              Welcome to Petpedia. By using our website or purchasing our products, you agree to these Terms of Service.
            </p>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">1. Website Use</h2>
              <p>Please use our website only for lawful purposes. You must not misuse the website, attempt unauthorized access, or interfere with its operation.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">2. Products & Orders</h2>
              <p className="mb-2">We strive to keep product details, images, prices, and availability accurate. Minor differences in appearance or packaging may occur.</p>
              <p>Petpedia reserves the right to correct errors, update information, change prices, or cancel orders when necessary. An order is confirmed once accepted by Petpedia.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">3. Pricing & Payment</h2>
              <p>All prices are in Indian Rupees (INR) unless stated otherwise. You are responsible for providing accurate billing and payment information. Orders are processed after successful payment or payment confirmation.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">4. Shipping & Delivery</h2>
              <p>We aim to deliver orders within the estimated time provided at checkout. Delays may occur due to courier issues, weather, holidays, or other circumstances beyond our control.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">5. Returns & Refunds</h2>
              <p>Returns and refunds are handled according to our Refund & Return Policy. Please check your order upon delivery and contact us promptly if it is damaged, defective, or incorrect.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">6. Product Use</h2>
              <p>Please use products according to the manufacturer's instructions and recommendations. Petpedia is not responsible for issues caused by improper use or failure to follow instructions.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">7. Intellectual Property</h2>
              <p>All Petpedia website content, including logos, images, text, and graphics, is owned by Petpedia or its respective owners and may not be copied or used without permission.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">8. Changes to These Terms</h2>
              <p>We may update these Terms from time to time. Any changes will be posted on this page. Continued use of our website means you accept the updated Terms.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">9. Contact Us</h2>
              <p>For questions about these Terms:</p>
              <p>Email: <a href="mailto:support@petpedia.in" className="text-[#FF5B00] hover:underline">support@petpedia.in</a></p>
              <p>Website: Petpedia</p>
            </section>

          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
