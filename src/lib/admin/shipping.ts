import { createServerFn } from "@tanstack/react-start";
import defaultShippingSettings from "@/data/shipping-settings.json";
import { adminAuthMiddleware } from "./auth";
import { storageGet, storageSet } from "@/lib/storage/adapter";

export interface ShippingSettings {
  standardFee: number;
  freeShippingThreshold: number;
  enableFreeShipping: boolean;
  codExtraFee: number;
  shippingTitle: string;
}

let inMemoryShippingSettings: ShippingSettings | null = null;

export async function loadShippingSettings(): Promise<ShippingSettings> {
  const fallback: ShippingSettings = inMemoryShippingSettings || {
    standardFee: Number(defaultShippingSettings.standardFee) || 50,
    freeShippingThreshold: Number(defaultShippingSettings.freeShippingThreshold) || 500,
    enableFreeShipping: Boolean(defaultShippingSettings.enableFreeShipping),
    codExtraFee: Number(defaultShippingSettings.codExtraFee) || 0,
    shippingTitle: defaultShippingSettings.shippingTitle || "Standard Shipping",
  };

  const loaded = await storageGet<ShippingSettings>("shipping-settings", fallback);
  inMemoryShippingSettings = loaded;
  return loaded;
}

export async function writeShippingSettings(settings: ShippingSettings): Promise<void> {
  inMemoryShippingSettings = { ...settings };
  await storageSet("shipping-settings", settings);
}

export const getShippingSettingsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ShippingSettings> => {
    return await loadShippingSettings();
  },
);

export const updateShippingSettingsFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((data: Partial<ShippingSettings>) => data)
  .handler(async ({ data }): Promise<{ success: boolean; settings: ShippingSettings }> => {
    const current = await loadShippingSettings();
    const updated: ShippingSettings = {
      standardFee:
        typeof data.standardFee === "number" ? Math.max(0, data.standardFee) : current.standardFee,
      freeShippingThreshold:
        typeof data.freeShippingThreshold === "number"
          ? Math.max(0, data.freeShippingThreshold)
          : current.freeShippingThreshold,
      enableFreeShipping:
        typeof data.enableFreeShipping === "boolean"
          ? data.enableFreeShipping
          : current.enableFreeShipping,
      codExtraFee:
        typeof data.codExtraFee === "number" ? Math.max(0, data.codExtraFee) : current.codExtraFee,
      shippingTitle: data.shippingTitle?.trim() || current.shippingTitle,
    };

    await writeShippingSettings(updated);
    return { success: true, settings: updated };
  });

/**
 * Calculates shipping fee based on current subtotal and store shipping settings
 */
export function calculateShippingFee(
  subtotal: number,
  settings?: Partial<ShippingSettings> | null,
): { shippingFee: number; isFree: boolean; title: string; shippingTitle: string } {
  const standardFee = settings?.standardFee !== undefined ? settings.standardFee : 50;
  const freeThreshold =
    settings?.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 500;
  const freeEnabled =
    settings?.enableFreeShipping !== undefined ? settings.enableFreeShipping : true;
  const title = settings?.shippingTitle || "Standard Shipping";

  if (freeEnabled && subtotal >= freeThreshold) {
    return { shippingFee: 0, isFree: true, title: "Free Shipping", shippingTitle: "Free Shipping" };
  }

  return { shippingFee: standardFee, isFree: standardFee === 0, title, shippingTitle: title };
}
