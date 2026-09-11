import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { Home } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
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
          <span className="text-[#FF5B00] font-medium">Privacy Policy</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-[1440px] w-full px-4 md:px-8 py-10 md:py-16">
        <div className="flex-1 text-muted-foreground text-[14px] leading-relaxed max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-[32px] font-bold text-foreground mb-8 tracking-tight text-center">
            Privacy Policy
          </h1>

          <div className="space-y-8 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-[#FFE4C4]">
            
            <p className="font-medium text-foreground">
              Last updated: September 12, 2026<br/>
              At Petpedia, we respect your privacy. This Privacy Policy explains how we collect, use, and protect your information when you visit our website or purchase our products.
            </p>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">1. Information We Collect</h2>
              <p>We may collect information such as your name, phone number, email address, billing and shipping address, payment details, order history, and information about how you use our website. We may also collect certain device and cookie information.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">2. How We Use Your Information</h2>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Process and deliver your orders</li>
                <li>Process payments and returns</li>
                <li>Provide customer support</li>
                <li>Improve our website and services</li>
                <li>Send order updates and, where permitted, promotional messages</li>
                <li>Prevent fraud and protect our services</li>
                <li>Comply with legal requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">3. Sharing Your Information</h2>
              <p>We may share necessary information with trusted service providers, including Shopify, payment providers, delivery partners, and technology providers, to operate our store and fulfill your orders. We may also share information when required by law or with your consent.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">4. Shopify & Cookies</h2>
              <p>Our store is powered by Shopify, which processes information to provide and improve our shopping services. We may also use cookies and similar technologies to improve your experience.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">5. Your Choices</h2>
              <p>Depending on applicable law, you may have rights to access, correct, or delete your personal information. You can also unsubscribe from promotional emails at any time.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">6. Data Security</h2>
              <p>We take reasonable steps to protect your information, but no online system can be guaranteed to be completely secure.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">7. Changes to This Policy</h2>
              <p>We may update this Privacy Policy when necessary. Any changes will be posted on this page with an updated date.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">8. Contact Us</h2>
              <p>For questions or privacy requests, contact us:</p>
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
