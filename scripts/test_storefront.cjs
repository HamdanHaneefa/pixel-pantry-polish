const https = require('https');
const token = '4bd7d34c9c5c825654fda51b56da2b4f';
const shop = '1fcjnw-tz.myshopify.com';

const postData = JSON.stringify({
  query: `
    query {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            images(first: 3) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `
});

const req = https.request({
  hostname: shop,
  path: '/api/2024-01/graphql.json',
  method: 'POST',
  headers: {
    'X-Shopify-Storefront-Access-Token': token,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Storefront Query Status:', res.statusCode);
    const json = JSON.parse(d);
    console.log('Products found on Storefront:', json.data?.products?.edges?.length);
    json.data?.products?.edges?.forEach(e => {
      console.log(` - ${e.node.title} (Images: ${e.node.images?.edges?.length}, Variants: ${e.node.variants?.edges?.length})`);
    });
  });
});
req.write(postData);
req.end();
