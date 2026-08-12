export interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  id?: string;
  url: string;
  altText?: string | null;
  width?: number;
  height?: number;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions?: ShopifySelectedOption[];
  price: ShopifyPrice;
  compareAtPrice?: ShopifyPrice | null;
  image?: ShopifyImage | null;
  sku?: string | null;
  quantityAvailable?: number | null;
}

export interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  availableForSale: boolean;
  productType?: string;
  vendor?: string;
  tags?: string[];
  priceRange?: {
    minVariantPrice: ShopifyPrice;
    maxVariantPrice?: ShopifyPrice;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyPrice;
    maxVariantPrice?: ShopifyPrice;
  };
  featuredImage?: ShopifyImage | null;
  images?: {
    edges: Array<{
      node: ShopifyImage;
    }>;
  };
  variants?: {
    edges: Array<{
      node: ShopifyProductVariant;
    }>;
  };
  collections?: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
      };
    }>;
  };
}

export interface ShopifyCollectionNode {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: ShopifyImage | null;
  products?: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor?: string | null;
    };
    edges: Array<{
      cursor: string;
      node: ShopifyProductNode;
    }>;
  };
}

export interface ShopifyCartLineMerchandise {
  id: string;
  title: string;
  product: {
    id: string;
    title: string;
    handle: string;
    featuredImage?: ShopifyImage | null;
  };
  price: ShopifyPrice;
  image?: ShopifyImage | null;
  selectedOptions?: ShopifySelectedOption[];
}

export interface ShopifyCartLineNode {
  id: string;
  quantity: number;
  cost: {
    totalAmount: ShopifyPrice;
    subtotalAmount?: ShopifyPrice;
  };
  merchandise: ShopifyCartLineMerchandise;
}

export interface ShopifyCartDiscountCode {
  code: string;
  applicable: boolean;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    edges: Array<{
      node: ShopifyCartLineNode;
    }>;
  };
  cost: {
    subtotalAmount: ShopifyPrice;
    totalAmount: ShopifyPrice;
    totalTaxAmount?: ShopifyPrice | null;
    totalDutyAmount?: ShopifyPrice | null;
  };
  discountCodes?: ShopifyCartDiscountCode[];
}

export interface ShopifyUserError {
  field: string[];
  message: string;
  code?: string;
}

export interface ShopifyPageInfo {
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  endCursor?: string | null;
  startCursor?: string | null;
}

export interface ShopifyProductsResponse {
  products: {
    pageInfo: ShopifyPageInfo;
    edges: Array<{
      cursor: string;
      node: ShopifyProductNode;
    }>;
  };
}

export interface ShopifySingleProductResponse {
  product: ShopifyProductNode | null;
}

export interface ShopifyCollectionsResponse {
  collections: {
    pageInfo: ShopifyPageInfo;
    edges: Array<{
      cursor: string;
      node: ShopifyCollectionNode;
    }>;
  };
}

export interface ShopifyCollectionByHandleResponse {
  collection: ShopifyCollectionNode | null;
}

export interface ShopifySearchResponse {
  search: {
    totalCount: number;
    pageInfo: ShopifyPageInfo;
    edges: Array<{
      cursor: string;
      node: ShopifyProductNode;
    }>;
  };
}
