import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { bestsellers, formatPrice } from "@/data/home";
import { Home, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const items = bestsellers.slice(0, 3).map((item) => ({ ...item, quantity: 1 }));

  const subTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = 100;
  const tax = 400;
  const total = subTotal - discount + tax;

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
          <Link to="/cart" className="text-muted-foreground hover:text-[#FF5B00] transition-colors">
            Shopping Cart
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[#FF5B00] font-medium">Check Out</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-2xl md:text-[28px] font-bold text-foreground mb-8">Billing details</h1>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
          
          {/* Left: Billing Form & Payment */}
          <div className="w-full lg:flex-[2]">
            {/* Billing Details Form */}
            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 p-6 md:p-8 mb-6 md:mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-foreground">First Name</label>
                  <Input placeholder="Enter Your Name" className="h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-foreground">Last Name</label>
                  <Input placeholder="Enter Last Name" className="h-11 border-border/60" />
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <label className="text-[14px] font-medium text-foreground">Address</label>
                <Input placeholder="Enter Address" className="h-11 border-border/60" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-foreground">Country</label>
                  <select className="flex h-11 w-full rounded-md border border-border/60 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-muted-foreground appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-no-repeat bg-[right_1rem_center]">
                    <option value="" disabled selected>Select</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-foreground">Region/State</label>
                  <select className="flex h-11 w-full rounded-md border border-border/60 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-muted-foreground appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-no-repeat bg-[right_1rem_center]">
                    <option value="" disabled selected>Select</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-foreground">City</label>
                  <select className="flex h-11 w-full rounded-md border border-border/60 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-muted-foreground appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-no-repeat bg-[right_1rem_center]">
                    <option value="" disabled selected>Select</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-foreground">Zip Code</label>
                  <Input placeholder="Enter Zip Code" className="h-11 border-border/60" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-foreground">Email <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <Input placeholder="Enter Email" className="h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-foreground">Phone Number</label>
                  <Input placeholder="Enter Phone Number" className="h-11 border-border/60" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-[14px] text-muted-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="w-5 h-5 rounded border border-border/60 flex items-center justify-center"></div>
                  Save this information for next time
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="w-5 h-5 rounded border border-border/60 flex items-center justify-center"></div>
                  Ship into different address
                </label>
              </div>
            </div>

            {/* Payment Section */}
            <div>
              <h2 className="text-[18px] font-bold text-foreground mb-4">Payment</h2>
              <div className="space-y-3">
                {/* Credit Card & Wallets */}
                <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg border border-[#FF5B00] bg-white cursor-pointer shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-4 border-[#FF5B00] bg-white"></div>
                    <span className="text-[15px] font-medium text-foreground">
                      Credit Card & Wallet Payments powered by PayTabs
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-8 sm:pl-0">
                    <div className="px-2 py-1 bg-[#E2136E] text-white text-[10px] font-bold rounded">bKash</div>
                    <div className="px-2 py-1 bg-[#1A1F71] text-white text-[10px] font-bold rounded">VISA</div>
                    <div className="w-8 h-5 bg-[#FF5F00] rounded relative overflow-hidden flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#EB001B] rounded-full absolute -left-0.5 mix-blend-multiply"></div>
                      <div className="w-3 h-3 bg-[#F79E1B] rounded-full absolute -right-0.5 mix-blend-multiply"></div>
                    </div>
                    <div className="px-2 py-1 bg-[#ED1C24] text-white text-[10px] font-bold rounded">নগদ</div>
                  </div>
                </label>
                
                {/* Cash on Delivery */}
                <label className="flex items-center gap-3 p-5 rounded-lg border border-border/60 bg-white cursor-pointer hover:border-border transition-colors">
                  <div className="w-5 h-5 rounded-full border border-border/60"></div>
                  <span className="text-[15px] font-medium text-foreground">
                    Cash on Delivery (COD)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:flex-[1.2] flex flex-col gap-6 md:gap-8">
            
            {/* Your order */}
            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 p-6 md:p-8">
              <h2 className="font-bold text-[18px] mb-6">Your order</h2>
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-[60px] h-[60px] shrink-0 bg-white rounded-lg border border-border/60 p-1 flex items-center justify-center">
                      <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-[13.5px] leading-snug text-foreground line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="text-[12px] text-muted-foreground mt-1">
                        × {item.quantity}
                      </div>
                    </div>
                    <div className="font-bold text-[14px] text-foreground shrink-0 pl-2">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 p-6 md:p-8">
              <h2 className="font-bold text-[18px] mb-6">Totals</h2>
              
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

              <Link to="/order-success" className="w-full h-12 bg-[#FF5B00] text-white font-bold text-[14px] rounded-md hover:bg-[#E55200] transition-colors flex items-center justify-center gap-2 shadow-sm">
                PLACE ORDER
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
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
