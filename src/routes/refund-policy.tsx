import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { Home } from "lucide-react";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
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
          <span className="text-[#FF5B00] font-medium">Refund & Return Policy</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-[1440px] w-full px-4 md:px-8 py-10 md:py-16">
        <div className="flex-1 text-muted-foreground text-[14px] leading-relaxed max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-[32px] font-bold text-foreground mb-8 tracking-tight text-center">
            Refund & Return Policy
          </h1>

          <div className="space-y-8 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-[#FFE4C4]">
            
            <p className="font-medium text-foreground">
              At Petpedia, we want you and your pets to be happy with every purchase.
            </p>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">Returns</h2>
              <p className="mb-2">You can request a return within 7 days of receiving your order if the product is damaged, defective, incorrect, or has an issue.</p>
              <p className="mb-2">To be eligible for a return, the product must be unused, unopened, and in its original packaging. You must also provide your order details or proof of purchase.</p>
              <p>To request a return, please contact us at <a href="mailto:petbey.in@gmail.com" className="text-[#FF5B00] hover:underline">petbey.in@gmail.com</a> with your order number and details of the issue.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">Damaged or Incorrect Products</h2>
              <p>Please check your order when you receive it. If you receive a damaged, defective, or incorrect product, contact us as soon as possible with photos or videos of the product and packaging. We will review the issue and provide a suitable solution.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">Non-Returnable Products</h2>
              <p className="mb-2">For hygiene and safety reasons, the following products cannot be returned once opened or used:</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Pet food and treats</li>
                <li>Supplements and health products</li>
                <li>Grooming and personal-care products</li>
                <li>Pet bedding and hygiene products</li>
                <li>Used toys, accessories, or other pet products</li>
                <li>Products marked as non-returnable</li>
              </ul>
              <p>Opened or used products are not eligible for return unless they are defective or damaged.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">Refunds</h2>
              <p className="mb-2">Once your return is received and inspected, we will notify you whether your refund has been approved.</p>
              <p>If approved, the refund will be processed to your original payment method. Depending on your bank or payment provider, it may take a few business days for the refund to appear in your account.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">Exchanges</h2>
              <p>We may provide an exchange for products that are damaged, defective, or incorrectly delivered, subject to availability.</p>
            </section>

            <section>
              <h2 className="text-[17px] font-bold text-foreground mb-3">Contact</h2>
              <p>For any questions regarding returns or refunds, please contact us at:</p>
              <p>Email: <a href="mailto:petbey.in@gmail.com" className="text-[#FF5B00] hover:underline">petbey.in@gmail.com</a></p>
            </section>

          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
