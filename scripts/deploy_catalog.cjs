const fs = require('fs');
const path = require('path');
const https = require('https');

const SHOP = '1fcjnw-tz.myshopify.com';
const TOKEN = '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';
const IMG_DIR = path.join(__dirname, '..', 'Petpediaa', 'Petpediaa');

function apiRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: SHOP,
      path: endpoint,
      method: method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getImagesBase64(filenames) {
  const images = [];
  for (const fn of filenames) {
    const filePath = path.join(IMG_DIR, fn);
    if (fs.existsSync(filePath)) {
      const b64 = fs.readFileSync(filePath).toString('base64');
      images.push({
        attachment: b64,
        filename: fn.replace(/ /g, '_')
      });
    } else {
      console.warn(`Warning: Image file not found: ${fn}`);
    }
  }
  return images;
}

const PRODUCTS_TO_CREATE = [
  {
    title: 'Automatic Cage-Hanging Pet Feeder & Water Dispenser (1L)',
    product_type: 'Bowls & Feeders',
    tags: 'Dogs, Cats, Rabbits, Small Pets, Puppies, Food, Accessories, Best Deals, Hot, Sale',
    body_html: `
      <div class="product-description">
        <h3>Automatic Gravity Pet Feeder & Water Dispenser (1000ml)</h3>
        <p>Ensure your dogs, cats, puppies, rabbits, and small pets stay hydrated and well-fed throughout the day with this hanging automatic feeder and waterer set.</p>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>Dual Usage Modes:</strong> Securely mounts to any wire cage/crate with the heavy-duty twist lock, or stands stably on flat floors.</li>
          <li><strong>Large 1L (1000ml) Capacity:</strong> Provides 3–5 days of continuous fresh water and kibble for small to medium pets.</li>
          <li><strong>Siphon Gravity Refill:</strong> Automatic replenishment prevents spills, leaks, and overflows while maintaining water freshness.</li>
          <li><strong>Anti-Clog 75° Ramp:</strong> Wide feeder mouth and 75-degree sloping ramp prevent dry kibble from jamming.</li>
          <li><strong>Top-Refill Lid:</strong> Refill dry food or water easily from the top without detaching the main unit.</li>
          <li><strong>BPA-Free Food Grade Material:</strong> Safe, durable, eco-friendly PP plastic with smooth, easy-to-clean surfaces.</li>
        </ul>
      </div>
    `,
    imageFiles: [
      '01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG',
      '02291d08-c439-4bff-af9b-1775531b28a4.JPG',
      '14f159a7-7f01-4fad-85b2-5dbf448ab8e6.JPG',
      '371b5483-97c3-4614-a3b7-192ababa932f.JPG',
      '50a5ca0b-be4f-48ec-863c-703a95de60a4.JPG',
      '6e4c2262-864f-474b-8df9-e9727a993c61.JPG',
      '73f8b973-d806-4b02-8bde-0f5cd58bb86e.JPG',
      'bf85bf94-b04e-493d-ab2a-97c0f7ca4af1.JPG',
      'cdf5e113-5ff8-4ff3-8bc9-aa693c6d758c.JPG',
      'f407cc06-4a78-489a-999d-551b8a2d5cfd.JPG',
      'fc8be5f6-78aa-442a-8959-ac87d1496f1d.JPG'
    ],
    options: [{ name: 'Type' }],
    variants: [
      {
        option1: 'Automatic Water Dispenser (1L - Mint Blue)',
        price: '699.00',
        compare_at_price: '1199.00',
        sku: 'FEED-WATER-1L',
        inventory_management: null
      },
      {
        option1: 'Automatic Food Feeder (1L - Mint Blue)',
        price: '749.00',
        compare_at_price: '1299.00',
        sku: 'FEED-FOOD-1L',
        inventory_management: null
      },
      {
        option1: '2-in-1 Feeder & Waterer Combo Set',
        price: '1299.00',
        compare_at_price: '2199.00',
        sku: 'FEED-COMBO-2IN1',
        inventory_management: null
      }
    ]
  },
  {
    title: 'Smart Interactive Rolling Toy Ball 2.0 with Braided Tail (USB Rechargeable)',
    product_type: 'Toys',
    tags: 'Dogs, Cats, Toys, Puppies, Hot, Best Deals, Sale',
    body_html: `
      <div class="product-description">
        <h3>Smart Motion Interactive Pet Ball 2.0 with Bionic Movement</h3>
        <p>Keep your dogs and cats engaged for hours! This motorized smart ball rolls, twists, bounces irregularly, and navigates obstacles autonomously.</p>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>360° Automatic Movement:</strong> Unpredictable trajectories stimulate hunting instincts and prevent pet boredom.</li>
          <li><strong>Intelligent Obstacle Avoidance:</strong> Built-in motion sensor reverses automatically when touching walls, furniture, or corners.</li>
          <li><strong>LED Light Attraction:</strong> Soft glowing LED ring captivates cats and dogs day and night without hurting their eyes.</li>
          <li><strong>Ultra-Quiet 20dB Motor:</strong> Whisper-quiet operation keeps playtime fun without disturbing your household.</li>
          <li><strong>Chew-Resistant Braided Rope Tail:</strong> Heavy-duty braided nylon cord withstands energetic bites, tugs, and pounces.</li>
          <li><strong>USB Rechargeable:</strong> High-capacity lithium battery charges via USB in 30 minutes for hours of continuous play.</li>
        </ul>
      </div>
    `,
    imageFiles: [
      '04d529af-ecdf-431d-b2d8-a55ef8abf348.JPG',
      '107c955d-e4ee-41f8-87de-1bf99138d71c.JPG',
      '1204fab2-c8e0-4af1-a9a2-7647795cf320.JPG',
      '3a541bd0-2658-4704-967a-0d239dd83bd4.JPG',
      '40dc86d7-fa98-4210-8ba2-6f97be08788f.JPG',
      '487bb4fb-78c8-4f39-abec-9eb1db27ac80.JPG',
      '4cc95c99-7b37-4452-a3a3-95250b0bdbc8.JPG',
      '5076a1e3-45a3-44c3-8835-b8fee3c2825f.JPG',
      'a60f34d5-bede-442f-9939-4f252131db61.JPG',
      'bdfd14de-38d0-4d2a-bf90-01e3013363ee.JPG'
    ],
    options: [{ name: 'Color' }],
    variants: [
      {
        option1: 'Sunset Orange (Yellow Tail)',
        price: '799.00',
        compare_at_price: '1499.00',
        sku: 'TOY-BALL-ORG',
        inventory_management: null
      },
      {
        option1: 'Fiery Red (Red Tail)',
        price: '799.00',
        compare_at_price: '1499.00',
        sku: 'TOY-BALL-RED',
        inventory_management: null
      },
      {
        option1: 'Ocean Cyan (Cyan Tail)',
        price: '799.00',
        compare_at_price: '1499.00',
        sku: 'TOY-BALL-CYAN',
        inventory_management: null
      }
    ]
  },
  {
    title: 'Gentleman Tuxedo & Plaid Breathable Mesh Harness Vest with Leash Set',
    product_type: 'Accessories',
    tags: 'Dogs, Cats, Puppies, Accessories, Hot, Best Deals, Sale',
    body_html: `
      <div class="product-description">
        <h3>Formal Tuxedo & Plaid Step-In Harness Vest with Matching Leash</h3>
        <p>Dress up your fur baby in style with this adorable bowtie tuxedo harness vest. Designed for small dogs, puppies, and cats.</p>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>Breathable Air Mesh:</strong> Honeycomb padded fabric prevents overheating and chafing, keeping pets cool and cozy.</li>
          <li><strong>Escape-Proof Step-In Design:</strong> Easy to put on and remove with a heavy-duty quick-release buckle and dual metal D-rings.</li>
          <li><strong>Charming Bowtie & Buttons:</strong> Dapper gentleman design with decorative bowtie and contrast suit buttons.</li>
          <li><strong>Matching 1.2m Leash Included:</strong> High-tensile matching lead with 360° tangle-free swivel hook.</li>
        </ul>
      </div>
    `,
    imageFiles: [
      'c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG',
      '50e17592-e67a-4853-945f-42b106e3c784.JPG',
      '639263fa-8b8c-4cf8-b54a-b3b508a1281b.JPG',
      '37bda72c-7a4a-4228-b8d8-aaac340e4adb.JPG',
      '8d913b7f-2eab-49e9-9135-77baeb7a8371.JPG',
      '28911819-80e7-46fd-b748-ae1b8dea0779.JPG',
      '4896f1f3-4b18-4bfb-8555-c8a34b508100.JPG',
      '5258aa4a-c94b-47f9-9431-f1e4e02813c1.JPG',
      '535be8a9-0dc5-426b-848a-68530df9b469.JPG',
      '0976e620-a7d5-4ea5-88ae-86ef51bd5cd9.JPG',
      'c1961604-e52d-48a1-87a5-dad68768f406.JPG',
      'ec005569-a295-46b4-9b29-54deb3c56d11.JPG',
      'edfa7c33-c769-457e-a704-0b3d32780b55.JPG',
      'fb7aa9b5-b083-45bf-89b0-ab353fa189ed.JPG'
    ],
    options: [{ name: 'Size' }, { name: 'Style' }],
    variants: [
      { option1: 'Small (Chest 23-42cm)', option2: 'Classic Black Tuxedo', price: '549.00', compare_at_price: '899.00', sku: 'HARN-S-BLKTUX' },
      { option1: 'Small (Chest 23-42cm)', option2: 'Red Plaid Gentleman', price: '549.00', compare_at_price: '899.00', sku: 'HARN-S-REDPLD' },
      { option1: 'Small (Chest 23-42cm)', option2: 'Formal Red Tuxedo', price: '549.00', compare_at_price: '899.00', sku: 'HARN-S-REDTUX' },
      { option1: 'Small (Chest 23-42cm)', option2: 'Houndstooth Checkered', price: '549.00', compare_at_price: '899.00', sku: 'HARN-S-HOUND' },
      { option1: 'Small (Chest 23-42cm)', option2: 'Wild Leopard', price: '549.00', compare_at_price: '899.00', sku: 'HARN-S-LEOP' },
      { option1: 'Small (Chest 23-42cm)', option2: 'Star Blue', price: '549.00', compare_at_price: '899.00', sku: 'HARN-S-STAR' },
      { option1: 'Small (Chest 23-42cm)', option2: 'Navy Anchor', price: '549.00', compare_at_price: '899.00', sku: 'HARN-S-NVYANC' },
      { option1: 'Small (Chest 23-42cm)', option2: 'Red Anchor', price: '549.00', compare_at_price: '899.00', sku: 'HARN-S-REDANC' },
      { option1: 'Medium (Chest 28-46cm)', option2: 'Classic Black Tuxedo', price: '599.00', compare_at_price: '999.00', sku: 'HARN-M-BLKTUX' },
      { option1: 'Medium (Chest 28-46cm)', option2: 'Red Plaid Gentleman', price: '599.00', compare_at_price: '999.00', sku: 'HARN-M-REDPLD' },
      { option1: 'Medium (Chest 28-46cm)', option2: 'Formal Red Tuxedo', price: '599.00', compare_at_price: '999.00', sku: 'HARN-M-REDTUX' },
      { option1: 'Medium (Chest 28-46cm)', option2: 'Houndstooth Checkered', price: '599.00', compare_at_price: '999.00', sku: 'HARN-M-HOUND' },
      { option1: 'Medium (Chest 28-46cm)', option2: 'Wild Leopard', price: '599.00', compare_at_price: '999.00', sku: 'HARN-M-LEOP' },
      { option1: 'Medium (Chest 28-46cm)', option2: 'Star Blue', price: '599.00', compare_at_price: '999.00', sku: 'HARN-M-STAR' },
      { option1: 'Medium (Chest 28-46cm)', option2: 'Navy Anchor', price: '599.00', compare_at_price: '999.00', sku: 'HARN-M-NVYANC' },
      { option1: 'Medium (Chest 28-46cm)', option2: 'Red Anchor', price: '599.00', compare_at_price: '999.00', sku: 'HARN-M-REDANC' },
      { option1: 'Large (Chest 35-50cm)', option2: 'Classic Black Tuxedo', price: '649.00', compare_at_price: '1099.00', sku: 'HARN-L-BLKTUX' },
      { option1: 'Large (Chest 35-50cm)', option2: 'Red Plaid Gentleman', price: '649.00', compare_at_price: '1099.00', sku: 'HARN-L-REDPLD' },
      { option1: 'Large (Chest 35-50cm)', option2: 'Formal Red Tuxedo', price: '649.00', compare_at_price: '1099.00', sku: 'HARN-L-REDTUX' },
      { option1: 'Large (Chest 35-50cm)', option2: 'Houndstooth Checkered', price: '649.00', compare_at_price: '1099.00', sku: 'HARN-L-HOUND' },
      { option1: 'Large (Chest 35-50cm)', option2: 'Wild Leopard', price: '649.00', compare_at_price: '1099.00', sku: 'HARN-L-LEOP' },
      { option1: 'Large (Chest 35-50cm)', option2: 'Star Blue', price: '649.00', compare_at_price: '1099.00', sku: 'HARN-L-STAR' },
      { option1: 'Large (Chest 35-50cm)', option2: 'Navy Anchor', price: '649.00', compare_at_price: '1099.00', sku: 'HARN-L-NVYANC' },
      { option1: 'Large (Chest 35-50cm)', option2: 'Red Anchor', price: '649.00', compare_at_price: '1099.00', sku: 'HARN-L-REDANC' }
    ]
  },
  {
    title: 'Pastel Adjustable Pet Bell Collar with Silicone Smile Charm',
    product_type: 'Accessories',
    tags: 'Dogs, Cats, Puppies, Accessories, Hot, Best Deals, Sale',
    body_html: `
      <div class="product-description">
        <h3>Soft Pastel Breakaway Bell Collar with Smile Tag</h3>
        <p>A lightweight, skin-friendly collar designed for puppies, kittens, cats, and small dogs.</p>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>Safety Breakaway Buckle:</strong> Releases under tension if snagged, preventing accidental choking.</li>
          <li><strong>Soft High-Density Webbing:</strong> Gentle on fur and skin, fully adjustable from 19cm to 32cm neck circumference.</li>
          <li><strong>Melodious Bell & Charm:</strong> Includes a color-coordinated chime bell and cheerful silicone smile badge.</li>
        </ul>
      </div>
    `,
    imageFiles: [
      '0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG',
      '271ecd71-e1bc-45e2-9341-cc996d791d5d.JPG',
      '959743d5-6118-48b9-83a0-6d849422bac5.JPG',
      '408f6c5d-844e-4f1b-a096-106c3c5556c6.JPG',
      'd54086ad-e02e-4ce1-bc18-ac28c713d6b7.JPG',
      '9ae7fefc-363d-4dfa-9355-1452939424ea.JPG',
      '4c6953fe-0916-4401-a13d-66a51c765f95.JPG',
      'ea4ade76-ffc7-44d1-9676-a8f6b37b280e.JPG',
      '7cc50eca-67e5-42d7-921f-6b3d5e2d289c.JPG',
      'fa4ed9dc-c461-415c-bebf-2b5ddd2a05bb.JPG'
    ],
    options: [{ name: 'Color' }],
    variants: [
      { option1: 'Sunny Yellow', price: '199.00', compare_at_price: '399.00', sku: 'COL-YEL' },
      { option1: 'Sakura Pink', price: '199.00', compare_at_price: '399.00', sku: 'COL-PNK' },
      { option1: 'Lavender Purple', price: '199.00', compare_at_price: '399.00', sku: 'COL-PUR' },
      { option1: 'Sky Blue', price: '199.00', compare_at_price: '399.00', sku: 'COL-BLU' },
      { option1: 'Forest Green', price: '199.00', compare_at_price: '399.00', sku: 'COL-GRN' },
      { option1: 'Coffee Brown', price: '199.00', compare_at_price: '399.00', sku: 'COL-BRN' }
    ]
  },
  {
    title: 'Pet Soft Grooming & Hygiene Wipes (100 Pcs - Fresh Apple Scent)',
    product_type: 'Grooming',
    tags: 'Dogs, Cats, Puppies, Grooming, Hot, Best Deals, Sale',
    body_html: `
      <div class="product-description">
        <h3>Pet Soft Fresh Apple Scent Hygiene Wipes (100 Count)</h3>
        <p>Specially formulated hypoallergenic wet wipes for dogs, cats, puppies, and kittens.</p>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>Alcohol-Free & Gentle:</strong> Safely cleans face, ears, paws, eyes, and coat without irritating sensitive skin.</li>
          <li><strong>Fresh Natural Apple Scent:</strong> Deodorizes fur and neutralizes pet odors instantly.</li>
          <li><strong>Thick Textured Embossed Fabric:</strong> 20cm x 15cm size traps dirt, dander, and loose hair effortlessly.</li>
          <li><strong>Moisture-Lock Seal:</strong> Durable flip-top lid preserves wetness and prevents drying out.</li>
        </ul>
      </div>
    `,
    imageFiles: [
      '19d92b6e-225f-480b-bfc0-8d0fda836cf8.JPG',
      '24fbe061-0ce7-480f-b9e7-4ab7378d01c2.JPG',
      '49d60686-08a3-47ca-87f5-5679d22ee54e.JPG',
      '4afc3d4e-e8bd-405f-8009-2f51cdd88c30.JPG',
      '8349458f-f7ba-439c-80a7-b1d6a57b9a82.JPG',
      'b6795bb6-0490-4521-9f44-50815c125d4b.JPG',
      'b8a53afd-3e4c-4a92-b8d0-ca636591e809.JPG',
      'd07c000b-8ade-454c-99a4-e6f064484baa.JPG',
      'ee33873c-d519-4f24-a604-29d3fab2f3f8.JPG'
    ],
    options: [{ name: 'Pack Size' }],
    variants: [
      { option1: '1 Pack (100 Wipes)', price: '299.00', compare_at_price: '499.00', sku: 'WIPE-100-1PK' },
      { option1: '2 Packs (200 Wipes Value Bundle)', price: '549.00', compare_at_price: '899.00', sku: 'WIPE-200-2PK' },
      { option1: '3 Packs (300 Wipes Mega Saver)', price: '749.00', compare_at_price: '1299.00', sku: 'WIPE-300-3PK' }
    ]
  },
  {
    title: 'Cute Cat-Ear Self-Cleaning Slicker Brush (Massage Bead Pins)',
    product_type: 'Grooming',
    tags: 'Cats, Dogs, Puppies, Grooming, Hot, Best Deals, Sale',
    body_html: `
      <div class="product-description">
        <h3>One-Click Self Cleaning Pet Grooming Slicker Brush</h3>
        <p>Say goodbye to painful shedding! Designed with 140° curved stainless steel pins tipped with soft massage resin beads.</p>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>One-Click Hair Ejection:</strong> Press the big push button on the back to instantly release shed fur in seconds.</li>
          <li><strong>Resin Bead Massage Tips:</strong> Protects delicate skin while boosting blood circulation and leaving coat glossy.</li>
          <li><strong>Cute Cat-Ear Ergonomic Handle:</strong> Lightweight, anti-slip curved handle for comfortable grooming sessions.</li>
          <li><strong>Fully Washable:</strong> Waterproof stainless steel and ABS construction can be rinsed under running water.</li>
        </ul>
      </div>
    `,
    imageFiles: [
      '19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG',
      'aba19b7d-e3c0-4c73-a566-79c7f2452dd5.JPG',
      'cbb429fc-ab6f-4cff-86ef-3e1edff51bbe.JPG',
      '29371db1-002a-42da-97b2-707e4d99660a.JPG',
      '297a3d24-2f61-4f64-8a5c-44a1ef94d713.JPG',
      '5036ce28-4bf8-4d98-b548-131d0d3204a8.JPG',
      'a5bea1ae-f928-478f-b3f2-e71f55165ec3.JPG',
      'c5cec50f-bf76-46d9-b6aa-5aa16ec63804.JPG',
      'e652ce9a-ca03-4414-99f6-1f340f15faa4.JPG'
    ],
    options: [{ name: 'Color' }],
    variants: [
      { option1: 'Mint Green', price: '399.00', compare_at_price: '699.00', sku: 'BRSH-CAT-GRN' },
      { option1: 'Pastel Pink', price: '399.00', compare_at_price: '699.00', sku: 'BRSH-CAT-PNK' },
      { option1: 'Coffee Brown', price: '399.00', compare_at_price: '699.00', sku: 'BRSH-CAT-BRN' }
    ]
  },
  {
    title: 'Ergonomic Retractable Fine-Pin Slicker Brush with Textured Grip',
    product_type: 'Grooming',
    tags: 'Dogs, Cats, Puppies, Grooming, Hot, Best Deals, Sale',
    body_html: `
      <div class="product-description">
        <h3>Professional Retractable Deshedding Pin Brush</h3>
        <p>Easily remove loose undercoat fur, mats, and tangles with this heavy-duty self-cleaning brush.</p>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>High-Density Fine Wire Bristles:</strong> Reaches deep into thick double coats without scratching or pulling.</li>
          <li><strong>Instant Hair Release Button:</strong> Push-button mechanism retracts pins to wipe shed hair clean in one swipe.</li>
          <li><strong>Diamond Textured Grip:</strong> Ergonomic anti-slip contoured handle ensures wrist comfort.</li>
        </ul>
      </div>
    `,
    imageFiles: [
      '7dc68386-e027-4d5f-bf64-8f99458c4685.JPG',
      '2c454b62-4843-419a-8cad-80738963aed0.JPG',
      'ab4d87e8-c570-4ce5-892b-2e2a72afbd91.JPG',
      'afa6812d-3dda-403a-9f8b-75f7c3d39293.JPG',
      'bd897710-ea7a-46ca-ac0a-a862c6e10f49.JPG',
      'c0601550-5554-440c-9bff-b731e6ef3468.JPG',
      'cdc39120-db0a-468c-b56a-32aba34084be.JPG'
    ],
    options: [{ name: 'Color' }],
    variants: [
      { option1: 'Ocean Blue & White', price: '449.00', compare_at_price: '799.00', sku: 'BRSH-BLUE-PRO' }
    ]
  },
  {
    title: 'Professional Pet Nail Clipper & Diamond Filer Set with Safety Guard',
    product_type: 'Grooming',
    tags: 'Dogs, Cats, Puppies, Grooming, Hot, Best Deals, Sale',
    body_html: `
      <div class="product-description">
        <h3>Heavy Duty Pet Nail Trimmer & Diamond Polishing File Set</h3>
        <p>Groom your pet's nails safely and comfortably at home without fear of injury or bleeding.</p>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>3.5mm Hardened Stainless Steel:</strong> Sharp half-moon razor blades make swift, clean cuts without splintering nails.</li>
          <li><strong>Quick-Stop Safety Guard:</strong> Prevents over-cutting and protects sensitive nail quicks.</li>
          <li><strong>Ergonomic Spring-Loaded Handles:</strong> Rubberized cushioned grip reduces hand fatigue and includes a safety storage lock.</li>
          <li><strong>Diamond Finishing File:</strong> Smooths rough edges after clipping for polished paws.</li>
        </ul>
      </div>
    `,
    imageFiles: [
      'eb4f50f9-0b0b-4b0c-8e2d-ff49d3014bd3.JPG',
      '423cca4f-8b33-42c0-9c83-0b0910a4e1d8.JPG',
      '4b41644c-510b-467b-b5f2-4d34c112f868.JPG',
      'a3fc3d24-d92d-41e9-bf47-3ecb37fec992.JPG',
      'fa7e0688-2c84-4d2e-bc7c-31a6f9794726.JPG'
    ],
    options: [{ name: 'Set' }],
    variants: [
      { option1: 'Pro Clipper + Diamond Filer Set (Blue/Black)', price: '349.00', compare_at_price: '599.00', sku: 'CLIP-SET-BLU' }
    ]
  },
  {
    title: 'Dual-Sided Reusable Electrostatic Pet Hair Remover Glove / Mitt',
    product_type: 'Grooming',
    tags: 'Dogs, Cats, Puppies, Grooming, Accessories, Hot, Best Deals, Sale',
    body_html: `
      <div class="product-description">
        <h3>Dual-Directional Static Pet Hair & Lint Cleaning Mitt</h3>
        <p>The ultimate fur-cleaning mitt for your home, car, and pet grooming routine!</p>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>Dual-Sided Static Fabric:</strong> Two-sided micro-bristle texture collects fur, hair, and lint instantly with a swipe.</li>
          <li><strong>Multi-Surface Cleaning:</strong> Works miracles on couches, carpets, clothing, car seats, pet beds, and directly on coats.</li>
          <li><strong>Reversible & Reusable:</strong> No sticky tape refills required. Simply roll fur off and reuse infinitely.</li>
          <li><strong>Comfortable Mesh Back:</strong> 24cm x 17cm breathable mesh glove fits hands securely with thumb band.</li>
        </ul>
      </div>
    `,
    imageFiles: [
      'b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG',
      '4166119a-e2c9-488b-8983-e4605e7098f5.JPG',
      '6f9eb2f8-5c0f-4be6-9636-ef0b64e583b6.JPG',
      '91eb9542-77c0-4cf8-ad10-1537bac043e5.JPG',
      '97d02a87-0502-4033-9b22-82b54f70d644.JPG',
      '9eee3003-2042-4797-ae5b-8f9ab4497661.JPG',
      'b7f1dc12-c595-447c-99f4-6d843fc8d547.JPG',
      'c14f74fe-5a72-4ad5-82d7-f0adfb198b0d.JPG',
      'd4cea5bc-1322-4a14-bb1a-ce0372dd43e3.JPG',
      'f7f28189-646f-4e3c-a6ef-76868c231e4f.JPG'
    ],
    options: [{ name: 'Quantity' }],
    variants: [
      { option1: '1 Glove (Single)', price: '249.00', compare_at_price: '449.00', sku: 'GLV-HAIR-1PC' },
      { option1: '2 Gloves (Pair)', price: '429.00', compare_at_price: '799.00', sku: 'GLV-HAIR-2PC' }
    ]
  },
  {
    title: 'Hexagonal Double Food & Water Feeding Bowl Station',
    product_type: 'Bowls & Feeders',
    tags: 'Dogs, Cats, Puppies, Food, Accessories, Hot, Best Deals, Sale',
    body_html: `
      <div class="product-description">
        <h3>Geometric Hexagon Dual Food & Water Feeding Dish</h3>
        <p>A modern, anti-tip double pet bowl designed for comfortable daily feeding for cats, puppies, and small-to-medium dogs.</p>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>2-in-1 Dual Dish Design:</strong> Serves dry/wet food and fresh water side-by-side.</li>
          <li><strong>Anti-Spill Hexagonal Base:</strong> Wide geometric foundation prevents tipping over and keeps feeding areas tidy.</li>
          <li><strong>Food-Grade PP Resin:</strong> Non-toxic, BPA-free, odorless, and heat-resistant plastic.</li>
          <li><strong>Easy to Clean:</strong> Seamless rounded corners rinse sparkling clean in seconds.</li>
        </ul>
      </div>
    `,
    imageFiles: [
      '84be20fc-2983-4016-a539-58da2060d5d9.JPG',
      '8fac1c61-ab66-440f-be1c-7c7ab0c5a0aa.JPG',
      '2c72fb23-fdc8-4445-808f-90b83d21e791.JPG',
      '95a6ac91-ab41-4f1c-be5b-37f6ca3c6b93.JPG',
      'a862ed0a-3f29-4bff-a673-5ddf6abd5830.JPG',
      'b932b79f-9cb7-4cc3-a728-b40d719ad411.JPG',
      'bd226b0f-b14c-42b8-b421-938b3b1ba94c.JPG',
      'baceeb48-8234-4e54-ae4b-37bc7004cea8.JPG'
    ],
    options: [{ name: 'Color' }],
    variants: [
      { option1: 'Sunset Orange', price: '349.00', compare_at_price: '599.00', sku: 'BWL-HEX-ORG' },
      { option1: 'Teal Green', price: '349.00', compare_at_price: '599.00', sku: 'BWL-HEX-GRN' },
      { option1: 'Sunny Yellow', price: '349.00', compare_at_price: '599.00', sku: 'BWL-HEX-YEL' },
      { option1: 'Nordic Blue', price: '349.00', compare_at_price: '599.00', sku: 'BWL-HEX-BLU' }
    ]
  },
  {
    title: 'Super Absorbent Quick-Dry PVA Chamois Pet Bath Towel with Portable Tube Case',
    product_type: 'Grooming',
    tags: 'Dogs, Cats, Puppies, Grooming, Accessories, Hot, Best Deals, Sale',
    body_html: `
      <div class="product-description">
        <h3>High-Absorbency PVA Chamois Pet Drying Towel (66cm x 43cm)</h3>
        <p>Dry your pet in minutes after baths, swimming, or rainy walks with this ultra-absorbent chamois towel.</p>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>5X Superior Absorbency:</strong> PVA material drinks up water instantly, cutting pet drying time in half.</li>
          <li><strong>Lint-Free & Antibacterial:</strong> Won't shed fuzz or hold damp odors when dried and stored.</li>
          <li><strong>Portable Cylindrical Case:</strong> Includes a ventilated travel container with a hanging loop for easy car trips and storage.</li>
          <li><strong>Generous Size (66cm x 43cm):</strong> Embossed with playful paw prints, ideal for all pet sizes.</li>
        </ul>
      </div>
    `,
    imageFiles: [
      'c88c695e-bce6-41b2-9a73-1d764f051fc6.JPG',
      '2d3e48e2-220e-449f-9245-7ba598e070a4.JPG',
      '391fdaf0-8f92-4ecd-a9bd-de3a4d307837.JPG',
      '3fa9eaa1-cecc-4073-ae81-b415f63ec08c.JPG',
      '483e84ff-0a01-4b51-b8f7-1bd7096a1503.JPG',
      '4ad23930-9f26-4342-97b5-cfaee3ce8826.JPG',
      '56333697-65a5-4061-8f5d-5d2efd260850.JPG',
      '56acd3eb-cf38-4b7c-9ed8-80be26187d82.JPG',
      '5b3f9d3a-5ae7-4936-a2e2-7c6e88e1fcfc.JPG',
      '5c914ea1-1a79-443d-894f-acbcf69b1706.JPG',
      '613de260-fab0-406f-8afe-a26693e66e90.JPG',
      '795e5e3e-83a2-4d3e-baa7-2eb0e26090cc.JPG',
      '7973af15-f60f-4546-835d-2d56f1754b40.JPG',
      'cbfa1943-09f2-421a-abe7-e16221f6a7c7.JPG',
      'e5d9f78a-e5c5-48aa-a76e-365096813914.JPG',
      'f95ab0ee-55cb-4c2b-8862-2bfcf26c7a63.JPG'
    ],
    options: [{ name: 'Color' }],
    variants: [
      { option1: 'Ocean Blue', price: '299.00', compare_at_price: '499.00', sku: 'TWL-PVA-BLU' },
      { option1: 'Pastel Pink', price: '299.00', compare_at_price: '499.00', sku: 'TWL-PVA-PNK' },
      { option1: 'Mint Green', price: '299.00', compare_at_price: '499.00', sku: 'TWL-PVA-GRN' },
      { option1: 'Lavender Purple', price: '299.00', compare_at_price: '499.00', sku: 'TWL-PVA-PUR' },
      { option1: 'Sunny Yellow', price: '299.00', compare_at_price: '499.00', sku: 'TWL-PVA-YEL' }
    ]
  }
];

