import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { formatPrice } from "@/data/home";
import { Home, ChevronRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";

import { createShopifyAdminOrder } from "@/lib/shopify/admin";
import { updateCartBuyerIdentity } from "@/lib/shopify/cart";
import { formatCheckoutUrl } from "@/lib/shopify/normalize";
import {
  Banknote,
  CreditCard,
  Sparkles,
  QrCode,
  Smartphone,
  Building2,
  CheckCircle2,
  Lock,
  X,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Petpedia" },
      { name: "description", content: "Complete your Petpedia order with secure checkout." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    country: "India",
    state: "",
    city: "",
    zipCode: "",
    email: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"shopify" | "cod">("shopify");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // In-app Localhost Payment Simulator State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [gatewayTab, setGatewayTab] = useState<"upi" | "card" | "netbanking">("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [cardNumber, setCardNumber] = useState("1");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const discountAmount = cart.discountCodes.length > 0 ? Math.round(cart.subtotal * 0.1) : 0;
  const shippingFee = cart.subtotal > 500 ? 0 : 50;
  const finalTotal = Math.max(0, cart.subtotal - discountAmount + cart.tax + shippingFee);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "shopify") {
      // Open the interactive payment modal for instant in-app payment
      setIsPaymentModalOpen(true);
      return;
    }

    // Direct Cash on Delivery placement
    setIsSubmitting(true);
    setStatusMessage("Submitting Cash on Delivery order to Shopify...");

    let orderId = `PET-${Math.floor(100000 + Math.random() * 900000)}`;

    // Try creating directly in Shopify Admin API
    try {
      const shopifyOrder = await createShopifyAdminOrder({
        customer: formData,
        items: cart.items,
        paymentMethod: "Cash on Delivery",
        financialStatus: "pending",
        total: finalTotal,
      });
      if (shopifyOrder?.success) {
        orderId = shopifyOrder.orderName || shopifyOrder.orderId;
      }
    } catch (err) {
      console.warn("Shopify Admin Order Error:", err);
    }

    const orderData = {
      orderId,
      date: new Date().toISOString(),
      items: cart.items,
      subtotal: cart.subtotal,
      discountAmount,
      shippingFee,
      tax: cart.tax,
      total: finalTotal,
      customer: formData,
      paymentMethod: "Cash on Delivery (COD)",
      paymentStatus: "Cash on Delivery (Pending)",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("petpedia_last_order", JSON.stringify(orderData));
    }

    setTimeout(() => {
      clearCart();
      navigate({ to: "/order-success" });
    }, 600);
  };

  const handleSimulatedPaymentSuccess = async (methodName: string) => {
    setIsProcessingPayment(true);

    let orderId = `PET-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create official order directly in Shopify Admin API
    try {
      const shopifyOrder = await createShopifyAdminOrder({
        customer: formData,
        items: cart.items,
        paymentMethod: methodName,
        financialStatus: "paid",
        total: finalTotal,
      });
      if (shopifyOrder?.success) {
        orderId = shopifyOrder.orderName || shopifyOrder.orderId;
      }
    } catch (err) {
      console.warn("Shopify Admin Order Error:", err);
    }

    const orderData = {
      orderId,
      date: new Date().toISOString(),
      items: cart.items,
      subtotal: cart.subtotal,
      discountAmount,
      shippingFee,
      tax: cart.tax,
      total: finalTotal,
      customer: formData,
      paymentMethod: methodName,
      paymentStatus: "Paid (Verified)",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("petpedia_last_order", JSON.stringify(orderData));
    }

    setIsProcessingPayment(false);
    setPaymentSuccess(true);

    setTimeout(() => {
      setIsPaymentModalOpen(false);
      clearCart();
      navigate({ to: "/order-success" });
    }, 1000);
  };


  const handleOpenExternalShopify = async () => {
    setIsPaymentModalOpen(false);
    setIsSubmitting(true);
    setStatusMessage("Connecting to Shopify Checkout...");

    if (cart.id && cart.id !== "local_cart") {
      try {
        const updated = await updateCartBuyerIdentity(cart.id, {
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          deliveryAddressPreferences: [
            {
              deliveryAddress: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address1: formData.address,
                city: formData.city,
                country: formData.country || "India",
                zip: formData.zipCode,
                phone: formData.phone,
              },
            },
          ],
        });

        const rawTargetUrl = updated?.checkoutUrl || cart.checkoutUrl;
        const targetUrl = formatCheckoutUrl(rawTargetUrl);
        if (targetUrl && targetUrl.startsWith("http") && !targetUrl.includes("localhost")) {
          window.location.href = targetUrl;
          return;
        }
      } catch (err) {
        console.warn("Could not sync buyer identity:", err);
      }
    }

    const directUrl = formatCheckoutUrl(cart.checkoutUrl);
    if (directUrl && directUrl.startsWith("http") && !directUrl.includes("localhost")) {
      window.location.href = directUrl;
      return;
    }

    // Fallback if no remote cart
    clearCart();
    navigate({ to: "/order-success" });
  };



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
          <Link to="/cart" className="text-muted-foreground hover:text-[#FF5B00] transition-colors">
            Shopping Cart
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[#FF5B00] font-medium">Check Out</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-2xl md:text-[28px] font-bold text-foreground mb-8">Billing & Shipping details</h1>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-border/40 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-xl font-bold text-foreground mb-2">No items to checkout</h2>
            <p className="text-sm text-muted-foreground mb-6">Your shopping cart is empty.</p>
            <Link
              to="/shop"
              className="bg-[#FF5B00] text-white px-6 py-2.5 rounded-md font-bold text-sm hover:bg-[#E55200] transition-colors inline-block"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
            {/* Left: Billing Form & Payment */}
            <div className="w-full lg:flex-[2]">
              {/* Billing Details Form */}
              <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 p-6 md:p-8 mb-6 md:mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-foreground">First Name *</label>
                    <Input
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter Your First Name"
                      className="h-11 border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-foreground">Last Name *</label>
                    <Input
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Enter Last Name"
                      className="h-11 border-border/60"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <label className="text-[14px] font-medium text-foreground">Address *</label>
                  <Input
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House / Flat / Street Name"
                    className="h-11 border-border/60"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-foreground">Country</label>
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="h-11 border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-foreground">City / Region *</label>
                    <Input
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City or Town"
                      className="h-11 border-border/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-foreground">Zip / PIN Code *</label>
                    <Input
                      required
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="e.g. 560001"
                      className="h-11 border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-medium text-foreground">Phone Number *</label>
                    <Input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="h-11 border-border/60"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-[14px] font-medium text-foreground">
                    Email Address <span className="text-muted-foreground font-normal">(For order updates)</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="h-11 border-border/60"
                  />
                </div>
              </div>

              {/* Payment Section */}
              <div>
                <h2 className="text-[18px] font-bold text-foreground mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {/* Option 1: Shopify Online Payment / Test Gateway */}
                  <label
                    onClick={() => setPaymentMethod("shopify")}
                    className={`p-4 md:p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === "shopify"
                        ? "border-[#FF5B00] bg-[#FFF8F3] shadow-sm"
                        : "border-border/60 bg-white hover:border-[#FF5B00]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${
                          paymentMethod === "shopify"
                            ? "border-[#FF5B00]"
                            : "border-muted-foreground/40 bg-white"
                        }`}
                      >
                        {paymentMethod === "shopify" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5B00]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold text-foreground">
                            Shopify Secure Online Payment
                          </span>
                          <span className="text-[10px] font-semibold tracking-wide bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            TEST GATEWAY ACTIVE
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground block mt-0.5">
                          UPI, Credit/Debit Cards, Net Banking & Wallets powered by Shopify
                        </span>
                      </div>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-green-600 shrink-0 ml-2" />
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-4 md:p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === "cod"
                        ? "border-[#FF5B00] bg-[#FFF8F3] shadow-sm"
                        : "border-border/60 bg-white hover:border-[#FF5B00]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${
                          paymentMethod === "cod"
                            ? "border-[#FF5B00]"
                            : "border-muted-foreground/40 bg-white"
                        }`}
                      >
                        {paymentMethod === "cod" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5B00]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold text-foreground">
                            Cash on Delivery (COD)
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground block mt-0.5">
                          Pay cash or UPI upon delivery at your doorstep
                        </span>
                      </div>
                    </div>
                    <Banknote className="w-6 h-6 text-[#FF5B00] shrink-0 ml-2" />
                  </label>
                </div>

                {/* Test Mode Helper Note */}
                <div className="mt-4 p-3.5 bg-blue-50/80 border border-blue-200/70 rounded-lg text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-950">Shopify Test Gateway Instructions:</span>
                    <br />
                    When redirected to Shopify checkout, enter Card Number <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">1</strong>, any future expiry date (e.g. <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">12/28</strong>), and any CVV (e.g. <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">123</strong>) to simulate a 100% successful order.
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:flex-[1.2] flex flex-col gap-6 md:gap-8">
              {/* Your order */}
              <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 p-6 md:p-8">
                <h2 className="font-bold text-[18px] mb-6">Your order ({cart.totalQuantity})</h2>
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-[60px] h-[60px] shrink-0 bg-white rounded-lg border border-border/60 p-1 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[13.5px] leading-snug text-foreground line-clamp-2">
                          {item.productTitle || item.title}
                        </h4>
                        <div className="text-[12px] text-muted-foreground mt-1">
                          Qty: {item.quantity}
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
                <h2 className="font-bold text-[18px] mb-6">Order Total</h2>

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
                      <span>Coupon Discount</span>
                      <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-muted-foreground">Taxes</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(cart.tax)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[15px]">Total Amount</span>
                    <span className="font-bold text-[20px] text-[#FF5B00]">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#FF5B00] text-white font-bold text-[14px] rounded-md hover:bg-[#E55200] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      {statusMessage || "PROCESSING..."}
                    </span>
                  ) : paymentMethod === "shopify" ? (
                    <>
                      PROCEED TO SHOPIFY PAYMENT
                      <svg
                        width="18"
                        height="18"
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
                    </>
                  ) : (
                    <>
                      PLACE CASH ON DELIVERY ORDER
                      <svg
                        width="18"
                        height="18"
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
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Interactive In-App Payment Gateway Modal (Localhost / Sandbox) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[540px] rounded-2xl shadow-2xl border border-border/60 overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#FF5B00] to-[#E55200] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg">
                  🐾
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Petpedia Secure Gateway</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                    <Lock className="w-3 h-3" /> 256-bit Encrypted Payment
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <span className="text-xs text-white/80 block">Amount to Pay</span>
                  <span className="text-xl font-extrabold">{formatPrice(finalTotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  disabled={isProcessingPayment}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {paymentSuccess ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-[#00A859]" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Transaction verified. Redirecting to your order confirmation...
                </p>
              </div>
            ) : isProcessingPayment ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-[#FF5B00] border-t-transparent rounded-full animate-spin mb-5"></div>
                <h3 className="text-lg font-bold text-foreground mb-1">Processing Payment...</h3>
                <p className="text-xs text-muted-foreground">
                  Please do not refresh or close this window.
                </p>
              </div>
            ) : (
              <div>
                {/* Method Tabs */}
                <div className="grid grid-cols-3 border-b border-border/60 bg-[#FAF8F5]">
                  <button
                    type="button"
                    onClick={() => setGatewayTab("upi")}
                    className={`py-3.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                      gatewayTab === "upi"
                        ? "border-[#FF5B00] text-[#FF5B00] bg-white shadow-xs"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> UPI & QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setGatewayTab("card")}
                    className={`py-3.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                      gatewayTab === "card"
                        ? "border-[#FF5B00] text-[#FF5B00] bg-white shadow-xs"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Card (Test)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGatewayTab("netbanking")}
                    className={`py-3.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                      gatewayTab === "netbanking"
                        ? "border-[#FF5B00] text-[#FF5B00] bg-white shadow-xs"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> Net Banking
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {gatewayTab === "upi" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200/70 text-xs text-amber-900">
                        <span>✨ Select your preferred UPI App to simulate:</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp("gpay")}
                          className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                            selectedUpiApp === "gpay"
                              ? "border-[#FF5B00] bg-[#FFF8F3] font-bold text-foreground"
                              : "border-border/60 hover:border-[#FF5B00]/40 text-muted-foreground"
                          }`}
                        >
                          <span className="text-xl">🟢</span>
                          <span className="text-xs">Google Pay</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp("phonepe")}
                          className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                            selectedUpiApp === "phonepe"
                              ? "border-[#FF5B00] bg-[#FFF8F3] font-bold text-foreground"
                              : "border-border/60 hover:border-[#FF5B00]/40 text-muted-foreground"
                          }`}
                        >
                          <span className="text-xl">🟣</span>
                          <span className="text-xs">PhonePe</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp("paytm")}
                          className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                            selectedUpiApp === "paytm"
                              ? "border-[#FF5B00] bg-[#FFF8F3] font-bold text-foreground"
                              : "border-border/60 hover:border-[#FF5B00]/40 text-muted-foreground"
                          }`}
                        >
                          <span className="text-xl">🔵</span>
                          <span className="text-xs">Paytm UPI</span>
                        </button>
                      </div>

                      <div className="p-4 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <QrCode className="w-7 h-7 text-[#FF5B00]" />
                          <div>
                            <span className="text-xs font-bold block">Instant QR Code Scan</span>
                            <span className="text-[11px] text-muted-foreground">
                              Scan with any UPI App (GPay/PhonePe/BHIM)
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#FF5B00] bg-orange-50 px-2 py-1 rounded border border-orange-200">
                          ACTIVE
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleSimulatedPaymentSuccess(
                            `UPI (${selectedUpiApp.toUpperCase()})`
                          )
                        }
                        className="w-full h-12 bg-[#00A859] hover:bg-[#00904C] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        PAY {formatPrice(finalTotal)} VIA UPI
                      </button>
                    </div>
                  )}

                  {gatewayTab === "card" && (
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900 leading-relaxed">
                        <strong>Test Card Mode:</strong> Use Card <kbd className="font-mono bg-white px-1 py-0.5 rounded">1</kbd> to simulate an approved payment, or change to test failure.
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            Card Number
                          </label>
                          <Input
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Enter 1 for approved card"
                            className="h-10 font-mono text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">
                              Expiry
                            </label>
                            <Input
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="h-10 font-mono text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">
                              CVV
                            </label>
                            <Input
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="123"
                              className="h-10 font-mono text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleSimulatedPaymentSuccess("Credit/Debit Card (Test Gateway)")
                        }
                        className="w-full h-12 bg-[#FF5B00] hover:bg-[#E55200] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4"
                      >
                        <Lock className="w-4 h-4" />
                        PAY {formatPrice(finalTotal)} SECURELY
                      </button>
                    </div>
                  )}

                  {gatewayTab === "netbanking" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank"].map(
                          (bank) => (
                            <button
                              key={bank}
                              type="button"
                              onClick={() =>
                                handleSimulatedPaymentSuccess(`Net Banking (${bank})`)
                              }
                              className="p-3.5 rounded-xl border border-border/80 hover:border-[#FF5B00] hover:bg-orange-50/50 text-left transition-all cursor-pointer"
                            >
                              <span className="text-xs font-bold text-foreground block">
                                {bank}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                Instant Verification
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer / External Option */}
                <div className="p-4 bg-[#FAF8F5] border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    100% Safe Localhost Sandbox
                  </span>

                  <button
                    type="button"
                    onClick={handleOpenExternalShopify}
                    className="text-[#FF5B00] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    Open Shopify Checkout
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}

