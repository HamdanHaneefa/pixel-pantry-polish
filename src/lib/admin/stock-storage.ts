import fs from "node:fs";
import path from "node:path";

function getStockFilePath(): string {
  return path.resolve(process.cwd(), "src", "data", "product-stock.json");
}

export function loadProductStockMap(): Record<string, number> {
  try {
    const file = getStockFilePath();
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[loadProductStockMap] Error reading stock file:", err);
  }
  return {};
}

export function saveProductStockMap(map: Record<string, number>): void {
  try {
    const file = getStockFilePath();
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file, JSON.stringify(map, null, 2), "utf-8");
  } catch (err) {
    console.error("[saveProductStockMap] Error writing stock file:", err);
  }
}

export function setStockForKeys(items: Array<{ key: string; quantity: number }>): void {
  const current = loadProductStockMap();
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
