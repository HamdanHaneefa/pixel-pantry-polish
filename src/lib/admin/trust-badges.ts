import { createServerFn } from "@tanstack/react-start";
import defaultTrustBadgeSettings from "@/data/trust-badge-settings.json";
import { adminAuthMiddleware } from "./auth";
import { storageGet, storageSet } from "@/lib/storage/adapter";

export interface TrustBadgeConfig {
  showQualityAssured: boolean;
  showExpressDelivery: boolean;
  showReturnPolicy: boolean;
  returnPolicyType: "no_return" | "easy_exchange" | "return_available";
  returnPolicyDays: number;
  returnPolicyCustomText: string;
}

export interface ProductTrustBadgeOverride {
  useGlobalDefault: boolean;
  showQualityAssured?: boolean;
  showExpressDelivery?: boolean;
  showReturnPolicy?: boolean;
  returnPolicyType?: "no_return" | "easy_exchange" | "return_available";
  returnPolicyDays?: number;
  returnPolicyCustomText?: string;
}

export interface ResolvedTrustBadges {
  showQualityAssured: boolean;
  showExpressDelivery: boolean;
  showReturnPolicy: boolean;
  returnPolicyType: "no_return" | "easy_exchange" | "return_available";
  returnPolicyDays: number;
  returnPolicyLabel: string;
}

let inMemoryTrustBadgeSettings: TrustBadgeConfig | null = null;

export const DEFAULT_TRUST_BADGE_SETTINGS: TrustBadgeConfig = {
  showQualityAssured: true,
  showExpressDelivery: true,
  showReturnPolicy: true,
  returnPolicyType: "no_return",
  returnPolicyDays: 7,
  returnPolicyCustomText: "",
};

export async function loadTrustBadgeSettings(): Promise<TrustBadgeConfig> {
  const fallback: TrustBadgeConfig = inMemoryTrustBadgeSettings || {
    showQualityAssured: defaultTrustBadgeSettings.showQualityAssured !== false,
    showExpressDelivery: defaultTrustBadgeSettings.showExpressDelivery !== false,
    showReturnPolicy: defaultTrustBadgeSettings.showReturnPolicy !== false,
    returnPolicyType:
      (defaultTrustBadgeSettings.returnPolicyType as "no_return" | "return_available") ||
      "no_return",
    returnPolicyDays: Number(defaultTrustBadgeSettings.returnPolicyDays) || 7,
    returnPolicyCustomText: defaultTrustBadgeSettings.returnPolicyCustomText || "",
  };

  const loaded = await storageGet<TrustBadgeConfig>("trust-badge-settings", fallback);
  inMemoryTrustBadgeSettings = loaded;
  return loaded;
}

export async function writeTrustBadgeSettings(settings: TrustBadgeConfig): Promise<void> {
  inMemoryTrustBadgeSettings = { ...settings };
  await storageSet("trust-badge-settings", settings);

  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = require("node:fs");
      const path = require("node:path");
      const file = path.resolve(process.cwd(), "src", "data", "trust-badge-settings.json");
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(file, JSON.stringify(inMemoryTrustBadgeSettings, null, 2), "utf-8");
    } catch {
      // Non-fatal
    }
  }
}

export const getTrustBadgeSettingsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<TrustBadgeConfig> => {
    return await loadTrustBadgeSettings();
  },
);

export const updateTrustBadgeSettingsFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((data: Partial<TrustBadgeConfig>) => data)
  .handler(async ({ data }): Promise<{ success: boolean; settings: TrustBadgeConfig }> => {
    const current = await loadTrustBadgeSettings();
    const updated: TrustBadgeConfig = {
      showQualityAssured:
        typeof data.showQualityAssured === "boolean"
          ? data.showQualityAssured
          : current.showQualityAssured,
      showExpressDelivery:
        typeof data.showExpressDelivery === "boolean"
          ? data.showExpressDelivery
          : current.showExpressDelivery,
      showReturnPolicy:
        typeof data.showReturnPolicy === "boolean"
          ? data.showReturnPolicy
          : current.showReturnPolicy,
      returnPolicyType: data.returnPolicyType || current.returnPolicyType,
      returnPolicyDays:
        typeof data.returnPolicyDays === "number" ? data.returnPolicyDays : current.returnPolicyDays,
      returnPolicyCustomText:
        typeof data.returnPolicyCustomText === "string"
          ? data.returnPolicyCustomText.trim()
          : current.returnPolicyCustomText,
    };

    await writeTrustBadgeSettings(updated);
    return { success: true, settings: updated };
  });

