import { isShopifyConfigured, shopifyFetch } from "./client";
import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_BY_HANDLE_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "./queries";
import {
  ShopifyProductsResponse,
  ShopifySingleProductResponse,
  ShopifyCollectionsResponse,
  ShopifyCollectionByHandleResponse,
  ShopifySearchResponse,
} from "./types";
import { normalizeShopifyProduct, normalizeAdminProduct } from "./normalize";
import { allProductsCatalog, hotPicks, bestsellers, columnProducts, Product } from "@/data/home";

import { getOutOfStockInfoFn } from "@/lib/admin/inventory";
import { getHiddenProductIdsFn, getAdminProductsFn } from "@/lib/admin/products";

export type ShopifyCollectionItem = {
  id: string;
  title: string;
  handle: string;
  image?: string | undefined;
  description?: string | undefined;
};

export type OutOfStockLookup = {
  handles: Set<string>;
  ids: Set<string>;
  skuMap: Record<string, number>;
  hiddenIds: Set<string>;
};

/**
 * Safely retrieve real-time out-of-stock data and hidden products from Admin
 */
export async function fetchOutOfStockLookup(): Promise<OutOfStockLookup> {
  try {
    const [res, hiddenList] = await Promise.all([
      getOutOfStockInfoFn().catch(() => null),
      getHiddenProductIdsFn().catch(() => []),
    ]);

    const hiddenIds = new Set<string>();
    for (const h of hiddenList || []) {
      if (!h) continue;
      hiddenIds.add(h);
      hiddenIds.add(String(h).toLowerCase());
      const bare = String(h).split("/").pop();
      if (bare) {
        hiddenIds.add(bare);
        hiddenIds.add(bare.toLowerCase());
      }
    }

    return {
      handles: new Set((res?.outOfStockHandles || []).map((h) => h.toLowerCase())),
      ids: new Set(res?.outOfStockIds || []),
      skuMap: res?.skuStockMap || {},
      hiddenIds,
    };
  } catch (err) {
    console.warn("[fetchOutOfStockLookup] Fallback to availableForSale:", err);
    return { handles: new Set(), ids: new Set(), skuMap: {}, hiddenIds: new Set() };
  }
}

/**
 * Check if product is hidden by merchant in Admin
 */
export function isProductHidden(
  p: Product,
  oosLookup?: OutOfStockLookup
): boolean {
  if (
    p.tags &&
    p.tags.some(
      (t) => t.toLowerCase() === "petpedia-hidden" || t.toLowerCase() === "hidden"
    )
  ) {
    return true;
  }
  if (!oosLookup?.hiddenIds || oosLookup.hiddenIds.size === 0) return false;
  if (p.id) {
    if (oosLookup.hiddenIds.has(p.id) || oosLookup.hiddenIds.has(p.id.toLowerCase())) return true;
    const bare = p.id.split("/").pop();
    if (bare && (oosLookup.hiddenIds.has(bare) || oosLookup.hiddenIds.has(bare.toLowerCase()))) return true;
  }
  if (p.handle) {
    if (oosLookup.hiddenIds.has(p.handle) || oosLookup.hiddenIds.has(p.handle.toLowerCase())) return true;
  }
  return false;
}

/**
 * Filter to verify product is in-stock and available for purchase
 */
export function isProductInStock(
  p: Product,
  oosLookup?: OutOfStockLookup
): boolean {
  if (isProductHidden(p, oosLookup)) return false;
  if (p.availableForSale === false) return false;

  // Filter out if tracked as out of stock in live Shopify inventory
  if (oosLookup) {
    if (p.handle && oosLookup.handles.has(p.handle.toLowerCase())) {
      return false;
    }
    if (p.id) {
      if (oosLookup.ids.has(p.id)) return false;
      const bareId = p.id.split("/").pop();
      if (bareId && oosLookup.ids.has(bareId)) return false;
    }
  }

  // Check custom products with explicit stockQuantity
  if (typeof (p as any).stockQuantity === "number") {
    return (p as any).stockQuantity > 0;
  }

  if (
    p.variants &&
    p.variants.length > 0 &&
    p.variants.every((v) => v.availableForSale === false)
  ) {
    return false;
  }
  return true;
}

// Helper for catalog products
export function getAllMockProducts(): Product[] {
  return allProductsCatalog;
}

/**
 * Fetch products from Shopify, automatically incorporating all store products
 * even if they haven't been manually assigned to the Headless sales channel.
 */
