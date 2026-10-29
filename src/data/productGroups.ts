/**
 * Rules that decide which products belong to a shop category or a "Shop by store" store.
 *
 * A product matches when its Shopify product type is one of `types`, or a whole word in its
 * title matches one of `keywords` (singular/plural both count, so "Toy" matches "toys").
 */
export interface GroupRule {
  types?: string[];
  keywords?: string[];
}

export const CATEGORY_RULES: Record<string, GroupRule> = {
  food: { types: ["food", "treat"], keywords: ["treat", "seed", "grit", "kibble"] },
  toys: { types: ["toy"], keywords: ["toy", "ball", "chew", "squeaky", "teaser"] },
  accessories: {
    types: ["accessories", "bowls & feeders"],
    keywords: ["harness", "leash", "collar", "bowl", "feeder"],
  },
  grooming: {
    types: ["grooming"],
    keywords: ["brush", "comb", "nail", "clipper", "shampoo", "towel", "glove", "deshedding"],
  },
  travel: { types: ["travel"], keywords: ["bag", "carrier", "travel", "outing", "crate"] },
  beds: { types: ["bedding", "bed"], keywords: ["bed", "mat", "cushion", "blanket"] },
  "pet-care": { types: ["pet care", "grooming", "health"], keywords: ["wipe", "towel", "care"] },
  health: {
    types: ["health", "supplement", "medicine"],
    keywords: ["supplement", "vitamin", "probiotic", "tablet", "syrup", "tick", "flea", "deworm"],
  },
};

export const STORE_RULES: Record<string, GroupRule> = {
  monsoon: {
    keywords: ["rain", "raincoat", "waterproof", "towel", "wipe", "umbrella", "dryer"],
  },
  fashion: {
    keywords: ["harness", "collar", "bow", "dress", "shirt", "bandana", "jacket", "sweater", "costume"],
  },
  grooming: CATEGORY_RULES.grooming!,
  supplement: CATEGORY_RULES.health!,
  accessories: CATEGORY_RULES.accessories!,
  toys: CATEGORY_RULES.toys!,
};

function singular(word: string): string {
  return word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

interface MatchableProduct {
  title: string;
  productType?: string | undefined;
}

export function matchesGroup(product: MatchableProduct, rule: GroupRule | undefined): boolean {
  if (!rule) return true;
  const type = normalize(product.productType || "");
  if (type && rule.types?.some((t) => singular(normalize(t)) === singular(type))) return true;
  const words = new Set(
    normalize(product.title)
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .map(singular),
  );
  return Boolean(rule.keywords?.some((k) => words.has(singular(normalize(k)))));
}
