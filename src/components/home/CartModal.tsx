import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus } from "lucide-react";
import { bestsellers, formatPrice } from "@/data/home";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const [items, setItems] = useState(
    bestsellers.slice(0, 3).map((item) => ({ ...item, quantity: 1 }))
  );

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const subTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const updateQuantity = (idx: number, delta: number) => {
    const newItems = [...items];
    const newQuantity = newItems[idx].quantity + delta;
    if (newQuantity > 0) {
      newItems[idx].quantity = newQuantity;
      setItems(newItems);
    }
  };

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
          <h2 className="text-[20px] font-bold text-foreground">Shopping Cart</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-xl border border-border/40 bg-white shadow-sm">
              <div className="w-[80px] h-[80px] shrink-0 bg-white rounded-lg border border-border/60 p-2 flex items-center justify-center">
                <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              
              <div className="flex flex-col flex-1 py-0.5">
                <h4 className="font-medium text-[13.5px] leading-snug text-foreground line-clamp-2 pr-4">
                  {item.title}
                </h4>
                <div className="text-[12px] text-muted-foreground mt-1">
                  × {item.quantity}
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex items-center gap-2">
                    {item.mrp && <span className="text-[12px] text-muted-foreground line-through">{formatPrice(item.mrp)}</span>}
                    <span className="font-bold text-[15px] text-foreground">{formatPrice(item.price)}</span>
                  </div>

                  <div className="flex items-center justify-between w-[90px] h-[34px] px-2 border border-[#FF5B00] rounded-full text-[#FF5B00]">
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
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/40 bg-white">
          <div className="flex items-center justify-between mb-6">
            <span className="text-muted-foreground text-[14px]">Sub-Total:</span>
            <span className="font-bold text-[18px] text-foreground">{formatPrice(subTotal)}</span>
          </div>
          
          <Link 
            to="/shop"
            onClick={onClose}
            className="w-full h-12 bg-[#FF5B00] text-white font-bold text-[14px] rounded-md hover:bg-[#E55200] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            RETURN TO SHOP
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </Link>
        </div>

      </div>
    </div>
  );
}