export async function getProducts(options: {
  first?: number | undefined;
  after?: string | undefined;
  sortKey?: string | undefined;
  reverse?: boolean | undefined;
  query?: string | undefined;
} = {}): Promise<{
  products: Product[];
  pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  isLiveShopify: boolean;
}> {
  const { first = 24, after, sortKey, reverse, query } = options;
  const oosLookup = await fetchOutOfStockLookup();

  // 1. Fetch live products from Admin API (includes all products regardless of sales channel activation!)
  let adminProducts: Product[] = [];
  try {
    const rawAdmin = await getAdminProductsFn();
    if (rawAdmin && rawAdmin.length > 0) {
      adminProducts = rawAdmin
        .filter((p) => !p.hidden && !isProductHidden(normalizeAdminProduct(p), oosLookup))
        .map(normalizeAdminProduct);
    }
  } catch (adminErr) {
    console.warn("[getProducts] Admin live fetch error:", adminErr);
  }

  // 2. Fetch Storefront products
  let sfProducts: Product[] = [];
  let sfPageInfo = { hasNextPage: false, endCursor: null as string | null };
  if (isShopifyConfigured()) {
    try {
      const data = await shopifyFetch<ShopifyProductsResponse>(
        GET_PRODUCTS_QUERY,
        { first, after, sortKey, reverse, query }
      );

      if (data?.products?.edges && data.products.edges.length > 0) {
        sfProducts = data.products.edges
          .map((e) => normalizeShopifyProduct(e.node))
          .filter((p) => !isProductHidden(p, oosLookup));
        sfPageInfo = data.products.pageInfo;
      }
    } catch (error) {
      console.warn("[Shopify getProducts failed]:", error);
    }
  }

  // 3. Merge: deduplicate by ID and handle
  const seenIds = new Set<string>();
  const seenHandles = new Set<string>();
  const combined: Product[] = [];

  for (const p of [...adminProducts, ...sfProducts]) {
    const bareId = p.id.split("/").pop() || p.id;
    const handle = p.handle?.toLowerCase() || "";
    if (!seenIds.has(bareId) && (!handle || !seenHandles.has(handle))) {
      seenIds.add(bareId);
      if (handle) seenHandles.add(handle);
      combined.push(p);
    }
  }

  if (combined.length > 0) {
    let result = combined;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.productType && p.productType.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))) ||
          (p.vendor && p.vendor.toLowerCase().includes(q))
      );
    }

    return {
      products: result.slice(0, first),
      pageInfo: sfPageInfo,
      isLiveShopify: true,
    };
  }

  // Fallback to complete catalog
  let all = getAllMockProducts().filter((p) => !isProductHidden(p, oosLookup));
  if (query) {
    const q = query.toLowerCase();
    all = all.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.productType && p.productType.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))) ||
        (p.vendor && p.vendor.toLowerCase().includes(q))
    );
  }

  return {
    products: all.slice(0, first),
    pageInfo: {
      hasNextPage: all.length > first,
      endCursor: null,
    },
    isLiveShopify: false,
  };
}

/**
 * Fetch products by collection handle, incorporating all live store products
 */
export async function getProductsByCollection(
  handle: string,
  first = 24
): Promise<{ products: Product[]; isLiveShopify: boolean }> {
  const oosLookup = await fetchOutOfStockLookup();
  const normHandle = handle.toLowerCase().replace(/-/g, " ");

  // 1. Fetch live admin products matching this collection / category
  let adminMatches: Product[] = [];
  try {
    const rawAdmin = await getAdminProductsFn();
    if (rawAdmin && rawAdmin.length > 0) {
      const matchingAdmin = rawAdmin.filter((p) => {
        if (p.hidden || isProductHidden(normalizeAdminProduct(p), oosLookup)) return false;
        if (normHandle === "all" || normHandle === "all products") return true;
        const cat = (p.category || "").toLowerCase();
        const title = p.title.toLowerCase();
        return cat.includes(normHandle) || normHandle.includes(cat) || title.includes(normHandle);
      });
      adminMatches = matchingAdmin.map(normalizeAdminProduct);
    }
  } catch (adminErr) {
    console.warn("[getProductsByCollection] Admin lookup fallback:", adminErr);
  }

  // 2. Fetch Storefront collection
  let sfProducts: Product[] = [];
  if (isShopifyConfigured()) {
    try {
      const data = await shopifyFetch<ShopifyCollectionByHandleResponse>(
        GET_COLLECTION_BY_HANDLE_QUERY,
        { handle, first }
      );

      if (data?.collection?.products?.edges && data.collection.products.edges.length > 0) {
        sfProducts = data.collection.products.edges
          .map((e) => normalizeShopifyProduct(e.node))
          .filter((p) => !isProductHidden(p, oosLookup));
      }
    } catch (error) {
      console.warn(`[Shopify getProductsByCollection "${handle}" failed]:`, error);
    }
  }

  // 3. Merge products
  const seenIds = new Set<string>();
  const combined: Product[] = [];
  for (const p of [...adminMatches, ...sfProducts]) {
    const bareId = p.id.split("/").pop() || p.id;
    if (!seenIds.has(bareId)) {
      seenIds.add(bareId);
      combined.push(p);
    }
  }

  if (combined.length > 0) {
    return {
      products: combined.slice(0, first),
      isLiveShopify: true,
    };
  }

  // Fallback: Filter catalog by collection tag or category
  const all = getAllMockProducts().filter((p) => isProductInStock(p, oosLookup));
  const filtered = all.filter((p) => {
    if (normHandle === "all" || normHandle === "all products") return true;
    const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(normHandle) || normHandle.includes(t.toLowerCase()));
    const typeMatch = p.productType?.toLowerCase().includes(normHandle) || normHandle.includes(p.productType?.toLowerCase() || "");
    const titleMatch = p.title.toLowerCase().includes(normHandle);
    return tagMatch || typeMatch || titleMatch;
  });

  return {
    products: (filtered.length > 0 ? filtered : all).slice(0, first),
    isLiveShopify: false,
  };
}

