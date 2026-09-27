const domain = '1fcjnw-tz.myshopify.com';
const tokens = [
  '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',
  '9ba4f15c6da9766e9568e4e1c348031a',
  '4bd7d34c9c5c825654fda51b56da2b4f'
];

async function testStorefront(token) {
  const query = `{
    shop { name }
    products(first: 50) {
      edges {
        node {
          id
          title
          handle
          productType
          tags
          variants(first: 10) {
            edges {
              node {
                id
                title
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
          products(first: 10) {
            edges {
              node {
                title
              }
            }
          }
        }
      }
    }
  }`;

  try {
    const res = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token
      },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    console.log(`=== Token: ${token} (Status: ${res.status}) ===`);
    if (data.errors) {
      console.log('Errors:', JSON.stringify(data.errors, null, 2));
    } else if (data.data) {
      console.log('Shop:', data.data.shop?.name);
      console.log('Products Count:', data.data.products?.edges?.length);
      console.log('Products:', JSON.stringify(data.data.products, null, 2));
      console.log('Collections Count:', data.data.collections?.edges?.length);
      console.log('Collections:', JSON.stringify(data.data.collections, null, 2));
      return data.data;
    }
  } catch (err) {
    console.error('Error with token:', token, err);
  }
}

// Also test Admin API if shpss_ or token is an admin / partner secret or access token
async function testAdmin(token) {
  try {
    const res = await fetch(`https://${domain}/admin/api/2026-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({
        query: `{
          products(first: 50) {
            edges {
              node {
                id
                title
                productType
                tags
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price
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
              }
            }
          }
        }`
      })
    });
    const data = await res.json();
    console.log(`=== Admin Token: ${token} (Status: ${res.status}) ===`);
    if (data.errors) {
      console.log('Admin Errors:', JSON.stringify(data.errors, null, 2));
    } else if (data.data) {
      console.log('Admin Products:', JSON.stringify(data.data.products, null, 2));
      console.log('Admin Collections:', JSON.stringify(data.data.collections, null, 2));
      return data.data;
    }
  } catch (err) {
    console.error('Admin test error:', err);
  }
}

(async () => {
  console.log('--- Testing Storefront API ---');
  for (const t of tokens) {
    await testStorefront(t);
  }
  console.log('--- Testing Admin API ---');
  for (const t of tokens) {
    await testAdmin(t);
  }
})();
