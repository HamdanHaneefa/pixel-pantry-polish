/**
 * Shopify Collections Setup Script
 * Creates automated collections in your Shopify store using the Admin API.
 */

const STORE_DOMAIN = "1fcjnw-tz.myshopify.com";
const ADMIN_TOKEN = "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";
const API_VERSION = "2024-10";

const collections = [
  // ── Pet Type Collections ──────────────────────────────────────────────────
  {
    title: "Dogs",
    body_html: "<p>Everything your good boy needs — food, treats, toys, grooming, and health essentials for dogs of all breeds and sizes.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Dogs" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
  },
  {
    title: "Cats",
    body_html: "<p>Premium food, litter, toys, and accessories for your feline friends — from playful kittens to senior cats.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Cats" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
  },
  {
    title: "Rabbits",
    body_html: "<p>Hay, pellets, treats, and habitat supplies for happy, healthy rabbits.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Rabbits" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800",
  },
  {
    title: "Hamsters",
    body_html: "<p>Wheels, bedding, food, and fun accessories for your little hamster.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Hamsters" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1425082661507-d6d2f66e7a52?w=800",
  },
  {
    title: "Birds",
    body_html: "<p>Seeds, cages, perches, and toys for parrots, budgies, and all feathered companions.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Birds" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800",
  },
  {
    title: "Fish",
    body_html: "<p>Aquarium supplies, fish food, filters, and decorations for freshwater and saltwater tanks.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Fish" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1520990269-3e40be03e14a?w=800",
  },
  {
    title: "Small Pets",
    body_html: "<p>Guinea pigs, hedgehogs, and other small pets — food, bedding, cages, and care essentials.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Small Pets" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800",
  },
  {
    title: "Puppies",
    body_html: "<p>Specially curated puppy essentials — training pads, starter food, chew toys, and socialization aids.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Puppies" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
  },

  // ── Product Category Collections ──────────────────────────────────────────
  {
    title: "Food",
    body_html: "<p>Premium dry and wet food for dogs, cats, and small pets — vet-recommended nutrition for every life stage.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Food" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800",
  },
  {
    title: "Treats",
    body_html: "<p>Jerky, biscuits, dental sticks, and training treats — delicious and nutritious rewards for your pets.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Treats" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800",
  },
  {
    title: "Grooming",
    body_html: "<p>Brushes, shampoos, nail clippers, and grooming kits to keep your pet looking and feeling their best.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Grooming" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800",
  },
  {
    title: "Litter",
    body_html: "<p>Clumping, crystal, and natural cat litters — odour control and easy cleanup for a fresh home.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Litter" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800",
  },
  {
    title: "Accessories",
    body_html: "<p>Leashes, collars, bowls, beds, and everything else to make your pet's life comfortable and fun.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Accessories" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=800",
  },
  {
    title: "Supplements",
    body_html: "<p>Calcium, joint care, vitamins, and probiotics for strong bones, healthy coats, and vitality.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Supplements" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800",
  },
  {
    title: "Beds",
    body_html: "<p>Orthopedic, calming, and plush beds for dogs and cats — cozy comfort for nap time.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Beds" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=800",
  },

  // ── Promo / Featured Collections ──────────────────────────────────────────
  {
    title: "Hot Picks",
    body_html: "<p>Trending products our customers can't stop buying — grab them before they're gone!</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Hot" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800",
  },
  {
    title: "Best Deals",
    body_html: "<p>Unbeatable prices on top-quality pet products — stock up and save big.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Best Deals" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800",
  },
  {
    title: "Sale",
    body_html: "<p>Clearance and markdown items at special discounted prices — limited time only.</p>",
    rules: [{ column: "tag", relation: "equals", condition: "Sale" }],
    sort_order: "best-selling",
    image_url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800",
  },
];

async function shopifyAdminFetch(endpoint, method = "GET", body = null) {
  const url = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/${endpoint}`;
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Admin API ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  console.log("🚀 Creating Shopify collections via Admin API...\n");

  let created = 0;
  let skipped = 0;

  for (const col of collections) {
    try {
      const existing = await shopifyAdminFetch(
        `smart_collections.json?title=${encodeURIComponent(col.title)}`
      );
      if (existing.smart_collections?.length > 0) {
        console.log(`  ⏭️  "${col.title}" — already exists, skipping`);
        skipped++;
        continue;
      }

      const payload = {
        smart_collection: {
          title: col.title,
          body_html: col.body_html,
          rules: col.rules,
          sort_order: col.sort_order,
          disjunctive: false,
          published: true,
        },
      };

      if (col.image_url) {
        payload.smart_collection.image = { src: col.image_url };
      }

      const result = await shopifyAdminFetch("smart_collections.json", "POST", payload);
      console.log(`  ✅ "${result.smart_collection.title}" — created successfully!`);
      created++;

      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      console.error(`  ❌ "${col.title}" — Error: ${err.message}`);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  🎉 Created: ${created}   ⏭️ Already Existing: ${skipped}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log("All collections are now active in your Shopify store!");
}

main().catch(console.error);