/**
 * Fetch a single product by handle, checking live store products first
 */
export async function getProductByHandle(
  handle: string
): Promise<{ product: Product | null; isLiveShopify: boolean }> {
  const oosLookup = await fetchOutOfStockLookup();
  const normalizedHandle = handle.toLowerCase();

  // 1. Check live admin products first (visible even if sales channels are not yet enabled in Shopify)
  try {
    const rawAdmin = await getAdminProductsFn();
    const foundAdmin = rawAdmin?.find(
      (p) =>
        p.handle?.toLowerCase() === normalizedHandle ||
        p.id.toLowerCase() === normalizedHandle ||
        p.id.split("/").pop() === normalizedHandle
    );

    if (foundAdmin) {
      const prod = normalizeAdminProduct(foundAdmin);
      if (isProductHidden(prod, oosLookup)) {
        return { product: null, isLiveShopify: false };
      }
      if (!isProductInStock(prod, oosLookup)) {
        prod.availableForSale = false;
        if (prod.variants) {
          prod.variants.forEach((v) => {
            v.availableForSale = false;
          });
        }
      }
      return { product: prod, isLiveShopify: true };
    }
  } catch (adminErr) {
    console.warn("[getProductByHandle] Admin lookup error:", adminErr);
  }

  if (isShopifyConfigured()) {
    try {
      const data = await shopifyFetch<ShopifySingleProductResponse>(
        GET_PRODUCT_BY_HANDLE_QUERY,
        { handle }
      );

      if (data?.product) {
        const prod = normalizeShopifyProduct(data.product);
        if (isProductHidden(prod, oosLookup)) {
          return { product: null, isLiveShopify: false };
        }
        if (!isProductInStock(prod, oosLookup)) {
          prod.availableForSale = false;
          if (prod.variants) {
            prod.variants.forEach((v) => {
              v.availableForSale = false;
            });
          }
        }

        return {
          product: prod,
          isLiveShopify: true,
        };
      }
    } catch (error) {
      console.warn(`[Shopify getProductByHandle failed for "${handle}"]:`, error);
    }
  }

  // Fallback to catalog matching handle or id
  const all = getAllMockProducts();
  const found =
    all.find(
      (p) =>
        p.handle?.toLowerCase() === normalizedHandle ||
        p.id.toLowerCase() === normalizedHandle
    ) ||
    all[0] ||
    null;

  return { product: found, isLiveShopify: false };
}

/**
 * Fetch collections
 */
export async function getCollections(first = 50): Promise<{
  collections: ShopifyCollectionItem[];
  isLiveShopify: boolean;
}> {
  if (isShopifyConfigured()) {
    try {
      const data = await shopifyFetch<ShopifyCollectionsResponse>(
        GET_COLLECTIONS_QUERY,
        { first }
      );

      if (data?.collections?.edges) {
        return {
          collections: data.collections.edges.map(({ node }) => ({
            id: node.id,
            title: node.title,
            handle: node.handle,
            description: node.description,
            image: node.image?.url,
          })),
          isLiveShopify: true,
        };
      }
    } catch (error) {
      console.warn("[Shopify getCollections failed]:", error);
    }
  }

  return {
    collections: [],
    isLiveShopify: false,
  };
}

/**
 * Search products
 */
export async function searchProducts(
  query: string,
  first = 20,
  after?: string
): Promise<{
  products: Product[];
  totalCount: number;
  isLiveShopify: boolean;
}> {
  if (isShopifyConfigured() && query.trim()) {
    try {
      const oosLookup = await fetchOutOfStockLookup();
      const data = await shopifyFetch<ShopifySearchResponse>(
        SEARCH_PRODUCTS_QUERY,
        { query, first, after }
      );

      if (data?.search?.edges) {
        const products = data.search.edges
          .map((e) => normalizeShopifyProduct(e.node))
          .filter((p) => isProductInStock(p, oosLookup));

        return {
          products,
          totalCount: products.length,
          isLiveShopify: true,
        };
      }
    } catch (error) {
      console.warn("[Shopify searchProducts failed]:", error);
    }
  }

  const { products } = await getProducts({ query, first });
  return {
    products,
    totalCount: products.length,
    isLiveShopify: false,
  };
}
