import { useState, useEffect } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getShippingSettingsFn,
  updateShippingSettingsFn,
  ShippingSettings,
} from "@/lib/admin/shipping";
import {
  getTrustBadgeSettingsFn,
  updateTrustBadgeSettingsFn,
  TrustBadgeConfig,
  DEFAULT_TRUST_BADGE_SETTINGS,
} from "@/lib/admin/trust-badges";
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
  BadgeAlert,
  Sliders,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import qualityAssuredIcon from "@/assets/badges/quality-assured.png";
import noReturnIcon from "@/assets/badges/no-return.png";
import easyExchangeIcon from "@/assets/badges/easy-exchange.png";

export const Route = createFileRoute("/admin/settings")({
  staleTime: 1000 * 30,
  gcTime: 1000 * 60 * 5,
  loader: async () => {
    const [settings, trustBadges] = await Promise.all([
      getShippingSettingsFn(),
      getTrustBadgeSettingsFn(),
    ]);
    return { settings, trustBadges };
  },
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const router = useRouter();
  const { settings: initialSettings, trustBadges: initialTrustBadges } = Route.useLoaderData();
  const [settings, setSettings] = useState<ShippingSettings>(initialSettings);
  const [trustBadges, setTrustBadges] = useState<TrustBadgeConfig>(
    initialTrustBadges || DEFAULT_TRUST_BADGE_SETTINGS,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    if (initialTrustBadges) {
      setTrustBadges(initialTrustBadges);
    }
  }, [initialTrustBadges]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const [shipRes, badgeRes] = await Promise.all([
        updateShippingSettingsFn({
          data: {
            standardFee: Number(settings.standardFee) || 0,
            freeShippingThreshold: Number(settings.freeShippingThreshold) || 0,
            enableFreeShipping: settings.enableFreeShipping,
            codExtraFee: Number(settings.codExtraFee) || 0,
            shippingTitle: settings.shippingTitle.trim() || "Standard Shipping",
          },
        }),
        updateTrustBadgeSettingsFn({
          data: trustBadges,
        }),
      ]);

      if (shipRes?.success && badgeRes?.success) {
        toast.success("Settings saved successfully!", {
          description: "Shipping and Product Trust Badge defaults updated storewide.",
        });
        setSettings(shipRes.settings);
        setTrustBadges(badgeRes.settings);
        router.invalidate();
      } else {
        toast.error("Failed to save all settings");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const computedReturnLabel =
    trustBadges.returnPolicyType === "no_return"
      ? "No Return & Exchange"
      : trustBadges.returnPolicyType === "easy_exchange"
        ? trustBadges.returnPolicyCustomText?.trim() || "Easy Exchange"
        : trustBadges.returnPolicyCustomText?.trim() ||
          `${trustBadges.returnPolicyDays || 7} Days Return Available`;

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Store & Product Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure delivery fees, free shipping criteria, and product trust badges shown across the storefront.
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
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-orange-500" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION: Trust Badges & Return Guarantee */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Product Trust Badges & Return Guarantee
              </h2>
              <p className="text-xs text-slate-500">
                Manage the trust assurance icons shown under "Buy Now" on all product pages.
              </p>
            </div>
          </div>

          {/* Interactive Live Preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Live Storefront Preview
              </span>
              <span className="text-[10px] text-slate-400">Updates as you edit</span>
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-around gap-2 sm:gap-4 py-3 px-4 sm:px-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              {trustBadges.showQualityAssured && (
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#EBF3FE] shrink-0">
                    <img
                      src={qualityAssuredIcon}
                      alt="Quality Assured"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <span className="text-[12px] sm:text-[13px] font-semibold text-[#1E293B] whitespace-nowrap">
                    Quality Assured
                  </span>
                </div>
              )}
              {trustBadges.showExpressDelivery && (
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF7E8] shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                      <path d="M15 18H9" />
                      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.24-4.05a1 1 0 0 0-.78-.38H14v10" />
                      <circle cx="7" cy="18.5" r="2.5" />
                      <circle cx="17" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                  <span className="text-[12px] sm:text-[13px] font-semibold text-[#1E293B] whitespace-nowrap">
                    Express Delivery
                  </span>
                </div>
              )}
              {trustBadges.showReturnPolicy && (
                <div className="flex items-center gap-2.5">
                  {trustBadges.returnPolicyType === "no_return" ? (
                    <>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFEAEA] shrink-0">
                        <img
                          src={noReturnIcon}
                          alt="No Return & Exchange"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <span className="text-[12px] sm:text-[13px] font-semibold text-[#1E293B] whitespace-nowrap">
                        {computedReturnLabel}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#EBF3FE] shrink-0">
                        <img
                          src={easyExchangeIcon}
                          alt="Easy Exchange"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <span className="text-[12px] sm:text-[13px] font-semibold text-[#1E293B] whitespace-nowrap">
                        {computedReturnLabel}
                      </span>
                    </>
                  )}
                </div>
              )}
              {!trustBadges.showQualityAssured &&
                !trustBadges.showExpressDelivery &&
                !trustBadges.showReturnPolicy && (
                  <p className="text-xs text-slate-400 italic">All badges are currently disabled.</p>
                )}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quality Assured Toggle */}
            <div className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Quality Assured Badge
                </span>
                <p className="text-xs text-slate-500">
                  Displays "Quality Assured" badge to boost customer trust.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setTrustBadges((prev) => ({
                    ...prev,
                    showQualityAssured: !prev.showQualityAssured,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  trustBadges.showQualityAssured ? "bg-orange-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    trustBadges.showQualityAssured ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Express Delivery Toggle */}
            <div className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  Express Delivery Badge
                </span>
                <p className="text-xs text-slate-500">
                  Displays "Express Delivery" icon highlighting fast order fulfillment.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setTrustBadges((prev) => ({
                    ...prev,
                    showExpressDelivery: !prev.showExpressDelivery,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  trustBadges.showExpressDelivery ? "bg-orange-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    trustBadges.showExpressDelivery ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Return Policy Badge Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-500" />
                  Return & Exchange Policy Badge
                </span>
                <p className="text-xs text-slate-500">
                  Controls whether return guarantee or non-returnable notice appears on products.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setTrustBadges((prev) => ({
                    ...prev,
                    showReturnPolicy: !prev.showReturnPolicy,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  trustBadges.showReturnPolicy ? "bg-orange-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    trustBadges.showReturnPolicy ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {trustBadges.showReturnPolicy && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <label className="text-xs font-bold text-slate-700 block">
                  Storewide Default Policy Type:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                  {/* Option 1: No Return & Exchange */}
                  <button
                    type="button"
                    onClick={() =>
                      setTrustBadges((prev) => ({
                        ...prev,
                        returnPolicyType: "no_return",
                        returnPolicyCustomText: "",
                      }))
                    }
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      trustBadges.returnPolicyType === "no_return"
                        ? "border-rose-400 bg-rose-50/70 text-rose-900 ring-2 ring-rose-300/40"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      No Return & Exchange
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      For hygiene & food items
                    </span>
                  </button>

                  {/* Option 2: Easy Exchange */}
                  <button
                    type="button"
                    onClick={() =>
                      setTrustBadges((prev) => ({
                        ...prev,
                        returnPolicyType: "easy_exchange",
                        returnPolicyDays: 7,
                        returnPolicyCustomText: "",
                      }))
                    }
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      trustBadges.returnPolicyType === "easy_exchange" &&
                      !trustBadges.returnPolicyCustomText
                        ? "border-blue-500 bg-blue-50/70 text-blue-900 ring-2 ring-blue-300/40"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Easy Exchange
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Hassle-free exchange
                    </span>
                  </button>

                  {/* Option 3: 7 Days Return */}
                  <button
                    type="button"
                    onClick={() =>
                      setTrustBadges((prev) => ({
                        ...prev,
                        returnPolicyType: "return_available",
                        returnPolicyDays: 7,
                        returnPolicyCustomText: "",
                      }))
                    }
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      trustBadges.returnPolicyType === "return_available" &&
                      trustBadges.returnPolicyDays === 7 &&
                      !trustBadges.returnPolicyCustomText
                        ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-300/40"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      7 Days Return
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Standard return policy
                    </span>
                  </button>

                  {/* Option 4: 3 Days Return */}
                  <button
                    type="button"
                    onClick={() =>
                      setTrustBadges((prev) => ({
                        ...prev,
                        returnPolicyType: "return_available",
                        returnPolicyDays: 3,
                        returnPolicyCustomText: "",
                      }))
                    }
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      trustBadges.returnPolicyType === "return_available" &&
                      trustBadges.returnPolicyDays === 3 &&
                      !trustBadges.returnPolicyCustomText
                        ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-300/40"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      3 Days Return
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Quick return policy
                    </span>
                  </button>

                  {/* Option 5: Custom Policy */}
                  <button
                    type="button"
                    onClick={() =>
                      setTrustBadges((prev) => ({
                        ...prev,
                        returnPolicyType: "easy_exchange",
                        returnPolicyCustomText: prev.returnPolicyCustomText || "Easy Exchange",
                      }))
                    }
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      Boolean(trustBadges.returnPolicyCustomText)
                        ? "border-purple-400 bg-purple-50/70 text-purple-900 ring-2 ring-purple-300/40"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      Custom Policy
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Write your own text
                    </span>
                  </button>
                </div>

                {/* Custom text input if custom chosen */}
                {Boolean(trustBadges.returnPolicyCustomText) && (
                  <div className="pt-2">
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Custom Policy Label Text:
                    </label>
                    <input
                      type="text"
                      value={trustBadges.returnPolicyCustomText}
                      onChange={(e) =>
                        setTrustBadges((prev) => ({
                          ...prev,
                          returnPolicyCustomText: e.target.value,
                        }))
                      }
                      placeholder="e.g. 7 Days Easy Exchange"
                      className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Link to Products for per-product override */}
            <div className="rounded-lg bg-orange-50/60 border border-orange-100 p-3 flex items-center justify-between text-xs text-orange-900">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                Want different badges for specific products? You can override them in each product's edit modal.
              </span>
              <Link
                to="/admin/products"
                className="font-bold text-orange-600 hover:text-orange-700 underline shrink-0 ml-2"
              >
                Go to Products
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION: Shipping Rates */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Delivery & Shipping Fees</h2>
              <p className="text-xs text-slate-500">
                Set standard delivery charges, shipping line titles, and free shipping triggers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-700">Shipping Display Title</label>
              <input
                type="text"
                required
                value={settings.shippingTitle}
                onChange={(e) => setSettings({ ...settings, shippingTitle: e.target.value })}
                placeholder="Standard Delivery"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 transition-colors focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Shown to customers at checkout and synced to Shopify order lines.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={settings.standardFee}
                onChange={(e) => setSettings({ ...settings, standardFee: Number(e.target.value) || 0 })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 transition-colors focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Charged when order total is below the free shipping threshold.
              </p>
            </div>
          </div>

          {/* Free Shipping Criteria */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Gift className="h-4 w-4 text-emerald-600" />
                  <span>Enable Free Shipping Threshold</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Automatically waive shipping fee when cart subtotal meets or exceeds threshold.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, enableFreeShipping: !settings.enableFreeShipping })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.enableFreeShipping ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.enableFreeShipping ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {settings.enableFreeShipping && (
              <div className="pt-2 border-t border-slate-200/60 max-w-xs">
                <label className="text-xs font-bold text-slate-700">
                  Free Shipping Minimum Cart Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) || 0 })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* SECTION: Cash on Delivery Extra Fee */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cash on Delivery (COD) Controls
              </h2>
              <p className="text-xs text-slate-500">
                Control Cash on Delivery availability and optional COD convenience fee
              </p>
            </div>
          </div>

          <div className="max-w-xs">
            <label className="text-xs font-bold text-slate-700">COD Convenience Handling Fee (₹)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={settings.codExtraFee}
              onChange={(e) =>
                setSettings({ ...settings, codExtraFee: Number(e.target.value) || 0 })
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 transition-colors focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Set to 0 if Cash on Delivery has no additional handling fee.
            </p>
          </div>

          <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 space-y-2 text-xs text-blue-900">
            <div className="flex items-center gap-2 font-bold">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Per-Product Cash on Delivery Controls</span>
            </div>
            <p className="text-blue-800 leading-relaxed text-[11px]">
              You can toggle Cash on Delivery for <strong>any product individually</strong> in the
              Products portal. When COD is turned off for a product, checkout will require prepaid
              payment (UPI, Cards, Netbanking) whenever that product is in the cart.
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
                <span>Saving All Settings...</span>
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
