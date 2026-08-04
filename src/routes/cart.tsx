import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { bestsellers, formatPrice } from "@/data/home";
import { Trash2, Home, ChevronRight, Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const [items, setItems] = useState(
    bestsellers.slice(0, 3).map((item) => ({ ...item, quantity: 1 }))
  );

  const subTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = 100;
  const tax = 400;
  const total = subTotal - discount + tax;

  const updateQuantity = (idx: number, delta: number) => {
    const newItems = [...items];
    const newQuantity = newItems[idx].quantity + delta;
    if (newQuantity > 0) {
      newItems[idx].quantity = newQuantity;
      setItems(newItems);
    }
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

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
          <span className="text-[#FF5B00] font-medium">Shopping Cart</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-2xl md:text-[28px] font-bold text-foreground mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40">
            <h2 className="text-2xl font-bold mb-3">Shopping Cart</h2>
            <p className="text-muted-foreground mb-8 text-[15px]">Oops, your cart is feeling a bit light. Time to give it some love and add some goodies!</p>
            <Link to="/shop" className="bg-[#FF5B00] text-white px-8 py-3 rounded-md font-bold text-[15px] hover:bg-[#E55200] transition-colors shadow-sm">
              RETURN TO SHOP →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
            
            {/* Left: Cart Items */}
            <div className="w-full lg:flex-[2.5] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 overflow-hidden">
              
              {/* Desktop Header */}
              <div className="hidden md:grid grid-cols-[1fr_150px_150px_150px] gap-8 p-6 bg-muted/10 border-b border-border/40 text-[13px] font-bold text-muted-foreground uppercase tracking-wider">
                <div>Products</div>
                <div>Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-right">Sub-Total</div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-border/40">
                {items.map((item, idx) => (
                  <div key={idx} className="p-4 md:p-6 hover:bg-muted/5 transition-colors">
                    
                    {/* --- MOBILE LAYOUT --- */}
                    <div className="flex md:hidden gap-4 items-start w-full">
                      <div className="relative shrink-0">
                        <button 
                          onClick={() => removeItem(idx)}
                          className="absolute -top-2.5 -left-2.5 w-6 h-6 flex items-center justify-center bg-white border border-border/80 text-muted-foreground hover:text-red-500 hover:border-red-200 rounded-full shadow-sm z-10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-[90px] h-[90px] bg-white rounded-lg border border-border/60 p-2 flex items-center justify-center">
                          <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 pt-1">
                        <Link to="/product" className="font-medium text-[13.5px] leading-snug text-foreground hover:text-[#FF5B00] transition-colors line-clamp-2 pr-2">
                          {item.title}
                        </Link>

                        <div className="flex items-center gap-2 mt-1.5">
                          {item.mrp && <span className="text-[12px] text-muted-foreground line-through">{formatPrice(item.mrp)}</span>}
                          <span className="font-bold text-[14px] text-foreground">{formatPrice(item.price)}</span>
                        </div>

                        <div className="mt-3">
                          <div className="inline-flex items-center justify-between w-[90px] h-8 px-2 border border-[#FF5B00] rounded-full text-[#FF5B00]">
                            <button onClick={() => updateQuantity(idx, -1)} className="p-1 hover:bg-[#FF5B00]/10 rounded-full transition-colors">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[13px] font-bold">
                              {item.quantity.toString().padStart(2, '0')}
                            </span>
                            <button onClick={() => updateQuantity(idx, 1)} className="p-1 hover:bg-[#FF5B00]/10 rounded-full transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* --- DESKTOP LAYOUT --- */}
                    <div className="hidden md:grid grid-cols-[1fr_150px_150px_150px] gap-8 items-center w-full">
                      
                      <div className="flex items-center gap-5 w-full pr-10">
                        <button 
                          onClick={() => removeItem(idx)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-24 h-24 shrink-0 bg-white rounded-lg border border-border/60 p-2 flex items-center justify-center">
                          <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <Link to="/product" className="font-semibold text-[15px] leading-snug text-foreground hover:text-[#FF5B00] transition-colors line-clamp-2">
                          {item.title}
                        </Link>
                      </div>

                      <div>
                        {item.mrp && <div className="text-[13px] text-muted-foreground line-through mb-0.5">{formatPrice(item.mrp)}</div>}
                        <div className="font-bold text-[16px] text-foreground">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="flex items-center justify-between w-[100px] h-[38px] px-3 border border-[#FF5B00] rounded-full text-[#FF5B00]">
                          <button onClick={() => updateQuantity(idx, -1)} className="p-1 hover:bg-[#FF5B00]/10 rounded-full transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-[14px] font-bold">
                            {item.quantity.toString().padStart(2, '0')}
                          </span>
                          <button onClick={() => updateQuantity(idx, 1)} className="p-1 hover:bg-[#FF5B00]/10 rounded-full transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="font-bold text-[16px] text-foreground text-right">
                        {formatPrice(item.price * item.quantity)}
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:flex-1 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 p-6 md:p-8">
              <h3 className="font-medium text-[15px] mb-4">Coupon code</h3>
              <div className="flex gap-3 mb-8">
                <Input placeholder="Enter code" className="h-11 border-border/60" />
                <button className="h-11 px-6 rounded-md border border-[#FF5B00] text-[#FF5B00] font-bold text-[14px] hover:bg-[#FF5B00] hover:text-white transition-colors">
                  Apply
                </button>
              </div>

              <h3 className="font-bold text-[18px] mb-6">Cart Totals</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-muted-foreground">Sub-total</span>
                  <span className="font-semibold text-foreground">{formatPrice(subTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-foreground">Free</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-semibold text-foreground">{formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-semibold text-foreground">{formatPrice(tax)}</span>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[15px]">Total</span>
                  <span className="font-bold text-[18px] text-foreground">{formatPrice(total)}</span>
                </div>
              </div>

              <Link to="/checkout" className="w-full h-12 bg-[#FF5B00] text-white font-bold text-[14px] rounded-md hover:bg-[#E55200] transition-colors flex items-center justify-center gap-2 shadow-sm">
                PROCEED TO CHECKOUT
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </Link>
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
