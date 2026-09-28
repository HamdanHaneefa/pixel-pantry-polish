import { createServerFn } from "@tanstack/react-start";
import { queryStorefront, queryShopifyAdmin } from "./shopify-admin";
import { loadProductStockMap, setStockForKeys } from "./stock-storage";
import { setShopifyInventoryQuantities, invalidateStockCache } from "./inventory";
import { ADMIN_CONFIG } from "./config";
import defaultHiddenProducts from "@/data/hidden-products.json";
import { allProductsCatalog } from "@/data/home";

export interface AdminProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number | undefined;
  sku?: string | undefined;
  inventoryItemId?: string | undefined;
  stockQuantity: number;
  availableForSale: boolean;
  image?: string | undefined;
}

export interface AdminProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface AdminProduct {
  id: string;
  title: string;
  handle: string;
  imageUrl: string;
  price: number;
  compareAtPrice?: number | undefined;
  category: string;
  categoryHandle?: string | undefined;
  sku: string;
  variantId: string;
  inventoryItemId?: string | undefined;
  stockQuantity: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  availableForSale: boolean;
  description?: string | undefined;
  images?: string[] | undefined;
  options?: AdminProductOption[] | undefined;
  variants?: AdminProductVariant[] | undefined;
  hidden?: boolean;
}

let inMemoryHiddenProductIds: string[] = Array.isArray(defaultHiddenProducts)
  ? [...defaultHiddenProducts]
  : [];

export function loadHiddenProductIds(): string[] {
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = require("node:fs");
      const path = require("node:path");
      const file = path.resolve(process.cwd(), "src", "data", "hidden-products.json");
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryHiddenProductIds = parsed;
        }
      }
    } catch {
      // Ignored
    }
  }
  return inMemoryHiddenProductIds;
}

export function saveHiddenProductIds(ids: string[]): void {
  inMemoryHiddenProductIds = Array.from(new Set(ids));
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = require("node:fs");
      const path = require("node:path");
      const file = path.resolve(process.cwd(), "src", "data", "hidden-products.json");
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(file, JSON.stringify(inMemoryHiddenProductIds, null, 2), "utf-8");
    } catch {
      // Non-fatal in edge/browser environments
    }
  }
}

