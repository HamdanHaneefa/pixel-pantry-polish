import { createServerFn } from "@tanstack/react-start";
import { queryStorefront, queryShopifyAdmin } from "./shopify-admin";
import { loadProductStockMap, setStockForKeys } from "./stock-storage";
import defaultHiddenProducts from "@/data/hidden-products.json";

export interface AdminProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number | undefined;
  sku?: string | undefined;
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
        variants(first: 10) {
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

export const getAdminProductsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminProduct[]> => {
    const hiddenIds = new Set(loadHiddenProductIds());
    const stockMap = loadProductStockMap();

    try {
      // Primary: Fetch all products from Shopify Admin GraphQL API
      const adminData = await queryShopifyAdmin<{
        products?: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              handle: string;
              description?: string;
              descriptionHtml?: string;
              productType?: string;
              status?: string;
              tags?: string[];
              featuredImage?: { url: string; altText?: string };
              images?: { edges: Array<{ node: { id: string; url: string } }> };
              options?: Array<{ id: string; name: string; values: string[] }>;
              variants?: {
                edges: Array<{
                  node: {
                    id: string;
                    title: string;
                    sku?: string;
                    price: string;
                    compareAtPrice?: string;
                    inventoryQuantity: number;
                    inventoryItem?: { id: string; sku?: string; tracked: boolean };
                    image?: { id: string; url: string };
                  };
                }>;
              };
            };
          }>;
        };
      }>(ADMIN_PRODUCTS_QUERY);

      if (adminData?.products?.edges && adminData.products.edges.length > 0) {
        return adminData.products.edges.map((edge, idx) => {
          const node = edge.node;
          const variantsRaw = node.variants?.edges || [];

          // Format variants
          const variantsList: AdminProductVariant[] = variantsRaw.map((vEdge) => {
            const v = vEdge.node;
            const vPrice = parseFloat(v.price || "0");
            const vCompare = v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined;
            const vSku = (v.sku || v.inventoryItem?.sku || "").trim();
            const vId = v.id;
            const invItemId = v.inventoryItem?.id;

            // Resolve stock: saved stock map -> Shopify inventoryQuantity -> default
            const localStock =
              stockMap[vId] ??
              (invItemId ? stockMap[invItemId] : undefined) ??
              (vSku ? stockMap[vSku] : undefined);

            const vStock =
              localStock !== undefined
                ? localStock
                : v.inventoryQuantity !== undefined && v.inventoryQuantity !== null && v.inventoryQuantity > 0
                ? v.inventoryQuantity
                : 10;

            return {
              id: v.id,
              title: v.title || "Default Title",
              price: vPrice,
              compareAtPrice: vCompare,
              sku: vSku,
              stockQuantity: vStock,
              availableForSale: vStock > 0,
              image: v.image?.url,
            };
          });

          // Product-level stock
          const firstVariant = variantsList[0];
          const firstVariantNode = variantsRaw[0]?.node;
          const invItemId = firstVariantNode?.inventoryItem?.id;

          const totalStock =
            variantsList.length > 0
              ? variantsList.reduce((acc, v) => acc + v.stockQuantity, 0)
              : stockMap[node.id] ?? 10;

          let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
          if (totalStock <= 0) {
            stockStatus = "out_of_stock";
          } else if (totalStock <= 5) {
            stockStatus = "low_stock";
          }

          // Images collection
          const productImages: string[] = [];
          if (node.images?.edges) {
            node.images.edges.forEach((imgEdge) => {
              if (imgEdge.node?.url && !productImages.includes(imgEdge.node.url)) {
                productImages.push(imgEdge.node.url);
              }
            });
          }
          if (node.featuredImage?.url && !productImages.includes(node.featuredImage.url)) {
            productImages.unshift(node.featuredImage.url);
          }
          if (firstVariant?.image && !productImages.includes(firstVariant.image)) {
            productImages.push(firstVariant.image);
          }

          const fallbackImage =
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80";
          const finalMainImg = productImages[0] || fallbackImage;

          const primaryPrice = firstVariant ? firstVariant.price : 0;
          const primaryCompareAt = firstVariant ? firstVariant.compareAtPrice : undefined;
          const primarySku = firstVariant?.sku || (firstVariantNode?.sku ? firstVariantNode.sku : `INV-${idx + 1}`);

          const categoryTitle =
            node.productType ||
            node.tags?.find((t) => !["Admin Added", "active"].includes(t)) ||
            "General";

            const nodeTags = node.tags || [];
            const isHiddenByTag = nodeTags.some(
              (t) => t.toLowerCase() === "petpedia-hidden" || t.toLowerCase() === "hidden"
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
              options: node.options?.map((o) => ({
                id: o.id,
                name: o.name,
                values: o.values || [],
              })),
              variants: variantsList.length > 0 ? variantsList : undefined,
              hidden: isHidden,
            };
        });
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
        const firstVariant = node.variants?.edges?.[0]?.node;
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

        const stock = stockMap[node.id] ?? stockMap[firstVariant?.id] ?? 10;

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
          stockQuantity: stock,
          stockStatus: stock <= 0 ? "out_of_stock" : stock <= 5 ? "low_stock" : "in_stock",
          availableForSale: stock > 0,
          description: node.description || "",
          hidden: hiddenIds.has(node.id) || hiddenIds.has(node.handle),
        };
      });
    } catch (err) {
      console.error("[getAdminProductsFn] Critical fetch error:", err);
      return [];
    }
  }
);

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

    const target = stageRes.stagedUploadsCreate?.stagedTargets?.[0];
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
      console.warn("[uploadImageToShopify] Google Cloud Storage upload failed with status:", uploadRes.status);
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

