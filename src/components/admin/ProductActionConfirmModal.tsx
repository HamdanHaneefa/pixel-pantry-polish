import { useEffect } from "react";
import { AdminProduct } from "@/lib/admin/products";
import { X, Banknote, CreditCard, Eye, EyeOff, Loader2 } from "lucide-react";

export interface ProductActionConfirmConfig {
  type: "cod" | "visibility";
  product: AdminProduct;
  // For "cod": true = enable COD, false = make prepaid only
  // For "visibility": true = make visible, false = hide
  targetValue: boolean;
}

interface ProductActionConfirmModalProps {
  isOpen: boolean;
  config: ProductActionConfirmConfig | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function ProductActionConfirmModal({
  isOpen,
  config,
  isLoading = false,
  onClose,
  onConfirm,
}: ProductActionConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isLoading) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !config) return null;

  const { type, product, targetValue } = config;

  // Derive modal visuals and text based on type & targetValue
  let title = "";
  let badgeText = "";
  let badgeColorClass = "";
  let iconComponent = null;
  let confirmButtonText = "";
  let confirmButtonColorClass = "";
  let descriptionText = "";

  if (type === "cod") {
    if (!targetValue) {
      // Switching from COD -> Prepaid Only
      title = "Change to Prepaid Only?";
      badgeText = "Prepaid Only";
      badgeColorClass = "bg-amber-100 text-amber-800 border-amber-300";
      iconComponent = (
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center ring-4 ring-amber-50 shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
      );
      confirmButtonText = "Yes, Make Prepaid Only";
      confirmButtonColorClass = "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20";
      descriptionText =
        "Cash on Delivery will be disabled at checkout. Customers will be required to pay online before their order is processed.";
    } else {
      // Switching from Prepaid -> COD Available
      title = "Enable Cash on Delivery?";
      badgeText = "COD Available";
      badgeColorClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
      iconComponent = (
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center ring-4 ring-emerald-50 shrink-0">
          <Banknote className="w-5 h-5" />
        </div>
      );
      confirmButtonText = "Yes, Enable COD";
      confirmButtonColorClass =
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20";
      descriptionText =
        "Cash on Delivery will be enabled for this product. Customers will be able to place orders and pay in cash upon delivery.";
    }
  } else {
    // Visibility toggle
    if (!targetValue) {
      // Switching from Visible -> Hidden
      title = "Hide Product from Storefront?";
      badgeText = "Hidden";
      badgeColorClass = "bg-purple-100 text-purple-800 border-purple-300";
      iconComponent = (
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center ring-4 ring-purple-50 shrink-0">
          <EyeOff className="w-5 h-5" />
        </div>
      );
      confirmButtonText = "Yes, Hide Product";
      confirmButtonColorClass =
        "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20";
      descriptionText =
        "This product will be hidden immediately from search results, category listings, and customer browsing on the storefront.";
    } else {
      // Switching from Hidden -> Visible
      title = "Make Product Visible?";
      badgeText = "Visible";
      badgeColorClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
      iconComponent = (
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center ring-4 ring-emerald-50 shrink-0">
          <Eye className="w-5 h-5" />
        </div>
      );
      confirmButtonText = "Yes, Make Visible";
      confirmButtonColorClass =
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20";
      descriptionText =
        "This product will become publicly visible across the store and search results for customers to purchase.";
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            {iconComponent}
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>
              <span
                className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColorClass}`}
              >
                {badgeText}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Product Details Card */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
            <img
              src={product.imageUrl || "/placeholder-product.png"}
              alt={product.title}
              className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
              }}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1" title={product.title}>
                {product.title}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">₹{product.price.toFixed(2)}</span>
                {product.category && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">{product.category}</span>
                  </>
                )}
                {product.sku && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{product.sku}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-100/70">
            {descriptionText}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-slate-100 bg-slate-50/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60 ${confirmButtonColorClass}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <span>{confirmButtonText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
