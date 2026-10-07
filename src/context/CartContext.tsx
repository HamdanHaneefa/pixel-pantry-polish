import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { AppCart, AppCartItem } from "@/lib/shopify/normalize";
import { isShopifyConfigured } from "@/lib/shopify/client";
import {
  createCart,
  fetchCart,
  addLinesToCart,
  updateCartLines,
  removeCartLines,
  updateDiscountCodes,
} from "@/lib/shopify/cart";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";

const CART_ID_STORAGE_KEY = "petpedia_shopify_cart_id";
const LOCAL_CART_STORAGE_KEY = "petpedia_local_cart_items";

interface CartContextType {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  cart: AppCart;
  itemCount: number;
  isLoading: boolean;
  addItem: (params: {
    variantId: string;
    quantity?: number;
    product?: {
      id: string;
      title: string;
      handle?: string | undefined;
      price: number;
      mrp?: number | undefined;
      image: string;
      isCodAvailable?: boolean | undefined;
    } | undefined;
  }) => Promise<void>;
  updateQuantity: (lineId: string, deltaOrQuantity: number, isDirectSet?: boolean) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  clearCart: () => void;
}

const emptyCart: AppCart = {
  id: "",
  checkoutUrl: "/checkout",
  totalQuantity: 0,
  subtotal: 0,
  tax: 0,
  total: 0,
  items: [],
  discountCodes: [],
};

const fallbackCartContext: CartContextType = {
  isCartOpen: false,
  setIsCartOpen: () => {},
  openCart: () => {},
  closeCart: () => {},
  cart: emptyCart,
  itemCount: 0,
  isLoading: false,
  addItem: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  applyDiscount: async () => {},
  clearCart: () => {},
};