async function run() {
  console.log('=== Step 1: Fetching current existing products ===');
  const existingRes = await apiRequest('GET', '/admin/api/2024-01/products.json?limit=250');
  const existingProducts = existingRes.data?.products || [];
  console.log(`Found ${existingProducts.length} existing products to remove.`);

  console.log('\n=== Step 2: Removing existing products ===');
  for (const prod of existingProducts) {
    console.log(`Deleting: [${prod.id}] ${prod.title}`);
    await apiRequest('DELETE', `/admin/api/2024-01/products/${prod.id}.json`);
    await sleep(600);
  }
  console.log('All existing products deleted successfully.');

  console.log('\n=== Step 3: Uploading 11 New Products with Variants & Galleries ===');
  for (let i = 0; i < PRODUCTS_TO_CREATE.length; i++) {
    const item = PRODUCTS_TO_CREATE[i];
    console.log(`\n[${i + 1}/${PRODUCTS_TO_CREATE.length}] Creating: ${item.title}`);
    console.log(`  - Encoding ${item.imageFiles.length} photos...`);
    const images = getImagesBase64(item.imageFiles);
    console.log(`  - ${images.length} photos ready for upload`);

    const payload = {
      product: {
        title: item.title,
        body_html: item.body_html.trim(),
        vendor: 'Petpedia',
        product_type: item.product_type,
        tags: item.tags,
        options: item.options,
        variants: item.variants,
        images: images
      }
    };

    const createRes = await apiRequest('POST', '/admin/api/2024-01/products.json', payload);
    if (createRes.status === 201 && createRes.data?.product) {
      const p = createRes.data.product;
      console.log(`  ✓ Successfully created Product ID: ${p.id}`);
      console.log(`    Variants created: ${p.variants?.length}`);
      console.log(`    Images uploaded: ${p.images?.length}`);
    } else {
      console.error(`  ✗ Error creating ${item.title}:`, createRes.data || createRes.raw || createRes.status);
    }

    await sleep(1500); // Respect Shopify API rate limits
  }

  console.log('\n=== Step 4: Verifying Catalog ===');
  const verifyRes = await apiRequest('GET', '/admin/api/2024-01/products.json?limit=250');
  const liveProds = verifyRes.data?.products || [];
  console.log(`\nTotal live products in store: ${liveProds.length}`);
  liveProds.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.id}] ${p.title} (${p.variants?.length} variants, ${p.images?.length} images)`);
  });

  console.log('\n✨ Catalog update complete!');
}

run().catch(console.error);
