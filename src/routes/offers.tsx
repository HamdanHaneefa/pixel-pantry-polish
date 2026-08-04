import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import ProductCard from "@/components/home/ProductCard";
import { hotPicks, bestsellers } from "@/data/home";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

export const Route = createFileRoute("/offers")({
  component: OffersPage,
});

function OffersPage() {
  // Combine some items to create a nice grid of offers
  const allOffers = [...hotPicks, ...bestsellers, ...hotPicks.slice(0, 2)];

  return (
    <div className="min-h-screen bg-[#FDF9F3] pb-20 md:pb-0">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-[#FFF5EB] border-b border-[#FFE4C4] py-3">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 flex items-center gap-2 text-[13px]">
          <Link to="/" className="text-muted-foreground hover:text-[#FF5B00] transition-colors flex items-center gap-1.5">
            <Home className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[#FF5B00] font-medium">Offers</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-[28px] font-bold text-foreground">Latest Offers</h1>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {allOffers.map((product, idx) => (
            <ProductCard key={`${product.id}-${idx}`} product={product} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex items-center justify-center gap-2 md:gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:border-[#FF5B00] hover:text-[#FF5B00] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1 md:gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF5B00] text-white font-bold text-sm">
              01
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50 font-bold text-sm transition-colors">
              02
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50 font-bold text-sm transition-colors">
              03
            </button>
            <span className="hidden md:flex items-center justify-center w-10 h-10 text-muted-foreground">...</span>
            <button className="hidden md:flex w-10 h-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50 font-bold text-sm transition-colors">
              08
            </button>
          </div>

          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:border-[#FF5B00] hover:text-[#FF5B00] transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
