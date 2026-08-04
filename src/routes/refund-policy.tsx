import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
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
          <span className="text-[#FF5B00] font-medium">Refund policy</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-[1440px] w-full px-4 md:px-8 py-10 md:py-16">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 lg:gap-24">
          
          {/* Content */}
          <div className="flex-1 text-muted-foreground text-[14px] leading-relaxed">
            <h1 className="text-3xl md:text-[32px] font-bold text-foreground mb-10 tracking-tight">
              Refund policy
            </h1>

            <div className="space-y-8">
              <section>
                <h2 className="text-[15px] font-bold text-foreground uppercase mb-4 tracking-wide">
                  OVERVIEW
                </h2>
                <div className="space-y-4">
                  <p>
                    Here is the updated Terms & Conditions adapted specifically for Petpedika Kerala:<br />
                    Terms & Conditions<br />
                    OVERVIEW
                  </p>
                  <p>
                    We have a 7-day exchange and return policy, which means you have 7 days after receiving your item to request a return or exchange.
                  </p>
                  <p>
                    To be eligible for a return, your item must be in the same condition that you received it, unused or unopened, with original tags, seals intact, and in its original packaging. You'll also need the receipt or proof of purchase.
                  </p>
                  <p>
                    To start a return, you can contact us at support@petpedika.com. If your return is accepted, we'll send you instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.
                  </p>
                  <p>
                    You can always contact us for any return question at support@petpedika.com.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-foreground uppercase mb-4 tracking-wide">
                  DAMAGES AND ISSUES
                </h2>
                <div className="space-y-4">
                  <p>
                    Please inspect your order upon receipt and contact us immediately if the item is defective, damaged, or if you receive the wrong item, so that we can evaluate the issue and make it right for you and your pet.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-foreground uppercase mb-4 tracking-wide">
                  EXCEPTIONS / NON-RETURNABLE ITEMS
                </h2>
                <div className="space-y-4">
                  <p>Certain types of items cannot be returned, including:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Perishable goods & food: Opened, unsealed, or partially consumed pet food, treats, fresh products, and supplements (for safety and hygiene reasons).</li>
                    <li>Custom or personalized items: Customized pet accessories, engraved tags, or special order items.</li>
                    <li>Grooming & personal care goods: Used pet brushes, shampoo, or hygiene products.</li>
                  </ul>
                  <p>
                    Unfortunately, we cannot accept returns on clearance sale items or gift cards.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-foreground uppercase mb-4 tracking-wide">
                  EXCHANGES
                </h2>
                <div className="space-y-4">
                  <p>
                    The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item or variant.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-foreground uppercase mb-4 tracking-wide">
                  REFUNDS
                </h2>
                <div className="space-y-4">
                  <p>
                    We will notify you once we've received and inspected your return, and let you know if the refund/store credit was approved or not. If approved, you'll be automatically refunded on your original payment method or issued store credit. Please remember it can take some time for your bank or card provider to process and post the refund.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-[360px] shrink-0">
            <div className="bg-[#FFF5EB] rounded-xl p-8 sticky top-32">
              <h3 className="text-[16px] font-bold text-foreground mb-3">
                Have Any More Questions?
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                If you have any inquiries or concerns regarding our shipping policy, feel free to reach out to our customer service team.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex h-11 px-6 bg-[#FF5B00] text-white font-bold text-[13px] rounded-md hover:bg-[#E55200] transition-colors items-center gap-2 shadow-sm"
              >
                CONTACT US
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
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
