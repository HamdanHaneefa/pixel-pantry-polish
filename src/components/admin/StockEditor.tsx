import { useState, useEffect } from "react";
import { updateStockFn } from "@/lib/admin/inventory";
import { Minus, Plus, Check, Loader2 } from "lucide-react";

interface StockEditorProps {
  inventoryItemId?: string | undefined;
  variantId?: string | undefined;
  productId?: string | undefined;
  initialStock: number;
  productTitle: string;
  onStockUpdated?: (newStock: number) => void;
  compact?: boolean;
}

export default function StockEditor({
  inventoryItemId,
  variantId,
  productId,
  initialStock,
  productTitle,
  onStockUpdated,
  compact = false,
}: StockEditorProps) {
  const [stock, setStock] = useState<number>(initialStock);
  const [inputValue, setInputValue] = useState<string>(String(initialStock));
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStock(initialStock);
    setInputValue(String(initialStock));
  }, [initialStock]);

  const handleUpdate = async (newVal: number) => {
    const val = Math.max(0, newVal);
    setStock(val);
    setInputValue(String(val));
    setError(null);

    if (!inventoryItemId && !variantId && !productId) {
      setError("No inventory item linked");
      return;
    }

    setIsUpdating(true);
    setIsSaved(false);

    try {
      const res = await updateStockFn({
        data: {
          inventoryItemId,
          variantId,
          productId,
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

  const commitValue = () => {
    const parsed = parseInt(inputValue, 10);
    const finalVal = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setInputValue(String(finalVal));
    if (finalVal !== stock) {
      handleUpdate(finalVal);
    }
  };

  const handleStep = (delta: number) => {
    const current = isNaN(parseInt(inputValue, 10)) ? stock : parseInt(inputValue, 10);
    const nextVal = Math.max(0, current + delta);
    setInputValue(String(nextVal));
    handleUpdate(nextVal);
  };

  const currentParsed = parseInt(inputValue, 10);
  const isZeroOrLess = (isNaN(currentParsed) ? stock : currentParsed) <= 0;

  return (
    <div className="flex flex-col items-end sm:items-start gap-0.5 shrink-0">
      <div
        className={`inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-xs transition-all focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 ${
          compact ? "p-0.5" : "p-1"
        }`}
      >
        <button
          type="button"
          disabled={isUpdating || isZeroOrLess}
          onClick={() => handleStep(-1)}
          aria-label="Decrease stock"
          className={`flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-25 transition-colors cursor-pointer ${
            compact ? "h-6 w-6" : "h-7 w-7"
          }`}
        >
          <Minus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </button>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          disabled={isUpdating}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            const formatted = raw.length > 1 ? raw.replace(/^0+/, "") || "0" : raw;
            setInputValue(formatted);
          }}
          onBlur={commitValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
          className={`text-center font-bold text-slate-900 focus:outline-none ${
            compact ? "h-6 w-9 text-xs" : "h-7 w-12 text-sm"
          }`}
        />

        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleStep(1)}
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