// Direct Admin GraphQL query: returns ALL products in the store regardless of sales channel publication
const ADMIN_PRODUCTS_QUERY = `
  query getAdminProducts {
    products(first: 100, reverse: true) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          productType
          status
          tags
          totalInventory
          featuredImage {
            url
            altText
          }
          images(first: 25) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          options {
            id
            name
            values
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                price
                compareAtPrice
                inventoryQuantity
                inventoryItem {
                  id
                  sku
                  tracked
                }
                image {
                  id
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;

const STOREFRONT_FALLBACK_QUERY = `{
  products(first: 100) {
    edges {
      node {
        id
        title
        handle
        description
        productType
        tags
        availableForSale
        featuredImage {
          url
        }
        images(first: 10) {
          edges {
            node {
              url
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
          }
        }
        variants(first: 25) {
          edges {
            node {
              id
              title
              sku
              availableForSale
              price {
                amount
              }
              compareAtPrice {
                amount
              }
              image {
                url
              }
            }
          }
        }
      }
    }
  }
}`;

export function formatShopifyAdminProductNode(
  node: any,
  stockMap: Record<string, number>,
  hiddenIds: Set<string>,
  idx = 0
): AdminProduct {
  const variantsRaw = node.variants?.edges || [];

  // Format variants using live Shopify inventory
  const variantsList: AdminProductVariant[] = variantsRaw.map((vEdge: any) => {
    const v = vEdge.node || vEdge;
    const vPrice = parseFloat(v.price || "0");
    const vCompare = v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined;
    const vSku = (v.sku || v.inventoryItem?.sku || "").trim();
    const vId = v.id;
    const invItemId = v.inventoryItem?.id;

    // Live Shopify inventory is ALWAYS authoritative
    const vStock =
      typeof v.inventoryQuantity === "number"
        ? v.inventoryQuantity
        : typeof stockMap[vId] === "number"
        ? stockMap[vId]
        : 0;

    return {
      id: v.id,
      title: v.title || "Default Title",
      price: vPrice,
      compareAtPrice: vCompare,
      sku: vSku,
      inventoryItemId: invItemId,
      stockQuantity: vStock,
      availableForSale: vStock > 0,
      image: v.image?.url,
    };
  });

  // Product-level stock: live sum of variants' inventory or Shopify totalInventory
  const totalStock =
    variantsList.length > 0
      ? variantsList.reduce((acc, v) => acc + v.stockQuantity, 0)
      : typeof node.totalInventory === "number"
      ? node.totalInventory
      : typeof stockMap[node.id] === "number"
      ? stockMap[node.id]
      : 0;

  let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
  if (totalStock <= 0) {
    stockStatus = "out_of_stock";
  } else if (totalStock <= 5) {
    stockStatus = "low_stock";
  }

  // Images collection
  const productImages: string[] = [];
  if (node.images?.edges) {
    node.images.edges.forEach((imgEdge: any) => {
      if (imgEdge.node?.url && !productImages.includes(imgEdge.node.url)) {
        productImages.push(imgEdge.node.url);
      }
    });
  }
  if (node.featuredImage?.url && !productImages.includes(node.featuredImage.url)) {
    productImages.unshift(node.featuredImage.url);
  }
  const firstVariant = variantsList[0];
  const firstVariantNode = variantsRaw[0]?.node;
  const invItemId = firstVariant?.inventoryItemId || firstVariantNode?.inventoryItem?.id;

  if (firstVariant?.image && !productImages.includes(firstVariant.image)) {
    productImages.push(firstVariant.image);
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80";
  const finalMainImg = productImages[0] || fallbackImage;

  const primaryPrice = firstVariant ? firstVariant.price : 0;
  const primaryCompareAt = firstVariant ? firstVariant.compareAtPrice : undefined;
  const primarySku = firstVariant?.sku || (firstVariantNode?.sku ? firstVariantNode.sku : (node.handle ? `SKU-${node.handle}` : `INV-${idx + 1}`));

  const categoryTitle =
    node.productType ||
    node.tags?.find((t: string) => !["Admin Added", "active"].includes(t)) ||
    "General";

  const nodeTags: string[] = node.tags || [];
  const isHiddenByTag = nodeTags.some(
    (t: string) => t.toLowerCase() === "petpedia-hidden" || t.toLowerCase() === "hidden"
  );
  const isDraftOrArchived = node.status === "DRAFT" || node.status === "ARCHIVED";
  const isHiddenById =
    hiddenIds.has(node.id) ||
    (node.handle ? hiddenIds.has(node.handle) || hiddenIds.has(node.handle.toLowerCase()) : false);

  const isHidden = isHiddenByTag || isDraftOrArchived || isHiddenById;

  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    imageUrl: finalMainImg,
    images: productImages.length > 0 ? productImages : [finalMainImg],
    price: primaryPrice,
    compareAtPrice: primaryCompareAt,
    category: categoryTitle,
    categoryHandle: categoryTitle.toLowerCase().replace(/\s+/g, "-"),
    sku: primarySku,
    variantId: firstVariant?.id || "",
    inventoryItemId: invItemId,
    stockQuantity: totalStock,
    stockStatus,
    availableForSale: totalStock > 0,
    description: node.description || "",
    options: node.options?.map((o: any) => ({
      id: o.id,
      name: o.name,
      values: o.values || [],
    })),
    variants: variantsList.length > 0 ? variantsList : undefined,
    hidden: isHidden,
  };
}

export const getAdminProductsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminProduct[]> => {
    const hiddenIds = new Set(loadHiddenProductIds());
    const stockMap = loadProductStockMap();

    try {
      // Primary: Fetch all products from Shopify Admin GraphQL API
      const adminData = await queryShopifyAdmin<{
        products?: {
          edges: Array<{
            node: any;
          }>;
        };
      }>(ADMIN_PRODUCTS_QUERY);

      if (adminData?.products?.edges && adminData.products.edges.length > 0) {
        return adminData.products.edges.map((edge, idx) =>
          formatShopifyAdminProductNode(edge.node, stockMap, hiddenIds, idx)
        );
      }
    } catch (adminErr) {
      console.warn("[getAdminProductsFn] Admin query error, falling back to storefront query:", adminErr);
    }

    // Fallback: Query Storefront API if Admin query returned null or threw
    try {
      const sfRes = await queryStorefront<{
        products?: {
          edges: Array<{ node: any }>;
        };
      }>(STOREFRONT_FALLBACK_QUERY);

      return (sfRes?.products?.edges || []).map((edge, idx) => {
        const node = edge.node;
        const variantsRaw = node.variants?.edges || [];
        const sfVariantsList: AdminProductVariant[] = variantsRaw.map((vEdge: any) => {
          const vNode = vEdge.node;
          const vPrice = parseFloat(vNode?.price?.amount || "0");
          const vCompare = vNode?.compareAtPrice?.amount ? parseFloat(vNode.compareAtPrice.amount) : undefined;
          const vSku = (vNode?.sku || "").trim();
          const vStock = stockMap[vNode?.id] ?? 0;
          return {
            id: vNode?.id || "",
            title: vNode?.title || "Default Title",
            price: vPrice,
            compareAtPrice: vCompare,
            sku: vSku,
            stockQuantity: vStock,
            availableForSale: vStock > 0,
            image: vNode?.image?.url,
          };
        });

        const firstVariant = variantsRaw[0]?.node;
        const vSku = (firstVariant?.sku || "").trim();
        const price = parseFloat(
          firstVariant?.price?.amount || node.priceRange?.minVariantPrice?.amount || "0"
        );
        const compareAtPrice = firstVariant?.compareAtPrice?.amount
          ? parseFloat(firstVariant.compareAtPrice.amount)
          : undefined;

        const productImages: string[] = [];
        if (node.images?.edges) {
          node.images.edges.forEach((e: any) => {
            if (e.node?.url) productImages.push(e.node.url);
          });
        }
        if (node.featuredImage?.url && !productImages.includes(node.featuredImage.url)) {
          productImages.unshift(node.featuredImage.url);
        }

        const finalMainImg =
          productImages[0] ||
          "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80";

        const totalStock =
          sfVariantsList.length > 0
            ? sfVariantsList.reduce((acc, v) => acc + v.stockQuantity, 0)
            : typeof stockMap[node.id] === "number"
            ? stockMap[node.id]
            : 0;

        return {
          id: node.id,
          title: node.title,
          handle: node.handle,
          imageUrl: finalMainImg,
          images: productImages.length > 0 ? productImages : [finalMainImg],
          price,
          compareAtPrice,
          category: node.productType || "General",
          categoryHandle: (node.productType || "General").toLowerCase().replace(/\s+/g, "-"),
          sku: vSku || `INV-${idx + 1}`,
          variantId: firstVariant?.id || "",
          stockQuantity: totalStock,
          stockStatus: totalStock <= 0 ? "out_of_stock" : totalStock <= 5 ? "low_stock" : "in_stock",
          availableForSale: totalStock > 0,
          description: node.description || "",
          variants: sfVariantsList.length > 0 ? sfVariantsList : undefined,
          hidden: hiddenIds.has(node.id) || hiddenIds.has(node.handle),
        };
      });
    } catch (err) {
      console.error("[getAdminProductsFn] Critical fetch error, falling back to catalog data:", err);
      return allProductsCatalog.map((p, idx) => {
        const variantsList: AdminProductVariant[] = (p.variants || []).map((v) => {
          const vStock = stockMap[v.id] ?? 0;
          return {
            id: v.id,
            title: v.title,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stockQuantity: vStock,
            availableForSale: vStock > 0,
            image: v.image,
          };
        });
        const totalStock =
          variantsList.length > 0
            ? variantsList.reduce((acc, v) => acc + v.stockQuantity, 0)
            : typeof stockMap[p.id] === "number"
            ? stockMap[p.id]
            : 0;
        return {
          id: p.id,
          title: p.title,
          handle: p.handle || `prod-${idx}`,
          imageUrl: p.image,
          images: p.images || [p.image],
          price: p.price,
          compareAtPrice: p.mrp,
          category: p.productType || "General",
          categoryHandle: (p.productType || "general").toLowerCase().replace(/\s+/g, "-"),
          sku: `SKU-${idx + 1}`,
          variantId: p.variants?.[0]?.id || `var-${p.id}`,
          stockQuantity: totalStock,
          stockStatus: totalStock <= 0 ? "out_of_stock" : totalStock <= 5 ? "low_stock" : "in_stock",
          availableForSale: totalStock > 0,
          description: p.description || "",
          variants: variantsList.length > 0 ? variantsList : undefined,
          hidden: hiddenIds.has(p.id) || (p.handle ? hiddenIds.has(p.handle) : false),
        };
      });
    }
  }
);

/**
 * Fetches fresh, authoritative product data directly from the backend (Shopify Admin API)
 * Used whenever a user clicks "Edit" or refreshes a product to ensure no stale data or default stocks are shown.
 */
export const getAdminProductByIdFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string | undefined; handle?: string | undefined }) => data)
  .handler(async ({ data }): Promise<AdminProduct | null> => {
    const rawId = (data?.id || "").trim();
    const handle = (data?.handle || "").trim();
    if (!rawId && !handle) return null;

    const hiddenIds = new Set(loadHiddenProductIds());
    const stockMap = loadProductStockMap();

    let formattedId = rawId;
    if (formattedId && !formattedId.startsWith("gid://")) {
      if (/^\d+$/.test(formattedId)) {
        formattedId = `gid://shopify/Product/${formattedId}`;
      }
    }

    try {
      // 1. Try querying Shopify Admin directly by ID
      if (formattedId && formattedId.startsWith("gid://shopify/Product/")) {
        const SINGLE_PRODUCT_BY_ID_QUERY = `
          query getAdminProductDetailsById($id: ID!) {
            product(id: $id) {
              id
              title
              handle
              description
              descriptionHtml
              productType
              status
              tags
              totalInventory
              featuredImage {
                url
                altText
              }
              images(first: 50) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              options {
                id
                name
                values
              }
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    compareAtPrice
                    inventoryQuantity
                    inventoryItem {
                      id
                      sku
                      tracked
                    }
                    image {
                      id
                      url
                    }
                  }
                }
              }
            }
          }
        `;

        const res = await queryShopifyAdmin<{ product?: any }>(
          SINGLE_PRODUCT_BY_ID_QUERY,
          { id: formattedId }
        );

        if (res?.product) {
          return formatShopifyAdminProductNode(res.product, stockMap, hiddenIds);
        }
      }

      // 2. If not found by ID or no ID, query Shopify Admin by handle
      const searchHandle = handle || (rawId && !rawId.startsWith("gid://") ? rawId : "");
      if (searchHandle) {
        const SINGLE_PRODUCT_BY_HANDLE_QUERY = `
          query getAdminProductDetailsByHandle($query: String!) {
            products(first: 1, query: $query) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  descriptionHtml
                  productType
                  status
                  tags
                  totalInventory
                  featuredImage {
                    url
                    altText
                  }
                  images(first: 50) {
                    edges {
                      node {
                        id
                        url
                        altText
                      }
                    }
                  }
                  options {
                    id
                    name
                    values
                  }
                  variants(first: 50) {
                    edges {
                      node {
                        id
                        title
                        sku
                        price
                        compareAtPrice
                        inventoryQuantity
                        inventoryItem {
                          id
                          sku
                          tracked
                        }
                        image {
                          id
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const handleRes = await queryShopifyAdmin<{ products?: { edges?: Array<{ node: any }> } }>(
          SINGLE_PRODUCT_BY_HANDLE_QUERY,
          { query: `handle:${searchHandle}` }
        );

        const node = handleRes?.products?.edges?.[0]?.node;
        if (node) {
          return formatShopifyAdminProductNode(node, stockMap, hiddenIds);
        }
      }
    } catch (err) {
      console.warn("[getAdminProductByIdFn] Admin fetch error:", err);
    }

    // 3. Fallback: try finding product in local catalog
    const catalogMatch = allProductsCatalog.find(
      (p) => p.id === rawId || p.handle === handle || (rawId && p.id.includes(rawId))
    );
    if (catalogMatch) {
      const variantsList: AdminProductVariant[] = (catalogMatch.variants || []).map((v) => {
        const vStock = stockMap[v.id] ?? 0;
        return {
          id: v.id,
          title: v.title,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          stockQuantity: vStock,
          availableForSale: vStock > 0,
          image: v.image,
        };
      });
      const totalStock =
        variantsList.length > 0
          ? variantsList.reduce((acc, v) => acc + v.stockQuantity, 0)
          : stockMap[catalogMatch.id] ?? 0;
      return {
        id: catalogMatch.id,
        title: catalogMatch.title,
        handle: catalogMatch.handle || rawId,
        imageUrl: catalogMatch.image,
        images: catalogMatch.images || [catalogMatch.image],
        price: catalogMatch.price,
        compareAtPrice: catalogMatch.mrp,
        category: catalogMatch.productType || "General",
        categoryHandle: (catalogMatch.productType || "general").toLowerCase().replace(/\s+/g, "-"),
        sku: `SKU-${rawId}`,
        variantId: catalogMatch.variants?.[0]?.id || `var-${catalogMatch.id}`,
        stockQuantity: totalStock,
        stockStatus: totalStock <= 0 ? "out_of_stock" : totalStock <= 5 ? "low_stock" : "in_stock",
        availableForSale: totalStock > 0,
        description: catalogMatch.description || "",
        variants: variantsList.length > 0 ? variantsList : undefined,
        hidden: hiddenIds.has(catalogMatch.id),
      };
    }

    return null;
  });


// Uploads a binary buffer to Shopify using Staged Uploads API (Google Cloud Storage)
export async function uploadImageToShopify(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string | null> {
  try {
    const stageQuery = `
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const stageRes = await queryShopifyAdmin<{
      stagedUploadsCreate?: {
        stagedTargets?: Array<{
          url: string;
          resourceUrl: string;
          parameters: Array<{ name: string; value: string }>;
        }>;
        userErrors?: Array<{ field: string[]; message: string }>;
      };
    }>(stageQuery, {
      input: [
        {
          resource: "IMAGE",
          filename,
          mimeType: contentType,
          httpMethod: "POST",
        },
      ],
    });

    const target = stageRes?.stagedUploadsCreate?.stagedTargets?.[0];
    if (!target?.url || !target?.resourceUrl) {
      console.warn("[uploadImageToShopify] Staged target creation failed:", stageRes);
      return null;
    }

    const formData = new FormData();
    for (const param of target.parameters) {
      formData.append(param.name, param.value);
    }
    const blob = new Blob([new Uint8Array(buffer)], { type: contentType });
    formData.append("file", blob, filename);

    const uploadRes = await fetch(target.url, {
      method: "POST",
      body: formData,
    });

    if (uploadRes.status >= 200 && uploadRes.status < 300) {
      return target.resourceUrl;
    } else {
      const errText = await uploadRes.text().catch(() => "");
      console.warn("[uploadImageToShopify] Google Cloud Storage upload failed with status:", uploadRes.status, errText);
      return null;
    }
  } catch (err) {
    console.error("[uploadImageToShopify] Error:", err);
    return null;
  }
}

