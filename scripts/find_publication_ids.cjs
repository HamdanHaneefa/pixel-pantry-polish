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
  // Check Channel publication
  const res = await gql(`
    query {
      channels(first: 5) {
        nodes {
          id
          name
          app {
            title
            apiKey
          }
        }
      }
    }
  `);
  console.log('Channels:', JSON.stringify(res, null, 2));
}

run().catch(console.error);
