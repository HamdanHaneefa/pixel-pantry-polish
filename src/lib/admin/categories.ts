import { createServerFn } from "@tanstack/react-start";
import { queryStorefront, queryShopifyAdmin } from "./shopify-admin";
import defaultCustomCategories from "@/data/custom-categories.json";
import { adminAuthMiddleware } from "./auth";
import { storageGet, storageSet } from "@/lib/storage/adapter";

export interface AdminCategory {
  id: string;
  title: string;
  handle: string;
  productCount: number;
}

const GET_COLLECTIONS_QUERY = `{
  collections(first: 50) {
    edges {
      node {
        id
        title
        handle
        products(first: 250) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
}`;

let inMemoryCustomCategories: AdminCategory[] = Array.isArray(defaultCustomCategories)
  ? [...defaultCustomCategories]
  : [];

async function loadCustomCategories(): Promise<AdminCategory[]> {
  const fallback = inMemoryCustomCategories;
  const loaded = await storageGet<AdminCategory[]>("custom-categories", fallback);
  inMemoryCustomCategories = loaded;
  return loaded;
}

async function saveCustomCategories(categories: AdminCategory[]): Promise<void> {
  inMemoryCustomCategories = [...categories];
  await storageSet("custom-categories", categories);
}

export const getCategoriesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminCategory[]> => {
    try {
      const data = await queryStorefront<{
        collections: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              handle: string;
              products: {
                edges: Array<{ node: { id: string } }>;
              };
            };
          }>;
        };
      }>(GET_COLLECTIONS_QUERY).catch(() => null);

      const shopifyList: AdminCategory[] = (data?.collections?.edges || []).map((e) => ({
        id: e.node.id,
        title: e.node.title,
        handle: e.node.handle,
        productCount: e.node.products?.edges?.length || 0,
      }));

      const customList = await loadCustomCategories();
      const map = new Map<string, AdminCategory>();

      shopifyList.forEach((c) => map.set(c.title.toLowerCase(), c));
      customList.forEach((c) => {
        if (!map.has(c.title.toLowerCase())) {
          map.set(c.title.toLowerCase(), c);
        }
      });

      return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
    } catch (err) {
      console.error("[getCategoriesFn] Error:", err);
      return await loadCustomCategories();
    }
  },
);

export const createCategoryFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((data: { title: string }) => data)
  .handler(async ({ data }) => {
    const title = data.title.trim();
    if (!title) {
      return { success: false, error: "Category title is required" };
    }

    const handle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const newCategory: AdminCategory = {
      id: `gid://shopify/Collection/custom-${Date.now()}`,
      title,
      handle,
      productCount: 0,
    };

    // Attempt creation on Shopify Admin API (if write_products scope is enabled)
    try {
      await queryShopifyAdmin(
        `mutation CreateCollection($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection { id title handle }
            userErrors { message field }
          }
        }`,
        { input: { title } },
      );
    } catch {
      // Graceful fallback to persistent custom store
    }

    // Persist to custom categories
    const existing = await loadCustomCategories();
    if (!existing.some((c) => c.title.toLowerCase() === title.toLowerCase())) {
      existing.push(newCategory);
      await saveCustomCategories(existing);
    }

    return { success: true, category: newCategory };
  });
