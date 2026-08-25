const https = require('https');
const TOKEN = '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';
const SHOP = '1fcjnw-tz.myshopify.com';

function gql(query, variables = {}) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: SHOP,
      path: '/admin/api/2024-01/graphql.json',
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.write(postData);
    req.end();
  });
}

async function run() {
  // 1. Get all publications
  const pubRes = await gql(`
    query {
      publications(first: 20) {
        nodes {
          id
          name
        }
      }
    }
  `);

  console.log('Available Publications / Sales Channels:');
  const publications = pubRes.data?.publications?.nodes || [];
  publications.forEach(p => console.log(` - [${p.id}] ${p.name}`));

  // 2. Get all products
  const prodRes = await gql(`
    query {
      products(first: 50) {
        nodes {
          id
          title
        }
      }
    }
  `);
  const products = prodRes.data?.products?.nodes || [];
  console.log(`\nFound ${products.length} products to publish.`);

  // 3. Publish each product to each publication
  for (const prod of products) {
    for (const pub of publications) {
      const pubMut = `
        mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
          publishablePublish(id: $id, input: $input) {
            publishable {
              availablePublicationCount
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      const res = await gql(pubMut, {
        id: prod.id,
        input: [{ publicationId: pub.id }]
      });
      console.log(`Published [${prod.title}] to [${pub.name}]:`, res.data?.publishablePublish?.userErrors?.length === 0 ? 'SUCCESS' : res.data?.publishablePublish?.userErrors);
    }
  }
}

run().catch(console.error);
