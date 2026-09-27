import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { bestsellers, formatPrice } from "@/data/home";
import { Trash2, Home, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const [items, setItems] = useState(bestsellers.slice(0, 3));

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
          <span className="text-[#FF5B00] font-medium">Wishlist</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-2xl md:text-[28px] font-bold text-foreground mb-8">Wishlist</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40">
            <h2 className="text-2xl font-bold mb-3">Wishlist</h2>
            <p className="text-muted-foreground mb-8 text-[15px]">The wishlist table is empty.</p>
            <Link to="/" className="bg-[#FF5B00] text-white px-8 py-3 rounded-md font-bold text-[15px] hover:bg-[#E55200] transition-colors shadow-sm">
              RETURN TO SHOP →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-[1fr_150px_150px_200px_60px] gap-8 p-6 bg-muted/10 border-b border-border/40 text-[13px] font-bold text-muted-foreground uppercase tracking-wider">
              <div>Products</div>
              <div>Price</div>
              <div>Stock Status</div>
              <div></div>
              <div></div>
            </div>

            {/* Items List */}
            <div className="divide-y divide-border/40">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 md:p-6 hover:bg-muted/5 transition-colors">
                  
                  {/* --- MOBILE LAYOUT --- */}
                  <div className="flex md:hidden gap-4 items-start w-full">
                    {/* Image & Remove Button */}
                    <div className="relative shrink-0">
                      <button 
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        className="absolute -top-2.5 -left-2.5 w-6 h-6 flex items-center justify-center bg-white border border-border/80 text-muted-foreground hover:text-red-500 hover:border-red-200 rounded-full shadow-sm z-10 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                      <div className="w-[90px] h-[90px] bg-white rounded-lg border border-border/60 p-2 flex items-center justify-center">
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1 pt-1">
                      <Link
                        to="/product"
                        search={{ handle: item.handle || item.id } as any}
                        className="font-medium text-[13.5px] leading-snug text-foreground hover:text-[#FF5B00] transition-colors line-clamp-2 pr-2"
                      >
                        {item.title}
                      </Link>

                      <div className="flex items-center gap-2 mt-1.5">
                        {item.mrp && <span className="text-[12px] text-muted-foreground line-through">{formatPrice(item.mrp)}</span>}
                        <span className="font-bold text-[14px] text-foreground">{formatPrice(item.price)}</span>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <button className="h-8 px-4 rounded-md border border-[#FF5B00] text-[#FF5B00] font-bold text-[11px] tracking-wide hover:bg-[#FF5B00] hover:text-white transition-colors uppercase">
                          ADD TO CART
                        </button>
                        <div className={`text-[11px] font-bold uppercase ${idx === 1 ? "text-red-500" : "text-[#00A651]"}`}>
                          {idx === 1 ? "OUT OF STOCK" : "IN STOCK"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- DESKTOP LAYOUT --- */}
                  <div className="hidden md:grid grid-cols-[1fr_150px_150px_200px_60px] gap-8 items-center w-full">
                    {/* Product Info */}
                    <div className="flex items-center gap-5 w-full pr-10">
                      <div className="w-24 h-24 shrink-0 bg-white rounded-lg border border-border/60 p-2 flex items-center justify-center">
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <Link
                        to="/product"
                        search={{ handle: item.handle || item.id } as any}
                        className="font-semibold text-[15px] leading-snug text-foreground hover:text-[#FF5B00] transition-colors line-clamp-2"
                      >
                        {item.title}
                      </Link>
                    </div>


                    {/* Price */}
                    <div className="font-bold text-[16px] text-foreground">
                      {formatPrice(item.price)}
                    </div>

                    {/* Stock Status */}
                    <div className={`text-[13px] font-bold uppercase ${idx === 1 ? "text-red-500" : "text-[#00A651]"}`}>
                      {idx === 1 ? "OUT OF STOCK" : "IN STOCK"}
                    </div>

                    {/* Actions */}
                    <div>
                      <button className="h-11 px-6 rounded-md border-2 border-[#FF5B00] text-[#FF5B00] font-bold text-[13px] tracking-wide hover:bg-[#FF5B00] hover:text-white transition-colors uppercase">
                        {idx === 2 ? "SELECT OPTIONS" : "ADD TO CART"}
                      </button>
                    </div>

                    {/* Remove Button */}
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
            
            {/* Empty state toggler for demo purposes */}
            <div className="p-4 bg-muted/20 border-t border-border/40 text-center text-sm text-muted-foreground">
              Tip: Remove all items to see the beautifully designed empty state!
            </div>
          </div>
        )}
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
