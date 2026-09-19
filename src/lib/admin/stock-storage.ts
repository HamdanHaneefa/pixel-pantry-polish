import defaultStockMap from "@/data/product-stock.json";

let inMemoryStockMap: Record<string, number> = { ...(defaultStockMap as Record<string, number>) };

export function loadProductStockMap(): Record<string, number> {
  return inMemoryStockMap;
}

export function saveProductStockMap(map: Record<string, number>): void {
  inMemoryStockMap = { ...map };
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      import("node:fs").then((fs) => {
        import("node:path").then((path) => {
          const file = path.resolve(process.cwd(), "src", "data", "product-stock.json");
          const dir = path.dirname(file);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(file, JSON.stringify(map, null, 2), "utf-8");
        }).catch(() => {});
      }).catch(() => {});
    } catch {
      // Non-fatal in edge/browser environments
    }
  }
}

export function setStockForKeys(items: Array<{ key: string; quantity: number }>): void {
  const current = { ...loadProductStockMap() };
  for (const item of items) {
    if (item.key) {
      current[item.key] = Math.max(0, Math.floor(Number(item.quantity) || 0));
    }
  }
  saveProductStockMap(current);
}

export function getStockForKey(key: string, fallback = 10): number {
  const current = loadProductStockMap();
  if (key && current[key] !== undefined) {
    return current[key] as number;
  }
  return fallback;
}
