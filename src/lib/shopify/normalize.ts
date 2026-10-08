import type { Product, Badge } from "@/data/home";
import type {
  ShopifyProductNode,
  ShopifyCart,
  ShopifyCollectionNode,
} from "./types";

/**
 * Parses tags or discount percentages into visual Badges
 */
export function extractBadges(
  price: number,
  mrp?: number,
  tags: string[] = []
): Badge[] {
  return [];
}

import productReviewsData from "@/data/product-reviews.json";

/**
 * Retrieves real ratings and review count for products from the review store.
 * Returns { rating: 0, reviews: 0 } when no reviews exist.
 */
export function getProductRating(id?: string, handle?: string): { rating: number; reviews: number } {
  if (!id && !handle) {
    return { rating: 0, reviews: 0 };
  }
  const pid = id ? id.split("/").pop()?.toLowerCase() : "";
  const phandle = handle?.toLowerCase();

  const reviewsMap = (productReviewsData as unknown as Record<string, any[]>) || {};
  const list =
    (pid && reviewsMap[pid]) ||
    (phandle && reviewsMap[phandle]) ||
    (id && reviewsMap[id]) ||
    [];

  if (!Array.isArray(list) || list.length === 0) {
    return { rating: 0, reviews: 0 };
  }

  const approved = list.filter((r) => r.status !== "pending");
  if (approved.length === 0) {
    return { rating: 0, reviews: 0 };
  }

  const total = approved.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const avg = Number((total / approved.length).toFixed(1));
  return { rating: avg, reviews: approved.length };
}

/**
 * Normalizes a single Shopify Product GraphQL node into Petpedia's Product structure
 */
export function normalizeShopifyProduct(node: ShopifyProductNode): Product {
  const minPrice = parseFloat(node.priceRange?.minVariantPrice?.amount || "0");
  const compareAtPrice = node.compareAtPriceRange?.minVariantPrice?.amount
    ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
    : undefined;

  const defaultImage =
    node.featuredImage?.url ||
    node.images?.edges?.[0]?.node?.url ||
    "/placeholder-product.png";

  const allImages =
    node.images?.edges?.map((edge) => edge.node.url).filter(Boolean) || [
      defaultImage,
    ];

  const variants =
    node.variants?.edges?.map((edge) => {
      const v = edge.node;
      return {
        id: v.id,
        title: v.title,
        price: parseFloat(v.price.amount),
        compareAtPrice: v.compareAtPrice
          ? parseFloat(v.compareAtPrice.amount)
          : undefined,
        sku: v.sku ? v.sku.trim() : undefined,
        availableForSale: v.availableForSale,
        image: v.image?.url || defaultImage,
        selectedOptions: v.selectedOptions || [],
      };
    }) || [];

  const { rating, reviews } = getProductRating(node.id, node.handle);
  const badges = extractBadges(minPrice, compareAtPrice, node.tags);
  const tags = node.tags || [];
  const hasNoCodTag = tags.some((t) => {
    const s = t.toLowerCase();
    return s === "no-cod" || s === "cod-disabled" || s === "prepaid-only";
  });

  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    price: minPrice,
    mrp: compareAtPrice && compareAtPrice > minPrice ? compareAtPrice : undefined,
    rating,
    reviews,
    image: defaultImage,
    images: allImages,
    badges,
    description: node.description || "",
    descriptionHtml: node.descriptionHtml || "",
    availableForSale: node.availableForSale,
    productType: node.productType || "",
    vendor: node.vendor || "",
    tags,
    isCodAvailable: !hasNoCodTag,
    variants,
  };
}

