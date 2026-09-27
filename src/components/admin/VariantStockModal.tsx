import { useState, useEffect } from "react";
import { AdminProduct, AdminProductVariant } from "@/lib/admin/products";
import StockEditor from "./StockEditor";
import { updateMultipleVariantStockFn } from "@/lib/admin/inventory";
import { X, Layers, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface VariantStockModalProps {
  isOpen: boolean;
  product: AdminProduct | null;
  onClose: () => void;
  onStockUpdated: (productId: string, totalStock: number, variants: AdminProductVariant[]) => void;
}

export default function VariantStockModal({
  isOpen,
  product,
  onClose,
  onStockUpdated,
}: VariantStockModalProps) {
  const [variants, setVariants] = useState<AdminProductVariant[]>(product?.variants || []);
  const [quickSetVal, setQuickSetVal] = useState<string>("");
  const [isBatchApplying, setIsBatchApplying] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  useEffect(() => {
    setVariants(product?.variants || []);
    setBatchSuccess(false);
    setBatchError(null);
  }, [product]);

  const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);

  const handleSingleVariantUpdated = (variantId: string, newStock: number) => {
    setVariants((prev) => {
      const updated = prev.map((v) =>
        v.id === variantId ? { ...v, stockQuantity: newStock, availableForSale: newStock > 0 } : v
      );
      const newTotal = updated.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
      if (product?.id) {
        onStockUpdated(product.id, newTotal, updated);
      }
      return updated;
    });
  };

  const handleApplyToAll = async () => {
    if (!product) return;
    const val = parseInt(quickSetVal, 10);
    if (isNaN(val) || val < 0) return;

    setIsBatchApplying(true);
    setBatchError(null);
    setBatchSuccess(false);

    try {
      const updates = variants.map((v) => ({
        variantId: v.id,
        inventoryItemId: v.inventoryItemId,
        quantity: val,
      }));

      const res = await updateMultipleVariantStockFn({
        data: {
          productId: product.id,
          updates,
        },
      });

      if (res.success) {
        const updated = variants.map((v) => ({
          ...v,
          stockQuantity: val,
          availableForSale: val > 0,
        }));
        setVariants(updated);
        const newTotal = val * updated.length;
        onStockUpdated(product.id, newTotal, updated);
        setBatchSuccess(true);
        setQuickSetVal("");
        setTimeout(() => setBatchSuccess(false), 3000);
      } else {
        setBatchError(res.error || "Failed to update all variants");
      }
    } catch (err: any) {
      setBatchError(err.message || "Failed to update variants");
    } finally {
      setIsBatchApplying(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/90">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-11 w-11 shrink-0 rounded-xl object-cover border border-slate-200 bg-white shadow-2xs"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-800">
                  <Layers className="h-3 w-3" />
                  {variants.length} Variants
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ID: {product.id.split("/").pop()}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 truncate leading-tight mt-0.5" title={product.title}>
                {product.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Total Stock Banner & Quick Batch Action */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-slate-50 px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Combined Store Inventory
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900">
                  {totalStock} <span className="text-xs font-semibold text-slate-500">units total</span>
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    totalStock <= 0
                      ? "bg-rose-100 text-rose-700"
                      : totalStock <= 5
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {totalStock <= 0 ? "Out of Stock" : totalStock <= 5 ? "Low Stock" : "In Stock"}
                </span>
              </div>
            </div>

            {/* Quick Set Uniform Quantity */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 pl-2 shrink-0">Set all to:</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Qty"
                value={quickSetVal}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  const formatted = raw.length > 1 ? raw.replace(/^0+/, "") || "0" : raw;
                  setQuickSetVal(formatted);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyToAll();
                  }
                }}
                className="w-14 rounded-lg border border-slate-200 px-2 py-1 text-xs text-center font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                disabled={isBatchApplying || !quickSetVal.trim()}
                onClick={handleApplyToAll}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-black disabled:opacity-40 transition-colors cursor-pointer"
              >
                {isBatchApplying ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3 text-amber-300" />
                )}
                <span>Apply</span>
              </button>
            </div>
          </div>

          {batchSuccess && (
            <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <Check className="h-3.5 w-3.5" /> All variants updated and synced to Shopify store!
            </div>
          )}

          {batchError && (
            <div className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="h-3.5 w-3.5" /> {batchError}
            </div>
          )}
        </div>

        {/* Variants List / Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          <p className="text-[11px] text-slate-500 font-medium">
            Adjust individual variant stock levels below. Each change immediately updates the live Shopify inventory.
          </p>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 transition-colors gap-3"
              >
                {/* Variant Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={variant.image || product.imageUrl}
                      alt={variant.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {variant.title}
                      </span>
                      {variant.sku && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 py-0.2 rounded shrink-0">
                          {variant.sku}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                      <span className="font-extrabold text-slate-900">
                        ₹{variant.price.toFixed(2)}
                      </span>
                      {variant.compareAtPrice && (
                        <span className="text-slate-400 line-through text-[10px]">
                          ₹{variant.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock Editor Stepper */}
                <div className="shrink-0 flex items-center gap-3">
                  <StockEditor
                    inventoryItemId={variant.inventoryItemId}
                    variantId={variant.id}
                    productId={product.id}
                    initialStock={variant.stockQuantity || 0}
                    productTitle={`${product.title} - ${variant.title}`}
                    onStockUpdated={(newStock) => handleSingleVariantUpdated(variant.id, newStock)}
                    compact={false}
                  />

                  <div className="hidden sm:block text-right w-20">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block ${
                        variant.stockQuantity <= 0
                          ? "text-rose-600"
                          : variant.stockQuantity <= 5
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {variant.stockQuantity <= 0
                        ? "Out"
                        : variant.stockQuantity <= 5
                        ? "Low"
                        : "In Stock"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {variant.stockQuantity} qty
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5 bg-slate-50/80">
          <span className="text-xs text-slate-500">
            {variants.length} variants • Synced with Shopify
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-600 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
