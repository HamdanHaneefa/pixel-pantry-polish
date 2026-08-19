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
import { hotPicks, bestsellers, columnProducts, Product } from "@/data/home";

export type ShopifyCollectionItem = {
  id: string;
  title: string;
  handle: string;
  image?: string | undefined;
  description?: string | undefined;
};

// Helper for combined mock products
export function getAllMockProducts(): Product[] {
  const map = new Map<string, Product>();
  [
    ...hotPicks,
    ...bestsellers,
    ...columnProducts.flatMap((c) => c.items),
  ].forEach((p) => {
    if (!map.has(p.id)) {
      map.set(p.id, {
        ...p,
        handle:
          p.handle ||
          p.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        images: p.images || [p.image],
        description:
          p.description ||
          "Premium quality pet product crafted with high nutrition, natural ingredients and designed to keep your furry friend healthy, vibrant, and energetic.",
        availableForSale: true,
        variants: p.variants || [
          {
            id: `var_${p.id}`,
            title: "Default Size / Pack",
            price: p.price,
            compareAtPrice: p.mrp,
            availableForSale: true,
            image: p.image,
          },
        ],
      });
    }
  });
  return Array.from(map.values());
}

/**
 * Fetch products from Shopify, with automatic fallback to mock catalog
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

      if (data?.products?.edges) {
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
      console.warn("[Shopify getProducts failed, falling back to mock]:", error);
    }
  }

  // Fallback to mock catalog
  let all = getAllMockProducts();
  if (query) {
    const q = query.toLowerCase();
    all = all.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
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
  first = 12
): Promise<{ products: Product[]; isLiveShopify: boolean }> {
  if (isShopifyConfigured()) {
    try {
      const data = await shopifyFetch<ShopifyCollectionByHandleResponse>(
        GET_COLLECTION_BY_HANDLE_QUERY,
        { handle, first }
      );

      if (data?.collection?.products?.edges) {
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

  // Fallback
  const { products } = await getProducts({ query: handle, first });
  return { products, isLiveShopify: false };
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
