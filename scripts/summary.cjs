const https = require("https");
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "";
const shop = "1fcjnw-tz.myshopify.com";

https.get(
  {
    hostname: shop,
    path: "/admin/api/2024-01/products.json?limit=250",
    headers: { "X-Shopify-Access-Token": token },
  },
  (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      const json = JSON.parse(d);
      console.log("====================================================");
      console.log("       LIVE SHOPIFY CATALOG DEPLOYED SUMMARY         ");
      console.log("====================================================");
      console.log("Total Products in Store:", json.products.length);
      json.products.forEach((p, idx) => {
        console.log(`\n[${idx + 1}] ${p.title}`);
        console.log(`    Product ID: ${p.id}`);
        console.log(`    Type: ${p.product_type} | Tags: ${p.tags}`);
        console.log(`    Images Uploaded: ${p.images.length}`);
        console.log(`    Variants Count: ${p.variants.length}`);
        p.variants.slice(0, 4).forEach((v) => {
          console.log(
            `      • ${v.title} => ₹${v.price} (Compare: ₹${v.compare_at_price || "N/A"}) [Variant ID: ${v.id}]`,
          );
        });
        if (p.variants.length > 4) {
          console.log(`      ... and ${p.variants.length - 4} more variants`);
        }
      });
    });
  },
);
