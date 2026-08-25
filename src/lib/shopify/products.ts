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
import { normalizeShopifyProduct } from "./normalize";
import { allProductsCatalog, hotPicks, bestsellers, columnProducts, Product } from "@/data/home";

export type ShopifyCollectionItem = {
  id: string;
  title: string;
  handle: string;
  image?: string | undefined;
  description?: string | undefined;
};

// Helper for catalog products
export function getAllMockProducts(): Product[] {
  return allProductsCatalog;
}

/**
 * Fetch products from Shopify, with automatic fallback to catalog
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

  if (isShopifyConfigured()) {
    try {
      const data = await shopifyFetch<ShopifyProductsResponse>(
        GET_PRODUCTS_QUERY,
        { first, after, sortKey, reverse, query }
      );

      if (data?.products?.edges && data.products.edges.length > 0) {
        const products = data.products.edges.map((e) =>
          normalizeShopifyProduct(e.node)
        );
        return {
          products,
          pageInfo: data.products.pageInfo,
          isLiveShopify: true,
        };
      }
    } catch (error) {
      console.warn("[Shopify getProducts failed, falling back to catalog]:", error);
    }
  }

  // Fallback to complete catalog
  let all = getAllMockProducts();
  if (query) {
    const q = query.toLowerCase();
    all = all.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.productType && p.productType.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
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
 * Fetch products by collection handle
 */
export async function getProductsByCollection(
  handle: string,
  first = 24
): Promise<{ products: Product[]; isLiveShopify: boolean }> {
  if (isShopifyConfigured()) {
    try {
      const data = await shopifyFetch<ShopifyCollectionByHandleResponse>(
        GET_COLLECTION_BY_HANDLE_QUERY,
        { handle, first }
      );

      if (data?.collection?.products?.edges && data.collection.products.edges.length > 0) {
        const products = data.collection.products.edges.map((e) =>
          normalizeShopifyProduct(e.node)
        );
        return {
          products,
          isLiveShopify: true,
        };
      }
    } catch (error) {
      console.warn(`[Shopify getProductsByCollection "${handle}" failed]:`, error);
    }
  }

  // Fallback: Filter catalog by collection tag or category
  const all = getAllMockProducts();
  const normalizedHandle = handle.toLowerCase().replace(/-/g, " ");
  const filtered = all.filter((p) => {
    if (normalizedHandle === "all" || normalizedHandle === "all products") return true;
    const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(normalizedHandle) || normalizedHandle.includes(t.toLowerCase()));
    const typeMatch = p.productType?.toLowerCase().includes(normalizedHandle) || normalizedHandle.includes(p.productType?.toLowerCase() || "");
    const titleMatch = p.title.toLowerCase().includes(normalizedHandle);
    return tagMatch || typeMatch || titleMatch;
  });

  return {
    products: (filtered.length > 0 ? filtered : all).slice(0, first),
    isLiveShopify: false,
  };
}

/**
 * Fetch a single product by handle
 */
export async function getProductByHandle(
  handle: string
): Promise<{ product: Product | null; isLiveShopify: boolean }> {
  if (isShopifyConfigured()) {
    try {
      const data = await shopifyFetch<ShopifySingleProductResponse>(
        GET_PRODUCT_BY_HANDLE_QUERY,
        { handle }
      );

      if (data?.product) {
        return {
          product: normalizeShopifyProduct(data.product),
          isLiveShopify: true,
        };
      }
    } catch (error) {
      console.warn(`[Shopify getProductByHandle failed for "${handle}"]:`, error);
    }
  }

  // Fallback to mock catalog matching handle or id
  const all = getAllMockProducts();
  const normalizedHandle = handle.toLowerCase();
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
      const data = await shopifyFetch<ShopifySearchResponse>(
        SEARCH_PRODUCTS_QUERY,
        { query, first, after }
      );

      if (data?.search?.edges) {
        return {
          products: data.search.edges.map((e) =>
            normalizeShopifyProduct(e.node)
          ),
          totalCount: data.search.totalCount,
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
