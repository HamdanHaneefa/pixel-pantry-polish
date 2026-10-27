import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { Product } from "@/data/home";

const WISHLIST_STORAGE_KEY = "petpedia_wishlist_items";

export interface WishlistItem {
  id: string;
  title: string;
  handle?: string;
  price: number;
  mrp?: number;
  image: string;
  availableForSale?: boolean;
  stockQuantity?: number;
  variantId?: string;
  vendor?: string;
  tags?: string[];
  variants?: any[];
}

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  isInWishlist: (id?: string | number) => boolean;
  addToWishlist: (product: any) => void;
  removeFromWishlist: (id: string | number) => void;
  toggleWishlist: (product: any) => boolean;
  clearWishlist: () => void;
}

const fallbackWishlistContext: WishlistContextType = {
  items: [],
  itemCount: 0,
  isInWishlist: () => false,
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  toggleWishlist: () => false,
  clearWishlist: () => {},
};

const WishlistContext = createContext<WishlistContextType>(fallbackWishlistContext);

function matchesId(itemId: string, checkId?: string | number, itemHandle?: string): boolean {
  if (!checkId) return false;
  const strCheck = String(checkId).trim().toLowerCase();
  const strItem = String(itemId).trim().toLowerCase();
  if (strCheck === strItem) return true;

  const bareCheck = strCheck.split("/").pop();
  const bareItem = strItem.split("/").pop();
  if (bareCheck && bareItem && bareCheck === bareItem) return true;

  if (itemHandle && itemHandle.toLowerCase() === strCheck) return true;
  return false;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (err) {
      console.warn("[WishlistContext] Failed to load from localStorage:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("[WishlistContext] Failed to persist to localStorage:", err);
    }
  }, [items, isHydrated]);

  const isInWishlist = useCallback(
    (id?: string | number): boolean => {
      if (!id) return false;
      return items.some((it) => matchesId(it.id, id, it.handle));
    },
    [items],
  );

  const addToWishlist = useCallback((product: any) => {
    if (!product || !product.id) return;
    setItems((prev) => {
      if (prev.some((it) => matchesId(it.id, product.id, it.handle || product.handle))) {
        return prev;
      }
      const newItem: WishlistItem = {
        id: String(product.id),
        title: product.title || "Product",
        handle: product.handle,
        price: Number(product.price) || 0,
        mrp: product.mrp ? Number(product.mrp) : undefined,
        image: product.image || product.imageUrl || product.images?.[0] || "/placeholder-product.png",
        availableForSale: product.availableForSale !== false,
        stockQuantity: product.stockQuantity,
        variantId: product.variantId || product.variants?.[0]?.id || String(product.id),
        vendor: product.vendor,
        tags: product.tags,
        variants: product.variants,
      };
      return [newItem, ...prev];
    });
  }, []);

  const removeFromWishlist = useCallback((id: string | number) => {
    if (!id) return;
    setItems((prev) => prev.filter((it) => !matchesId(it.id, id, it.handle)));
  }, []);

  const toggleWishlist = useCallback(
    (product: any): boolean => {
      if (!product || !product.id) return false;
      const exists = items.some((it) => matchesId(it.id, product.id, it.handle || product.handle));
      if (exists) {
        removeFromWishlist(product.id);
        return false;
      } else {
        addToWishlist(product);
        return true;
      }
    },
    [items, addToWishlist, removeFromWishlist],
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
