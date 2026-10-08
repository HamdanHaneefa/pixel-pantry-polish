import { createServerFn } from "@tanstack/react-start";
import { ProductReview, ProductRatingSummary, SubmitReviewInput } from "./types";
import { queryShopifyAdmin } from "@/lib/admin/shopify-admin";

export * from "./types";

// In-memory cache of reviews indexed by product keys (bare ID, full GID, handle)
let inMemoryReviews: Record<string, ProductReview[]> | null = null;

function normalizeKey(key?: string): string {
  if (!key) return "";
  const trimmed = key.trim().toLowerCase();
  const bare = trimmed.split("/").pop() || trimmed;
  return bare;
}

function calculateSummary(reviews: ProductReview[]): ProductRatingSummary {
  const approved = reviews.filter((r) => r.status !== "pending");
  const count = approved.length;

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (count === 0) {
    return { rating: 0, reviews: 0, breakdown };
  }

  let totalSum = 0;
  for (const r of approved) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    breakdown[star] = (breakdown[star] || 0) + 1;
    totalSum += r.rating;
  }

  const avg = Number((totalSum / count).toFixed(1));
  return {
    rating: avg,
    reviews: count,
    breakdown,
  };
}

async function loadReviewsFromDisk(): Promise<Record<string, ProductReview[]>> {
  if (inMemoryReviews !== null) {
    return inMemoryReviews;
  }

  let loaded: Record<string, ProductReview[]> = {};

  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const file = path.resolve(process.cwd(), "src", "data", "product-reviews.json");

      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, "utf-8");
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null) {
          loaded = parsed;
        }
      }
    } catch (err) {
      console.warn("[loadReviewsFromDisk] Error reading product-reviews.json:", err);
    }
  }

  inMemoryReviews = loaded;
  return inMemoryReviews;
}

async function saveReviewsToDisk(data: Record<string, ProductReview[]>): Promise<void> {
  inMemoryReviews = data;

  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const targetPaths = [
        path.resolve(process.cwd(), "src", "data", "product-reviews.json"),
        path.resolve(process.cwd(), "public", "data", "product-reviews.json"),
      ];

      const jsonStr = JSON.stringify(data, null, 2);

      for (const file of targetPaths) {
        try {
          const dir = path.dirname(file);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(file, jsonStr, "utf-8");
        } catch {
          // ignore individual path write errors
        }
      }
    } catch (err) {
      console.warn("[saveReviewsToDisk] Failed to write product-reviews.json:", err);
    }
  }
}

/**
 * Asynchronously syncs reviews and rating summaries to Shopify Product Metafields
 */
async function syncReviewsToShopify(
  productId: string,
  reviews: ProductReview[],
  summary: ProductRatingSummary
): Promise<void> {
  try {
    const rawId = productId.trim();
    const numericId = rawId.split("/").pop();
    if (!numericId || !/^\d+$/.test(numericId)) {
      return; // Skip non-Shopify mock products
    }

    const productGid = `gid://shopify/Product/${numericId}`;

    // Format rating value conforming to standard Shopify rating metafield structure
    const ratingValueObj = {
      value: String(summary.rating || 0),
      scale_min: "1.0",
      scale_max: "5.0",
    };

    const mutation = `
      mutation setProductReviewsMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      metafields: [
        {
          ownerId: productGid,
          namespace: "petpedia",
          key: "reviews",
          type: "json",
          value: JSON.stringify(reviews),
        },
        {
          ownerId: productGid,
          namespace: "reviews",
          key: "rating",
          type: "rating",
          value: JSON.stringify(ratingValueObj),
        },
        {
          ownerId: productGid,
          namespace: "reviews",
          key: "rating_count",
          type: "number_integer",
          value: String(summary.reviews || 0),
        },
      ],
    };

    const res = await queryShopifyAdmin(mutation, variables);
    if (res?.data?.metafieldsSet?.userErrors?.length > 0) {
      console.warn(
        `[syncReviewsToShopify] Metafield userErrors for ${productGid}:`,
        res.data.metafieldsSet.userErrors
      );
    }
  } catch (err) {
    console.warn(`[syncReviewsToShopify] Failed to sync metafields for ${productId}:`, err);
  }
}

async function fetchReviewsFromShopify(productId: string): Promise<ProductReview[] | null> {
  try {
    const rawId = productId.trim();
    const numericId = rawId.split("/").pop();
    if (!numericId || !/^\d+$/.test(numericId)) return null;

    const productGid = `gid://shopify/Product/${numericId}`;
    const query = `
      query getProductReviewsMetafield($id: ID!) {
        product(id: $id) {
          metafield(namespace: "petpedia", key: "reviews") {
            value
          }
        }
      }
    `;

    const res = await queryShopifyAdmin(query, { id: productGid });
    const rawVal = res?.data?.product?.metafield?.value;
    if (rawVal) {
      const parsed = JSON.parse(rawVal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ProductReview[];
      }
    }
  } catch {
    // Non-blocking fallback
  }
  return null;
}

