import { createServerFn } from "@tanstack/react-start";
import defaultShippingSettings from "@/data/shipping-settings.json";

export interface ShippingSettings {
  standardFee: number;
  freeShippingThreshold: number;
  enableFreeShipping: boolean;
  codExtraFee: number;
  shippingTitle: string;
}

let inMemoryShippingSettings: ShippingSettings | null = null;

export async function loadShippingSettings(): Promise<ShippingSettings> {
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const file = path.resolve(process.cwd(), "src", "data", "shipping-settings.json");
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.standardFee === "number") {
          inMemoryShippingSettings = {
            standardFee: Number(parsed.standardFee) || 0,
            freeShippingThreshold: Number(parsed.freeShippingThreshold) || 500,
            enableFreeShipping: Boolean(parsed.enableFreeShipping),
            codExtraFee: Number(parsed.codExtraFee) || 0,
            shippingTitle: parsed.shippingTitle || "Standard Shipping",
          };
          return inMemoryShippingSettings;
        }
      }
    } catch (err) {
      console.warn("[loadShippingSettings] Error reading shipping-settings.json:", err);
    }
  }

  if (inMemoryShippingSettings !== null) {
    return inMemoryShippingSettings;
  }

  inMemoryShippingSettings = {
    standardFee: Number(defaultShippingSettings.standardFee) || 50,
    freeShippingThreshold: Number(defaultShippingSettings.freeShippingThreshold) || 500,
    enableFreeShipping: Boolean(defaultShippingSettings.enableFreeShipping),
    codExtraFee: Number(defaultShippingSettings.codExtraFee) || 0,
    shippingTitle: defaultShippingSettings.shippingTitle || "Standard Shipping",
  };

  return inMemoryShippingSettings;
}

export async function writeShippingSettings(settings: ShippingSettings): Promise<void> {
  inMemoryShippingSettings = { ...settings };
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const targetPaths = [
        path.resolve(process.cwd(), "src", "data", "shipping-settings.json"),
        path.resolve(process.cwd(), "public", "data", "shipping-settings.json"),
      ];

      for (const file of targetPaths) {
        try {
          const dir = path.dirname(file);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(file, JSON.stringify(settings, null, 2), "utf-8");
        } catch {
          // ignore individual path write errors
        }
      }
    } catch (err) {
      console.warn("[writeShippingSettings] Failed to write shipping-settings.json:", err);
    }
  }
}

export const getShippingSettingsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ShippingSettings> => {
    return await loadShippingSettings();
  }
);

export const updateShippingSettingsFn = createServerFn({ method: "POST" })
  .validator((data: Partial<ShippingSettings>) => data)
  .handler(async ({ data }): Promise<{ success: boolean; settings: ShippingSettings }> => {
    const current = await loadShippingSettings();
    const updated: ShippingSettings = {
      standardFee: typeof data.standardFee === "number" ? Math.max(0, data.standardFee) : current.standardFee,
      freeShippingThreshold:
        typeof data.freeShippingThreshold === "number"
          ? Math.max(0, data.freeShippingThreshold)
          : current.freeShippingThreshold,
      enableFreeShipping:
        typeof data.enableFreeShipping === "boolean"
          ? data.enableFreeShipping
          : current.enableFreeShipping,
      codExtraFee: typeof data.codExtraFee === "number" ? Math.max(0, data.codExtraFee) : current.codExtraFee,
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
  settings?: Partial<ShippingSettings> | null
): { shippingFee: number; isFree: boolean; title: string; shippingTitle: string } {
  const standardFee = settings?.standardFee !== undefined ? settings.standardFee : 50;
  const freeThreshold = settings?.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 500;
  const freeEnabled = settings?.enableFreeShipping !== undefined ? settings.enableFreeShipping : true;
  const title = settings?.shippingTitle || "Standard Shipping";

  if (freeEnabled && subtotal >= freeThreshold) {
    return { shippingFee: 0, isFree: true, title: "Free Shipping", shippingTitle: "Free Shipping" };
  }

  return { shippingFee: standardFee, isFree: standardFee === 0, title, shippingTitle: title };
}
