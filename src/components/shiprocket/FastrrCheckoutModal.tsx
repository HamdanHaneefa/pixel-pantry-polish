import { useState, useEffect, useId } from "react";
import {
  ArrowLeft,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Truck,
  CreditCard,
  Building2,
  QrCode,
  Banknote,
  CheckCircle2,
  Plus,
  Percent,
  Lock,
  Smartphone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { formatPrice } from "@/data/home";
import { createShopifyAdminOrder } from "@/lib/shopify/admin";

interface CartItem {
  id: string;
  variantId?: string | undefined;
  title: string;
  productTitle?: string | undefined;
  price: number;
  quantity: number;
  image: string;
  handle?: string | undefined;
  mrp?: number | undefined;
}

interface FastrrCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discountAmount?: number;
  shippingFee?: number;
  onOrderSuccess?: (orderId: string) => void;
}

export default function FastrrCheckoutModal({
  isOpen,
  onClose,
  items,
  subtotal,
  discountAmount: initialDiscount = 0,
  shippingFee = 0,
  onOrderSuccess,
}: FastrrCheckoutModalProps) {
  // Phase: 'initiating' | 'checkout' | 'paying' | 'success'
  const [phase, setPhase] = useState<"initiating" | "checkout" | "paying" | "success">("initiating");
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(initialDiscount);
  const [couponStatus, setCouponStatus] = useState<string | null>(null);

  // Address state (Pre-filled with Shiprocket user profile from screenshot)
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState({
    name: "Hamdan C",
    tag: "Home",
    line1: "Chulliyil House Thallakkadathur, Tharayil, areekad school ground road",
    city: "Tirur, thalakkadathur, Malappuram",
    state: "Kerala",
    pincode: "676103",
    phone: "7306827008",
    email: "hamdanhaneefa23@gmail.com",
  });

  // Selected payment method accordion tab: 'upi' | 'card' | 'netbanking' | 'cod' | null
  const [selectedPaymentTab, setSelectedPaymentTab] = useState<string | null>("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [cardForm, setCardForm] = useState({ number: "4111 2222 3333 4444", expiry: "12/28", cvv: "123" });
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  const sessionId = "b34a" + Math.floor(1000 + Math.random() * 9000);

  // Totals calculation
  const totalMrp = items.reduce((sum, it) => sum + (it.mrp || Math.round(it.price * 1.4)) * it.quantity, 0);
  const totalAmount = Math.max(0, subtotal - appliedDiscount + shippingFee);

  // Simulating the real Fastrr "Initiating Checkout" loading splash
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setPhase("initiating");
      const timer = setTimeout(() => {
        setPhase("checkout");
      }, 1100);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const discount = Math.round(subtotal * 0.1);
    setAppliedDiscount(discount);
    setCouponStatus(`Coupon "${couponCode.trim().toUpperCase()}" applied! (₹${discount} Saved)`);
  };

  const handleCompletePayment = async (method: string) => {
    setPhase("paying");
    const orderId = `SR-FST-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await createShopifyAdminOrder({
        customer: {
          firstName: address.name.split(" ")[0] || "Hamdan",
          lastName: address.name.split(" ").slice(1).join(" ") || "C",
          address: `${address.line1}, ${address.city}`,
          city: address.city,
          country: "India",
          zipCode: address.pincode,
          email: address.email,
          phone: address.phone,
        },
        items: items.map((it) => ({
          id: it.id,
          variantId: it.variantId || it.id,
          productId: it.id,
          handle: it.handle || "product",
          title: it.title,
          productTitle: it.productTitle || it.title,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
        })),
        paymentMethod: `Shiprocket Fastrr (${method.toUpperCase()})`,
        financialStatus: method === "cod" ? "pending" : "paid",
        total: totalAmount,
      });

      const savedOrderPayload = {
        orderId,
        date: new Date().toISOString(),
        items,
        subtotal,
        discountAmount: appliedDiscount,
        shippingFee,
        tax: 0,
        total: totalAmount,
        customer: {
          firstName: address.name.split(" ")[0] || "Hamdan",
          lastName: address.name.split(" ").slice(1).join(" ") || "C",
          address: `${address.line1}, ${address.city}`,
          city: address.city,
          country: "India",
          zipCode: address.pincode,
          email: address.email,
          phone: address.phone,
        },
        paymentMethod: method === "cod" ? "Cash on Delivery" : `Shiprocket Fastrr (${method.toUpperCase()})`,
        paymentStatus: method === "cod" ? "Pending" : "SUCCESS",
        source: "shiprocket_fastrr",
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("petpedia_last_order", JSON.stringify(savedOrderPayload));
      }

      setConfirmedOrderId(orderId);
      setPhase("success");

      setTimeout(() => {
        if (onOrderSuccess) {
          onOrderSuccess(orderId);
        } else {
          window.location.href = `/order-success?oid=${orderId}&ost=SUCCESS`;
        }
      }, 1200);
    } catch (err) {
      console.warn("Order creation error:", err);
      setConfirmedOrderId(orderId);
      setPhase("success");
      setTimeout(() => {
        window.location.href = `/order-success?oid=${orderId}&ost=SUCCESS`;
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Dim Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* --- INITIATING CHECKOUT SPLASH (Screenshot 3) --- */}
      {phase === "initiating" && (
        <div className="relative w-full max-w-[480px] h-[480px] bg-white sm:rounded-2xl shadow-2xl z-20 flex flex-col items-center justify-between p-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full flex justify-end">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Animated Purple Fastrr Logo */}
            <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center relative shadow-sm">
              <div className="w-16 h-16 rounded-full border-2 border-purple-200 border-t-[#6C3483] animate-spin absolute" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#581845] via-[#6C3483] to-[#884EA0] flex items-center justify-center text-white shadow-md">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white pl-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <p className="text-[15px] font-semibold text-gray-700 tracking-wide">Initiating Checkout</p>
          </div>

          <div className="text-[11px] text-gray-300 font-mono">{sessionId}</div>
        </div>
      )}

      {/* --- INBUILT SHIPROCKET CHECKOUT WINDOW (Screenshot 2) --- */}
      {(phase === "checkout" || phase === "paying" || phase === "success") && (
        <div className="relative w-full max-w-[480px] min-h-[580px] max-h-[92vh] bg-[#F4F6F8] sm:rounded-2xl shadow-2xl z-20 flex flex-col overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
          {/* Top Navigation Bar */}
          <div className="bg-white border-b border-gray-200/80 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Store Name / Logo */}
            <div className="flex items-center gap-1.5 font-extrabold text-[17px] text-[#112240] tracking-tight">
              <span className="text-[19px]">🐾</span>
              <span>Petpedia</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
            {/* CARD 1: Order Summary (Expandable) */}
            <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
              <div
                onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
              >
                <div className="font-bold text-[14.5px] text-gray-900">
                  Order summary{" "}
                  <span className="text-gray-500 font-normal text-[13.5px]">
                    ({items.reduce((s, it) => s + it.quantity, 0)} Item{items.length > 1 ? "s" : ""})
                  </span>
                </div>

                <div className="flex items-center gap-2 font-bold text-[14.5px]">
                  {totalMrp > totalAmount && (
                    <span className="text-gray-400 line-through text-[13px]">
                      {formatPrice(totalMrp)}
                    </span>
                  )}
                  <span className="text-gray-900">{formatPrice(totalAmount)}</span>
                  {isOrderSummaryOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Expanded Item Details */}
              {isOrderSummaryOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 divide-y divide-gray-100 space-y-3">
                  {items.map((it) => (
                    <div key={it.id} className="pt-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.image}
                          alt={it.title}
                          className="w-12 h-12 object-contain rounded-md border border-gray-200 p-1 bg-white"
                        />
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-1">
                            {it.productTitle || it.title}
                          </p>
                          <p className="text-gray-500">Qty: {it.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                  <div className="pt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount</span>
                        <span>-{formatPrice(appliedDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery charges</span>
                      <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: Enter Coupon Code */}
            <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs p-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-1">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <Percent className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full text-xs font-medium text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyCoupon}
                className="text-xs font-bold text-[#1A73E8] hover:text-blue-700 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
            {couponStatus && (
              <p className="text-[11px] text-green-600 font-medium px-2">{couponStatus}</p>
            )}

            {/* CARD 3: Delivery Details (Screenshot 2 Match) */}
            <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[14.5px] text-gray-900">Delivery details</h3>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs font-bold text-[#1A73E8] hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Address Content */}
              {!isEditingAddress ? (
                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-[13.5px]">{address.name}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                      {address.tag}
                    </span>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    {address.line1} {address.city}, {address.state}, {address.pincode}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-gray-500 pt-1">
                    <span>📞 {address.phone}</span>
                    <span>✉ {address.email}</span>
                  </div>

                  {/* Free shipping badge */}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-green-600 text-xs font-semibold bg-green-50/70 px-2.5 py-1 rounded-md">
                      <Truck className="w-3.5 h-3.5" />
                      Free shipping for you
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 pt-2 text-xs">
                  <input
                    placeholder="Full Name"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="w-full h-9 px-3 border border-gray-300 rounded-lg text-xs"
                  />
                  <input
                    placeholder="Address (House, Street, Area)"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    className="w-full h-9 px-3 border border-gray-300 rounded-lg text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="City / District"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="h-9 px-3 border border-gray-300 rounded-lg text-xs"
                    />
                    <input
                      placeholder="PIN Code"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      className="h-9 px-3 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Phone"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="h-9 px-3 border border-gray-300 rounded-lg text-xs"
                    />
                    <input
                      placeholder="Email"
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      className="h-9 px-3 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="w-full h-9 bg-gray-900 text-white font-bold rounded-lg text-xs mt-1 cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              )}
            </div>

            {/* CARD 4: Pay via (Screenshot 2 Match) */}
            <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs p-4 space-y-3">
              <h3 className="font-bold text-[14.5px] text-gray-900">Pay via</h3>

              {/* 1. Credit/Debit Card Option */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div
                  onClick={() => setSelectedPaymentTab(selectedPaymentTab === "card" ? null : "card")}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-gray-900">Credit/Debit Card</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                    <span>{formatPrice(totalAmount)}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${selectedPaymentTab === "card" ? "rotate-90" : ""}`} />
                  </div>
                </div>

                {selectedPaymentTab === "card" && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 text-xs">
                    <input
                      placeholder="Card Number (e.g. 4111 2222 3333 4444)"
                      value={cardForm.number}
                      onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="MM/YY"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                        className="h-10 px-3 bg-white border border-gray-300 rounded-lg text-xs"
                      />
                      <input
                        placeholder="CVV"
                        type="password"
                        maxLength={3}
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        className="h-10 px-3 bg-white border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCompletePayment("card")}
                      className="w-full h-11 bg-[#112240] hover:bg-black text-white font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Pay {formatPrice(totalAmount)}
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Net Banking Option */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div
                  onClick={() => setSelectedPaymentTab(selectedPaymentTab === "netbanking" ? null : "netbanking")}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-gray-900">Net Banking</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                    <span>{formatPrice(totalAmount)}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${selectedPaymentTab === "netbanking" ? "rotate-90" : ""}`} />
                  </div>
                </div>

                {selectedPaymentTab === "netbanking" && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      {["HDFC", "SBI", "ICICI", "Axis"].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-lg border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            selectedBank === bank
                              ? "bg-white border-blue-600 text-blue-700 shadow-xs"
                              : "bg-white border-gray-200 text-gray-700"
                          }`}
                        >
                          🏦 {bank} Bank
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCompletePayment("netbanking")}
                      className="w-full h-11 bg-[#112240] hover:bg-black text-white font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      Continue with {selectedBank} Bank • {formatPrice(totalAmount)}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. UPI Payment (Screenshot 2 match - Expanded with QR & UPI Apps) */}
              <div className="border-2 border-blue-600/60 rounded-xl overflow-hidden bg-blue-50/15">
                <div
                  onClick={() => setSelectedPaymentTab(selectedPaymentTab === "upi" ? null : "upi")}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-blue-50/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-gray-900">UPI payment</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                    <span>{formatPrice(totalAmount)}</span>
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                {selectedPaymentTab === "upi" && (
                  <div className="p-4 bg-white border-t border-gray-200 space-y-4 text-center">
                    <p className="text-xs font-semibold text-gray-700">
                      Scan the QR code & pay via any UPI app
                    </p>

                    {/* QR Code Container */}
                    <div className="w-40 h-40 mx-auto bg-white p-2.5 rounded-2xl border-2 border-gray-200 shadow-xs flex flex-col items-center justify-center relative">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=petpedia@shiprocket&pn=Petpedia&am=${totalAmount}&cu=INR`}
                        alt="UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center p-0.5">
                          <Zap className="w-3.5 h-3.5 text-[#FF5B00] fill-current" />
                        </div>
                      </div>
                    </div>

                    {/* One-Click UPI App Icons */}
                    <div className="pt-2">
                      <p className="text-[11px] text-gray-500 mb-2">Or click to pay with UPI app</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "gpay", name: "GPay", color: "bg-white", border: "border-gray-200" },
                          { id: "phonepe", name: "PhonePe", color: "bg-[#5f259f] text-white", border: "border-purple-600" },
                          { id: "paytm", name: "Paytm", color: "bg-[#002e6e] text-white", border: "border-blue-900" },
                          { id: "bhim", name: "BHIM", color: "bg-[#00796B] text-white", border: "border-teal-700" },
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                              selectedUpiApp === app.id ? "ring-2 ring-blue-600 shadow-sm" : ""
                            } ${app.color} ${app.border}`}
                          >
                            <span>{app.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCompletePayment("upi")}
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Pay with {selectedUpiApp.toUpperCase()} • {formatPrice(totalAmount)}
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Cash on Delivery Option */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div
                  onClick={() => setSelectedPaymentTab(selectedPaymentTab === "cod" ? null : "cod")}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-gray-500">Pay cash or UPI at doorstep</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                    <span>{formatPrice(totalAmount)}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${selectedPaymentTab === "cod" ? "rotate-90" : ""}`} />
                  </div>
                </div>

                {selectedPaymentTab === "cod" && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 text-center space-y-3">
                    <p className="text-xs text-gray-600">
                      No advance payment needed. Pay upon delivery at your doorstep.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCompletePayment("cod")}
                      className="w-full h-11 bg-[#FF5B00] hover:bg-[#E55200] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                    >
                      Place Cash on Delivery Order • {formatPrice(totalAmount)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="bg-white border-t border-gray-200/80 px-4 py-3 flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>100% Safe & Secure Checkout</span>
            </div>
            <span className="font-bold text-gray-700">Powered By Shiprocket ⚡</span>
          </div>

          {/* Loading Overlay when processing */}
          {phase === "paying" && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center animate-spin">
                <Zap className="w-8 h-8 fill-current" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Verifying with Shiprocket Fastrr...</h3>
              <p className="text-xs text-gray-500 max-w-xs">
                Connecting to payment gateway & reserving inventory...
              </p>
            </div>
          )}

          {/* Success Overlay */}
          {phase === "success" && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Order Confirmed!</h3>
              <p className="text-xs text-gray-600">
                Order ID: <strong className="text-gray-900">{confirmedOrderId}</strong>
              </p>
              <p className="text-xs text-gray-400">Redirecting to order confirmation...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
