import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/data/home";
import { useCart } from "@/context/CartContext";
import FastrrCheckoutModal from "@/components/shiprocket/FastrrCheckoutModal";
import FastrrButton from "@/components/shiprocket/FastrrButton";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, updateQuantity, removeItem, isLoading } = useCart();
  const [isFastrrOpen, setIsFastrrOpen] = useState(false);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full md:w-[480px] h-full bg-white shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#FF5B00]" />
            <h2 className="text-[20px] font-bold text-foreground">Shopping Cart</h2>
            <span className="text-xs bg-[#FF5B00]/10 text-[#FF5B00] font-bold px-2 py-0.5 rounded-full">
              {cart.items.reduce((acc, it) => acc + it.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 bg-[#FFF5EB] rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-[#FF5B00]" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                Looks like you haven't added any pet goodies yet.
              </p>
              <Link
                to="/shop"
                onClick={onClose}
                className="bg-[#FF5B00] text-white px-6 py-2.5 rounded-md font-bold text-sm hover:bg-[#E55200] transition-colors"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            cart.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl border border-border/40 bg-white shadow-sm hover:border-[#FF5B00]/30 transition-colors"
              >
                <div className="w-[80px] h-[80px] shrink-0 bg-white rounded-lg border border-border/60 p-2 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                <div className="flex flex-col flex-1 py-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to="/product"
                      search={{ handle: item.handle } as unknown as void}
                      onClick={onClose}
                      className="font-medium text-[13.5px] leading-snug text-foreground line-clamp-2 hover:text-[#FF5B00] transition-colors"
                    >
                      {item.productTitle || item.title}
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isLoading}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3">
                    <div className="flex items-center gap-2">
                      {item.mrp && (
                        <span className="text-[12px] text-muted-foreground line-through">
                          {formatPrice(item.mrp)}
                        </span>
                      )}
                      <span className="font-bold text-[15px] text-foreground">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between w-[90px] h-[34px] px-2 border border-[#FF5B00] rounded-full text-[#FF5B00]">
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
            ))
          )}
        </div>

        {/* Footer (Screenshot 1 Match) */}
        {cart.items.length > 0 && (
          <div className="p-6 border-t border-border/40 bg-white space-y-3.5">
            {/* Estimated total */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[14.5px] text-gray-800 font-medium">Estimated total</span>
                <span className="font-bold text-[16px] text-gray-900">
                  Rs. {cart.subtotal.toFixed(2)} INR
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Taxes and shipping calculated at checkout.
              </p>
            </div>

            {/* Exact Shiprocket BUY NOW Pill Button */}
            <FastrrButton
              onClick={() => setIsFastrrOpen(true)}
              label="BUY NOW"
              className="w-full"
              items={cart.items.map((it) => ({
                variantId: it.variantId || it.id,
                quantity: it.quantity,
              }))}
            />

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                to="/cart"
                onClick={onClose}
                className="h-10 border border-gray-300 text-gray-700 font-semibold text-[13px] rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center shadow-xs"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={onClose}
                className="h-10 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[13px] rounded-lg transition-colors flex items-center justify-center shadow-xs"
              >
                Regular Checkout
              </Link>
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
          shippingFee={cart.subtotal > 500 ? 0 : 50}
        />
      )}
    </div>
  );
}
