import { createServerFn } from "@tanstack/react-start";
import { queryStorefront, queryShopifyAdmin } from "./shopify-admin";
import fs from "node:fs";
import path from "node:path";

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
        products(first: 50) {
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

function getCustomCategoriesFilePath(): string {
  return path.resolve(process.cwd(), "src", "data", "custom-categories.json");
}

function loadCustomCategories(): AdminCategory[] {
  try {
    const file = getCustomCategoriesFilePath();
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, "utf-8");
      return JSON.parse(raw) as AdminCategory[];
    }
  } catch (err) {
    console.warn("[loadCustomCategories] Error reading file:", err);
  }
  return [];
}

function saveCustomCategories(categories: AdminCategory[]): void {
  try {
    const file = getCustomCategoriesFilePath();
    fs.writeFileSync(file, JSON.stringify(categories, null, 2), "utf-8");
  } catch (err) {
    console.error("[saveCustomCategories] Error writing file:", err);
  }
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

      const customList = loadCustomCategories();
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
      return loadCustomCategories();
    }
  }
);

export const createCategoryFn = createServerFn({ method: "POST" })
  .validator((data: { title: string }) => data)
  .handler(async ({ data }) => {
    const title = data.title.trim();
    if (!title) {
      return { success: false, error: "Category title is required" };
    }

    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newCategory: AdminCategory = {
      id: `gid://shopify/Collection/custom-${Date.now()}`,
      title,
      handle,
      productCount: 0,
    };

    // Attempt creation on Shopify Admin API (if write_products scope is enabled)
    try {
      await queryShopifyAdmin(`mutation {
        collectionCreate(input: { title: "${title.replace(/"/g, '\\"')}" }) {
          collection { id title handle }
          userErrors { message }
        }
      }`);
    } catch {
      // Graceful fallback to persistent custom store
    }

    // Persist to custom categories
    const existing = loadCustomCategories();
    if (!existing.some((c) => c.title.toLowerCase() === title.toLowerCase())) {
      existing.push(newCategory);
      saveCustomCategories(existing);
    }

    return { success: true, category: newCategory };
  });
