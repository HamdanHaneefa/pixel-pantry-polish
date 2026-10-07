import { useState, useEffect } from "react";
import { updateProductPriceFn } from "@/lib/admin/products";
import { Pencil, Check, X, Loader2 } from "lucide-react";

interface PriceEditorProps {
  productId: string;
  variantId?: string | undefined;
  initialPrice: number;
  initialCompareAtPrice?: number | undefined;
  productTitle: string;
  onPriceUpdated?: ((newPrice: number, newCompareAt?: number | null) => void) | undefined;
}

export default function PriceEditor({
  productId,
  variantId,
  initialPrice,
  initialCompareAtPrice,
  productTitle,
  onPriceUpdated,
}: PriceEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState<string>(initialPrice ? initialPrice.toString() : "0");
  const [comparePrice, setComparePrice] = useState<string>(
    initialCompareAtPrice ? initialCompareAtPrice.toString() : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPrice(initialPrice ? initialPrice.toString() : "0");
    setComparePrice(initialCompareAtPrice ? initialCompareAtPrice.toString() : "");
  }, [initialPrice, initialCompareAtPrice]);

  const handleSave = async () => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError("Invalid price");
      return;
    }

    const numCompare = comparePrice.trim() ? parseFloat(comparePrice) : null;

    setIsSaving(true);
    setError(null);

    try {
      const res = await updateProductPriceFn({
        data: {
          productId,
          variantId,
          price: numPrice,
          compareAtPrice: numCompare,
        },
      });

      if (res?.success) {
        setSavedSuccess(true);
        setIsEditing(false);
        onPriceUpdated?.(numPrice, numCompare);
        setTimeout(() => setSavedSuccess(false), 2500);
      } else {
        setError("Failed to update price");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update price");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1.5 p-2 bg-orange-50/70 border border-orange-200 rounded-xl shadow-xs animate-in fade-in duration-150">
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <label className="text-[9px] font-bold text-orange-950 uppercase block mb-0.5">
              Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              disabled={isSaving}
              autoFocus
              onFocus={(e) => e.target.select()}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
              placeholder="0.00"
              className="w-20 rounded-lg border border-orange-300 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="flex-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">
              MRP (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={comparePrice}
              disabled={isSaving}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setComparePrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
              placeholder="MRP"
              className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-1 pt-3.5">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
              title="Save to Shopify"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {error && (
          <span className="text-[10px] text-red-600 font-semibold">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group">
      <div className="flex items-baseline gap-1.5">
        <span className="text-base font-black text-slate-900">
          ₹{initialPrice.toFixed(2)}
        </span>
        {initialCompareAtPrice && initialCompareAtPrice > initialPrice ? (
          <span className="text-xs text-slate-400 line-through">
            ₹{initialCompareAtPrice.toFixed(2)}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="opacity-70 group-hover:opacity-100 inline-flex items-center justify-center h-6 w-6 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-all cursor-pointer"
        title="Quick edit price for this product"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {savedSuccess && (
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded animate-in fade-in">
          Synced!
        </span>
      )}
    </div>
  );
}
