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
  const badges: Badge[] = [];

  // Check tags for custom badges
  tags.forEach((tag) => {
    const lower = tag.toLowerCase();
    if (lower.includes("hot")) badges.push({ label: "HOT", tone: "hot" });
    else if (lower.includes("deal") || lower.includes("best deal"))
      badges.push({ label: "BEST DEALS", tone: "deal" });
    else if (lower.includes("sale"))
      badges.push({ label: "SALE", tone: "sale" });
  });

  // Calculate discount badge if MRP is higher than sale price
  if (mrp && mrp > price) {
    const discountPct = Math.round(((mrp - price) / mrp) * 100);
    if (discountPct > 0 && !badges.some((b) => b.tone === "off")) {
      badges.unshift({ label: `${discountPct}% OFF`, tone: "off" });
    }
  }

  return badges;
}

/**
 * Generates deterministic pseudo-ratings for Shopify products that lack a review app
 */
export function getProductRating(id: string): { rating: number; reviews: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const rating = 4 + (positiveHash % 10) / 10; // e.g. 4.0 - 4.9
  const reviews = 50 + (positiveHash % 850); // e.g. 50 - 900
  return { rating: Number(rating.toFixed(1)), reviews };
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

  const { rating, reviews } = getProductRating(node.id);
  const badges = extractBadges(minPrice, compareAtPrice, node.tags);

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
    tags: node.tags || [],
    variants,
  };
}

export function normalizeAdminProduct(ap: import("@/lib/admin/products").AdminProduct): Product {
  const { rating, reviews } = getProductRating(ap.id);
  const badges = extractBadges(ap.price, ap.compareAtPrice, [ap.category]);
  const defaultImage = ap.imageUrl || ap.images?.[0] || "/placeholder-product.png";

  const variants = (ap.variants || []).map((v) => ({
    id: v.id,
    title: v.title,
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    sku: v.sku,
    availableForSale: v.stockQuantity > 0,
    image: v.image || defaultImage,
    selectedOptions: [{ name: "Title", value: v.title }],
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
    descriptionHtml: ap.description ? `<p>${ap.description}</p>` : "",
    availableForSale: ap.stockQuantity > 0,
    productType: ap.category,
    vendor: "Petpedia",
    tags: [ap.category],
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

