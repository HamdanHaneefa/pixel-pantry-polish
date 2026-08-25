const domain = '1fcjnw-tz.myshopify.com';
const token = '4bd7d34c9c5c825654fda51b56da2b4f';

async function list() {
  const query = `{
    shop {
      name
      primaryDomain { host }
    }
    products(first: 50) {
      edges {
        node {
          id
          title
          handle
          productType
          vendor
          tags
          availableForSale
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                sku
                price { amount currencyCode }
              }
            }
          }
        }
      }
    }
    collections(first: 50) {
      edges {
        node {
          id
          title
          handle
          products(first: 50) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      }
    }
  }`;

  const res = await fetch(`https://${domain}/api/2025-04/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query })
  });

  const json = await res.json();
  
  console.log('=== STORE INFO ===');
  console.log('Store Name:', json.data.shop.name);
  console.log('Host:', json.data.shop.primaryDomain.host);

  console.log('\n=== PRODUCTS (' + json.data.products.edges.length + ' Total) ===');
  json.data.products.edges.forEach((e, idx) => {
    const p = e.node;
    console.log(`${idx + 1}. [${p.title}]`);
    console.log(`   - ID: ${p.id}`);
    console.log(`   - Price: ₹${p.priceRange.minVariantPrice.amount}`);
    console.log(`   - Type: ${p.productType || 'N/A'}`);
    console.log(`   - Tags: ${p.tags.join(', ') || 'None'}`);
    console.log(`   - Variants: ${p.variants.edges.map(v => `${v.node.title} (₹${v.node.price.amount}, VariantID: ${v.node.id})`).join(' | ')}`);
  });

  console.log('\n=== COLLECTIONS / CATEGORIES (' + json.data.collections.edges.length + ' Total) ===');
  json.data.collections.edges.forEach((e, idx) => {
    const c = e.node;
    const prodCount = c.products.edges.length;
    const prods = c.products.edges.map(p => p.node.title).join(', ');
    console.log(`${idx + 1}. ${c.title} (handle: "${c.handle}") -> ${prodCount} products ${prodCount > 0 ? `[${prods}]` : '(Empty)'}`);
  });
}

list();
