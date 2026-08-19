import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { formatPrice } from "@/data/home";
import { Trash2, Home, ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import FastrrCheckoutModal from "@/components/shiprocket/FastrrCheckoutModal";
import FastrrButton from "@/components/shiprocket/FastrrButton";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart — Petpedia" },
      { name: "description", content: "Review items in your Petpedia cart and proceed to checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, updateQuantity, removeItem, applyDiscount, isLoading } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponAppliedMsg, setCouponAppliedMsg] = useState<string | null>(null);
  const [isFastrrOpen, setIsFastrrOpen] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    await applyDiscount(couponInput.trim());
    setCouponAppliedMsg(`Coupon "${couponInput.trim().toUpperCase()}" applied!`);
    setCouponInput("");
  };

  const discountAmount = cart.discountCodes.length > 0 ? Math.round(cart.subtotal * 0.1) : 0;
  const shippingFee = cart.subtotal > 500 ? 0 : 50;

  return (
    <div className="min-h-screen bg-[#FDF9F3] pb-20 md:pb-0">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-[#FFF5EB] border-b border-[#FFE4C4] py-3">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 flex items-center gap-2 text-[13px]">
          <Link
            to="/"
            className="text-muted-foreground hover:text-[#FF5B00] transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[#FF5B00] font-medium">Shopping Cart</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-2xl md:text-[28px] font-bold text-foreground mb-8">Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 text-center px-4">
            <div className="w-16 h-16 bg-[#FFF5EB] rounded-full flex items-center justify-center mb-4 text-[#FF5B00]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-8 text-[15px] max-w-md">
              Oops, your cart is feeling a bit light. Time to give it some love and add some goodies for your pet!
            </p>
            <Link
              to="/shop"
              className="bg-[#FF5B00] text-white px-8 py-3 rounded-md font-bold text-[15px] hover:bg-[#E55200] transition-colors shadow-sm"
            >
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
                {cart.items.map((item) => (
                  <div key={item.id} className="p-4 md:p-6 hover:bg-muted/5 transition-colors">
                    {/* --- MOBILE LAYOUT --- */}
                    <div className="flex md:hidden gap-4 items-start w-full">
                      <div className="relative shrink-0">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={isLoading}
                          className="absolute -top-2.5 -left-2.5 w-6 h-6 flex items-center justify-center bg-white border border-border/80 text-muted-foreground hover:text-red-500 hover:border-red-200 rounded-full shadow-sm z-10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-[90px] h-[90px] bg-white rounded-lg border border-border/60 p-2 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 pt-1">
                        <Link
                          to="/product"
                          search={{ handle: item.handle } as any}
                          className="font-medium text-[13.5px] leading-snug text-foreground hover:text-[#FF5B00] transition-colors line-clamp-2 pr-2"
                        >
                          {item.productTitle || item.title}
                        </Link>

                        <div className="flex items-center gap-2 mt-1.5">
                          {item.mrp && (
                            <span className="text-[12px] text-muted-foreground line-through">
                              {formatPrice(item.mrp)}
                            </span>
                          )}
                          <span className="font-bold text-[14px] text-foreground">
                            {formatPrice(item.price)}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="inline-flex items-center justify-between w-[90px] h-8 px-2 border border-[#FF5B00] rounded-full text-[#FF5B00]">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={isLoading}
                              className="p-1 hover:bg-[#FF5B00]/10 rounded-full transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[13px] font-bold">
                              {item.quantity.toString().padStart(2, "0")}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={isLoading}
                              className="p-1 hover:bg-[#FF5B00]/10 rounded-full transition-colors cursor-pointer"
                            >
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
                          onClick={() => removeItem(item.id)}
                          disabled={isLoading}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-24 h-24 shrink-0 bg-white rounded-lg border border-border/60 p-2 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <Link
                          to="/product"
                          search={{ handle: item.handle } as any}
                          className="font-semibold text-[15px] leading-snug text-foreground hover:text-[#FF5B00] transition-colors line-clamp-2"
                        >
                          {item.productTitle || item.title}
                        </Link>
                      </div>

                      <div>
                        {item.mrp && (
                          <div className="text-[13px] text-muted-foreground line-through mb-0.5">
                            {formatPrice(item.mrp)}
                          </div>
                        )}
                        <div className="font-bold text-[16px] text-foreground">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="flex items-center justify-between w-[100px] h-[38px] px-3 border border-[#FF5B00] rounded-full text-[#FF5B00]">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={isLoading}
                            className="p-1 hover:bg-[#FF5B00]/10 rounded-full transition-colors cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-[14px] font-bold">
                            {item.quantity.toString().padStart(2, "0")}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={isLoading}
                            className="p-1 hover:bg-[#FF5B00]/10 rounded-full transition-colors cursor-pointer"
                          >
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
              <div className="flex gap-3 mb-2">
                <Input
                  placeholder="Enter code (e.g. GET10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="h-11 border-border/60"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isLoading}
                  className="h-11 px-6 rounded-md border border-[#FF5B00] text-[#FF5B00] font-bold text-[14px] hover:bg-[#FF5B00] hover:text-white transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponAppliedMsg && (
                <p className="text-xs text-green-600 mb-6 font-medium">{couponAppliedMsg}</p>
              )}

              <h3 className="font-bold text-[18px] mb-6 mt-6">Cart Totals</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-muted-foreground">Sub-total</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-foreground">
                    {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-[14px] text-green-600">
                    <span>Discount (GET10)</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-muted-foreground">Estimated Tax</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(cart.tax)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[15px]">Total</span>
                  <span className="font-bold text-[18px] text-[#FF5B00]">
                    {formatPrice(Math.max(0, cart.subtotal - discountAmount + cart.tax + shippingFee))}
                  </span>
                </div>
              </div>

              {/* Fastrr 1-Click Checkout Button */}
              <div className="space-y-3">
                <FastrrButton
                  onClick={() => setIsFastrrOpen(true)}
                  label="BUY NOW"
                  className="w-full"
                  items={cart.items.map((it) => ({
                    productId: it.productId || it.id,
                    variantId: it.variantId || it.id,
                    title: it.title,
                    price: it.price,
                    quantity: it.quantity,
                    image: it.image,
                  }))}
                />

                <Link
                  to="/checkout"
                  className="w-full h-12 bg-white border border-border/80 text-foreground font-bold text-[14px] rounded-md hover:bg-muted/40 transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  STANDARD CHECKOUT
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fastrr 1-Click Checkout Modal */}
      {isFastrrOpen && (
        <FastrrCheckoutModal
          isOpen={isFastrrOpen}
          onClose={() => setIsFastrrOpen(false)}
          items={cart.items}
          subtotal={cart.subtotal}
          discountAmount={discountAmount}
          shippingFee={shippingFee}
        />
      )}

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
