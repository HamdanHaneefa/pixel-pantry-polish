import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { formatPrice } from "@/data/formatPrice";
import qualityAssuredIcon from "@/assets/badges/quality-assured.png";
import expressDeliveryIcon from "@/assets/badges/express-delivery.png";
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

type PolicyKey = "no_return" | "easy_exchange" | "return_7" | "return_3" | "custom";

const POLICY_OPTIONS: Array<{ key: PolicyKey; label: string; description: string }> = [
  { key: "no_return", label: "No return or exchange", description: "For food & hygiene items" },
  { key: "easy_exchange", label: "Easy exchange", description: "Exchange only, no refunds" },
  { key: "return_7", label: "7-day return", description: "Standard return window" },
  { key: "return_3", label: "3-day return", description: "Short return window" },
  { key: "custom", label: "Custom text", description: "Write your own badge text" },
];

function policyKeyOf(tb: TrustBadgeConfig, isCustom: boolean): PolicyKey {
  if (isCustom) return "custom";
  if (tb.returnPolicyType === "no_return") return "no_return";
  if (tb.returnPolicyType === "easy_exchange") return "easy_exchange";
  return tb.returnPolicyDays === 3 ? "return_3" : "return_7";
}

function AdminSettingsPage() {
  const router = useRouter();
  const { settings: initialSettings, trustBadges: initialTrustBadges } = Route.useLoaderData();
  const savedBadges = initialTrustBadges || DEFAULT_TRUST_BADGE_SETTINGS;

  const [settings, setSettings] = useState<ShippingSettings>(initialSettings);
  const [trustBadges, setTrustBadges] = useState<TrustBadgeConfig>(savedBadges);
  const [isCustomPolicy, setIsCustomPolicy] = useState(Boolean(savedBadges.returnPolicyCustomText));
  const [isSaving, setIsSaving] = useState(false);

  const resetToSaved = () => {
    setSettings(initialSettings);
    setTrustBadges(savedBadges);
    setIsCustomPolicy(Boolean(savedBadges.returnPolicyCustomText));
  };

  useEffect(resetToSaved, [initialSettings, initialTrustBadges]);

  const isDirty =
    JSON.stringify(settings) !== JSON.stringify(initialSettings) ||
    JSON.stringify(trustBadges) !== JSON.stringify(savedBadges);

  const selectPolicy = (key: PolicyKey) => {
    setIsCustomPolicy(key === "custom");
    setTrustBadges((prev) => {
      switch (key) {
        case "no_return":
          return { ...prev, returnPolicyType: "no_return", returnPolicyCustomText: "" };
        case "easy_exchange":
          return { ...prev, returnPolicyType: "easy_exchange", returnPolicyCustomText: "" };
        case "return_7":
        case "return_3":
          return {
            ...prev,
            returnPolicyType: "return_available",
            returnPolicyDays: key === "return_3" ? 3 : 7,
            returnPolicyCustomText: "",
          };
        case "custom":
          return {
            ...prev,
            returnPolicyType: "easy_exchange",
            returnPolicyCustomText: prev.returnPolicyCustomText || "Easy Exchange",
          };
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const [shipRes, badgeRes] = await Promise.all([
        updateShippingSettingsFn({
          data: {
            freeShippingThreshold: Number(settings.freeShippingThreshold) || 0,
            enableFreeShipping: settings.enableFreeShipping,
            // COD handling fee is no longer offered.
            codExtraFee: 0,
            shippingTitle: settings.shippingTitle.trim() || "Standard Shipping",
          },
        }),
        updateTrustBadgeSettingsFn({
          data: {
            ...trustBadges,
            returnPolicyCustomText: isCustomPolicy ? trustBadges.returnPolicyCustomText.trim() : "",
          },
        }),
      ]);

      if (shipRes?.success && badgeRes?.success) {
        toast.success("Settings saved");
        await router.invalidate();
      } else {
        toast.error("Some settings could not be saved. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const threshold = Number(settings.freeShippingThreshold) || 0;
  const deliverySummary = settings.enableFreeShipping
    ? `Each product's delivery charge is added up. Orders of ${formatPrice(threshold)} or more ship free.`
    : "Each product's delivery charge is added up on every order.";

  const policyKey = policyKeyOf(trustBadges, isCustomPolicy);
  const returnLabel =
    policyKey === "custom"
      ? trustBadges.returnPolicyCustomText.trim() || "Custom policy"
      : policyKey === "no_return"
        ? "No Return & Exchange"
        : policyKey === "easy_exchange"
          ? "Easy Exchange"
          : `${trustBadges.returnPolicyDays || 7} Days Return Available`;

  const previewBadges = [
    trustBadges.showQualityAssured && { icon: qualityAssuredIcon, label: "Quality Assured" },
    trustBadges.showExpressDelivery && { icon: expressDeliveryIcon, label: "Express Delivery" },
    trustBadges.showReturnPolicy && {
      icon: policyKey === "no_return" ? noReturnIcon : easyExchangeIcon,
      label: returnLabel,
    },
  ].filter(Boolean) as Array<{ icon: string; label: string }>;

  return (
    <div className="max-w-5xl space-y-8 pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Delivery fees and the trust badges shown on product pages.
        </p>
      </div>

      {/* Delivery fees */}
      <SettingsSection
        title="Delivery fees"
        description="Each product's delivery charge is set when editing it in Products & Stock."
      >
        <div className="max-w-sm">
          <Field label="Name shown at checkout">
            <input
              type="text"
              value={settings.shippingTitle}
              onChange={(e) => setSettings({ ...settings, shippingTitle: e.target.value })}
              placeholder="Standard Shipping"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <ToggleRow
            title="Free delivery above a minimum order"
            description="Waive the delivery fee when the cart total reaches the amount below."
            checked={settings.enableFreeShipping}
            onChange={(enableFreeShipping) => setSettings({ ...settings, enableFreeShipping })}
          />
          {settings.enableFreeShipping && (
            <div className="mt-3 max-w-[240px]">
              <Field label="Minimum order for free delivery">
                <MoneyInput
                  value={settings.freeShippingThreshold}
                  onChange={(v) => setSettings({ ...settings, freeShippingThreshold: v })}
                />
              </Field>
            </div>
          )}
        </div>

        <p className="rounded-md bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          {deliverySummary}
        </p>
        <p className="text-xs text-slate-500">
          Keep this amount the same as the "Free Shipping" rule in your Fastrr dashboard.
        </p>
      </SettingsSection>

      {/* Product badges */}
      <SettingsSection
        title="Product page badges"
        description="Trust badges shown under the Buy Now button on every product."
      >
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Preview
          </p>
          <div className="flex min-h-[60px] flex-wrap items-center justify-around gap-4 rounded-md border border-slate-200 px-4 py-3">
            {previewBadges.length > 0 ? (
              previewBadges.map((b) => (
                <span key={b.label} className="flex items-center gap-2.5">
                  <img src={b.icon} alt="" className="h-8 w-8 object-contain" />
                  <span className="text-sm font-medium text-slate-800">{b.label}</span>
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">No badges will be shown.</span>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100 border-t border-slate-100">
          <ToggleRow
            className="py-4"
            title="Quality Assured"
            description="Reassures customers about product quality."
            checked={trustBadges.showQualityAssured}
            onChange={(showQualityAssured) =>
              setTrustBadges({ ...trustBadges, showQualityAssured })
            }
          />
          <ToggleRow
            className="py-4"
            title="Express Delivery"
            description="Highlights fast order fulfilment."
            checked={trustBadges.showExpressDelivery}
            onChange={(showExpressDelivery) =>
              setTrustBadges({ ...trustBadges, showExpressDelivery })
            }
          />
          <div className="py-4">
            <ToggleRow
              title="Return policy"
              description="Tells customers whether they can return or exchange the item."
              checked={trustBadges.showReturnPolicy}
              onChange={(showReturnPolicy) => setTrustBadges({ ...trustBadges, showReturnPolicy })}
            />

            {trustBadges.showReturnPolicy && (
              <div className="mt-4 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {POLICY_OPTIONS.map((opt) => {
                    const selected = policyKey === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => selectPolicy(opt.key)}
                        className={`flex items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                          selected
                            ? "border-orange-400 bg-orange-50/60"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            selected ? "border-orange-500" : "border-slate-300"
                          }`}
                        >
                          {selected && <span className="h-2 w-2 rounded-full bg-orange-500" />}
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-slate-900">
                            {opt.label}
                          </span>
                          <span className="block text-xs text-slate-500">{opt.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {isCustomPolicy && (
                  <div className="max-w-sm">
                    <Field label="Badge text">
                      <input
                        type="text"
                        value={trustBadges.returnPolicyCustomText}
                        onChange={(e) =>
                          setTrustBadges({ ...trustBadges, returnPolicyCustomText: e.target.value })
                        }
                        placeholder="e.g. 7 Days Easy Exchange"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          These are the defaults for every product. To use different badges on a single product,
          edit it in{" "}
          <Link to="/admin/products" className="font-medium text-orange-600 hover:underline">
            Products & Stock
          </Link>
          .
        </p>
      </SettingsSection>

      {/* Save bar — only shown when there are unsaved changes */}
      {isDirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:left-64">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-7">
            <span className="text-sm font-medium text-slate-700">You have unsaved changes</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={resetToSaved}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60 cursor-pointer"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const inputCls =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-[220px_1fr] md:gap-8">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        {children}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
        ₹
      </span>
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className={`${inputCls} pl-7`}
      />
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  className = "",
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
          checked ? "bg-orange-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
