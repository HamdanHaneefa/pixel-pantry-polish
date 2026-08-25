const https = require('https');
const token = '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';
const shop = '1fcjnw-tz.myshopify.com';

function gql(query, variables = {}) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: shop,
      path: '/admin/api/2024-01/graphql.json',
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
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
  const pRes = await gql(`
    query {
      products(first: 20) {
        nodes {
          id
          title
        }
      }
    }
  `);
  const prods = pRes.data?.products?.nodes || [];

  for (const p of prods) {
    const mut = `
      mutation publishablePublishToCurrentChannel($id: ID!) {
        publishablePublishToCurrentChannel(id: $id) {
          publishable {
            availablePublicationsCount {
              count
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const r = await gql(mut, { id: p.id });
    console.log(`Publish to Current Channel [${p.title}]:`, JSON.stringify(r.data?.publishablePublishToCurrentChannel || r));
  }
}

run().catch(console.error);
