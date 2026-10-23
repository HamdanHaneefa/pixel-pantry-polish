import { useEffect, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { formatPrice } from "@/data/formatPrice";
import { useCart } from "@/context/CartContext";
import FastrrCheckoutModal from "@/components/shiprocket/FastrrCheckoutModal";
import FastrrButton from "@/components/shiprocket/FastrrButton";
import {
  getShippingSettingsFn,
  calculateShippingFee,
  ShippingSettings,
} from "@/lib/admin/shipping";
import {
  CART_MILESTONES,
  calculateMilestoneProgress,
} from "@/lib/cart/milestones";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, updateQuantity, removeItem, isLoading } = useCart();
  const [isFastrrOpen, setIsFastrrOpen] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);

  // Collapsible Order Summary state
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  // Load shipping settings on mount
  useEffect(() => {
    getShippingSettingsFn()
      .then(setShippingSettings)
      .catch(() => {});
  }, []);

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen && !isFastrrOpen) {
      document.body.style.overflow = "hidden";
    } else if (!isFastrrOpen) {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isFastrrOpen]);

  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isFastrrOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFastrrOpen, onClose]);

  // Immediately close Cart Drawer whenever Fastrr begins launching
  useEffect(() => {
    const handleFastrrOpening = () => {
      onClose();
    };
    window.addEventListener("fastrr:opening", handleFastrrOpening);
    return () => window.removeEventListener("fastrr:opening", handleFastrrOpening);
  }, [onClose]);

  // Milestone Calculations
  const milestoneProgress = useMemo(() => {
    return calculateMilestoneProgress(cart.subtotal);
  }, [cart.subtotal]);

  // Shipping Fee calculation
  const shippingInfo = useMemo(() => {
    if (milestoneProgress.isFreeShipping) {
      return { shippingFee: 0, isFree: true, title: "Free Shipping" };
    }
    const computed = calculateShippingFee(cart.subtotal, shippingSettings);
    return { shippingFee: computed.shippingFee, isFree: computed.isFree, title: computed.title };
  }, [cart.subtotal, milestoneProgress.isFreeShipping, shippingSettings]);

  // Pricing calculations
  const totalItems = cart.items.reduce((acc, it) => acc + it.quantity, 0);

  const totalMrp = cart.items.reduce((acc, it) => {
    const itemMrp = it.mrp && it.mrp > it.price ? it.mrp : it.price;
    return acc + itemMrp * it.quantity;
  }, 0);

  const productSavings = Math.max(0, totalMrp - cart.subtotal);
  const tierSavings = milestoneProgress.tierDiscount;
  const discountOnMrp = productSavings + tierSavings;
  const finalPayable = Math.max(0, cart.subtotal - tierSavings + shippingInfo.shippingFee);

  // Delivery fee savings calculation (matching reference image)
  const standardDeliveryFee = shippingSettings?.standardFee || 75;
  const deliverySavings = shippingInfo.isFree ? standardDeliveryFee : 0;
  const totalSavingWithDelivery = discountOnMrp + deliverySavings;
  const baselineGross = totalMrp + (shippingInfo.isFree ? standardDeliveryFee : shippingInfo.shippingFee);
  const savingPercentage = baselineGross > 0 ? Math.round((totalSavingWithDelivery / baselineGross) * 100) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer (Compact desktop width matching Zigly ~390px) */}
      <div className="relative w-full sm:w-[390px] h-full bg-white shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
        
        {/* 1. Header (Zigly Style: Bag (X items) + Close) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] sm:text-[18px] font-bold text-gray-900 tracking-tight">
              Bag <span className="text-gray-500 font-medium text-[15px]">({totalItems} items)</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* 2. Milestone Progress Bar (Zigly Style Tier Tracker) */}
        {cart.items.length > 0 && (
          <div className="px-5 pt-3.5 pb-4 bg-white border-b border-gray-100 shrink-0">
            {/* Headline Teaser Prompt */}
            <div className="text-center mb-3">
              <p className="text-[13px] font-bold text-gray-900 tracking-tight">
                {milestoneProgress.headlineMessage}
              </p>
            </div>

            {/* Milestones Track Container */}
            <div className="relative px-2 pt-5 pb-2">
              {/* Background Line */}
              <div className="absolute top-[31px] left-5 right-5 h-[3px] bg-gray-200 rounded-full" />
              
              {/* Animated Active Progress Line */}
              <div
                className="absolute top-[31px] left-5 h-[3px] bg-[#16a34a] rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `calc(${milestoneProgress.progressPercent}% * (100% - 40px) / 100)`,
                  maxWidth: "calc(100% - 40px)",
                }}
              />

              {/* 4 Milestone Step Nodes */}
              <div className="relative flex justify-between items-center">
                {CART_MILESTONES.map((milestone, idx) => {
                  const isUnlocked = cart.subtotal >= milestone.threshold;
                  return (
                    <div
                      key={milestone.threshold}
                      className="flex flex-col items-center text-center -mx-2"
                      style={{ width: "25%" }}
                    >
                      {/* Top Label */}
                      <span
                        className={`text-[10px] leading-tight font-semibold mb-1 whitespace-nowrap transition-colors ${
                          isUnlocked ? "text-[#16a34a]" : "text-gray-500"
                        }`}
                      >
                        {milestone.label}
                      </span>

                      {/* Milestone Node Circle */}
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
                          isUnlocked
                            ? "bg-[#16a34a] text-white shadow-xs ring-2 ring-white"
                            : "bg-white border-2 border-gray-300 ring-2 ring-white"
                        }`}
                      >
                        {isUnlocked && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                      </div>

                      {/* Bottom Sublabel / Threshold */}
                      <span
                        className={`text-[10.5px] mt-1 font-bold transition-colors ${
                          isUnlocked ? "text-[#16a34a]" : "text-gray-600"
                        }`}
                      >
                        {milestone.sublabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. Cart Items List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-3 space-y-3 divide-y divide-gray-100">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 bg-[#FFF5EB] rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-[#FF5B00]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                Looks like you haven't added any pet goodies yet.
              </p>
              <Link
                to="/shop"
                onClick={onClose}
                className="bg-[#FF5B00] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E55200] transition-colors shadow-sm"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            cart.items.map((item) => {
              const itemMrp = item.mrp && item.mrp > item.price ? item.mrp : null;
              const discountPercent = itemMrp
                ? Math.round(((itemMrp - item.price) / itemMrp) * 100)
                : 0;

              return (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3.5">
                  {/* Thumbnail Box */}
                  <div className="w-[72px] h-[72px] shrink-0 bg-white rounded-lg border border-gray-200 p-1 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to="/product"
                          search={{ handle: item.handle }}
                          onClick={onClose}
                          className="font-medium text-[13px] leading-snug text-gray-900 hover:text-[#FF5B00] line-clamp-2 transition-colors"
                        >
                          {item.productTitle || item.title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={isLoading}
                          className="text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant / Size Tag */}
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                        Size: {item.title !== item.productTitle && item.title ? item.title : "Standard"}
                      </p>
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      {/* Price Row */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {itemMrp && (
                          <span className="text-[11.5px] text-gray-400 line-through">
                            {formatPrice(itemMrp)}
                          </span>
                        )}
                        <span className="font-extrabold text-[14px] text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        {discountPercent > 0 && (
                          <span className="text-[11px] font-bold text-red-600">
                            ({discountPercent}% OFF)
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-gray-200 rounded-md bg-white shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={isLoading}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-l-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-gray-800 select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={isLoading}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 5. Sticky Bottom Footer (Zigly Style Order Summary + Savings + Split Action Bar) */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 bg-white shrink-0 shadow-lg">
            
            {/* A. Collapsible Order Summary Accordion */}
            <div className="border-b border-gray-100">
              <button
                type="button"
                onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
              >
                <span className="font-bold text-[14px] text-gray-900">Order Summary</span>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                  <span>{isOrderSummaryOpen ? "Details" : "Details"}</span>
                  {isOrderSummaryOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>

              {isOrderSummaryOpen && (
                <div className="px-5 pb-3.5 pt-1 space-y-2.5 text-[13.5px] bg-white">
                  {/* Row 1: Total MRP */}
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Total MRP</span>
                    <span className="text-gray-900 font-medium">{formatPrice(totalMrp)}</span>
                  </div>

                  {/* Row 2: Discount on MRP */}
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Discount on MRP</span>
                    <span className="text-gray-900 font-medium">
                      {discountOnMrp > 0 ? formatPrice(discountOnMrp) : "₹0"}
                    </span>
                  </div>

                  {/* Row 3: Shipping */}
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Shipping:</span>
                    <div className="font-medium text-gray-900 flex items-center">
                      {shippingInfo.isFree ? (
                        <>
                          <span className="line-through text-gray-400 mr-1.5 font-normal">
                            ₹{standardDeliveryFee}
                          </span>
                          <span>Free</span>
                        </>
                      ) : (
                        <span>{formatPrice(shippingInfo.shippingFee)}</span>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Total Amount */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 font-bold text-gray-900 text-[14.5px]">
                    <span>Total Amount :</span>
                    <span>{formatPrice(finalPayable)}</span>
                  </div>

                  {/* Row 5: Your total saving */}
                  {totalSavingWithDelivery > 0 && (
                    <div className="flex justify-between items-center pt-0.5 font-bold text-[14.5px]">
                      <span className="text-gray-900">Your total saving</span>
                      <span className="text-[#16a34a]">
                        {formatPrice(totalSavingWithDelivery)} ({savingPercentage}%)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* B. Green Savings Pill Banner (Reference Match) */}
            {totalSavingWithDelivery > 0 && (
              <div className="mx-4 my-2.5 px-3.5 py-1.5 bg-[#16a34a] text-white rounded-lg flex items-center justify-center gap-2 text-[12px] sm:text-[13px] font-bold tracking-wide shadow-xs animate-in fade-in duration-200">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
                  <path d="M12 2l1.6 2.3 2.8-.4.7 2.7 2.7.9-.3 2.8 2.3 1.7-1.4 2.5 1.4 2.5-2.3 1.7.3 2.8-2.7.9-.7 2.7-2.8-.4L12 22l-1.6-2.3-2.8.4-.7-2.7-2.7-.9.3-2.8-2.3-1.7 1.4-2.5-1.4-2.5 2.3-1.7-.3-2.8 2.7-.9.7-2.7 2.8.4L12 2z" />
                </svg>
                <span>You’re saving {formatPrice(totalSavingWithDelivery)} on this order</span>
              </div>
            )}

            {/* C. Split Action Bar (Price Left, Fastrr BUY NOW Right) */}
            <div className="px-4 py-3 flex items-center justify-between gap-3 bg-white">
              {/* Left Side: Pricing Breakdown */}
              <div className="flex flex-col shrink-0 min-w-0 pr-1">
                {totalMrp > finalPayable && (
                  <span className="text-[12px] text-gray-400 line-through leading-tight">
                    {formatPrice(totalMrp)}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-[18px] sm:text-[19px] font-black text-gray-900 leading-tight">
                    {formatPrice(finalPayable)}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 leading-tight">
                  Inclusive of all taxes
                </span>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="text-[11px] font-bold text-[#FF5B00] hover:underline mt-0.5"
                >
                  View Full Cart →
                </Link>
              </div>

              {/* Right Side: Fastrr BUY NOW Button */}
              <div className="flex-1 min-w-[210px] sm:min-w-[220px] max-w-[250px] shrink-0">
                <FastrrButton
                  onClick={() => {
                    onClose();
                    setIsFastrrOpen(true);
                  }}
                  onBeforeLaunch={onClose}
                  label="BUY NOW"
                  items={cart.items.map((it) => ({
                    variantId: it.variantId || it.id,
                    quantity: it.quantity,
                    price: it.price,
                    title: it.title,
                  }))}
                />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Shiprocket Fastrr 1-Click Checkout Modal */}
      {isFastrrOpen && (
        <FastrrCheckoutModal
          isOpen={isFastrrOpen}
          onClose={() => setIsFastrrOpen(false)}
          items={cart.items}
          subtotal={cart.subtotal}
          discountAmount={tierSavings}
          shippingFee={shippingInfo.shippingFee}
          shippingTitle={shippingInfo.title}
        />
      )}
    </div>
  );
}
