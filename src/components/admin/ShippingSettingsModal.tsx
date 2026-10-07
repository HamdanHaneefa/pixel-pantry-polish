import { useState, useEffect } from "react";
import {
  getShippingSettingsFn,
  updateShippingSettingsFn,
  ShippingSettings,
} from "@/lib/admin/shipping";
import {
  Truck,
  X,
  Check,
  Loader2,
  DollarSign,
  Gift,
  ShieldCheck,
  CreditCard,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";

interface ShippingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated?: (settings: ShippingSettings) => void;
}

export default function ShippingSettingsModal({
  isOpen,
  onClose,
  onSettingsUpdated,
}: ShippingSettingsModalProps) {
  const [settings, setSettings] = useState<ShippingSettings>({
    standardFee: 50,
    freeShippingThreshold: 500,
    enableFreeShipping: true,
    codExtraFee: 0,
    shippingTitle: "Standard Shipping",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const data = await getShippingSettingsFn();
        if (active && data) {
          setSettings(data);
        }
      } catch (err) {
        console.warn("Failed to load shipping settings:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updateShippingSettingsFn({
        data: {
          standardFee: Number(settings.standardFee) || 0,
          freeShippingThreshold: Number(settings.freeShippingThreshold) || 0,
          enableFreeShipping: settings.enableFreeShipping,
          codExtraFee: Number(settings.codExtraFee) || 0,
          shippingTitle: settings.shippingTitle.trim() || "Standard Shipping",
        },
      });

      if (res?.success) {
        toast.success("Shipping & delivery settings saved!", {
          description: "All customer checkouts and Shopify orders are now synced.",
        });
        onSettingsUpdated?.(res.settings);
        onClose();
      } else {
        toast.error("Failed to save shipping settings");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update shipping settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Shipping & Delivery Settings
              </h2>
              <p className="text-xs text-slate-500">
                Configure store delivery fees and free shipping thresholds
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
            <p className="text-xs font-semibold text-slate-500">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
            {/* Standard Shipping Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Standard Shipping Charge (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={settings.standardFee}
                  onChange={(e) =>
                    setSettings({ ...settings, standardFee: Math.max(0, parseInt(e.target.value, 10) || 0) })
                  }
                  placeholder="50"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Charged to customers when order total is below the free shipping threshold.
              </p>
            </div>

            {/* Free Shipping Threshold */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Gift className="h-4 w-4 text-emerald-600" />
                    Free Delivery Threshold
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Offer free delivery when cart reaches a minimum order amount
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableFreeShipping}
                    onChange={(e) =>
                      setSettings({ ...settings, enableFreeShipping: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {settings.enableFreeShipping && (
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Free Delivery on Orders Above (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={settings.freeShippingThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          freeShippingThreshold: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      placeholder="500"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    ✓ Orders of ₹{settings.freeShippingThreshold} or more will automatically receive Free Shipping.
                  </p>
                </div>
              )}
            </div>

            {/* Shipping Label Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Shipping Service Name (Shown on Shopify & Checkout)
              </label>
              <input
                type="text"
                value={settings.shippingTitle}
                onChange={(e) => setSettings({ ...settings, shippingTitle: e.target.value })}
                placeholder="Standard Shipping"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                This exact title appears on customer checkout receipts and inside your Shopify Admin order receipts.
              </p>
            </div>

            {/* Shopify Sync Guarantee Banner */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Automatic Shopify Admin Sync</p>
                <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                  Whenever an order is placed on Petpedia, the configured shipping fee is submitted directly to Shopify as an official line item (<code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">shipping_lines</code>). It will display on your Shopify Admin dashboard and invoices!
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-60 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