export interface UploadImagePayload {
  filename: string;
  base64Data: string;
  contentType: string;
}

export const uploadProductImageFn = createServerFn({ method: "POST" })
  .validator((data: UploadImagePayload) => data)
  .handler(async ({ data }) => {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const ext = path.extname(data.filename) || ".png";
      const cleanName = path
        .basename(data.filename, ext)
        .replace(/[^a-zA-Z0-9-_]/g, "");
      const finalName = `prod-${Date.now()}-${cleanName}${ext}`;
      const filePath = path.join(uploadsDir, finalName);

      const base64Clean = data.base64Data.replace(/^data:image\/[a-z+]+;base64,/, "");
      const buffer = Buffer.from(base64Clean, "base64");
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${finalName}`;

      // Also push directly to Shopify via Staged Upload
      let shopifyUrl: string | null = null;
      try {
        shopifyUrl = await uploadImageToShopify(buffer, finalName, data.contentType || "image/png");
      } catch (shopErr) {
        console.warn("[uploadProductImageFn] Shopify staged upload fallback:", shopErr);
      }

      return {
        success: true,
        url: shopifyUrl || publicUrl,
        localUrl: publicUrl,
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
          media(first: 30) {
            edges {
              node {
                id
                ... on MediaImage {
                  image {
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
    return edges
      .map((e) => ({
        id: e.node.id,
        url: e.node.image?.url || "",
      }))
      .filter((m) => Boolean(m.url));
  } catch (err) {
    console.warn("[resolveProductMediaMap] Error:", err);
    return [];
  }
}

function findMediaIdForImage(imageTarget: string, mediaList: Array<{ id: string; url: string }>): string | undefined {
  if (!imageTarget) return undefined;
  const cleanTarget = imageTarget.split("?")[0]?.split("/").pop()?.toLowerCase() || "";
  if (!cleanTarget) return undefined;

  const match = mediaList.find((m) => {
    const cleanMedia = m.url.split("?")[0]?.split("/").pop()?.toLowerCase() || "";
    return cleanMedia === cleanTarget || m.url.toLowerCase().includes(cleanTarget);
  });

  return match?.id;
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

    const convertedImages: string[] = [];
    for (const rawImg of Array.from(new Set(rawImages))) {
      const converted = await convertLocalUrlToShopify(rawImg);
      if (converted && !convertedImages.includes(converted)) {
        convertedImages.push(converted);
      }
    }

    const primaryImage = convertedImages[0] || data.imageUrl;

    // Convert variant images if any
    const formattedVariants: SaveProductVariantPayload[] = [];
    if (data.variants && data.variants.length > 0) {
      for (const v of data.variants) {
        let vImg = v.image;
        if (vImg) {
          vImg = await convertLocalUrlToShopify(vImg);
        }
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
                  const mId = v.image ? findMediaIdForImage(v.image, productMediaList) : undefined;
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
                  const mId = v.image ? findMediaIdForImage(v.image, productMediaList) : undefined;
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
                      }
                    }
                  }
                }
              }
            `, { id: data.id });

            const shopifyVars = checkVarsRes.product?.variants?.edges || [];
            const linkList: Array<{ id: string; mediaId: string }> = [];

            for (const formattedV of formattedVariants) {
              if (!formattedV.image) continue;
              const matchedShopifyVar = shopifyVars.find((sv) =>
                formattedV.id ? sv.node.id === formattedV.id : sv.node.title.toLowerCase() === formattedV.title.toLowerCase()
              );
              if (!matchedShopifyVar) continue;
              const mId = findMediaIdForImage(formattedV.image, finalMedia);
              if (mId) {
                linkList.push({ id: matchedShopifyVar.node.id, mediaId: mId });
              }
            }

            if (linkList.length > 0) {
              await queryShopifyAdmin(`
                mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                    productVariants {
                      id
                      image {
                        id
                        url
                      }
                    }
                  }
                }
              `, {
                productId: data.id,
                variants: linkList,
              });
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
        }

        // Auto-publish to sales channels if scope is granted
        await tryAutoPublishToChannels(data.id);

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
                  variants(first: 10) {
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
                  variants(first: 10) {
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
            const productMediaList = await resolveProductMediaMap(createdProd.id);

            // Update the default first variant with option 1
            const firstOpt = formattedVariants[0];
            if (firstOpt) {
              const firstMId = firstOpt.image ? findMediaIdForImage(firstOpt.image, productMediaList) : undefined;
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
                      optionValues: [{ optionName: targetOptionName, name: firstOpt.title }],
                      price: firstOpt.price.toString(),
                      compareAtPrice: firstOpt.compareAtPrice ? firstOpt.compareAtPrice.toString() : undefined,
                      inventoryItem: {
                        sku: firstOpt.sku || undefined,
                      },
                      ...(firstMId ? { mediaId: firstMId } : {}),
                      ...(!firstMId && firstOpt.image && firstOpt.image.startsWith("http") && !firstOpt.image.includes("localhost")
                        ? { mediaSrc: [firstOpt.image] }
                        : {}),
                    },
                  ],
                });
              } catch (err1) {
                console.warn("[saveProductFn] New product first variant update error:", err1);
              }
            }

            // Create remaining variants
            if (formattedVariants.length > 1) {
              const remainingVariants = formattedVariants.slice(1);
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
                  productId: createdProd.id,
                  variants: remainingVariants.map((v) => {
                    const mId = v.image ? findMediaIdForImage(v.image, productMediaList) : undefined;
                    return {
                      optionValues: [{ optionName: targetOptionName, name: v.title }],
                      price: v.price.toString(),
                      compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toString() : undefined,
                      inventoryItem: {
                        sku: v.sku || undefined,
                      },
                      ...(mId ? { mediaId: mId } : {}),
                      ...(!mId && v.image && v.image.startsWith("http") && !v.image.includes("localhost")
                        ? { mediaSrc: [v.image] }
                        : {}),
                    };
                  }),
                });
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
                const mId = findMediaIdForImage(formattedV.image, finalMedia);
                if (mId) {
                  linkList.push({ id: matchedShopifyVar.node.id, mediaId: mId });
                }
              }

              if (linkList.length > 0) {
                await queryShopifyAdmin(`
                  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                      productVariants {
                        id
                        image {
                          id
                          url
                        }
                      }
                    }
                  }
                `, {
                  productId: createdProd.id,
                  variants: linkList,
                });
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
          }
        }

        // Auto-publish to sales channels if scope is granted
        await tryAutoPublishToChannels(createdProd.id);

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

      // Sync to Shopify: add "petpedia-hidden" tag
      try {
        const prodRes = await queryShopifyAdmin<{
          product?: { id: string; tags: string[] };
        }>(`
          query getProdTags($id: ID!) {
            product(id: $id) {
              id
              tags
            }
          }
        `, { id: fullGid });

        const existingTags = prodRes.product?.tags || [];
        if (!existingTags.includes("petpedia-hidden")) {
          const updatedTags = Array.from(new Set([...existingTags, "petpedia-hidden"]));
          await queryShopifyAdmin(`
            mutation productUpdate($product: ProductUpdateInput!) {
              productUpdate(product: $product) {
                product {
                  id
                  tags
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
            },
          });
        }
      } catch (shopErr) {
        console.warn("[toggleProductVisibilityFn] Shopify tag sync notice:", shopErr);
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

      // Ensure local stock map has positive stock for unhidden product
      setStockForKeys([
        { key: bareId, quantity: 15 },
        { key: fullGid, quantity: 15 },
      ]);

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
      } catch (shopErr) {
        console.warn("[toggleProductVisibilityFn] Shopify unhide tag sync notice:", shopErr);
      }
    }

    const updated = Array.from(current);
    saveHiddenProductIds(updated);

    return { success: true, hidden: data.hidden, hiddenProductIds: updated };
  });