// Auto-publishes a product to all store sales channels (Headless, Online Store, POS)
export async function tryAutoPublishToChannels(productId: string): Promise<void> {
  try {
    const pubRes = await queryShopifyAdmin<{
      publications?: {
        edges: Array<{
          node: {
            id: string;
            name: string;
          };
        }>;
      };
    }>(`
      query {
        publications(first: 10) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `);

    const pubs = pubRes?.publications?.edges || [];
    if (pubs.length > 0) {
      await queryShopifyAdmin(`
        mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
          publishablePublish(id: $id, input: $input) {
            userErrors {
              field
              message
            }
          }
        }
      `, {
        id: productId,
        input: pubs.map((p) => ({ publicationId: p.node.id })),
      });
      console.log(`[tryAutoPublishToChannels] Successfully published product ${productId} to ${pubs.length} sales channels.`);
    }
  } catch (err) {
    // If publication scopes aren't granted in Shopify app yet, continue gracefully
    console.info("[tryAutoPublishToChannels] Auto-publish skipped (requires write_publications scope in Shopify Dev App):", err);
  }
}

// Converts a local /uploads/ URL to a live Shopify staged resourceUrl
async function convertLocalUrlToShopify(url: string): Promise<string> {
  if (!url || !url.startsWith("/uploads/")) return url;

  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const relativePart = url.replace(/^\/+/, "");
    const localFilePath = path.resolve(process.cwd(), "public", relativePart);
    if (fs.existsSync(localFilePath)) {
      const buffer = fs.readFileSync(localFilePath);
      const ext = path.extname(localFilePath).toLowerCase();
      const mimeType =
        ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
          ? "image/webp"
          : ext === ".gif"
          ? "image/gif"
          : "image/png";

      const shopifyUrl = await uploadImageToShopify(buffer, path.basename(localFilePath), mimeType);
      if (shopifyUrl) {
        return shopifyUrl;
      }
    }
  } catch (err) {
    console.warn("[convertLocalUrlToShopify] Error resolving local image:", url, err);
  }
  return url;
}

export interface StagedTargetPayload {
  filename: string;
  mimeType: string;
}

export interface StagedTargetResponse {
  success: boolean;
  target?: {
    url: string;
    resourceUrl: string;
    parameters: Array<{ name: string; value: string }>;
  };
  error?: string;
}