/**
 * Server Function: Get reviews & summary for a specific product
 */
export const getProductReviewsFn = createServerFn({ method: "GET" })
  .validator((d: { productId?: string; handle?: string }) => d)
  .handler(async ({ data }) => {
    const all = await loadReviewsFromDisk();
    const pid = normalizeKey(data?.productId);
    const phandle = normalizeKey(data?.handle);

    // Look up by bare ID, full ID, or handle
    let list =
      (pid && all[pid]) ||
      (phandle && all[phandle]) ||
      (data?.productId && all[data.productId]) ||
      [];

    // If disk has no reviews, check if Shopify Admin has reviews stored in metafields
    if (list.length === 0 && data?.productId) {
      const remoteReviews = await fetchReviewsFromShopify(data.productId);
      if (remoteReviews && remoteReviews.length > 0) {
        list = remoteReviews;
        if (pid) all[pid] = list;
        if (phandle) all[phandle] = list;
        await saveReviewsToDisk(all);
      }
    }

    const summary = calculateSummary(list);
    return {
      reviews: list.filter((r) => r.status !== "pending"),
      summary,
    };
  });

/**
 * Server Function: Get all rating summaries across catalog for instant listing normalization
 */
export const getAllReviewSummariesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const all = await loadReviewsFromDisk();
    const map: Record<string, { rating: number; reviews: number }> = {};

    for (const [key, list] of Object.entries(all)) {
      if (Array.isArray(list) && list.length > 0) {
        const summary = calculateSummary(list);
        map[key] = { rating: summary.rating, reviews: summary.reviews };
      }
    }

    return map;
  });

/**
 * Server Function: Submit a guest customer review (No login required)
 */
export const submitProductReviewFn = createServerFn({ method: "POST" })
  .validator((d: SubmitReviewInput) => d)
  .handler(async ({ data }) => {
    // 1. Anti-spam check (honeypot field)
    if (data.honeypot && data.honeypot.trim().length > 0) {
      return { success: false, error: "Spam detected." };
    }

    const rating = Math.min(5, Math.max(1, Number(data.rating) || 5));
    const author = (data.author || "Verified Customer").trim();
    const title = (data.title || "").trim();
    const comment = (data.comment || "").trim();

    if (!title) {
      return { success: false, error: "Review title is required." };
    }

    if (!comment || comment.length < 5) {
      return { success: false, error: "Review comment must be at least 5 characters." };
    }

    const productId = data.productId || "";
    const productHandle = data.productHandle || "";
    const pid = normalizeKey(productId);
    const phandle = normalizeKey(productHandle);
    const targetKey = pid || phandle || "general";

    const all = await loadReviewsFromDisk();
    const existing = all[targetKey] || [];

    const newReview: ProductReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId,
      productHandle,
      author,
      email: data.email?.trim() || undefined,
      rating,
      title,
      comment,
      createdAt: new Date().toISOString(),
      status: "approved", // Auto-approved for instant visibility; store owners can moderate via admin
      verifiedPurchase: false,
    };

    // Prepend so the newest review is at the top
    const updated = [newReview, ...existing];
    all[targetKey] = updated;

    // Index under both ID and handle for fast lookups
    if (phandle && phandle !== targetKey) {
      all[phandle] = updated;
    }
    if (pid && pid !== targetKey) {
      all[pid] = updated;
    }

    await saveReviewsToDisk(all);

    // Asynchronously push to Shopify Admin Product Metafields
    const summary = calculateSummary(updated);
    if (productId) {
      syncReviewsToShopify(productId, updated, summary).catch(() => {});
    }

    return {
      success: true,
      review: newReview,
      summary,
    };
  });
