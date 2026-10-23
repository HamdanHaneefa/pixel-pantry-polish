import defaultStockMap from "@/data/product-stock.json";
import { storageGet, storageSet } from "@/lib/storage/adapter";

let inMemoryStockMap: Record<string, number> = { ...(defaultStockMap as Record<string, number>) };

export function loadProductStockMap(): Record<string, number> {
  return inMemoryStockMap;
}

export async function refreshProductStockMap(): Promise<Record<string, number>> {
  const loaded = await storageGet<Record<string, number>>("product-stock", inMemoryStockMap);
  inMemoryStockMap = { ...loaded };
  return inMemoryStockMap;
}

export async function saveProductStockMap(map: Record<string, number>): Promise<void> {
  inMemoryStockMap = { ...map };
  await storageSet("product-stock", map);
}

export async function setStockForKeys(
  items: Array<{ key: string; quantity: number }>,
): Promise<void> {
  const current = { ...loadProductStockMap() };
  for (const item of items) {
    if (item.key) {
      current[item.key] = Math.max(0, Math.floor(Number(item.quantity) || 0));
    }
  }
  await saveProductStockMap(current);
}

export function getStockForKey(key: string, fallback = 0): number {
  const current = loadProductStockMap();
  if (key && current[key] !== undefined) {
    return current[key] as number;
  }
  return fallback;
}
