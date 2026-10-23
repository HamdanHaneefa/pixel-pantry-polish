const domain = "1fcjnw-tz.myshopify.com";
const tokens = [
  process.env.SHOPIFY_CLIENT_SECRET,
  process.env.SHOPIFY_CLIENT_ID,
  process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
].filter(Boolean);

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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
function maskSecret(val) {
  if (!val || typeof val !== "string") return "[EMPTY]";
  if (val.length <= 8) return "[REDACTED]";
  return `${val.slice(0, 4)}...${val.slice(-4)}`;
}

    console.log(`=== Token: ${maskSecret(token)} (Status: ${res.status}) ===`);
    if (data.errors) {
      console.log("Errors:", JSON.stringify(data.errors, null, 2));
    } else if (data.data) {
      console.log("Shop:", data.data.shop?.name);
      console.log("Products Count:", data.data.products?.edges?.length);
      console.log("Collections Count:", data.data.collections?.edges?.length);
      return data.data;
    }
  } catch (err) {
    console.error("Error with token:", maskSecret(token), err?.message || err);
  }
}

// Also test Admin API if shpss_ or token is an admin / partner secret or access token
async function testAdmin(token) {
  try {
    const res = await fetch(`https://${domain}/admin/api/2026-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
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
        }`,
      }),
    });
    const data = await res.json();
    console.log(`=== Admin Token: ${maskSecret(token)} (Status: ${res.status}) ===`);
    if (data.errors) {
      console.log("Admin Errors:", JSON.stringify(data.errors, null, 2));
    } else if (data.data) {
      console.log("Admin Products Count:", data.data.products?.edges?.length);
      console.log("Admin Collections Count:", data.data.collections?.edges?.length);
      return data.data;
    }
  } catch (err) {
    console.error("Admin test error with token:", maskSecret(token), err?.message || err);
  }
}

(async () => {
  console.log("--- Testing Storefront API ---");
  for (const t of tokens) {
    await testStorefront(t);
  }
  console.log("--- Testing Admin API ---");
  for (const t of tokens) {
    await testAdmin(t);
  }
})();