/**
 * Resolves effective trust badge configuration for a product.
 * Evaluates: Product override -> Shopify Tags -> Global Defaults
 */
export function resolveEffectiveTrustBadges(
  globalConfig: TrustBadgeConfig,
  override?: ProductTrustBadgeOverride | null,
  tags?: string[],
): ResolvedTrustBadges {
  // If product has explicit override and useGlobalDefault is false
  if (override && override.useGlobalDefault === false) {
    const showQA = override.showQualityAssured ?? globalConfig.showQualityAssured;
    const showExp = override.showExpressDelivery ?? globalConfig.showExpressDelivery;
    const showRet = override.showReturnPolicy ?? globalConfig.showReturnPolicy;
    const retType = override.returnPolicyType ?? globalConfig.returnPolicyType;
    const retDays = override.returnPolicyDays ?? globalConfig.returnPolicyDays ?? 7;
    const customText = override.returnPolicyCustomText?.trim() || "";

    let label = "No Return & Exchange";
    if (retType === "easy_exchange") {
      label = customText || (retDays ? `${retDays} Days Easy Exchange` : "Easy Exchange");
    } else if (retType === "return_available") {
      label = customText || (retDays ? `${retDays} Days Return Available` : "Return Available");
    }

    return {
      showQualityAssured: showQA,
      showExpressDelivery: showExp,
      showReturnPolicy: showRet,
      returnPolicyType: retType,
      returnPolicyDays: retDays,
      returnPolicyLabel: label,
    };
  }

  // Check tags if any tag overrides return policy
  let tagReturnPolicyType: "no_return" | "easy_exchange" | "return_available" | null = null;
  let tagReturnDays: number | null = null;

  if (tags && tags.length > 0) {
    const lowerTags = tags.map((t) => t.toLowerCase().trim());
    if (lowerTags.includes("no-return") || lowerTags.includes("no-return-exchange")) {
      tagReturnPolicyType = "no_return";
    } else if (
      lowerTags.includes("easy-exchange") ||
      lowerTags.some((t) => t.match(/^exchange-\d+-days?$/))
    ) {
      tagReturnPolicyType = "easy_exchange";
      const match = lowerTags.find((t) => t.match(/^exchange-(\d+)-days?$/));
      if (match) {
        const days = match.match(/\d+/);
        if (days) tagReturnDays = parseInt(days[0], 10);
      }
    } else {
      const returnMatch = lowerTags.find((t) =>
        t.match(/^return-(\d+)-days?$|^return-available$/),
      );
      if (returnMatch) {
        tagReturnPolicyType = "return_available";
        const daysMatch = returnMatch.match(/return-(\d+)-days?/);
        if (daysMatch && daysMatch[1]) {
          tagReturnDays = parseInt(daysMatch[1], 10);
        }
      }
    }
  }

  const finalRetType = tagReturnPolicyType ?? globalConfig.returnPolicyType;
  const finalDays = tagReturnDays ?? globalConfig.returnPolicyDays ?? 7;
  const customText = globalConfig.returnPolicyCustomText?.trim() || "";

  let finalLabel = "No Return & Exchange";
  if (finalRetType === "easy_exchange") {
    finalLabel = customText || (finalDays ? `${finalDays} Days Easy Exchange` : "Easy Exchange");
  } else if (finalRetType === "return_available") {
    finalLabel =
      customText || (finalDays ? `${finalDays} Days Return Available` : "Return Available");
  }

  return {
    showQualityAssured: globalConfig.showQualityAssured,
    showExpressDelivery: globalConfig.showExpressDelivery,
    showReturnPolicy: globalConfig.showReturnPolicy,
    returnPolicyType: finalRetType,
    returnPolicyDays: finalDays,
    returnPolicyLabel: finalLabel,
  };
}