// Generates a pre-signed Shopify staged upload URL so clients can stream files directly to Shopify/GCS
export const createStagedUploadTargetFn = createServerFn({ method: "POST" })
  .validator((data: StagedTargetPayload) => data)
  .handler(async ({ data }): Promise<StagedTargetResponse> => {
    try {
      const stageQuery = `
        mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
          stagedUploadsCreate(input: $input) {
            stagedTargets {
              url
              resourceUrl
              parameters {
                name
                value
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const stageRes = await queryShopifyAdmin<{
        stagedUploadsCreate?: {
          stagedTargets?: Array<{
            url: string;
            resourceUrl: string;
            parameters: Array<{ name: string; value: string }>;
          }>;
          userErrors?: Array<{ field: string[]; message: string }>;
        };
      }>(stageQuery, {
        input: [
          {
            resource: "IMAGE",
            filename: data.filename || "image.png",
            mimeType: data.mimeType || "image/png",
            httpMethod: "POST",
          },
        ],
      });

      const target = stageRes?.stagedUploadsCreate?.stagedTargets?.[0];
      if (!target?.url || !target?.resourceUrl) {
        const errMsg =
          stageRes?.stagedUploadsCreate?.userErrors?.[0]?.message ||
          "Shopify failed to create staged upload target";
        return { success: false, error: errMsg };
      }

      return {
        success: true,
        target: {
          url: target.url,
          resourceUrl: target.resourceUrl,
          parameters: target.parameters,
        },
      };
    } catch (err: any) {
      console.error("[createStagedUploadTargetFn] Error:", err);
      return { success: false, error: err.message || "Failed to create upload target" };
    }
  });

export interface UploadImagePayload {
  filename: string;
  base64Data: string;
  contentType: string;
}

export const uploadProductImageFn = createServerFn({ method: "POST" })
  .validator((data: UploadImagePayload) => data)
  .handler(async ({ data }) => {
    try {
      const rawExt = data.filename?.includes(".")
        ? "." + data.filename.split(".").pop()!.toLowerCase()
        : ".png";
      const baseClean = (data.filename || "img")
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "");
      const finalName = `prod-${Date.now()}-${baseClean || "image"}${rawExt}`;

      const base64Clean = data.base64Data
        ? (data.base64Data.includes(",") ? data.base64Data.split(",")[1] || "" : data.base64Data)
        : "";
      const buffer = Buffer.from(base64Clean, "base64");

      // 1. Primary: Upload directly to Shopify Staged Cloud Storage
      let shopifyUrl: string | null = null;
      try {
        shopifyUrl = await uploadImageToShopify(buffer, finalName, data.contentType || "image/png");
      } catch (shopErr) {
        console.warn("[uploadProductImageFn] Shopify staged upload error:", shopErr);
      }

      // 2. Secondary: Safe local disk write (non-fatal if serverless or read-only filesystem)
      let publicUrl: string | null = null;
      try {
        const fs = await import("node:fs");
        const path = await import("node:path");
        const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, finalName);
        fs.writeFileSync(filePath, buffer);
        publicUrl = `/uploads/${finalName}`;
      } catch (fsErr) {
        console.info("[uploadProductImageFn] Local disk write skipped (read-only filesystem):", fsErr);
      }

      const finalUrl = shopifyUrl || publicUrl;
      if (!finalUrl) {
        // Fallback to data URI so client form is never blocked
        return {
          success: true,
          url: data.base64Data,
          filename: finalName,
        };
      }

      return {
        success: true,
        url: finalUrl,
        localUrl: publicUrl || undefined,
        shopifyUrl: shopifyUrl || undefined,
        filename: finalName,
      };
    } catch (err: any) {
      console.error("[uploadProductImageFn] Error:", err);
      return { success: false, error: err.message || "Failed to upload file" };
    }
  });

export interface SaveProductVariantPayload {
  id?: string | undefined;
  title: string;
  price: number;
  compareAtPrice?: number | undefined;
  sku?: string | undefined;
  inventoryItemId?: string | undefined;
  stockQuantity: number;
  image?: string | undefined;
}

export interface SaveProductPayload {
  id?: string | undefined;
  title: string;
  price: number;
  compareAtPrice?: number | undefined;
  category: string;
  categoryHandle?: string | undefined;
  sku?: string | undefined;
  stockQuantity: number;
  imageUrl: string;
  images?: string[] | undefined;
  description?: string | undefined;
  hasVariants?: boolean | undefined;
  optionName?: string | undefined;
  variants?: SaveProductVariantPayload[] | undefined;
}

async function resolveProductMediaMap(productId: string): Promise<Array<{ id: string; url: string }>> {
  try {
    const res = await queryShopifyAdmin<{
      product?: {
        media?: {
          edges: Array<{
            node: {
              id: string;
              image?: { url: string };
            };
          }>;
        };
      };
    }>(`
      query getProdMedia($id: ID!) {
        product(id: $id) {
          id
          media(first: 50) {
            edges {
              node {
                id
                status
                mediaContentType
                ... on MediaImage {
                  image {
                    id
                    url
                  }
                  originalSource {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `, { id: productId });

    const edges = res.product?.media?.edges || [];
    return edges.map((e, idx) => ({
      id: e.node.id,
      url: e.node.image?.url || "",
      originalSourceUrl: e.node.originalSource?.url || "",
      index: idx,
    }));
  } catch (err) {
    console.warn("[resolveProductMediaMap] Error:", err);
    return [];
  }
}

export interface ResolvedMediaItem {
  id: string;
  url: string;
  originalSourceUrl?: string;
  index: number;
}

function cleanImageKey(rawUrl: string): string {
  if (!rawUrl) return "";
  try {
    const decoded = decodeURIComponent(rawUrl);
    const noQuery = decoded.split("?")[0]?.split("#")[0] || "";
    let filename = noQuery.split("/").pop()?.toLowerCase() || "";
    // Remove local numeric timestamp prefix (e.g. 1790566440123-image.jpg -> image.jpg)
    filename = filename.replace(/^\d+[-_]/, "");
    // Remove Shopify hash suffix if present (e.g. image_0045f1ee-f65e-4f51-9b07-61b0aaddca36.jpg -> image.jpg)
    filename = filename.replace(/_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i, "");
    return filename.trim();
  } catch {
    return rawUrl.toLowerCase();
  }
}

function findMediaIdForImage(
  imageTarget: string,
  mediaList: ResolvedMediaItem[],
  allInputImages?: string[]
): string | undefined {
  if (!imageTarget || mediaList.length === 0) return undefined;

  // 1. Direct GID check
  if (imageTarget.startsWith("gid://shopify/MediaImage/")) {
    return imageTarget;
  }

  // 2. Direct exact URL match
  const exactMatch = mediaList.find(
    (m) =>
      (m.url && m.url === imageTarget) ||
      (m.originalSourceUrl && m.originalSourceUrl === imageTarget)
  );
  if (exactMatch) return exactMatch.id;

  // 3. Match by index in input images array (100% reliable for gallery/variant orders)
  if (allInputImages && allInputImages.length > 0) {
    const targetIdx = allInputImages.findIndex(
      (img) =>
        img === imageTarget ||
        cleanImageKey(img) === cleanImageKey(imageTarget)
    );
    if (targetIdx !== -1 && mediaList[targetIdx]) {
      return mediaList[targetIdx].id;
    }
  }

  // 4. Clean filename matching
  const targetKey = cleanImageKey(imageTarget);
  if (targetKey) {
    const nameMatch = mediaList.find((m) => {
      const mediaKey = cleanImageKey(m.url) || cleanImageKey(m.originalSourceUrl || "");
      return mediaKey === targetKey;
    });
    if (nameMatch) return nameMatch.id;

    // Partial/contains match
    const subMatch = mediaList.find((m) => {
      const mediaKey = cleanImageKey(m.url) || cleanImageKey(m.originalSourceUrl || "");
      const targetBase = targetKey.replace(/\.[^/.]+$/, "");
      const mediaBase = mediaKey.replace(/\.[^/.]+$/, "");
      return (
        targetBase.length > 3 &&
        (mediaBase.includes(targetBase) || targetBase.includes(mediaBase))
      );
    });
    if (subMatch) return subMatch.id;
  }

  return undefined;
}

export const saveProductFn = createServerFn({ method: "POST" })
  .validator((data: SaveProductPayload) => data)
  .handler(async ({ data }) => {
    const isEdit = Boolean(data.id);

    // 1. Convert any local /uploads/... URLs to Shopify Staged Cloud URLs
    const rawImages = [
      data.imageUrl,
      ...(data.images || []),
      ...(data.variants?.map((v) => v.image).filter(Boolean) as string[] || []),
    ].filter(Boolean);

    const conversionMap = new Map<string, string>();
    const convertedImages: string[] = [];
    for (const rawImg of Array.from(new Set(rawImages))) {
      const converted = await convertLocalUrlToShopify(rawImg);
      if (converted) {
        conversionMap.set(rawImg, converted);
        if (!convertedImages.includes(converted)) {
          convertedImages.push(converted);
        }
      }
    }

    const primaryImage =
      (data.imageUrl ? conversionMap.get(data.imageUrl) : undefined) ||
      convertedImages[0] ||
      data.imageUrl;

    // Convert variant images if any, reusing conversionMap
    const formattedVariants: SaveProductVariantPayload[] = [];
    if (data.variants && data.variants.length > 0) {
      for (const v of data.variants) {
        const vImg = v.image
          ? conversionMap.get(v.image) || (await convertLocalUrlToShopify(v.image))
          : undefined;
        formattedVariants.push({
          ...v,
          image: vImg,
        });
      }
    }

    // Public/Shopify media entries for product creation or attachment
    const validShopifyMedia = convertedImages
      .filter((u) => u.startsWith("http://") || u.startsWith("https://"))
      .filter((u) => !u.includes("localhost") && !u.includes("127.0.0.1"))
      .slice(0, 10)
      .map((url) => ({
        originalSource: url,
        mediaContentType: "IMAGE" as const,
      }));

    try {
      if (isEdit && data.id) {
        // ----------------------------------------------------
        // EDIT EXISTING PRODUCT
        // ----------------------------------------------------
        const updateMutation = `
          mutation productUpdate($product: ProductUpdateInput!) {
            productUpdate(product: $product) {
              product {
                id
                title
                handle
                description
                productType
                variants(first: 20) {
                  edges {
                    node {
                      id
                      title
                      price
                      sku
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const updateRes = await queryShopifyAdmin<{
          productUpdate: {
            product?: {
              id: string;
              title: string;
              handle: string;
              variants?: { edges: Array<{ node: { id: string; title: string; price: string } }> };
            };
            userErrors?: Array<{ field: string[]; message: string }>;
          };
        }>(updateMutation, {
          product: {
            id: data.id,
            title: data.title,
            descriptionHtml: data.description ? `<p>${data.description}</p>` : undefined,
            productType: data.category,
            tags: [data.category, "Admin Added"],
          },
        });

        if (updateRes.productUpdate?.userErrors && updateRes.productUpdate.userErrors.length > 0) {
          const errMsg = updateRes.productUpdate.userErrors
            .map((e) => `${e.field?.join?.(".") || ""}: ${e.message}`)
            .join(", ");
          return { success: false, error: `Shopify Update Error: ${errMsg}` };
        }

        const updatedProd = updateRes.productUpdate?.product;
        if (!updatedProd) {
          return { success: false, error: "Shopify failed to update product." };
        }

        // Push new media/images to Shopify if any exist
        if (validShopifyMedia.length > 0) {
          try {
            await queryShopifyAdmin(`
              mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
                productCreateMedia(productId: $productId, media: $media) {
                  media {
                    id
                    status
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
            `, {
              productId: data.id,
              media: validShopifyMedia,
            });
          } catch (mediaErr) {
            console.warn("[saveProductFn] Attach media error:", mediaErr);
          }
        }

        // Update variant pricing, SKU, and variant image
        const existingVariantsOnShopify = updatedProd.variants?.edges || [];
        const primaryVariantId = existingVariantsOnShopify[0]?.node?.id;
        const targetOptionName = data.optionName?.trim() || "Option";

        if (data.hasVariants && formattedVariants.length > 0) {
          // Rename existing option on Shopify if it is not targetOptionName (or if it's currently "Title")
          try {
            const optCheckRes = await queryShopifyAdmin<{
              product?: {
                id: string;
                options?: Array<{ id: string; name: string; values: string[] }>;
              };
            }>(`
              query getProdOptions($id: ID!) {
                product(id: $id) {
                  id
                  options {
                    id
                    name
                    values
                  }
                }
              }
            `, { id: data.id });

            const existingOpts = optCheckRes.product?.options || [];
            const firstExistingOpt = existingOpts[0];
            if (firstExistingOpt && firstExistingOpt.name !== targetOptionName) {
              await queryShopifyAdmin(`
                mutation productOptionUpdate($productId: ID!, $option: OptionUpdateInput!) {
                  productOptionUpdate(productId: $productId, option: $option) {
                    userErrors {
                      field
                      message
                    }
                  }
                }
              `, {
                productId: data.id,
                option: {
                  id: firstExistingOpt.id,
                  name: targetOptionName,
                },
              });
            }
          } catch (optErr) {
            console.warn("[saveProductFn] Rename option error:", optErr);
          }

          const productMediaList = await resolveProductMediaMap(data.id);

          // Has multiple variants
          const existingToUpdate = formattedVariants.filter((v) => Boolean(v.id));
          const newToCreate = formattedVariants.filter((v) => !v.id);

          if (existingToUpdate.length > 0) {
            try {
              await queryShopifyAdmin(`
                mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                    productVariants {
                      id
                      price
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }
              `, {
                productId: data.id,
                variants: existingToUpdate.map((v) => {
                  const mId = v.image
                    ? findMediaIdForImage(v.image, productMediaList, convertedImages)
                    : undefined;
                  return {
                    id: v.id,
                    optionValues: [{ optionName: targetOptionName, name: v.title }],
                    price: v.price.toString(),
                    compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toString() : undefined,
                    inventoryItem: {
                      sku: v.sku || undefined,
                    },
                    ...(mId ? { mediaId: mId } : {}),
                    ...(!mId && v.image && (v.image.startsWith("http://") || v.image.startsWith("https://")) && !v.image.includes("localhost")
                      ? { mediaSrc: [v.image] }
                      : {}),
                  };
                }),
              });
            } catch (varErr) {
              console.warn("[saveProductFn] productVariantsBulkUpdate error:", varErr);
            }
          }

          if (newToCreate.length > 0) {
            try {
              await queryShopifyAdmin(`
                mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                  productVariantsBulkCreate(productId: $productId, variants: $variants) {
                    productVariants {
                      id
                      price
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }
              `, {
                productId: data.id,
                variants: newToCreate.map((v) => {
                  const mId = v.image
                    ? findMediaIdForImage(v.image, productMediaList, convertedImages)
                    : undefined;
                  return {
                    optionValues: [{ optionName: targetOptionName, name: v.title }],
                    price: v.price.toString(),
                    compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toString() : undefined,
                    inventoryItem: {
                      sku: v.sku || undefined,
                    },
                    ...(mId ? { mediaId: mId } : {}),
                    ...(!mId && v.image && (v.image.startsWith("http://") || v.image.startsWith("https://")) && !v.image.includes("localhost")
                      ? { mediaSrc: [v.image] }
                      : {}),
                  };
                }),
              });
            } catch (newVarErr) {
              console.warn("[saveProductFn] productVariantsBulkCreate error:", newVarErr);
            }
          }

          // Dedicated post-update media linking pass to guarantee images attach to variants
          let shopifyVars: any[] = [];
          try {
            const finalMedia = await resolveProductMediaMap(data.id);
            const checkVarsRes = await queryShopifyAdmin<{
              product?: {
                variants?: {
                  edges: Array<{
                    node: {
                      id: string;
                      title: string;
                      image?: { id: string };
                    };
                  }>;
                };
              };
            }>(`
              query getProdVarMedia($id: ID!) {
                product(id: $id) {
                  id
                  variants(first: 50) {
                    edges {
                      node {
                        id
                        title
                        image {
                          id
                        }
                        inventoryItem {
                          id
                        }
                      }
                    }
                  }
                }
              }
            `, { id: data.id });

            shopifyVars = checkVarsRes.product?.variants?.edges || [];
            const linkList: Array<{ id: string; mediaId: string }> = [];

            for (const formattedV of formattedVariants) {
              if (!formattedV.image) continue;
              const matchedShopifyVar = shopifyVars.find((sv) =>
                formattedV.id ? sv.node.id === formattedV.id : sv.node.title.toLowerCase() === formattedV.title.toLowerCase()
              );
              if (!matchedShopifyVar) continue;
              const mId = findMediaIdForImage(formattedV.image, finalMedia, convertedImages);
              if (mId) {
                linkList.push({ id: matchedShopifyVar.node.id, mediaId: mId });
              }
            }

            if (linkList.length > 0) {
              const linkRes = await queryShopifyAdmin<{
                productVariantsBulkUpdate: {
                  productVariants?: Array<{ id: string }>;
                  userErrors?: Array<{ field: string[]; message: string }>;
                };
              }>(`
                mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                    productVariants {
                      id
                      image {
                        id
                        url
                      }
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }
              `, {
                productId: data.id,
                variants: linkList,
              });
              if (linkRes.productVariantsBulkUpdate?.userErrors?.length) {
                console.warn("[saveProductFn] Variant media link pass userErrors:", linkRes.productVariantsBulkUpdate.userErrors);
              }
            }
          } catch (linkErr) {
            console.warn("[saveProductFn] Variant media link pass error:", linkErr);
          }

          // Persist stock for each variant
          const stockItems = formattedVariants.map((v) => ({
            key: v.id || `${data.id}-${v.title}`,
            quantity: v.stockQuantity,
          }));
          stockItems.push({ key: data.id, quantity: data.stockQuantity });
          setStockForKeys(stockItems);

          // Synchronize variant stock levels to Shopify
          try {
            const locId = ADMIN_CONFIG.defaultLocationId.startsWith("gid://")
              ? ADMIN_CONFIG.defaultLocationId
              : `gid://shopify/Location/${ADMIN_CONFIG.defaultLocationId}`;

            const quantitiesToSet: Array<{ inventoryItemId: string; locationId: string; quantity: number }> = [];

            for (const formattedV of formattedVariants) {
              const matchedShopifyVar = shopifyVars.find((sv) =>
                formattedV.id ? sv.node.id === formattedV.id : sv.node.title.toLowerCase() === formattedV.title.toLowerCase()
              );
              const invId = formattedV.inventoryItemId || (matchedShopifyVar?.node as any)?.inventoryItem?.id;
              if (invId) {
                const formattedInvId = invId.startsWith("gid://")
                  ? invId
                  : `gid://shopify/InventoryItem/${invId}`;
                quantitiesToSet.push({
                  inventoryItemId: formattedInvId,
                  locationId: locId,
                  quantity: Math.max(0, Math.floor(Number(formattedV.stockQuantity) || 0)),
                });
              }
            }

            if (quantitiesToSet.length > 0) {
              const shopRes = await setShopifyInventoryQuantities(quantitiesToSet);
              if (!shopRes.success) {
                console.warn("[saveProductFn] Shopify live variant stock update warning:", shopRes.error);
              }
            }
          } catch (shopStockErr) {
            console.warn("[saveProductFn] Shopify live variant stock update error:", shopStockErr);
          }
        } else if (primaryVariantId) {
          // Standard single product - update primary variant price & sku
          try {
            await queryShopifyAdmin(`
              mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                  productVariants {
                    id
                    price
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
            `, {
              productId: data.id,
              variants: [
                {
                  id: primaryVariantId,
                  price: data.price.toString(),
                  compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toString() : undefined,
                  inventoryItem: {
                    sku: data.sku || undefined,
                  },
                  ...(primaryImage && primaryImage.startsWith("http") && !primaryImage.includes("localhost")
                    ? { mediaSrc: [primaryImage] }
                    : {}),
                },
              ],
            });
          } catch (varErr) {
            console.warn("[saveProductFn] Single variant price update error:", varErr);
          }

          // Persist stock
          setStockForKeys([
            { key: data.id, quantity: data.stockQuantity },
            { key: primaryVariantId, quantity: data.stockQuantity },
          ]);

          // Synchronize single product stock level to Shopify
          try {
            const locId = ADMIN_CONFIG.defaultLocationId.startsWith("gid://")
              ? ADMIN_CONFIG.defaultLocationId
              : `gid://shopify/Location/${ADMIN_CONFIG.defaultLocationId}`;

            const vInvRes = await queryShopifyAdmin<{
              productVariant?: { inventoryItem?: { id: string } };
            }>(`
              query getSingleVarInv($id: ID!) {
                productVariant(id: $id) {
                  id
                  inventoryItem {
                    id
                  }
                }
              }
            `, { id: primaryVariantId });

            const sInvId = vInvRes.productVariant?.inventoryItem?.id;
            if (sInvId) {
              const formattedInvId = sInvId.startsWith("gid://")
                ? sInvId
                : `gid://shopify/InventoryItem/${sInvId}`;
              await setShopifyInventoryQuantities([
                {
                  inventoryItemId: formattedInvId,
                  locationId: locId,
                  quantity: Math.max(0, Math.floor(Number(data.stockQuantity) || 0)),
                },
              ]);
            }
          } catch (singleStockErr) {
            console.warn("[saveProductFn] Single product live stock update error:", singleStockErr);
          }
        }

        // Auto-publish to sales channels if scope is granted
        await tryAutoPublishToChannels(data.id);
        invalidateStockCache();

        return {
          success: true,
          product: {
            ...data,
            id: updatedProd.id,
            handle: updatedProd.handle,
            imageUrl: primaryImage,
            images: convertedImages.length > 0 ? convertedImages : [primaryImage],
            variants: formattedVariants.length > 0 ? formattedVariants : undefined,
          },
        };
      } else {
        // ----------------------------------------------------
        // CREATE NEW PRODUCT
        // ----------------------------------------------------
        const hasMedia = validShopifyMedia.length > 0;
        const createMutation = hasMedia
          ? `
            mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
              productCreate(product: $product, media: $media) {
                product {
                  id
                  title
                  handle
                  media(first: 30) {
                    edges {
                      node {
                        id
                        status
                        mediaContentType
                        ... on MediaImage {
                          image {
                            id
                            url
                          }
                          originalSource {
                            url
                          }
                        }
                      }
                    }
                  }
                  variants(first: 20) {
                    edges {
                      node {
                        id
                        price
                      }
                    }
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `
          : `
            mutation productCreate($product: ProductCreateInput!) {
              productCreate(product: $product) {
                product {
                  id
                  title
                  handle
                  variants(first: 20) {
                    edges {
                      node {
                        id
                        price
                      }
                    }
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `;

        const targetOptionName = data.optionName?.trim() || "Option";
        const hasVariants = Boolean(data.hasVariants && formattedVariants.length > 0);

        const createVars: any = {
          product: {
            title: data.title,
            descriptionHtml: data.description ? `<p>${data.description}</p>` : undefined,
            productType: data.category,
            tags: [data.category, "Admin Added"],
            status: "ACTIVE",
            ...(hasVariants
              ? {
                  productOptions: [
                    {
                      name: targetOptionName,
                      values: formattedVariants.map((v) => ({ name: v.title })),
                    },
                  ],
                }
              : {}),
          },
        };
        if (hasMedia) {
          createVars.media = validShopifyMedia;
        }

        const createRes = await queryShopifyAdmin<{
          productCreate: {
            product?: {
              id: string;
              title: string;
              handle: string;
              media?: {
                edges: Array<{
                  node: {
                    id: string;
                    status?: string;
                    mediaContentType?: string;
                    image?: { id?: string; url?: string };
                    originalSource?: { url?: string };
                  };
                }>;
              };
              variants?: {
                edges: Array<{ node: { id: string; price: string } }>;
              };
            };
            userErrors?: Array<{ field: string[]; message: string }>;
          };
        }>(createMutation, createVars);

        if (createRes.productCreate?.userErrors && createRes.productCreate.userErrors.length > 0) {
          const errMsg = createRes.productCreate.userErrors
            .map((e) => `${e.field?.join?.(".") || ""}: ${e.message}`)
            .join(", ");
          return { success: false, error: `Shopify Create Error: ${errMsg}` };
        }

        const createdProd = createRes.productCreate?.product;
        if (!createdProd?.id) {
          return { success: false, error: "Shopify did not return a created product ID." };
        }

        const firstVariantId = createdProd.variants?.edges?.[0]?.node?.id;

        if (firstVariantId) {
          if (hasVariants) {
            let productMediaList: ResolvedMediaItem[] = (createdProd.media?.edges || []).map((e: any, idx: number) => ({
              id: e.node.id,
              url: e.node.image?.url || "",
              originalSourceUrl: e.node.originalSource?.url || "",
              index: idx,
            }));

            if (productMediaList.length === 0) {
              productMediaList = await resolveProductMediaMap(createdProd.id);
            }

            // Update the default first variant with option 1
            const firstOpt = formattedVariants[0];
            if (firstOpt) {
              const firstMId = firstOpt.image
                ? findMediaIdForImage(firstOpt.image, productMediaList, convertedImages)
                : undefined;
              try {
                const bulkRes = await queryShopifyAdmin<{
                  productVariantsBulkUpdate: {
                    productVariants?: Array<{ id: string; price: string }>;
                    userErrors?: Array<{ field: string[]; message: string }>;
                  };
                }>(`
                  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                      productVariants {
                        id
                        price
                      }
                      userErrors {
                        field
                        message
                      }
                    }
                  }
                `, {
                  productId: createdProd.id,
                  variants: [
                    {
                      id: firstVariantId,
                      optionValues: [{ optionName: targetOptionName, name: firstOpt.title }],
                      price: firstOpt.price.toString(),
                      compareAtPrice: firstOpt.compareAtPrice ? firstOpt.compareAtPrice.toString() : undefined,
                      inventoryItem: {
                        sku: firstOpt.sku || undefined,
                      },
                      ...(firstMId ? { mediaId: firstMId } : {}),
                    },
                  ],
                });
                if (bulkRes.productVariantsBulkUpdate?.userErrors?.length) {
                  console.warn("[saveProductFn] First variant bulk update userErrors:", bulkRes.productVariantsBulkUpdate.userErrors);
                }
              } catch (err1) {
                console.warn("[saveProductFn] New product first variant update error:", err1);
              }
            }

            // Create remaining variants
            if (formattedVariants.length > 1) {
              const remainingVariants = formattedVariants.slice(1);
              try {
                const bulkCreateRes = await queryShopifyAdmin<{
                  productVariantsBulkCreate: {
                    productVariants?: Array<{ id: string; price: string }>;
                    userErrors?: Array<{ field: string[]; message: string }>;
                  };
                }>(`
                  mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                    productVariantsBulkCreate(productId: $productId, variants: $variants) {
                      productVariants {
                        id
                        price
                      }
                      userErrors {
                        field
                        message
                      }
                    }
                  }
                `, {
                  productId: createdProd.id,
                  variants: remainingVariants.map((v) => {
                    const mId = v.image
                      ? findMediaIdForImage(v.image, productMediaList, convertedImages)
                      : undefined;
                    return {
                      optionValues: [{ optionName: targetOptionName, name: v.title }],
                      price: v.price.toString(),
                      compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toString() : undefined,
                      inventoryItem: {
                        sku: v.sku || undefined,
                      },
                      ...(mId ? { mediaId: mId } : {}),
                    };
                  }),
                });
                if (bulkCreateRes.productVariantsBulkCreate?.userErrors?.length) {
                  console.warn("[saveProductFn] Remaining variants bulk create userErrors:", bulkCreateRes.productVariantsBulkCreate.userErrors);
                }
              } catch (remErr) {
                console.warn("[saveProductFn] New product remaining variants create error:", remErr);
              }
            }

            // Post-creation media linking pass
            try {
              const finalMedia = await resolveProductMediaMap(createdProd.id);
              const checkVarsRes = await queryShopifyAdmin<{
                product?: {
                  variants?: {
                    edges: Array<{
                      node: {
                        id: string;
                        title: string;
                        image?: { id: string };
                      };
                    }>;
                  };
                };
              }>(`
                query getProdVarMedia($id: ID!) {
                  product(id: $id) {
                    id
                    variants(first: 50) {
                      edges {
                        node {
                          id
                          title
                          image {
                            id
                          }
                        }
                      }
                    }
                  }
                }
              `, { id: createdProd.id });

              const shopifyVars = checkVarsRes.product?.variants?.edges || [];
              const linkList: Array<{ id: string; mediaId: string }> = [];

              for (const formattedV of formattedVariants) {
                if (!formattedV.image) continue;
                const matchedShopifyVar = shopifyVars.find((sv) =>
                  sv.node.title.toLowerCase() === formattedV.title.toLowerCase()
                );
                if (!matchedShopifyVar) continue;
                const mId = findMediaIdForImage(formattedV.image, finalMedia, convertedImages);
                if (mId) {
                  linkList.push({ id: matchedShopifyVar.node.id, mediaId: mId });
                }
              }

              if (linkList.length > 0) {
                const linkRes = await queryShopifyAdmin<{
                  productVariantsBulkUpdate: {
                    userErrors?: Array<{ field: string[]; message: string }>;
                  };
                }>(`
                  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                      productVariants {
                        id
                        image {
                          id
                          url
                        }
                      }
                      userErrors {
                        field
                        message
                      }
                    }
                  }
                `, {
                  productId: createdProd.id,
                  variants: linkList,
                });
                if (linkRes.productVariantsBulkUpdate?.userErrors?.length) {
                  console.warn("[saveProductFn] Variant media link pass userErrors:", linkRes.productVariantsBulkUpdate.userErrors);
                }
              }
            } catch (linkErr) {
              console.warn("[saveProductFn] New product variant media link pass error:", linkErr);
            }

            // Persist stock
            const stockItems = formattedVariants.map((v, idx) => ({
              key: idx === 0 ? firstVariantId : `${createdProd.id}-${v.title}`,
              quantity: v.stockQuantity,
            }));
            stockItems.push({ key: createdProd.id, quantity: data.stockQuantity });
            setStockForKeys(stockItems);

            // Synchronize newly created variant stock levels to Shopify
            try {
              const locId = ADMIN_CONFIG.defaultLocationId.startsWith("gid://")
                ? ADMIN_CONFIG.defaultLocationId
                : `gid://shopify/Location/${ADMIN_CONFIG.defaultLocationId}`;

              const newVarsRes = await queryShopifyAdmin<{
                product?: {
                  variants?: {
                    edges: Array<{
                      node: {
                        id: string;
                        title: string;
                        inventoryItem?: { id: string };
                      };
                    }>;
                  };
                };
              }>(`
                query getNewProdVars($id: ID!) {
                  product(id: $id) {
                    id
                    variants(first: 50) {
                      edges {
                        node {
                          id
                          title
                          inventoryItem {
                            id
                          }
                        }
                      }
                    }
                  }
                }
              `, { id: createdProd.id });

              const newShopifyVars = newVarsRes.product?.variants?.edges || [];
              const newQuantities: Array<{ inventoryItemId: string; locationId: string; quantity: number }> = [];

              for (const fv of formattedVariants) {
                const matched = newShopifyVars.find(
                  (nsv) => nsv.node.title.toLowerCase() === fv.title.toLowerCase()
                );
                const invId = matched?.node?.inventoryItem?.id;
                if (invId) {
                  const formattedInvId = invId.startsWith("gid://")
                    ? invId
                    : `gid://shopify/InventoryItem/${invId}`;
                  newQuantities.push({
                    inventoryItemId: formattedInvId,
                    locationId: locId,
                    quantity: Math.max(0, Math.floor(Number(fv.stockQuantity) || 0)),
                  });
                }
              }

              if (newQuantities.length > 0) {
                await setShopifyInventoryQuantities(newQuantities);
              }
            } catch (newVarStockErr) {
              console.warn("[saveProductFn] New product variant live stock update error:", newVarStockErr);
            }
          } else {
            // Standard single product
            try {
              await queryShopifyAdmin(`
                mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                    productVariants {
                      id
                      price
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }
              `, {
                productId: createdProd.id,
                variants: [
                  {
                    id: firstVariantId,
                    price: data.price.toString(),
                    compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toString() : undefined,
                    inventoryItem: {
                      sku: data.sku || undefined,
                    },
                  },
                ],
              });
            } catch (singleErr) {
              console.warn("[saveProductFn] New single product variant price update error:", singleErr);
            }

            setStockForKeys([
              { key: createdProd.id, quantity: data.stockQuantity },
              { key: firstVariantId, quantity: data.stockQuantity },
            ]);

            // Synchronize newly created single product stock level to Shopify
            try {
              const locId = ADMIN_CONFIG.defaultLocationId.startsWith("gid://")
                ? ADMIN_CONFIG.defaultLocationId
                : `gid://shopify/Location/${ADMIN_CONFIG.defaultLocationId}`;

              const sInvRes = await queryShopifyAdmin<{
                productVariant?: { inventoryItem?: { id: string } };
              }>(`
                query getNewSingleVarInv($id: ID!) {
                  productVariant(id: $id) {
                    id
                    inventoryItem {
                      id
                    }
                  }
                }
              `, { id: firstVariantId });

              const sInvId = sInvRes.productVariant?.inventoryItem?.id;
              if (sInvId) {
                const formattedInvId = sInvId.startsWith("gid://")
                  ? sInvId
                  : `gid://shopify/InventoryItem/${sInvId}`;
                await setShopifyInventoryQuantities([
                  {
                    inventoryItemId: formattedInvId,
                    locationId: locId,
                    quantity: Math.max(0, Math.floor(Number(data.stockQuantity) || 0)),
                  },
                ]);
              }
            } catch (singleStockErr) {
              console.warn("[saveProductFn] New single product live stock update error:", singleStockErr);
            }
          }
        }

        // Auto-publish to sales channels if scope is granted
        await tryAutoPublishToChannels(createdProd.id);
        invalidateStockCache();

        return {
          success: true,
          product: {
            ...data,
            id: createdProd.id,
            handle: createdProd.handle,
            imageUrl: primaryImage,
            images: convertedImages.length > 0 ? convertedImages : [primaryImage],
            variantId: firstVariantId,
            variants: formattedVariants.length > 0 ? formattedVariants : undefined,
          },
        };
      }
    } catch (err: any) {
      console.error("[saveProductFn] Shopify API Error:", err);
      const rawMsg = err?.message || String(err);
      let userFriendlyMsg = rawMsg;
      if (rawMsg.includes("write_products") || rawMsg.includes("Access denied")) {
        userFriendlyMsg = `Shopify API Access Denied: The app credentials lack write permissions.`;
      }
      return { success: false, error: userFriendlyMsg };
    }
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    try {
      const res = await queryShopifyAdmin<{
        productDelete: {
          deletedProductId?: string;
          userErrors: Array<{ field: string[]; message: string }>;
        };
      }>(`
        mutation productDelete($input: ProductDeleteInput!) {
          productDelete(input: $input) {
            deletedProductId
            userErrors {
              field
              message
            }
          }
        }
      `, {
        input: {
          id: data.id,
        },
      });

      if (res.productDelete?.userErrors && res.productDelete.userErrors.length > 0) {
        const errMsg = res.productDelete.userErrors
          .map((e) => `${e.field?.join?.(".") || ""}: ${e.message}`)
          .join(", ");
        return { success: false, error: `Shopify Delete Error: ${errMsg}` };
      }

      invalidateStockCache();
      return { success: true, deletedId: res.productDelete?.deletedProductId };
    } catch (err: any) {
      console.error("[deleteProductFn] Error:", err);
      return { success: false, error: err.message || "Failed to delete product from Shopify" };
    }
  });

export const getHiddenProductIdsFn = createServerFn({ method: "GET" }).handler(async () => {
  return loadHiddenProductIds();
});

export const toggleProductVisibilityFn = createServerFn({ method: "POST" })
  .validator(
    (data: { productId: string; handle?: string; hidden: boolean }) => data
  )
  .handler(async ({ data }) => {
    const currentList = loadHiddenProductIds();
    const current = new Set(currentList);

    const bareId = data.productId.split("/").pop() || data.productId;
    const fullGid = bareId.startsWith("gid://") ? bareId : `gid://shopify/Product/${bareId}`;
    const handleNorm = data.handle?.toLowerCase() || "";

    if (data.hidden) {
      // Add all identifiers to hidden list
      current.add(fullGid);
      current.add(bareId);
      if (data.handle) {
        current.add(data.handle);
        current.add(handleNorm);
      }

      // Sync to Shopify: add "petpedia-hidden" tag AND set status to ARCHIVED
      try {
        const prodRes = await queryShopifyAdmin<{
          product?: { id: string; tags: string[]; status: string };
        }>(`
          query getProdTags($id: ID!) {
            product(id: $id) {
              id
              tags
              status
            }
          }
        `, { id: fullGid });

        const existingTags = prodRes.product?.tags || [];
        const updatedTags = Array.from(new Set([...existingTags, "petpedia-hidden"]));
        await queryShopifyAdmin(`
          mutation productUpdate($product: ProductUpdateInput!) {
            productUpdate(product: $product) {
              product {
                id
                tags
                status
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          product: {
            id: fullGid,
            tags: updatedTags,
            status: "ARCHIVED",
          },
        });
      } catch (shopErr) {
        console.warn("[toggleProductVisibilityFn] Shopify hide tag sync notice:", shopErr);
      }
    } else {
      // UNHIDE: Thoroughly remove all forms of ID and handle from hidden list
      const toRemove = new Set([
        data.productId,
        data.productId.toLowerCase(),
        bareId,
        bareId.toLowerCase(),
        fullGid,
        fullGid.toLowerCase(),
      ]);
      if (data.handle) {
        toRemove.add(data.handle);
        toRemove.add(handleNorm);
      }

      // Purge any item that matches
      for (const item of Array.from(current)) {
        const itemBare = item.split("/").pop() || item;
        if (
          toRemove.has(item) ||
          toRemove.has(item.toLowerCase()) ||
          toRemove.has(itemBare) ||
          toRemove.has(itemBare.toLowerCase()) ||
          (handleNorm && item.toLowerCase() === handleNorm)
        ) {
          current.delete(item);
        }
      }

      // Sync to Shopify: remove "petpedia-hidden" and "hidden" tags, ensure status is ACTIVE
      try {
        const prodRes = await queryShopifyAdmin<{
          product?: { id: string; tags: string[]; status: string };
        }>(`
          query getProdTags($id: ID!) {
            product(id: $id) {
              id
              tags
              status
            }
          }
        `, { id: fullGid });

        const existingTags = prodRes.product?.tags || [];
        const cleanedTags = existingTags.filter(
          (t) => t.toLowerCase() !== "petpedia-hidden" && t.toLowerCase() !== "hidden"
        );

        await queryShopifyAdmin(`
          mutation productUpdate($product: ProductUpdateInput!) {
            productUpdate(product: $product) {
              product {
                id
                tags
                status
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          product: {
            id: fullGid,
            tags: cleanedTags,
            status: "ACTIVE",
          },
        });

        // Ensure published to channels (Headless Storefront and Online Store)
        await tryAutoPublishToChannels(fullGid);
      } catch (shopErr) {
        console.warn("[toggleProductVisibilityFn] Shopify unhide tag sync notice:", shopErr);
      }
    }

    const updated = Array.from(current);
    saveHiddenProductIds(updated);
    invalidateStockCache();

    return { success: true, hidden: data.hidden, hiddenProductIds: updated };
  });
