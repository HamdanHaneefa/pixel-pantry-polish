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
  const res = await gql(`
    query {
      channels(first: 10) {
        nodes {
          id
          name
        }
      }
    }
  `);
  console.log('Channels:', JSON.stringify(res, null, 2));

  const prodRes = await gql(`
    query {
      products(first: 1) {
        nodes {
          id
          title
          resourcePublicationsV2(first: 10) {
            nodes {
              publication {
                id
                name
              }
              isPublished
            }
          }
        }
      }
    }
  `);
  console.log('Product resourcePublications:', JSON.stringify(prodRes, null, 2));
}

run().catch(console.error);
