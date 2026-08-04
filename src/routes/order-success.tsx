import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";

export const Route = createFileRoute("/order-success")({
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FDF9F3] flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-xl w-full text-center flex flex-col items-center">
          
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-[#00A859] rounded-full flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Your order is successfully placed
          </h1>
          
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-10 max-w-md mx-auto">
            Your order has been placed successfully. We're getting your pet's goodies ready for dispatch! 
            We've sent a confirmation email with your order details and invoice.
          </p>

          <Link 
            to="/shop" 
            className="inline-flex h-12 px-8 bg-[#FF5B00] text-white font-bold text-[14px] rounded-md hover:bg-[#E55200] transition-colors items-center justify-center gap-2 shadow-sm"
          >
            RETURN TO SHOP
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </Link>

        </div>
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
