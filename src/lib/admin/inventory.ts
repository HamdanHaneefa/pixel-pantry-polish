import { createServerFn } from "@tanstack/react-start";
import { queryShopifyAdmin } from "./shopify-admin";
import { ADMIN_CONFIG } from "./config";
import { loadProductStockMap, setStockForKeys } from "./stock-storage";

interface UpdateStockInput {
  inventoryItemId?: string | undefined;
  variantId?: string | undefined;
  productId?: string | undefined;
  quantity: number;
  locationId?: string | undefined;
}

export interface VariantStockUpdateItem {
  inventoryItemId?: string | undefined;
  variantId?: string | undefined;
  quantity: number;
}

export interface UpdateMultipleVariantStockInput {
  productId?: string | undefined;
  updates: VariantStockUpdateItem[];
  locationId?: string | undefined;
}

/**
 * Ensures an inventory item has tracking enabled on Shopify so stock counts are tracked and visible
 */
export async function ensureInventoryItemTracked(inventoryItemId: string): Promise<boolean> {
  try {
    const formattedId = inventoryItemId.startsWith("gid://")
      ? inventoryItemId
      : `gid://shopify/InventoryItem/${inventoryItemId}`;

    const res = await queryShopifyAdmin<{
      inventoryItemUpdate?: {
        inventoryItem?: { id: string; tracked: boolean };
        userErrors?: Array<{ field: string[]; message: string }>;
      };
    }>(`
      mutation ensureTracked($id: ID!) {
        inventoryItemUpdate(id: $id, input: { tracked: true }) {
          inventoryItem {
            id
            tracked
          }
          userErrors {
            field
            message
          }
        }
      }
    `, { id: formattedId });

    if (res.inventoryItemUpdate?.userErrors && res.inventoryItemUpdate.userErrors.length > 0) {
      console.warn("[ensureInventoryItemTracked] Warning:", res.inventoryItemUpdate.userErrors);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[ensureInventoryItemTracked] Failed to enable tracking on Shopify:", err);
    return false;
  }
}

/**
 * Sets live inventory quantities on Shopify, ensuring items are tracked and activated at location
 */
export async function setShopifyInventoryQuantities(
  quantities: Array<{ inventoryItemId: string; locationId: string; quantity: number }>
): Promise<{ success: boolean; error?: string }> {
  if (quantities.length === 0) return { success: true };

  // First ensure tracking is enabled on each item
  for (const q of quantities) {
    await ensureInventoryItemTracked(q.inventoryItemId);
  }

  const SET_MUTATION = `
    mutation inventorySetOnHandQuantities($input: InventorySetOnHandQuantitiesInput!) {
      inventorySetOnHandQuantities(input: $input) {
        userErrors {
          field
          message
        }
        inventoryAdjustmentGroup {
          createdAt
          reason
        }
      }
    }
  `;

  try {
    const res = await queryShopifyAdmin<{
      inventorySetOnHandQuantities?: {
        userErrors?: Array<{ field: string[]; message: string }>;
      };
    }>(SET_MUTATION, {
      input: {
        reason: "cycle_count_available",
        setQuantities: quantities,
      },
    });

    const userErrors = res.inventorySetOnHandQuantities?.userErrors || [];
    if (userErrors.length > 0) {
      // Check if item needs to be stocked/activated at the location
      const needsActivation = userErrors.some((e) => {
        const msg = (e.message || "").toLowerCase();
        return msg.includes("not stocked") || msg.includes("activate") || msg.includes("location");
      });

      if (needsActivation) {
        for (const q of quantities) {
          try {
            await queryShopifyAdmin(`
              mutation inventoryActivate($inventoryItemId: ID!, $locationId: ID!) {
                inventoryActivate(inventoryItemId: $inventoryItemId, locationId: $locationId) {
                  inventoryLevel {
                    id
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
            `, {
              inventoryItemId: q.inventoryItemId,
              locationId: q.locationId,
            });
          } catch (actErr) {
            console.warn("[setShopifyInventoryQuantities] Activation error:", actErr);
          }
        }

        // Retry after activation
        const retryRes = await queryShopifyAdmin<{
          inventorySetOnHandQuantities?: {
            userErrors?: Array<{ field: string[]; message: string }>;
          };
        }>(SET_MUTATION, {
          input: {
            reason: "cycle_count_available",
            setQuantities: quantities,
          },
        });

        const retryErrors = retryRes.inventorySetOnHandQuantities?.userErrors || [];
        if (retryErrors.length > 0) {
          const errSummary = retryErrors.map((e) => e.message).join(", ");
          return { success: false, error: errSummary };
        }
        return { success: true };
      }

      const errSummary = userErrors.map((e) => e.message).join(", ");
      return { success: false, error: errSummary };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update Shopify inventory" };
  }
}

export const updateStockFn = createServerFn({ method: "POST" })
  .validator((data: UpdateStockInput) => data)
  .handler(async ({ data }) => {
    try {
      const locationId = (data.locationId || ADMIN_CONFIG.defaultLocationId).trim();
      const targetQuantity = Math.max(0, Math.floor(Number(data.quantity) || 0));

      let resolvedItemId = data.inventoryItemId;

      // If no inventoryItemId provided, resolve it from variantId or productId
      if (!resolvedItemId && data.variantId) {
        try {
          const formattedVId = data.variantId.startsWith("gid://")
            ? data.variantId
            : `gid://shopify/ProductVariant/${data.variantId}`;
          const vRes = await queryShopifyAdmin<{
            productVariant?: { inventoryItem?: { id: string } };
          }>(`
            query getVarInv($id: ID!) {
              productVariant(id: $id) {
                id
                inventoryItem {
                  id
                }
              }
            }
          `, { id: formattedVId });
          resolvedItemId = vRes.productVariant?.inventoryItem?.id;
        } catch (e) {
          console.warn("[updateStockFn] Could not resolve inventoryItemId from variantId:", e);
        }
      }

      if (!resolvedItemId && data.productId) {
        try {
          const formattedPId = data.productId.startsWith("gid://")
            ? data.productId
            : `gid://shopify/Product/${data.productId}`;
          const pRes = await queryShopifyAdmin<{
            product?: { variants?: { edges: Array<{ node: { inventoryItem?: { id: string } } }> } };
          }>(`
            query getProdInv($id: ID!) {
              product(id: $id) {
                id
                variants(first: 1) {
                  edges {
                    node {
                      inventoryItem {
                        id
                      }
                    }
                  }
                }
              }
            }
          `, { id: formattedPId });
          resolvedItemId = pRes.product?.variants?.edges?.[0]?.node?.inventoryItem?.id;
        } catch (e) {
          console.warn("[updateStockFn] Could not resolve inventoryItemId from productId:", e);
        }
      }

      if (!resolvedItemId) {
        // Fallback: Still save to local storage for variant/product keys
        if (data.variantId || data.productId) {
          const keys: string[] = [];
          if (data.variantId) keys.push(data.variantId);
          if (data.productId) keys.push(data.productId);
          setStockForKeys(keys.map((k) => ({ key: k, quantity: targetQuantity })));
        }
        return {
          success: false,
          error: "Could not link to a Shopify inventory item. Check product settings.",
        };
      }

      const formattedItemId = resolvedItemId.startsWith("gid://")
        ? resolvedItemId
        : `gid://shopify/InventoryItem/${resolvedItemId}`;

      const formattedLocationId = locationId.startsWith("gid://")
        ? locationId
        : `gid://shopify/Location/${locationId}`;

      // 1. Always persist to local stock store first so the UI & storefront immediately reflect the update
      setStockForKeys([
        { key: resolvedItemId, quantity: targetQuantity },
        { key: formattedItemId, quantity: targetQuantity },
        ...(data.variantId ? [{ key: data.variantId, quantity: targetQuantity }] : []),
        ...(data.productId ? [{ key: data.productId, quantity: targetQuantity }] : []),
      ]);

      // 2. Synchronize to live Shopify inventory
      const shopifyResult = await setShopifyInventoryQuantities([
        {
          inventoryItemId: formattedItemId,
          locationId: formattedLocationId,
          quantity: targetQuantity,
        },
      ]);

      // Invalidate live stock cache immediately so storefront reflects new stock
      cachedStockInfo = null;

      if (!shopifyResult.success) {
        console.warn("[updateStockFn] Shopify live inventory update warning:", shopifyResult.error);
        return {
          success: true,
          shopifyWarning: shopifyResult.error,
          newQuantity: targetQuantity,
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        success: true,
        newQuantity: targetQuantity,
        updatedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error("[updateStockFn] Error:", err);
      return {
        success: false,
        error: err.message || "Failed to update stock",
      };
    }
  });

export const updateMultipleVariantStockFn = createServerFn({ method: "POST" })
  .validator((data: UpdateMultipleVariantStockInput) => data)
  .handler(async ({ data }) => {
    try {
      const locationId = (data.locationId || ADMIN_CONFIG.defaultLocationId).trim();
      const formattedLocationId = locationId.startsWith("gid://")
        ? locationId
        : `gid://shopify/Location/${locationId}`;

      const resolvedItems: Array<{ inventoryItemId: string; locationId: string; quantity: number }> = [];
      const stockKeys: Array<{ key: string; quantity: number }> = [];

      for (const u of data.updates) {
        const qty = Math.max(0, Math.floor(Number(u.quantity) || 0));
        let invId = u.inventoryItemId;

        if (!invId && u.variantId) {
          try {
            const formattedVId = u.variantId.startsWith("gid://")
              ? u.variantId
              : `gid://shopify/ProductVariant/${u.variantId}`;
            const vRes = await queryShopifyAdmin<{
              productVariant?: { inventoryItem?: { id: string } };
            }>(`
              query getVarInvItem($id: ID!) {
                productVariant(id: $id) {
                  id
                  inventoryItem {
                    id
                  }
                }
              }
            `, { id: formattedVId });
            invId = vRes.productVariant?.inventoryItem?.id;
          } catch (e) {
            console.warn("[updateMultipleVariantStockFn] Lookup error for variant:", u.variantId, e);
          }
        }

        if (invId) {
          const formattedInvId = invId.startsWith("gid://")
            ? invId
            : `gid://shopify/InventoryItem/${invId}`;
          resolvedItems.push({
            inventoryItemId: formattedInvId,
            locationId: formattedLocationId,
            quantity: qty,
          });
          stockKeys.push({ key: invId, quantity: qty });
          stockKeys.push({ key: formattedInvId, quantity: qty });
        }

        if (u.variantId) {
          stockKeys.push({ key: u.variantId, quantity: qty });
        }
      }

      if (stockKeys.length > 0) {
        setStockForKeys(stockKeys);
      }

      let shopifyWarning: string | undefined = undefined;
      if (resolvedItems.length > 0) {
        const shopifyRes = await setShopifyInventoryQuantities(resolvedItems);
        if (!shopifyRes.success) {
          shopifyWarning = shopifyRes.error;
        }
      }

      // Invalidate live stock cache immediately
      cachedStockInfo = null;

      return {
        success: true,
        updatedCount: resolvedItems.length,
        shopifyWarning,
      };
    } catch (err: any) {
      console.error("[updateMultipleVariantStockFn] Error:", err);
      return {
        success: false,
        error: err.message || "Failed to update variant stock",
      };
    }
  });

export interface OutOfStockData {
  outOfStockHandles: string[];
  outOfStockIds: string[];
  skuStockMap: Record<string, number>;
  productStockMap: Record<string, number>;
  variantStockMap: Record<string, number>;
  hiddenIds: string[];
}

let cachedStockInfo: { timestamp: number; data: OutOfStockData } | null = null;
const stockCacheListeners: Array<() => void> = [];

export function registerStockCacheListener(fn: () => void): void {
  stockCacheListeners.push(fn);
}

export function invalidateStockCache(): void {
  cachedStockInfo = null;
  for (const listener of stockCacheListeners) {
    try {
      listener();
    } catch {
      // Ignore listener error
    }
  }
}

function getLocalHiddenIds(): Set<string> {
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = require("node:fs");
      const path = require("node:path");
      const file = path.resolve(process.cwd(), "src", "data", "hidden-products.json");
      if (fs.existsSync(file)) {
        const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {
      // Ignored
    }
  }
  return new Set();
}

export const getOutOfStockInfoFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<OutOfStockData> => {
    try {
      const now = Date.now();

      // Return cached data if fresh (5 minutes)
      if (cachedStockInfo && now - cachedStockInfo.timestamp < 5 * 60 * 1000) {
        return cachedStockInfo.data;
      }

      const localStockMap = loadProductStockMap();
      const localHiddenIds = getLocalHiddenIds();

      // Query products from Admin API to get true inventory for all products & variants
      const adminRes = await queryShopifyAdmin<{
        products?: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              handle: string;
              status: string;
              tags: string[];
              totalInventory?: number;
              variants?: {
                edges: Array<{
                  node: {
                    id: string;
                    title: string;
                    sku?: string;
                    inventoryQuantity?: number;
                    inventoryItem?: { id: string; sku?: string; tracked: boolean };
                  };
                }>;
              };
            };
          }>;
        };
      }>(`{
        products(first: 100, reverse: true) {
          edges {
            node {
              id
              title
              handle
              status
              tags
              totalInventory
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    sku
                    inventoryQuantity
                    inventoryItem {
                      id
                      sku
                      tracked
                    }
                  }
                }
              }
            }
          }
        }
      }`);

      const outOfStockHandles: string[] = [];
      const outOfStockIds: string[] = [];
      const hiddenIdsList: string[] = [];
      const productStockMap: Record<string, number> = {};
      const variantStockMap: Record<string, number> = {};
      const skuStockMap: Record<string, number> = {};

      const products = adminRes?.products?.edges || [];
      for (const edge of products) {
        const node = edge.node;
        const bareId = node.id.split("/").pop() || node.id;
        const handle = node.handle?.toLowerCase();

        const isHiddenByTag = (node.tags || []).some(
          (t) => t.toLowerCase() === "petpedia-hidden" || t.toLowerCase() === "hidden"
        );
        const isArchived = node.status === "ARCHIVED" || node.status === "DRAFT";
        const isHiddenById =
          localHiddenIds.has(node.id) ||
          localHiddenIds.has(bareId) ||
          (handle ? localHiddenIds.has(handle) || localHiddenIds.has(node.handle) : false);

        const isHidden = isHiddenByTag || isArchived || isHiddenById;
        if (isHidden) {
          hiddenIdsList.push(node.id);
          hiddenIdsList.push(bareId);
          if (handle) hiddenIdsList.push(handle);
        }

        const variantsRaw = node.variants?.edges || [];
        let totalStock = 0;

        for (const vEdge of variantsRaw) {
          const v = vEdge.node;
          const vBareId = v.id.split("/").pop() || v.id;
          const invId = v.inventoryItem?.id;
          const sku = (v.sku || v.inventoryItem?.sku || "").trim();

          // Live Shopify inventory is ALWAYS the source of truth
          const vStock =
            typeof v.inventoryQuantity === "number"
              ? v.inventoryQuantity
              : typeof localStockMap[v.id] === "number"
              ? localStockMap[v.id]
              : 0;

          variantStockMap[v.id] = vStock;
          variantStockMap[vBareId] = vStock;
          if (sku) skuStockMap[sku] = vStock;
          totalStock += vStock;
        }

        if (variantsRaw.length === 0) {
          totalStock =
            typeof node.totalInventory === "number"
              ? node.totalInventory
              : 0;
        }

        productStockMap[node.id] = totalStock;
        productStockMap[bareId] = totalStock;
        if (handle) productStockMap[handle] = totalStock;

        // If product has 0 stock or is hidden, register in outOfStock
        if (totalStock <= 0 || isHidden) {
          outOfStockIds.push(node.id);
          outOfStockIds.push(bareId);
          if (handle) outOfStockHandles.push(handle);
        }
      }

      // Also ensure any leftover items in localHiddenIds are added to hiddenIdsList
      for (const hid of localHiddenIds) {
        if (!hiddenIdsList.includes(hid)) {
          hiddenIdsList.push(hid);
          hiddenIdsList.push(String(hid).toLowerCase());
        }
      }

      const result: OutOfStockData = {
        outOfStockHandles,
        outOfStockIds,
        skuStockMap,
        productStockMap,
        variantStockMap,
        hiddenIds: hiddenIdsList,
      };

      cachedStockInfo = { timestamp: now, data: result };
      return result;
    } catch (err) {
      console.error("[getOutOfStockInfoFn] Failed:", err);
      return {
        outOfStockHandles: [],
        outOfStockIds: [],
        skuStockMap: {},
        productStockMap: {},
        variantStockMap: {},
        hiddenIds: [],
      };
    }
  }
);