const CartContext = createContext<CartContextType>(fallbackCartContext);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<AppCart>(emptyCart);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Recalculate cart totals helper for local fallback
  const computeLocalCart = useCallback((items: AppCartItem[]): AppCart => {
    const totalQuantity = items.reduce((acc, it) => acc + it.quantity, 0);
    const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const discount = items.length > 0 ? 100 : 0;
    const tax = Math.round(subtotal * 0.05);
    const total = Math.max(0, subtotal - discount + tax);

    return {
      id: "local_cart",
      checkoutUrl: "/checkout",
      totalQuantity,
      subtotal,
      tax,
      total,
      items,
      discountCodes: discount > 0 ? ["GET10"] : [],
    };
  }, []);

  // Initialize cart on mount
  useEffect(() => {
    let isMounted = true;

    async function initCart() {
      if (typeof window === "undefined") return;

      if (isShopifyConfigured()) {
        const storedCartId = localStorage.getItem(CART_ID_STORAGE_KEY);
        if (storedCartId) {
          setCartId(storedCartId);
          setIsLoading(true);
          try {
            const liveCart = await fetchCart(storedCartId);
            if (isMounted && liveCart) {
              setCart(liveCart);
            }
          } catch (e) {
            console.warn("Failed to load existing Shopify cart, resetting:", e);
            localStorage.removeItem(CART_ID_STORAGE_KEY);
          } finally {
            if (isMounted) setIsLoading(false);
          }
        }
      } else {
        // Load local cart
        const saved = localStorage.getItem(LOCAL_CART_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as AppCartItem[];
            if (Array.isArray(parsed) && isMounted) {
              setCart(computeLocalCart(parsed));
            }
          } catch (e) {
            console.error("Failed to parse local cart:", e);
          }
        }
      }
    }

    initCart();
    return () => {
      isMounted = false;
    };
  }, [computeLocalCart]);

  // Persist local cart changes
  const saveLocalCart = (newItems: AppCartItem[]) => {
    const updated = computeLocalCart(newItems);
    setCart(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_CART_STORAGE_KEY, JSON.stringify(newItems));
    }
  };

  // Add Item to Cart
  const addItem = async ({
    variantId,
    quantity = 1,
    product,
  }: {
    variantId: string;
    quantity?: number;
    product?: {
      id: string;
      title: string;
      handle?: string | undefined;
      price: number;
      mrp?: number | undefined;
      image: string;
      isCodAvailable?: boolean | undefined;
    } | undefined;
  }) => {
    setIsLoading(true);
    try {
      if (
        product &&
        ((product as any).availableForSale === false ||
          ((product as any).stockQuantity !== undefined && (product as any).stockQuantity <= 0))
      ) {
        console.warn("[CartContext] Cannot add out-of-stock product to cart:", product.title);
        setIsLoading(false);
        return;
      }

      const isShopifyVariant = variantId && variantId.startsWith("gid://shopify/ProductVariant/");

      if (isShopifyConfigured() && isShopifyVariant) {
        let currentCartId = cartId;
        if (!currentCartId) {
          const newCart = await createCart([{ merchandiseId: variantId, quantity }]);
          if (newCart) {
            setCartId(newCart.id);
            setCart(newCart);
            localStorage.setItem(CART_ID_STORAGE_KEY, newCart.id);
          }
        } else {
          const updated = await addLinesToCart(currentCartId, [
            { merchandiseId: variantId, quantity },
          ]);
          if (updated) setCart(updated);
        }
      } else {
        // Local Fallback
        const currentItems = [...cart.items];
        const existingIdx = currentItems.findIndex(
          (it) => it.variantId === variantId
        );

        if (existingIdx > -1) {
          const existing = currentItems[existingIdx]!;
          currentItems[existingIdx] = {
            ...existing,
            quantity: existing.quantity + quantity,
          };
        } else if (product) {
          currentItems.push({
            id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            variantId: variantId || `var_${product.id}`,
            productId: product.id,
            title: product.title,
            productTitle: product.title,
            handle: product.handle || "",
            price: product.price,
            mrp: product.mrp || product.price,
            quantity,
            image: product.image,
            isCodAvailable: product.isCodAvailable !== false,
          });
        }
        saveLocalCart(currentItems);
      }
      if (product) {
        trackAddToCart({
          id: product.id,
          name: product.title,
          price: product.price,
          quantity,
        });
      }
      setIsCartOpen(true);
    } catch (err) {
      console.error("Failed to add item to cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (
    lineId: string,
    deltaOrQuantity: number,
    isDirectSet = false
  ) => {
    setIsLoading(true);
    try {
      if (isShopifyConfigured() && cartId) {
        const item = cart.items.find((i) => i.id === lineId);
        if (!item) return;

        const newQty = isDirectSet ? deltaOrQuantity : item.quantity + deltaOrQuantity;
        if (newQty <= 0) {
          const updated = await removeCartLines(cartId, [lineId]);
          if (updated) setCart(updated);
        } else {
          const updated = await updateCartLines(cartId, [
            { id: lineId, quantity: newQty },
          ]);
          if (updated) setCart(updated);
        }
      } else {
        // Local update
        let updatedItems = [...cart.items];
        const idx = updatedItems.findIndex((i) => i.id === lineId);
        if (idx > -1) {
          const item = updatedItems[idx]!;
          const newQty = isDirectSet ? deltaOrQuantity : item.quantity + deltaOrQuantity;
          if (newQty <= 0) {
            updatedItems = updatedItems.filter((i) => i.id !== lineId);
          } else {
            updatedItems[idx] = { ...item, quantity: newQty };
          }
          saveLocalCart(updatedItems);
        }
      }
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove Item
  const removeItem = async (lineId: string) => {
    setIsLoading(true);
    try {
      const itemToRemove = cart.items.find((i) => i.id === lineId);
      if (itemToRemove) {
        trackRemoveFromCart({
          id: itemToRemove.productId || itemToRemove.id,
          name: itemToRemove.title,
          price: itemToRemove.price,
          quantity: itemToRemove.quantity,
        });
      }
      if (isShopifyConfigured() && cartId) {
        const updated = await removeCartLines(cartId, [lineId]);
        if (updated) setCart(updated);
      } else {
        const updatedItems = cart.items.filter((i) => i.id !== lineId);
        saveLocalCart(updatedItems);
      }
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply Discount Code
  const applyDiscount = async (code: string) => {
    if (!code.trim()) return;
    setIsLoading(true);
    try {
      if (isShopifyConfigured() && cartId) {
        const updated = await updateDiscountCodes(cartId, [code.trim()]);
        if (updated) setCart(updated);
      } else {
        // Mock coupon effect
        if (code.toUpperCase() === "GET10" || code.toUpperCase() === "PET10") {
          const items = [...cart.items];
          const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
          const discount = Math.round(subtotal * 0.1);
          const tax = Math.round((subtotal - discount) * 0.05);
          setCart({
            ...cart,
            subtotal,
            tax,
            total: Math.max(0, subtotal - discount + tax),
            discountCodes: [code.toUpperCase()],
          });
        }
      }
    } catch (err) {
      console.error("Failed to apply discount code:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    setCart(emptyCart);
    setCartId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_ID_STORAGE_KEY);
      localStorage.removeItem(LOCAL_CART_STORAGE_KEY);
    }
  };

  const itemCount = cart.items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        cart,
        itemCount,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        applyDiscount,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  return context || fallbackCartContext;
}