export function normalizeAdminProduct(ap: import("@/lib/admin/products").AdminProduct): Product {
  const { rating, reviews } = getProductRating(ap.id, ap.handle);
  const badges = extractBadges(ap.price, ap.compareAtPrice, [ap.category]);
  const defaultImage = ap.imageUrl || ap.images?.[0] || "/placeholder-product.png";

  const variants = (ap.variants || []).map((v) => ({
    id: v.id,
    title: v.title,
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    sku: v.sku,
    availableForSale: v.stockQuantity > 0,
    stockQuantity: v.stockQuantity,
    image: v.image || defaultImage,
    selectedOptions: v.selectedOptions && v.selectedOptions.length > 0 ? v.selectedOptions : [{ name: "Title", value: v.title }],
  }));

  return {
    id: ap.id,
    title: ap.title,
    handle: ap.handle,
    price: ap.price,
    mrp: ap.compareAtPrice && ap.compareAtPrice > ap.price ? ap.compareAtPrice : undefined,
    rating,
    reviews,
    image: defaultImage,
    images: ap.images && ap.images.length > 0 ? ap.images : [defaultImage],
    badges,
    description: ap.description || "",
    descriptionHtml:
      ap.descriptionHtml ||
      (ap.description
        ? `<p>${ap.description.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`
        : ""),
    availableForSale: ap.stockQuantity > 0,
    stockQuantity: ap.stockQuantity,
    productType: ap.category,
    vendor: "Petpedia",
    tags: ap.tags || [ap.category],
    isCodAvailable: ap.isCodAvailable !== false,
    variants:
      variants.length > 0
        ? variants
        : [
            {
              id: ap.variantId || ap.id,
              title: "Default Title",
              price: ap.price,
              compareAtPrice: ap.compareAtPrice,
              sku: ap.sku,
              availableForSale: ap.stockQuantity > 0,
              stockQuantity: ap.stockQuantity,
              image: defaultImage,
              selectedOptions: [{ name: "Title", value: "Default Title" }],
            },
          ],
  };
}

export interface AppCartItem {
  id: string; // Line ID
  variantId: string;
  productId: string;
  title: string;
  productTitle: string;
  handle: string;
  price: number;
  mrp?: number;
  quantity: number;
  image: string;
  selectedOptions?: Array<{ name: string; value: string }>;
  isCodAvailable?: boolean;
}

export interface AppCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: number;
  tax: number;
  total: number;
  items: AppCartItem[];
  discountCodes: string[];
}

/**
 * Ensures checkout URLs route to the myshopify.com checkout server
 * avoiding 404 errors when custom domains are mapped to the headless frontend
 */
export function formatCheckoutUrl(rawCheckoutUrl: string): string {
  if (!rawCheckoutUrl || !rawCheckoutUrl.startsWith("http")) return rawCheckoutUrl;
  try {
    const url = new URL(rawCheckoutUrl);
    const storeDomain =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_SHOPIFY_STORE_DOMAIN) ||
      "1fcjnw-tz.myshopify.com";
    const cleanStoreDomain = storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (cleanStoreDomain.includes("myshopify.com")) {
      url.hostname = cleanStoreDomain;
    }
    return url.toString();
  } catch {
    return rawCheckoutUrl;
  }
}

/**
 * Normalizes a Shopify Cart object into the AppCart representation
 */
export function normalizeShopifyCart(cart: ShopifyCart): AppCart {
  const items: AppCartItem[] = (cart.lines?.edges || []).map(({ node }) => {
    const merch = node.merchandise;
    const price = parseFloat(merch?.price?.amount || "0");
    const image =
      merch?.image?.url ||
      merch?.product?.featuredImage?.url ||
      "/placeholder-product.png";

    return {
      id: node.id,
      variantId: merch?.id || "",
      productId: merch?.product?.id || "",
      title: merch?.title !== "Default Title" ? merch?.title : merch?.product?.title || "",
      productTitle: merch?.product?.title || "",
      handle: merch?.product?.handle || "",
      price,
      quantity: node.quantity,
      image,
      selectedOptions: merch?.selectedOptions || [],
    };
  });

  const subtotal = parseFloat(cart.cost?.subtotalAmount?.amount || "0");
  const tax = parseFloat(cart.cost?.totalTaxAmount?.amount || "0");
  const total = parseFloat(cart.cost?.totalAmount?.amount || `${subtotal + tax}`);

  return {
    id: cart.id,
    checkoutUrl: formatCheckoutUrl(cart.checkoutUrl),
    totalQuantity: cart.totalQuantity || items.reduce((acc, it) => acc + it.quantity, 0),
    subtotal,
    tax,
    total,
    items,
    discountCodes: (cart.discountCodes || [])
      .filter((d) => d.applicable)
      .map((d) => d.code),
  };
}

