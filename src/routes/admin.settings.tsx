import { useState, useEffect } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getShippingSettingsFn,
  updateShippingSettingsFn,
  ShippingSettings,
} from "@/lib/admin/shipping";
import {
  Truck,
  Check,
  Loader2,
  Gift,
  ShieldCheck,
  CreditCard,
  Banknote,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/settings")({
  staleTime: 0,
  gcTime: 0,
  shouldReload: () => true,
  loader: async () => {
    const settings = await getShippingSettingsFn();
    return { settings };
  },
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const router = useRouter();
  const { settings: initialSettings } = Route.useLoaderData();
  const [settings, setSettings] = useState<ShippingSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

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
        toast.success("Settings saved successfully!", {
          description: "Shipping charges and delivery settings updated across storefront & Shopify.",
        });
        setSettings(res.settings);
        router.invalidate();
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Shipping & Payment Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure delivery fees, free shipping criteria, and Cash on Delivery rules synced to Shopify.
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            setIsRefreshing(true);
            try {
              await router.invalidate();
            } finally {
              setTimeout(() => setIsRefreshing(false), 400);
            }
          }}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all disabled:opacity-60 active:scale-[0.99] self-start sm:self-auto"
        >
          <RotateCcw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-orange-500" : ""}`} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Delivery Charges */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Delivery Charges Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Set standard shipping fee and free shipping thresholds
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Standard Shipping Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                    setSettings({
                      ...settings,
                      standardFee: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
                  placeholder="50"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Applied to customer orders when subtotal does not qualify for free delivery.
              </p>
            </div>

            {/* Shipping Service Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Shipping Title (Shopify Line Item)
              </label>
              <input
                type="text"
                required
                value={settings.shippingTitle}
                onChange={(e) =>
                  setSettings({ ...settings, shippingTitle: e.target.value })
                }
                placeholder="Standard Shipping"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                This exact title appears inside Shopify Admin orders and customer receipts.
              </p>
            </div>
          </div>

          {/* Free Shipping Criteria */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Gift className="h-4 w-4 text-emerald-600" />
                  Free Shipping Promotion
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automatically waive shipping fee when cart subtotal exceeds a minimum amount
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
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Order Subtotal For Free Shipping (₹)
                </label>
                <div className="relative max-w-xs">
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
                <p className="text-[11px] text-emerald-700 font-semibold mt-1.5">
                  ✓ Orders with ₹{settings.freeShippingThreshold} or more will have ₹0 shipping fee.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Cash on Delivery (COD) Controls */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cash on Delivery (COD) Controls
              </h2>
              <p className="text-xs text-slate-500">
                Control Cash on Delivery availability per product or storewide
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 space-y-2 text-xs text-blue-900">
            <div className="flex items-center gap-2 font-bold">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Per-Product Cash on Delivery Controls</span>
            </div>
            <p className="text-blue-800 leading-relaxed text-[11px]">
              You can toggle Cash on Delivery for <strong>any product individually</strong> in the Products portal. When COD is turned off for a product, checkout will require prepaid payment (UPI, Cards, Netbanking) whenever that product is in the cart.
            </p>
            <div className="pt-1">
              <Link
                to="/admin/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 underline"
              >
                <span>Manage Per-Product COD in Products Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Shopify Sync Guarantee */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-5 sm:p-6 shadow-xs flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shrink-0 shadow-sm shadow-emerald-600/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              Verified Shopify Admin Integration
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When orders are placed, the shipping charge is synced to Shopify Admin as an official order line item (<code className="font-mono bg-emerald-100/70 text-emerald-800 px-1 py-0.5 rounded">shipping_lines</code>). It appears accurately on your Shopify order screen, packing slips, customer email receipts, and analytics!
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-60 transition-all active:scale-[0.99] cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
