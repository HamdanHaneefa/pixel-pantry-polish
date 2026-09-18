import { createServerFn } from "@tanstack/react-start";
import { queryShopifyAdmin } from "./shopify-admin";
import { ADMIN_CONFIG } from "./config";
import { loadProductStockMap, setStockForKeys } from "./stock-storage";

interface UpdateStockInput {
  inventoryItemId: string;
  quantity: number;
  locationId?: string | undefined;
}

const SET_INVENTORY_MUTATION = `
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

export const updateStockFn = createServerFn({ method: "POST" })
  .validator((data: UpdateStockInput) => data)
  .handler(async ({ data }) => {
    try {
      const locationId = data.locationId || ADMIN_CONFIG.defaultLocationId;
      const targetQuantity = Math.max(0, Math.floor(Number(data.quantity) || 0));

      const formattedItemId = data.inventoryItemId.startsWith("gid://")
        ? data.inventoryItemId
        : `gid://shopify/InventoryItem/${data.inventoryItemId}`;

      const formattedLocationId = locationId.startsWith("gid://")
        ? locationId
        : `gid://shopify/Location/${locationId}`;

      // 1. Always persist to local stock store first so the UI & storefront immediately reflect the update
      setStockForKeys([
        { key: data.inventoryItemId, quantity: targetQuantity },
        { key: formattedItemId, quantity: targetQuantity },
      ]);

      // 2. Also attempt updating Shopify inventory if write_inventory permission exists
      try {
        await queryShopifyAdmin(SET_INVENTORY_MUTATION, {
          input: {
            reason: "cycle_count_available",
            setQuantities: [
              {
                inventoryItemId: formattedItemId,
                locationId: formattedLocationId,
                quantity: targetQuantity,
              },
            ],
          },
        });
      } catch (shopErr) {
        // Silently tolerate missing write_inventory scope
        console.info("[updateStockFn] Shopify live inventory update skipped (local stock persisted):", shopErr);
      }

      // Invalidate live stock cache immediately so storefront reflects new stock
      cachedStockInfo = null;

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

export interface OutOfStockData {
  outOfStockHandles: string[];
  outOfStockIds: string[];
  skuStockMap: Record<string, number>;
}

let cachedStockInfo: { timestamp: number; data: OutOfStockData } | null = null;

export const getOutOfStockInfoFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<OutOfStockData> => {
    const now = Date.now();
    // Cache for 10 seconds to keep storefront fast while reacting quickly to stock changes
    if (cachedStockInfo && now - cachedStockInfo.timestamp < 10000) {
      return cachedStockInfo.data;
    }

    try {
      // 1. Fetch Storefront products
      const sfPromise = fetch(
        `https://${ADMIN_CONFIG.storeDomain}/api/${ADMIN_CONFIG.apiVersion}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": ADMIN_CONFIG.storefrontToken,
          },
          body: JSON.stringify({
            query: `{
              products(first: 100) {
                edges {
                  node {
                    id
                    title
                    handle
                    availableForSale
                    variants(first: 25) {
                      edges {
                        node {
                          id
                          sku
                          availableForSale
                        }
                      }
                    }
                  }
                }
              }
            }`,
          }),
        }
      ).then((r) => r.json());

      // 2. Fetch Admin Inventory Items (without inventoryLevels to avoid permission error)
      const adminInvPromise = queryShopifyAdmin<{
        inventoryItems: {
          edges: Array<{
            node: {
              id: string;
              sku: string;
              tracked: boolean;
            };
          }>;
        };
      }>(`{
        inventoryItems(first: 100) {
          edges {
            node {
              id
              sku
              tracked
            }
          }
        }
      }`).catch((err) => {
        console.warn("[getOutOfStockInfoFn] Admin inventory query skipped:", err);
        return null;
      });

      const [sfRes, adminRes] = await Promise.all([sfPromise, adminInvPromise]);
      const localStockMap = loadProductStockMap();

      const skuStockMap: Record<string, number> = {};
      const invEdges = adminRes?.inventoryItems?.edges || [];
      for (const edge of invEdges) {
        const sku = (edge.node.sku || "").trim();
        const itemId = edge.node.id;
        const qty = localStockMap[itemId] ?? localStockMap[sku] ?? (edge.node.tracked ? 0 : 10);
        if (sku) {
          skuStockMap[sku] = qty;
        }
      }

      const outOfStockHandles: string[] = [];
      const outOfStockIds: string[] = [];

      const sfEdges = sfRes?.data?.products?.edges || [];
      sfEdges.forEach((e: any, idx: number) => {
        const node = e.node;
        const variants = node.variants?.edges || [];

        let totalStock = 0;
        let anyVariantTracked = false;

        variants.forEach((vEdge: any) => {
          const v = vEdge.node;
          const sku = (v.sku || "").trim();
          if (sku && skuStockMap[sku] !== undefined) {
            anyVariantTracked = true;
            totalStock += skuStockMap[sku] || 0;
          }
        });

        // If no variant SKUs were tracked, fallback to local stock or position index
        if (!anyVariantTracked && invEdges[idx]) {
          const edgeItem = invEdges[idx].node;
          totalStock = localStockMap[edgeItem.id] ?? (edgeItem.tracked ? 0 : 10);
          anyVariantTracked = true;
        }

        const isInStock =
          node.availableForSale !== false && (anyVariantTracked ? totalStock > 0 : true);

        if (!isInStock) {
          if (node.handle) outOfStockHandles.push(node.handle.toLowerCase());
          if (node.id) {
            outOfStockIds.push(node.id);
            const bareId = node.id.split("/").pop();
            if (bareId) outOfStockIds.push(bareId);
          }
        }
      });

      const result: OutOfStockData = {
        outOfStockHandles,
        outOfStockIds,
        skuStockMap,
      };

      cachedStockInfo = { timestamp: now, data: result };
      return result;
    } catch (err) {
      console.error("[getOutOfStockInfoFn] Failed:", err);
      return {
        outOfStockHandles: [],
        outOfStockIds: [],
        skuStockMap: {},
      };
    }
  }
);

