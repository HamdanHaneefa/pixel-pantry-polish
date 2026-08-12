import { isShopifyConfigured, shopifyFetch } from "./client";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
  GET_CART_QUERY,
} from "./mutations";
import { ShopifyCart } from "./types";
import { normalizeShopifyCart, AppCart } from "./normalize";

interface ShopifyCartMutationResponse {
  cartCreate?: { cart: ShopifyCart; userErrors: Array<{ message: string }> };
  cartLinesAdd?: { cart: ShopifyCart; userErrors: Array<{ message: string }> };
  cartLinesUpdate?: { cart: ShopifyCart; userErrors: Array<{ message: string }> };
  cartLinesRemove?: { cart: ShopifyCart; userErrors: Array<{ message: string }> };
  cartDiscountCodesUpdate?: { cart: ShopifyCart; userErrors: Array<{ message: string }> };
  cartBuyerIdentityUpdate?: { cart: ShopifyCart; userErrors: Array<{ message: string }> };
  cart?: ShopifyCart;
}

export async function createCart(
  lines: Array<{ merchandiseId: string; quantity: number }> = []
): Promise<AppCart | null> {
  if (!isShopifyConfigured()) return null;

  try {
    const data = await shopifyFetch<ShopifyCartMutationResponse>(
      CART_CREATE_MUTATION,
      { input: { lines } }
    );

    if (data?.cartCreate?.cart) {
      return normalizeShopifyCart(data.cartCreate.cart);
    }
  } catch (error) {
    console.error("[Shopify createCart Error]:", error);
  }
  return null;
}

export async function fetchCart(cartId: string): Promise<AppCart | null> {
  if (!isShopifyConfigured() || !cartId) return null;

  try {
    const data = await shopifyFetch<ShopifyCartMutationResponse>(
      GET_CART_QUERY,
      { cartId }
    );

    if (data?.cart) {
      return normalizeShopifyCart(data.cart);
    }
  } catch (error) {
    console.error("[Shopify fetchCart Error]:", error);
  }
  return null;
}

export async function addLinesToCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<AppCart | null> {
  if (!isShopifyConfigured() || !cartId) return null;

  try {
    const data = await shopifyFetch<ShopifyCartMutationResponse>(
      CART_LINES_ADD_MUTATION,
      { cartId, lines }
    );

    if (data?.cartLinesAdd?.cart) {
      return normalizeShopifyCart(data.cartLinesAdd.cart);
    }
  } catch (error) {
    console.error("[Shopify addLinesToCart Error]:", error);
  }
  return null;
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<AppCart | null> {
  if (!isShopifyConfigured() || !cartId) return null;

  try {
    const data = await shopifyFetch<ShopifyCartMutationResponse>(
      CART_LINES_UPDATE_MUTATION,
      { cartId, lines }
    );

    if (data?.cartLinesUpdate?.cart) {
      return normalizeShopifyCart(data.cartLinesUpdate.cart);
    }
  } catch (error) {
    console.error("[Shopify updateCartLines Error]:", error);
  }
  return null;
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<AppCart | null> {
  if (!isShopifyConfigured() || !cartId) return null;

  try {
    const data = await shopifyFetch<ShopifyCartMutationResponse>(
      CART_LINES_REMOVE_MUTATION,
      { cartId, lineIds }
    );

    if (data?.cartLinesRemove?.cart) {
      return normalizeShopifyCart(data.cartLinesRemove.cart);
    }
  } catch (error) {
    console.error("[Shopify removeCartLines Error]:", error);
  }
  return null;
}

export async function updateDiscountCodes(
  cartId: string,
  discountCodes: string[]
): Promise<AppCart | null> {
  if (!isShopifyConfigured() || !cartId) return null;

  try {
    const data = await shopifyFetch<ShopifyCartMutationResponse>(
      CART_DISCOUNT_CODES_UPDATE_MUTATION,
      { cartId, discountCodes }
    );

    if (data?.cartDiscountCodesUpdate?.cart) {
      return normalizeShopifyCart(data.cartDiscountCodesUpdate.cart);
    }
  } catch (error) {
    console.error("[Shopify updateDiscountCodes Error]:", error);
  }
  return null;
}

export async function updateCartBuyerIdentity(
  cartId: string,
  buyerIdentity: {
    email?: string | undefined;
    phone?: string | undefined;
    deliveryAddressPreferences?: Array<{
      deliveryAddress: {
        address1: string;
        city: string;
        country: string;
        zip: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        phone?: string | undefined;
      };
    }> | undefined;
  }
): Promise<AppCart | null> {
  if (!isShopifyConfigured() || !cartId) return null;

  try {
    const data = await shopifyFetch<ShopifyCartMutationResponse>(
      CART_BUYER_IDENTITY_UPDATE_MUTATION,
      { cartId, buyerIdentity }
    );

    if (data?.cartBuyerIdentityUpdate?.cart) {
      return normalizeShopifyCart(data.cartBuyerIdentityUpdate.cart);
    }
  } catch (error) {
    console.error("[Shopify updateCartBuyerIdentity Error]:", error);
  }
  return null;
}

