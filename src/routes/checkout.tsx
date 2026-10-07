import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { formatPrice } from "@/data/home";
import { Home, ChevronRight, ShoppingBag, ShieldCheck, Zap, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import FastrrCheckoutModal from "@/components/shiprocket/FastrrCheckoutModal";
import FastrrButton from "@/components/shiprocket/FastrrButton";
import { triggerShiprocketHeadlessCheckout } from "@/lib/shiprocket/fastrr";
import { getShippingSettingsFn, calculateShippingFee, ShippingSettings } from "@/lib/admin/shipping";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => search,
  head: () => ({
    meta: [
      { title: "Fast Checkout — Petpedia" },
      { name: "description", content: "Complete your Petpedia order with 1-Click Fastrr checkout." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cart } = useCart();
  const [isFastrrModalOpen, setIsFastrrModalOpen] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);

  useEffect(() => {
    getShippingSettingsFn()
      .then(setShippingSettings)
      .catch(() => {});
  }, []);

  const discountAmount = cart.discountCodes.length > 0 ? Math.round(cart.subtotal * 0.1) : 0;
  const shippingCalc = calculateShippingFee(cart.subtotal, shippingSettings);
  const shippingFee = shippingCalc.shippingFee;
  const finalTotal = Math.max(0, cart.subtotal - discountAmount + cart.tax + shippingFee);

  const fastrrItems = cart.items.map((it) => ({
    productId: it.productId || it.id,
    variantId: it.variantId || it.id,
    title: it.title,
    price: it.price,
    quantity: it.quantity,
    image: it.image,
  }));

  useEffect(() => {
    if (cart.items.length > 0) {
      const launched = triggerShiprocketHeadlessCheckout(fastrrItems);
      if (!launched) {
        setIsFastrrModalOpen(true);
      }
    }
  }, [cart.items.length]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      <SiteHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/cart" className="hover:text-primary">
            Cart
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-foreground">Fast Checkout</span>
        </nav>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border/60 shadow-xs max-w-md mx-auto my-8">
            <div className="w-16 h-16 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Your Cart is Empty</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Looks like you haven't added any pet essentials to your cart yet.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Order Items */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-border/60 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
                  <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Review Order ({cart.items.reduce((acc, it) => acc + it.quantity, 0)} items)
                  </h1>
                  <Link
                    to="/cart"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Edit Cart
                  </Link>
                </div>

                <div className="divide-y divide-border/30">
                  {cart.items.map((item) => (
                    <div key={item.id} className="py-3.5 flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl bg-secondary/40 border border-border/40 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img
                          src={item.image || "/placeholder-product.png"}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 rounded-xl p-3.5 border border-border/40 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Instant 1-Click</h4>
                    <p className="text-[11px] text-muted-foreground">OTP login & address autofill</p>
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl p-3.5 border border-border/40 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Secure Checkout</h4>
                    <p className="text-[11px] text-muted-foreground">Encrypted by Shiprocket</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Fastrr Checkout Summary */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-border/60 shadow-sm space-y-5">
                <h2 className="text-base font-bold text-foreground">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">{formatPrice(cart.subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount (GET10)</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-semibold text-foreground">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-xs">Free</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Taxes</span>
                    <span className="font-semibold text-foreground">{formatPrice(cart.tax)}</span>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex justify-between items-baseline">
                    <span className="text-base font-bold text-foreground">Total Amount</span>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-foreground tracking-tight">
                        {formatPrice(finalTotal)}
                      </span>
                      <p className="text-[10px] text-muted-foreground">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>

                {/* Primary Fastrr Checkout Action */}
                <div className="pt-2 space-y-2">
                  <FastrrButton
                    onClick={() => setIsFastrrModalOpen(true)}
                    label="BUY NOW"
                    className="w-full"
                    items={fastrrItems}
                  />
                  <p className="text-[11px] text-center text-muted-foreground">
                    Fast, secure UPI, Cards, Netbanking & COD powered by Shiprocket Fastrr
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fastrr 1-Click Checkout Modal */}
      {isFastrrModalOpen && (
        <FastrrCheckoutModal
          isOpen={isFastrrModalOpen}
          onClose={() => setIsFastrrModalOpen(false)}
          items={cart.items}
          subtotal={cart.subtotal}
          discountAmount={discountAmount}
          shippingFee={shippingFee}
          shippingTitle={shippingCalc.shippingTitle}
        />
      )}

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
