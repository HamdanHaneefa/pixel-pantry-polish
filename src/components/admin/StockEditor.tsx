import { useState } from "react";
import { updateStockFn } from "@/lib/admin/inventory";
import { Minus, Plus, Check, Loader2 } from "lucide-react";

interface StockEditorProps {
  inventoryItemId?: string | undefined;
  initialStock: number;
  productTitle: string;
  onStockUpdated?: (newStock: number) => void;
  compact?: boolean;
}

export default function StockEditor({
  inventoryItemId,
  initialStock,
  productTitle,
  onStockUpdated,
  compact = false,
}: StockEditorProps) {
  const [stock, setStock] = useState<number>(initialStock);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (newVal: number) => {
    const val = Math.max(0, newVal);
    setStock(val);
    setError(null);

    if (!inventoryItemId) {
      setError("No inventory item linked");
      return;
    }

    setIsUpdating(true);
    setIsSaved(false);

    try {
      const res = await updateStockFn({
        data: {
          inventoryItemId,
          quantity: val,
        },
      });

      if (res.success) {
        setIsSaved(true);
        onStockUpdated?.(val);
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        setError(res.error || "Update failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col items-end sm:items-start gap-0.5 shrink-0">
      <div
        className={`inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-xs transition-all focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 ${
          compact ? "p-0.5" : "p-1"
        }`}
      >
        <button
          type="button"
          disabled={isUpdating || stock <= 0}
          onClick={() => handleUpdate(stock - 1)}
          aria-label="Decrease stock"
          className={`flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-25 transition-colors cursor-pointer ${
            compact ? "h-6 w-6" : "h-7 w-7"
          }`}
        >
          <Minus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </button>

        <input
          type="number"
          min="0"
          value={stock}
          disabled={isUpdating}
          onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
          onBlur={() => {
            if (stock !== initialStock) {
              handleUpdate(stock);
            }
          }}
          className={`text-center font-bold text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
            compact ? "h-6 w-9 text-xs" : "h-7 w-12 text-sm"
          }`}
        />

        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleUpdate(stock + 1)}
          aria-label="Increase stock"
          className={`flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-25 transition-colors cursor-pointer ${
            compact ? "h-6 w-6" : "h-7 w-7"
          }`}
        >
          <Plus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </button>

        {isUpdating ? (
          <div className="px-1 text-orange-500 shrink-0">
            <Loader2 className="h-3 w-3 animate-spin" />
          </div>
        ) : isSaved ? (
          <div className="px-1 text-emerald-600 animate-in fade-in shrink-0">
            <Check className="h-3 w-3" />
          </div>
        ) : null}
      </div>

      {error ? (
        <span className="text-[10px] text-red-500 font-semibold truncate max-w-[120px]">
          {error}
        </span>
      ) : null}
    </div>
  );
}
