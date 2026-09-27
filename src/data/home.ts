import animalDog from "@/assets/animal-dog.png";
import animalCat from "@/assets/animal-cat.png";
import animalRabbit from "@/assets/animal-rabbit.png";
import animalHamster from "@/assets/animal-hamster.png";
import animalGuineapig from "@/assets/animal-guineapig.png";
import animalBird from "@/assets/animal-bird.png";
import animalFish from "@/assets/animal-fish.png";
import animalHedgehog from "@/assets/animal-hedgehog.png";
import animalPuppy from "@/assets/animal-puppy.png";

import brandMerrick from "@/assets/brands/brand-merrick.png";
import brandDrools from "@/assets/brands/brand-drools.png";
import brandOrijen from "@/assets/brands/brand-orijen.png";
import brandPetfuel from "@/assets/brands/brand-petfuel.png";
import brandRoyalcanin from "@/assets/brands/brand-royalcanin.png";
import brandWhiskas from "@/assets/brands/brand-whiskas.png";
import brandPurepet from "@/assets/brands/brand-purepet.png";
import brandAcana from "@/assets/brands/brand-acana.png";

import storeMonsoon from "@/assets/store-monsoon.png";
import storeFashion from "@/assets/store-fashion.png";
import groomingImg from "@/assets/p-grooming.png";
import supplementImg from "@/assets/p-supplement.png";
import toysImg from "@/assets/p-toys.png";
import accessoriesImg from "@/assets/categories/accessories.png";

export type Badge = { label: string; tone: "deal" | "hot" | "sale" | "off" };

export type Product = {
  id: string;
  title: string;
  price: number;
  mrp?: number;
  rating: number;
  reviews: number;
  image: string;
  badges?: Badge[];
  handle?: string;
  description?: string;
  descriptionHtml?: string;
  images?: string[];
  availableForSale?: boolean;
  stockQuantity?: number;
  productType?: string;
  vendor?: string;
  tags?: string[];
  variants?: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    availableForSale: boolean;
    stockQuantity?: number;
    image?: string;
    selectedOptions?: Array<{ name: string; value: string }>;
  }>;
};

const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatPrice = inr;

export const allProductsCatalog: Product[] = [
  {
    "id": "gid://shopify/Product/8781940162754",
    "title": "Automatic Cage-Hanging Pet Feeder & Water Dispenser (1L)",
    "handle": "automatic-cage-hanging-pet-feeder-water-dispenser-1l",
    "price": 699,
    "mrp": 1199,
    "rating": 4.8,
    "reviews": 120,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/02291d08-c439-4bff-af9b-1775531b28a4.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/14f159a7-7f01-4fad-85b2-5dbf448ab8e6.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/371b5483-97c3-4614-a3b7-192ababa932f.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/50a5ca0b-be4f-48ec-863c-703a95de60a4.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/6e4c2262-864f-474b-8df9-e9727a993c61.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/73f8b973-d806-4b02-8bde-0f5cd58bb86e.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/bf85bf94-b04e-493d-ab2a-97c0f7ca4af1.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cdf5e113-5ff8-4ff3-8bc9-aa693c6d758c.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/f407cc06-4a78-489a-999d-551b8a2d5cfd.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/fc8be5f6-78aa-442a-8959-ac87d1496f1d.JPG?v=1787631697"
    ],
    "badges": [
      {
        "label": "42% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Automatic Gravity Pet Feeder &amp; Water Dispenser (1000ml) \n         Ensure your dogs, cats, puppies, rabbits, and small pets stay hydrated and well-fed throughout the day with this hanging automatic feeder and waterer set. \n         Key Features: \n         \n           \n Dual Usage Modes:  Securely mounts to any wire cage/crate with the heavy-duty twist lock, or stands stably on flat floors. \n           \n Large 1L (1000ml) Capacity:  Provides 3–5 days of continuous fresh water and kibble for small to medium pets. \n           \n Siphon Gravity Refill:  Automatic replenishment prevents spills, leaks, and overflows while maintaining water freshness. \n           \n Anti-Clog 75° Ramp:  Wide feeder mouth and 75-degree sloping ramp prevent dry kibble from jamming. \n           \n Top-Refill Lid:  Refill dry food or water easily from the top without detaching the main unit. \n           \n BPA-Free Food Grade Material:  Safe, durable, eco-friendly PP plastic with smooth, easy-to-clean surfaces.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Automatic Gravity Pet Feeder &amp; Water Dispenser (1000ml)</h3>\n        <p>Ensure your dogs, cats, puppies, rabbits, and small pets stay hydrated and well-fed throughout the day with this hanging automatic feeder and waterer set.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Dual Usage Modes:</strong> Securely mounts to any wire cage/crate with the heavy-duty twist lock, or stands stably on flat floors.</li>\n          <li>\n<strong>Large 1L (1000ml) Capacity:</strong> Provides 3–5 days of continuous fresh water and kibble for small to medium pets.</li>\n          <li>\n<strong>Siphon Gravity Refill:</strong> Automatic replenishment prevents spills, leaks, and overflows while maintaining water freshness.</li>\n          <li>\n<strong>Anti-Clog 75° Ramp:</strong> Wide feeder mouth and 75-degree sloping ramp prevent dry kibble from jamming.</li>\n          <li>\n<strong>Top-Refill Lid:</strong> Refill dry food or water easily from the top without detaching the main unit.</li>\n          <li>\n<strong>BPA-Free Food Grade Material:</strong> Safe, durable, eco-friendly PP plastic with smooth, easy-to-clean surfaces.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Bowls & Feeders",
    "vendor": "Petpedia",
    "tags": [
      "Accessories",
      "Best Deals",
      "Cats",
      "Dogs",
      "Food",
      "Hot",
      "Puppies",
      "Rabbits",
      "Sale",
      "Small Pets"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670193811650",
        "title": "Automatic Water Dispenser (1L - Mint Blue)",
        "price": 699,
        "compareAtPrice": 1199,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
        "selectedOptions": [
          {
            "name": "Type",
            "value": "Automatic Water Dispenser (1L - Mint Blue)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670193844418",
        "title": "Automatic Food Feeder (1L - Mint Blue)",
        "price": 749,
        "compareAtPrice": 1299,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
        "selectedOptions": [
          {
            "name": "Type",
            "value": "Automatic Food Feeder (1L - Mint Blue)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670193877186",
        "title": "2-in-1 Feeder & Waterer Combo Set",
        "price": 1299,
        "compareAtPrice": 2199,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
        "selectedOptions": [
          {
            "name": "Type",
            "value": "2-in-1 Feeder & Waterer Combo Set"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781940981954",
    "title": "Cute Cat-Ear Self-Cleaning Slicker Brush (Massage Bead Pins)",
    "handle": "cute-cat-ear-self-cleaning-slicker-brush-massage-bead-pins",
    "price": 399,
    "mrp": 699,
    "rating": 4.8,
    "reviews": 135,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/aba19b7d-e3c0-4c73-a566-79c7f2452dd5.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cbb429fc-ab6f-4cff-86ef-3e1edff51bbe.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/29371db1-002a-42da-97b2-707e4d99660a.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/297a3d24-2f61-4f64-8a5c-44a1ef94d713.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/5036ce28-4bf8-4d98-b548-131d0d3204a8.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/a5bea1ae-f928-478f-b3f2-e71f55165ec3.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c5cec50f-bf76-46d9-b6aa-5aa16ec63804.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/e652ce9a-ca03-4414-99f6-1f340f15faa4.JPG?v=1787631772"
    ],
    "badges": [
      {
        "label": "43% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "One-Click Self Cleaning Pet Grooming Slicker Brush \n         Say goodbye to painful shedding! Designed with 140° curved stainless steel pins tipped with soft massage resin beads. \n         Key Features: \n         \n           \n One-Click Hair Ejection:  Press the big push button on the back to instantly release shed fur in seconds. \n           \n Resin Bead Massage Tips:  Protects delicate skin while boosting blood circulation and leaving coat glossy. \n           \n Cute Cat-Ear Ergonomic Handle:  Lightweight, anti-slip curved handle for comfortable grooming sessions. \n           \n Fully Washable:  Waterproof stainless steel and ABS construction can be rinsed under running water.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>One-Click Self Cleaning Pet Grooming Slicker Brush</h3>\n        <p>Say goodbye to painful shedding! Designed with 140° curved stainless steel pins tipped with soft massage resin beads.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>One-Click Hair Ejection:</strong> Press the big push button on the back to instantly release shed fur in seconds.</li>\n          <li>\n<strong>Resin Bead Massage Tips:</strong> Protects delicate skin while boosting blood circulation and leaving coat glossy.</li>\n          <li>\n<strong>Cute Cat-Ear Ergonomic Handle:</strong> Lightweight, anti-slip curved handle for comfortable grooming sessions.</li>\n          <li>\n<strong>Fully Washable:</strong> Waterproof stainless steel and ABS construction can be rinsed under running water.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Grooming",
    "vendor": "Petpedia",
    "tags": [
      "Best Deals",
      "Cats",
      "Dogs",
      "Grooming",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670196596930",
        "title": "Mint Green",
        "price": 399,
        "compareAtPrice": 699,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Mint Green"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670196629698",
        "title": "Pastel Pink",
        "price": 399,
        "compareAtPrice": 699,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Pastel Pink"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670196662466",
        "title": "Coffee Brown",
        "price": 399,
        "compareAtPrice": 699,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Coffee Brown"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781941407938",
    "title": "Dual-Sided Reusable Electrostatic Pet Hair Remover Glove / Mitt",
    "handle": "dual-sided-reusable-electrostatic-pet-hair-remover-glove-mitt",
    "price": 249,
    "mrp": 449,
    "rating": 4.8,
    "reviews": 150,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4166119a-e2c9-488b-8983-e4605e7098f5.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/6f9eb2f8-5c0f-4be6-9636-ef0b64e583b6.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/91eb9542-77c0-4cf8-ad10-1537bac043e5.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/97d02a87-0502-4033-9b22-82b54f70d644.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/9eee3003-2042-4797-ae5b-8f9ab4497661.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b7f1dc12-c595-447c-99f4-6d843fc8d547.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c14f74fe-5a72-4ad5-82d7-f0adfb198b0d.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/d4cea5bc-1322-4a14-bb1a-ce0372dd43e3.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/f7f28189-646f-4e3c-a6ef-76868c231e4f.JPG?v=1787631812"
    ],
    "badges": [
      {
        "label": "45% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Dual-Directional Static Pet Hair &amp; Lint Cleaning Mitt \n         The ultimate fur-cleaning mitt for your home, car, and pet grooming routine! \n         Key Features: \n         \n           \n Dual-Sided Static Fabric:  Two-sided micro-bristle texture collects fur, hair, and lint instantly with a swipe. \n           \n Multi-Surface Cleaning:  Works miracles on couches, carpets, clothing, car seats, pet beds, and directly on coats. \n           \n Reversible &amp; Reusable:  No sticky tape refills required. Simply roll fur off and reuse infinitely. \n           \n Comfortable Mesh Back:  24cm x 17cm breathable mesh glove fits hands securely with thumb band.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Dual-Directional Static Pet Hair &amp; Lint Cleaning Mitt</h3>\n        <p>The ultimate fur-cleaning mitt for your home, car, and pet grooming routine!</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Dual-Sided Static Fabric:</strong> Two-sided micro-bristle texture collects fur, hair, and lint instantly with a swipe.</li>\n          <li>\n<strong>Multi-Surface Cleaning:</strong> Works miracles on couches, carpets, clothing, car seats, pet beds, and directly on coats.</li>\n          <li>\n<strong>Reversible &amp; Reusable:</strong> No sticky tape refills required. Simply roll fur off and reuse infinitely.</li>\n          <li>\n<strong>Comfortable Mesh Back:</strong> 24cm x 17cm breathable mesh glove fits hands securely with thumb band.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Grooming",
    "vendor": "Petpedia",
    "tags": [
      "Accessories",
      "Best Deals",
      "Cats",
      "Dogs",
      "Grooming",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670197612738",
        "title": "1 Glove (Single)",
        "price": 249,
        "compareAtPrice": 449,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
        "selectedOptions": [
          {
            "name": "Quantity",
            "value": "1 Glove (Single)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670197645506",
        "title": "2 Gloves (Pair)",
        "price": 429,
        "compareAtPrice": 799,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
        "selectedOptions": [
          {
            "name": "Quantity",
            "value": "2 Gloves (Pair)"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781941178562",
    "title": "Ergonomic Retractable Fine-Pin Slicker Brush with Textured Grip",
    "handle": "ergonomic-retractable-fine-pin-slicker-brush-with-textured-grip",
    "price": 449,
    "mrp": 799,
    "rating": 4.8,
    "reviews": 165,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7dc68386-e027-4d5f-bf64-8f99458c4685.JPG?v=1787631784",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7dc68386-e027-4d5f-bf64-8f99458c4685.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/2c454b62-4843-419a-8cad-80738963aed0.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/ab4d87e8-c570-4ce5-892b-2e2a72afbd91.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/afa6812d-3dda-403a-9f8b-75f7c3d39293.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/bd897710-ea7a-46ca-ac0a-a862c6e10f49.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c0601550-5554-440c-9bff-b731e6ef3468.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cdc39120-db0a-468c-b56a-32aba34084be.JPG?v=1787631784"
    ],
    "badges": [
      {
        "label": "44% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Professional Retractable Deshedding Pin Brush \n         Easily remove loose undercoat fur, mats, and tangles with this heavy-duty self-cleaning brush. \n         Key Features: \n         \n           \n High-Density Fine Wire Bristles:  Reaches deep into thick double coats without scratching or pulling. \n           \n Instant Hair Release Button:  Push-button mechanism retracts pins to wipe shed hair clean in one swipe. \n           \n Diamond Textured Grip:  Ergonomic anti-slip contoured handle ensures wrist comfort.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Professional Retractable Deshedding Pin Brush</h3>\n        <p>Easily remove loose undercoat fur, mats, and tangles with this heavy-duty self-cleaning brush.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>High-Density Fine Wire Bristles:</strong> Reaches deep into thick double coats without scratching or pulling.</li>\n          <li>\n<strong>Instant Hair Release Button:</strong> Push-button mechanism retracts pins to wipe shed hair clean in one swipe.</li>\n          <li>\n<strong>Diamond Textured Grip:</strong> Ergonomic anti-slip contoured handle ensures wrist comfort.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Grooming",
    "vendor": "Petpedia",
    "tags": [
      "Best Deals",
      "Cats",
      "Dogs",
      "Grooming",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670197055682",
        "title": "Ocean Blue & White",
        "price": 449,
        "compareAtPrice": 799,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7dc68386-e027-4d5f-bf64-8f99458c4685.JPG?v=1787631784",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Ocean Blue & White"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781940654274",
    "title": "Gentleman Tuxedo & Plaid Breathable Mesh Harness Vest with Leash Set",
    "handle": "gentleman-tuxedo-plaid-breathable-mesh-harness-vest-with-leash-set",
    "price": 549,
    "mrp": 899,
    "rating": 4.8,
    "reviews": 180,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/50e17592-e67a-4853-945f-42b106e3c784.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/639263fa-8b8c-4cf8-b54a-b3b508a1281b.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/37bda72c-7a4a-4228-b8d8-aaac340e4adb.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/8d913b7f-2eab-49e9-9135-77baeb7a8371.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/28911819-80e7-46fd-b748-ae1b8dea0779.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4896f1f3-4b18-4bfb-8555-c8a34b508100.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/5258aa4a-c94b-47f9-9431-f1e4e02813c1.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/535be8a9-0dc5-426b-848a-68530df9b469.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0976e620-a7d5-4ea5-88ae-86ef51bd5cd9.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c1961604-e52d-48a1-87a5-dad68768f406.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/ec005569-a295-46b4-9b29-54deb3c56d11.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/edfa7c33-c769-457e-a704-0b3d32780b55.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/fb7aa9b5-b083-45bf-89b0-ab353fa189ed.JPG?v=1787631731"
    ],
    "badges": [
      {
        "label": "39% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Formal Tuxedo &amp; Plaid Step-In Harness Vest with Matching Leash \n         Dress up your fur baby in style with this adorable bowtie tuxedo harness vest. Designed for small dogs, puppies, and cats. \n         Key Features: \n         \n           \n Breathable Air Mesh:  Honeycomb padded fabric prevents overheating and chafing, keeping pets cool and cozy. \n           \n Escape-Proof Step-In Design:  Easy to put on and remove with a heavy-duty quick-release buckle and dual metal D-rings. \n           \n Charming Bowtie &amp; Buttons:  Dapper gentleman design with decorative bowtie and contrast suit buttons. \n           \n Matching 1.2m Leash Included:  High-tensile matching lead with 360° tangle-free swivel hook.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Formal Tuxedo &amp; Plaid Step-In Harness Vest with Matching Leash</h3>\n        <p>Dress up your fur baby in style with this adorable bowtie tuxedo harness vest. Designed for small dogs, puppies, and cats.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Breathable Air Mesh:</strong> Honeycomb padded fabric prevents overheating and chafing, keeping pets cool and cozy.</li>\n          <li>\n<strong>Escape-Proof Step-In Design:</strong> Easy to put on and remove with a heavy-duty quick-release buckle and dual metal D-rings.</li>\n          <li>\n<strong>Charming Bowtie &amp; Buttons:</strong> Dapper gentleman design with decorative bowtie and contrast suit buttons.</li>\n          <li>\n<strong>Matching 1.2m Leash Included:</strong> High-tensile matching lead with 360° tangle-free swivel hook.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Accessories",
    "vendor": "Petpedia",
    "tags": [
      "Accessories",
      "Best Deals",
      "Cats",
      "Dogs",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670194794690",
        "title": "Small (Chest 23-42cm) / Classic Black Tuxedo",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194827458",
        "title": "Small (Chest 23-42cm) / Red Plaid Gentleman",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194860226",
        "title": "Small (Chest 23-42cm) / Formal Red Tuxedo",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194892994",
        "title": "Small (Chest 23-42cm) / Houndstooth Checkered",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194925762",
        "title": "Small (Chest 23-42cm) / Wild Leopard",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194958530",
        "title": "Small (Chest 23-42cm) / Star Blue",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194991298",
        "title": "Small (Chest 23-42cm) / Navy Anchor",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195024066",
        "title": "Small (Chest 23-42cm) / Red Anchor",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195056834",
        "title": "Medium (Chest 28-46cm) / Classic Black Tuxedo",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195089602",
        "title": "Medium (Chest 28-46cm) / Red Plaid Gentleman",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195122370",
        "title": "Medium (Chest 28-46cm) / Formal Red Tuxedo",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195155138",
        "title": "Medium (Chest 28-46cm) / Houndstooth Checkered",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195187906",
        "title": "Medium (Chest 28-46cm) / Wild Leopard",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195220674",
        "title": "Medium (Chest 28-46cm) / Star Blue",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195253442",
        "title": "Medium (Chest 28-46cm) / Navy Anchor",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195286210",
        "title": "Medium (Chest 28-46cm) / Red Anchor",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195318978",
        "title": "Large (Chest 35-50cm) / Classic Black Tuxedo",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195351746",
        "title": "Large (Chest 35-50cm) / Red Plaid Gentleman",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195384514",
        "title": "Large (Chest 35-50cm) / Formal Red Tuxedo",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195417282",
        "title": "Large (Chest 35-50cm) / Houndstooth Checkered",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195450050",
        "title": "Large (Chest 35-50cm) / Wild Leopard",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195482818",
        "title": "Large (Chest 35-50cm) / Star Blue",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195515586",
        "title": "Large (Chest 35-50cm) / Navy Anchor",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195548354",
        "title": "Large (Chest 35-50cm) / Red Anchor",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781941440706",
    "title": "Hexagonal Double Food & Water Feeding Bowl Station",
    "handle": "hexagonal-double-food-water-feeding-bowl-station",
    "price": 349,
    "mrp": 599,
    "rating": 4.8,
    "reviews": 195,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/8fac1c61-ab66-440f-be1c-7c7ab0c5a0aa.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/2c72fb23-fdc8-4445-808f-90b83d21e791.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/95a6ac91-ab41-4f1c-be5b-37f6ca3c6b93.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/a862ed0a-3f29-4bff-a673-5ddf6abd5830.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b932b79f-9cb7-4cc3-a728-b40d719ad411.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/bd226b0f-b14c-42b8-b421-938b3b1ba94c.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/baceeb48-8234-4e54-ae4b-37bc7004cea8.JPG?v=1787631825"
    ],
    "badges": [
      {
        "label": "42% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Geometric Hexagon Dual Food &amp; Water Feeding Dish \n         A modern, anti-tip double pet bowl designed for comfortable daily feeding for cats, puppies, and small-to-medium dogs. \n         Key Features: \n         \n           \n 2-in-1 Dual Dish Design:  Serves dry/wet food and fresh water side-by-side. \n           \n Anti-Spill Hexagonal Base:  Wide geometric foundation prevents tipping over and keeps feeding areas tidy. \n           \n Food-Grade PP Resin:  Non-toxic, BPA-free, odorless, and heat-resistant plastic. \n           \n Easy to Clean:  Seamless rounded corners rinse sparkling clean in seconds.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Geometric Hexagon Dual Food &amp; Water Feeding Dish</h3>\n        <p>A modern, anti-tip double pet bowl designed for comfortable daily feeding for cats, puppies, and small-to-medium dogs.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>2-in-1 Dual Dish Design:</strong> Serves dry/wet food and fresh water side-by-side.</li>\n          <li>\n<strong>Anti-Spill Hexagonal Base:</strong> Wide geometric foundation prevents tipping over and keeps feeding areas tidy.</li>\n          <li>\n<strong>Food-Grade PP Resin:</strong> Non-toxic, BPA-free, odorless, and heat-resistant plastic.</li>\n          <li>\n<strong>Easy to Clean:</strong> Seamless rounded corners rinse sparkling clean in seconds.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Bowls & Feeders",
    "vendor": "Petpedia",
    "tags": [
      "Accessories",
      "Best Deals",
      "Cats",
      "Dogs",
      "Food",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670197711042",
        "title": "Sunset Orange",
        "price": 349,
        "compareAtPrice": 599,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sunset Orange"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670197743810",
        "title": "Teal Green",
        "price": 349,
        "compareAtPrice": 599,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Teal Green"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670197776578",
        "title": "Sunny Yellow",
        "price": 349,
        "compareAtPrice": 599,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sunny Yellow"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670197809346",
        "title": "Nordic Blue",
        "price": 349,
        "compareAtPrice": 599,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Nordic Blue"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781940850882",
    "title": "Pastel Adjustable Pet Bell Collar with Silicone Smile Charm",
    "handle": "pastel-adjustable-pet-bell-collar-with-silicone-smile-charm",
    "price": 199,
    "mrp": 399,
    "rating": 4.8,
    "reviews": 210,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/271ecd71-e1bc-45e2-9341-cc996d791d5d.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/959743d5-6118-48b9-83a0-6d849422bac5.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/408f6c5d-844e-4f1b-a096-106c3c5556c6.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/d54086ad-e02e-4ce1-bc18-ac28c713d6b7.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/9ae7fefc-363d-4dfa-9355-1452939424ea.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4c6953fe-0916-4401-a13d-66a51c765f95.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/ea4ade76-ffc7-44d1-9676-a8f6b37b280e.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7cc50eca-67e5-42d7-921f-6b3d5e2d289c.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/fa4ed9dc-c461-415c-bebf-2b5ddd2a05bb.JPG?v=1787631747"
    ],
    "badges": [
      {
        "label": "50% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Soft Pastel Breakaway Bell Collar with Smile Tag \n         A lightweight, skin-friendly collar designed for puppies, kittens, cats, and small dogs. \n         Key Features: \n         \n           \n Safety Breakaway Buckle:  Releases under tension if snagged, preventing accidental choking. \n           \n Soft High-Density Webbing:  Gentle on fur and skin, fully adjustable from 19cm to 32cm neck circumference. \n           \n Melodious Bell &amp; Charm:  Includes a color-coordinated chime bell and cheerful silicone smile badge.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Soft Pastel Breakaway Bell Collar with Smile Tag</h3>\n        <p>A lightweight, skin-friendly collar designed for puppies, kittens, cats, and small dogs.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Safety Breakaway Buckle:</strong> Releases under tension if snagged, preventing accidental choking.</li>\n          <li>\n<strong>Soft High-Density Webbing:</strong> Gentle on fur and skin, fully adjustable from 19cm to 32cm neck circumference.</li>\n          <li>\n<strong>Melodious Bell &amp; Charm:</strong> Includes a color-coordinated chime bell and cheerful silicone smile badge.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Accessories",
    "vendor": "Petpedia",
    "tags": [
      "Accessories",
      "Best Deals",
      "Cats",
      "Dogs",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670195744962",
        "title": "Sunny Yellow",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sunny Yellow"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195777730",
        "title": "Sakura Pink",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sakura Pink"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195810498",
        "title": "Lavender Purple",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Lavender Purple"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195843266",
        "title": "Sky Blue",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sky Blue"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195876034",
        "title": "Forest Green",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Forest Green"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195908802",
        "title": "Coffee Brown",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Coffee Brown"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781940883650",
    "title": "Pet Soft Grooming & Hygiene Wipes (100 Pcs - Fresh Apple Scent)",
    "handle": "pet-soft-grooming-hygiene-wipes-100-pcs-fresh-apple-scent",
    "price": 299,
    "mrp": 499,
    "rating": 4.8,
    "reviews": 225,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19d92b6e-225f-480b-bfc0-8d0fda836cf8.JPG?v=1787631760",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19d92b6e-225f-480b-bfc0-8d0fda836cf8.JPG?v=1787631760",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/24fbe061-0ce7-480f-b9e7-4ab7378d01c2.JPG?v=1787631760",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/49d60686-08a3-47ca-87f5-5679d22ee54e.JPG?v=1787631760",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4afc3d4e-e8bd-405f-8009-2f51cdd88c30.JPG?v=1787631760",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/8349458f-f7ba-439c-80a7-b1d6a57b9a82.JPG?v=1787631761",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b6795bb6-0490-4521-9f44-50815c125d4b.JPG?v=1787631761",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b8a53afd-3e4c-4a92-b8d0-ca636591e809.JPG?v=1787631761",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/d07c000b-8ade-454c-99a4-e6f064484baa.JPG?v=1787631761",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/ee33873c-d519-4f24-a604-29d3fab2f3f8.JPG?v=1787631761"
    ],
    "badges": [
      {
        "label": "40% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Pet Soft Fresh Apple Scent Hygiene Wipes (100 Count) \n         Specially formulated hypoallergenic wet wipes for dogs, cats, puppies, and kittens. \n         Key Features: \n         \n           \n Alcohol-Free &amp; Gentle:  Safely cleans face, ears, paws, eyes, and coat without irritating sensitive skin. \n           \n Fresh Natural Apple Scent:  Deodorizes fur and neutralizes pet odors instantly. \n           \n Thick Textured Embossed Fabric:  20cm x 15cm size traps dirt, dander, and loose hair effortlessly. \n           \n Moisture-Lock Seal:  Durable flip-top lid preserves wetness and prevents drying out.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Pet Soft Fresh Apple Scent Hygiene Wipes (100 Count)</h3>\n        <p>Specially formulated hypoallergenic wet wipes for dogs, cats, puppies, and kittens.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Alcohol-Free &amp; Gentle:</strong> Safely cleans face, ears, paws, eyes, and coat without irritating sensitive skin.</li>\n          <li>\n<strong>Fresh Natural Apple Scent:</strong> Deodorizes fur and neutralizes pet odors instantly.</li>\n          <li>\n<strong>Thick Textured Embossed Fabric:</strong> 20cm x 15cm size traps dirt, dander, and loose hair effortlessly.</li>\n          <li>\n<strong>Moisture-Lock Seal:</strong> Durable flip-top lid preserves wetness and prevents drying out.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Grooming",
    "vendor": "Petpedia",
    "tags": [
      "Best Deals",
      "Cats",
      "Dogs",
      "Grooming",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670195941570",
        "title": "1 Pack (100 Wipes)",
        "price": 299,
        "compareAtPrice": 499,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19d92b6e-225f-480b-bfc0-8d0fda836cf8.JPG?v=1787631760",
        "selectedOptions": [
          {
            "name": "Pack Size",
            "value": "1 Pack (100 Wipes)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195974338",
        "title": "2 Packs (200 Wipes Value Bundle)",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19d92b6e-225f-480b-bfc0-8d0fda836cf8.JPG?v=1787631760",
        "selectedOptions": [
          {
            "name": "Pack Size",
            "value": "2 Packs (200 Wipes Value Bundle)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670196007106",
        "title": "3 Packs (300 Wipes Mega Saver)",
        "price": 749,
        "compareAtPrice": 1299,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19d92b6e-225f-480b-bfc0-8d0fda836cf8.JPG?v=1787631760",
        "selectedOptions": [
          {
            "name": "Pack Size",
            "value": "3 Packs (300 Wipes Mega Saver)"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781941211330",
    "title": "Professional Pet Nail Clipper & Diamond Filer Set with Safety Guard",
    "handle": "professional-pet-nail-clipper-diamond-filer-set-with-safety-guard",
    "price": 349,
    "mrp": 599,
    "rating": 4.8,
    "reviews": 240,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/eb4f50f9-0b0b-4b0c-8e2d-ff49d3014bd3.JPG?v=1787631793",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/eb4f50f9-0b0b-4b0c-8e2d-ff49d3014bd3.JPG?v=1787631793",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/423cca4f-8b33-42c0-9c83-0b0910a4e1d8.JPG?v=1787631793",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4b41644c-510b-467b-b5f2-4d34c112f868.JPG?v=1787631793",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/a3fc3d24-d92d-41e9-bf47-3ecb37fec992.JPG?v=1787631793",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/fa7e0688-2c84-4d2e-bc7c-31a6f9794726.JPG?v=1787631793"
    ],
    "badges": [
      {
        "label": "42% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Heavy Duty Pet Nail Trimmer &amp; Diamond Polishing File Set \n         Groom your pet's nails safely and comfortably at home without fear of injury or bleeding. \n         Key Features: \n         \n           \n 3.5mm Hardened Stainless Steel:  Sharp half-moon razor blades make swift, clean cuts without splintering nails. \n           \n Quick-Stop Safety Guard:  Prevents over-cutting and protects sensitive nail quicks. \n           \n Ergonomic Spring-Loaded Handles:  Rubberized cushioned grip reduces hand fatigue and includes a safety storage lock. \n           \n Diamond Finishing File:  Smooths rough edges after clipping for polished paws.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Heavy Duty Pet Nail Trimmer &amp; Diamond Polishing File Set</h3>\n        <p>Groom your pet's nails safely and comfortably at home without fear of injury or bleeding.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>3.5mm Hardened Stainless Steel:</strong> Sharp half-moon razor blades make swift, clean cuts without splintering nails.</li>\n          <li>\n<strong>Quick-Stop Safety Guard:</strong> Prevents over-cutting and protects sensitive nail quicks.</li>\n          <li>\n<strong>Ergonomic Spring-Loaded Handles:</strong> Rubberized cushioned grip reduces hand fatigue and includes a safety storage lock.</li>\n          <li>\n<strong>Diamond Finishing File:</strong> Smooths rough edges after clipping for polished paws.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Grooming",
    "vendor": "Petpedia",
    "tags": [
      "Best Deals",
      "Cats",
      "Dogs",
      "Grooming",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670197088450",
        "title": "Pro Clipper + Diamond Filer Set (Blue/Black)",
        "price": 349,
        "compareAtPrice": 599,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/eb4f50f9-0b0b-4b0c-8e2d-ff49d3014bd3.JPG?v=1787631793",
        "selectedOptions": [
          {
            "name": "Set",
            "value": "Pro Clipper + Diamond Filer Set (Blue/Black)"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781940490434",
    "title": "Smart Interactive Rolling Toy Ball 2.0 with Braided Tail (USB Rechargeable)",
    "handle": "smart-interactive-rolling-toy-ball-2-0-with-braided-tail-usb-rechargeable",
    "price": 799,
    "mrp": 1499,
    "rating": 4.8,
    "reviews": 255,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/04d529af-ecdf-431d-b2d8-a55ef8abf348.JPG?v=1787631714",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/04d529af-ecdf-431d-b2d8-a55ef8abf348.JPG?v=1787631714",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/107c955d-e4ee-41f8-87de-1bf99138d71c.JPG?v=1787631714",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/1204fab2-c8e0-4af1-a9a2-7647795cf320.JPG?v=1787631714",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/3a541bd0-2658-4704-967a-0d239dd83bd4.JPG?v=1787631714",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/40dc86d7-fa98-4210-8ba2-6f97be08788f.JPG?v=1787631714",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/487bb4fb-78c8-4f39-abec-9eb1db27ac80.JPG?v=1787631714",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4cc95c99-7b37-4452-a3a3-95250b0bdbc8.JPG?v=1787631714",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/5076a1e3-45a3-44c3-8835-b8fee3c2825f.JPG?v=1787631714",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/a60f34d5-bede-442f-9939-4f252131db61.JPG?v=1787631714",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/bdfd14de-38d0-4d2a-bf90-01e3013363ee.JPG?v=1787631714"
    ],
    "badges": [
      {
        "label": "47% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Smart Motion Interactive Pet Ball 2.0 with Bionic Movement \n         Keep your dogs and cats engaged for hours! This motorized smart ball rolls, twists, bounces irregularly, and navigates obstacles autonomously. \n         Key Features: \n         \n           \n 360° Automatic Movement:  Unpredictable trajectories stimulate hunting instincts and prevent pet boredom. \n           \n Intelligent Obstacle Avoidance:  Built-in motion sensor reverses automatically when touching walls, furniture, or corners. \n           \n LED Light Attraction:  Soft glowing LED ring captivates cats and dogs day and night without hurting their eyes. \n           \n Ultra-Quiet 20dB Motor:  Whisper-quiet operation keeps playtime fun without disturbing your household. \n           \n Chew-Resistant Braided Rope Tail:  Heavy-duty braided nylon cord withstands energetic bites, tugs, and pounces. \n           \n USB Rechargeable:  High-capacity lithium battery charges via USB in 30 minutes for hours of continuous play.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Smart Motion Interactive Pet Ball 2.0 with Bionic Movement</h3>\n        <p>Keep your dogs and cats engaged for hours! This motorized smart ball rolls, twists, bounces irregularly, and navigates obstacles autonomously.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>360° Automatic Movement:</strong> Unpredictable trajectories stimulate hunting instincts and prevent pet boredom.</li>\n          <li>\n<strong>Intelligent Obstacle Avoidance:</strong> Built-in motion sensor reverses automatically when touching walls, furniture, or corners.</li>\n          <li>\n<strong>LED Light Attraction:</strong> Soft glowing LED ring captivates cats and dogs day and night without hurting their eyes.</li>\n          <li>\n<strong>Ultra-Quiet 20dB Motor:</strong> Whisper-quiet operation keeps playtime fun without disturbing your household.</li>\n          <li>\n<strong>Chew-Resistant Braided Rope Tail:</strong> Heavy-duty braided nylon cord withstands energetic bites, tugs, and pounces.</li>\n          <li>\n<strong>USB Rechargeable:</strong> High-capacity lithium battery charges via USB in 30 minutes for hours of continuous play.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Toys",
    "vendor": "Petpedia",
    "tags": [
      "Best Deals",
      "Cats",
      "Dogs",
      "Hot",
      "Puppies",
      "Sale",
      "Toys"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670194565314",
        "title": "Sunset Orange (Yellow Tail)",
        "price": 799,
        "compareAtPrice": 1499,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/04d529af-ecdf-431d-b2d8-a55ef8abf348.JPG?v=1787631714",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sunset Orange (Yellow Tail)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194598082",
        "title": "Fiery Red (Red Tail)",
        "price": 799,
        "compareAtPrice": 1499,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/04d529af-ecdf-431d-b2d8-a55ef8abf348.JPG?v=1787631714",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Fiery Red (Red Tail)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194630850",
        "title": "Ocean Cyan (Cyan Tail)",
        "price": 799,
        "compareAtPrice": 1499,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/04d529af-ecdf-431d-b2d8-a55ef8abf348.JPG?v=1787631714",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Ocean Cyan (Cyan Tail)"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781941506242",
    "title": "Super Absorbent Quick-Dry PVA Chamois Pet Bath Towel with Portable Tube Case",
    "handle": "super-absorbent-quick-dry-pva-chamois-pet-bath-towel-with-portable-tube-case",
    "price": 299,
    "mrp": 499,
    "rating": 4.8,
    "reviews": 270,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c88c695e-bce6-41b2-9a73-1d764f051fc6.JPG?v=1787631844",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c88c695e-bce6-41b2-9a73-1d764f051fc6.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/2d3e48e2-220e-449f-9245-7ba598e070a4.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/391fdaf0-8f92-4ecd-a9bd-de3a4d307837.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/3fa9eaa1-cecc-4073-ae81-b415f63ec08c.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/483e84ff-0a01-4b51-b8f7-1bd7096a1503.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4ad23930-9f26-4342-97b5-cfaee3ce8826.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/56333697-65a5-4061-8f5d-5d2efd260850.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/56acd3eb-cf38-4b7c-9ed8-80be26187d82.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/5b3f9d3a-5ae7-4936-a2e2-7c6e88e1fcfc.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/5c914ea1-1a79-443d-894f-acbcf69b1706.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/613de260-fab0-406f-8afe-a26693e66e90.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/795e5e3e-83a2-4d3e-baa7-2eb0e26090cc.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7973af15-f60f-4546-835d-2d56f1754b40.JPG?v=1787631844",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cbfa1943-09f2-421a-abe7-e16221f6a7c7.JPG?v=1787631845",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/e5d9f78a-e5c5-48aa-a76e-365096813914.JPG?v=1787631845",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/f95ab0ee-55cb-4c2b-8862-2bfcf26c7a63.JPG?v=1787631845"
    ],
    "badges": [
      {
        "label": "40% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "High-Absorbency PVA Chamois Pet Drying Towel (66cm x 43cm) \n         Dry your pet in minutes after baths, swimming, or rainy walks with this ultra-absorbent chamois towel. \n         Key Features: \n         \n           \n 5X Superior Absorbency:  PVA material drinks up water instantly, cutting pet drying time in half. \n           \n Lint-Free &amp; Antibacterial:  Won't shed fuzz or hold damp odors when dried and stored. \n           \n Portable Cylindrical Case:  Includes a ventilated travel container with a hanging loop for easy car trips and storage. \n           \n Generous Size (66cm x 43cm):  Embossed with playful paw prints, ideal for all pet sizes.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>High-Absorbency PVA Chamois Pet Drying Towel (66cm x 43cm)</h3>\n        <p>Dry your pet in minutes after baths, swimming, or rainy walks with this ultra-absorbent chamois towel.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>5X Superior Absorbency:</strong> PVA material drinks up water instantly, cutting pet drying time in half.</li>\n          <li>\n<strong>Lint-Free &amp; Antibacterial:</strong> Won't shed fuzz or hold damp odors when dried and stored.</li>\n          <li>\n<strong>Portable Cylindrical Case:</strong> Includes a ventilated travel container with a hanging loop for easy car trips and storage.</li>\n          <li>\n<strong>Generous Size (66cm x 43cm):</strong> Embossed with playful paw prints, ideal for all pet sizes.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Grooming",
    "vendor": "Petpedia",
    "tags": [
      "Accessories",
      "Best Deals",
      "Cats",
      "Dogs",
      "Grooming",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670198104258",
        "title": "Ocean Blue",
        "price": 299,
        "compareAtPrice": 499,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c88c695e-bce6-41b2-9a73-1d764f051fc6.JPG?v=1787631844",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Ocean Blue"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670198137026",
        "title": "Pastel Pink",
        "price": 299,
        "compareAtPrice": 499,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c88c695e-bce6-41b2-9a73-1d764f051fc6.JPG?v=1787631844",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Pastel Pink"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670198169794",
        "title": "Mint Green",
        "price": 299,
        "compareAtPrice": 499,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c88c695e-bce6-41b2-9a73-1d764f051fc6.JPG?v=1787631844",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Mint Green"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670198202562",
        "title": "Lavender Purple",
        "price": 299,
        "compareAtPrice": 499,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c88c695e-bce6-41b2-9a73-1d764f051fc6.JPG?v=1787631844",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Lavender Purple"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670198235330",
        "title": "Sunny Yellow",
        "price": 299,
        "compareAtPrice": 499,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c88c695e-bce6-41b2-9a73-1d764f051fc6.JPG?v=1787631844",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sunny Yellow"
          }
        ]
      }
    ]
  }
];

export const hotPicks: Product[] = [
  {
    "id": "gid://shopify/Product/8781940162754",
    "title": "Automatic Cage-Hanging Pet Feeder & Water Dispenser (1L)",
    "handle": "automatic-cage-hanging-pet-feeder-water-dispenser-1l",
    "price": 699,
    "mrp": 1199,
    "rating": 4.8,
    "reviews": 120,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/02291d08-c439-4bff-af9b-1775531b28a4.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/14f159a7-7f01-4fad-85b2-5dbf448ab8e6.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/371b5483-97c3-4614-a3b7-192ababa932f.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/50a5ca0b-be4f-48ec-863c-703a95de60a4.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/6e4c2262-864f-474b-8df9-e9727a993c61.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/73f8b973-d806-4b02-8bde-0f5cd58bb86e.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/bf85bf94-b04e-493d-ab2a-97c0f7ca4af1.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cdf5e113-5ff8-4ff3-8bc9-aa693c6d758c.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/f407cc06-4a78-489a-999d-551b8a2d5cfd.JPG?v=1787631697",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/fc8be5f6-78aa-442a-8959-ac87d1496f1d.JPG?v=1787631697"
    ],
    "badges": [
      {
        "label": "42% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Automatic Gravity Pet Feeder &amp; Water Dispenser (1000ml) \n         Ensure your dogs, cats, puppies, rabbits, and small pets stay hydrated and well-fed throughout the day with this hanging automatic feeder and waterer set. \n         Key Features: \n         \n           \n Dual Usage Modes:  Securely mounts to any wire cage/crate with the heavy-duty twist lock, or stands stably on flat floors. \n           \n Large 1L (1000ml) Capacity:  Provides 3–5 days of continuous fresh water and kibble for small to medium pets. \n           \n Siphon Gravity Refill:  Automatic replenishment prevents spills, leaks, and overflows while maintaining water freshness. \n           \n Anti-Clog 75° Ramp:  Wide feeder mouth and 75-degree sloping ramp prevent dry kibble from jamming. \n           \n Top-Refill Lid:  Refill dry food or water easily from the top without detaching the main unit. \n           \n BPA-Free Food Grade Material:  Safe, durable, eco-friendly PP plastic with smooth, easy-to-clean surfaces.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Automatic Gravity Pet Feeder &amp; Water Dispenser (1000ml)</h3>\n        <p>Ensure your dogs, cats, puppies, rabbits, and small pets stay hydrated and well-fed throughout the day with this hanging automatic feeder and waterer set.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Dual Usage Modes:</strong> Securely mounts to any wire cage/crate with the heavy-duty twist lock, or stands stably on flat floors.</li>\n          <li>\n<strong>Large 1L (1000ml) Capacity:</strong> Provides 3–5 days of continuous fresh water and kibble for small to medium pets.</li>\n          <li>\n<strong>Siphon Gravity Refill:</strong> Automatic replenishment prevents spills, leaks, and overflows while maintaining water freshness.</li>\n          <li>\n<strong>Anti-Clog 75° Ramp:</strong> Wide feeder mouth and 75-degree sloping ramp prevent dry kibble from jamming.</li>\n          <li>\n<strong>Top-Refill Lid:</strong> Refill dry food or water easily from the top without detaching the main unit.</li>\n          <li>\n<strong>BPA-Free Food Grade Material:</strong> Safe, durable, eco-friendly PP plastic with smooth, easy-to-clean surfaces.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Bowls & Feeders",
    "vendor": "Petpedia",
    "tags": [
      "Accessories",
      "Best Deals",
      "Cats",
      "Dogs",
      "Food",
      "Hot",
      "Puppies",
      "Rabbits",
      "Sale",
      "Small Pets"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670193811650",
        "title": "Automatic Water Dispenser (1L - Mint Blue)",
        "price": 699,
        "compareAtPrice": 1199,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
        "selectedOptions": [
          {
            "name": "Type",
            "value": "Automatic Water Dispenser (1L - Mint Blue)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670193844418",
        "title": "Automatic Food Feeder (1L - Mint Blue)",
        "price": 749,
        "compareAtPrice": 1299,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
        "selectedOptions": [
          {
            "name": "Type",
            "value": "Automatic Food Feeder (1L - Mint Blue)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670193877186",
        "title": "2-in-1 Feeder & Waterer Combo Set",
        "price": 1299,
        "compareAtPrice": 2199,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
        "selectedOptions": [
          {
            "name": "Type",
            "value": "2-in-1 Feeder & Waterer Combo Set"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781940981954",
    "title": "Cute Cat-Ear Self-Cleaning Slicker Brush (Massage Bead Pins)",
    "handle": "cute-cat-ear-self-cleaning-slicker-brush-massage-bead-pins",
    "price": 399,
    "mrp": 699,
    "rating": 4.8,
    "reviews": 135,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/aba19b7d-e3c0-4c73-a566-79c7f2452dd5.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cbb429fc-ab6f-4cff-86ef-3e1edff51bbe.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/29371db1-002a-42da-97b2-707e4d99660a.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/297a3d24-2f61-4f64-8a5c-44a1ef94d713.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/5036ce28-4bf8-4d98-b548-131d0d3204a8.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/a5bea1ae-f928-478f-b3f2-e71f55165ec3.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c5cec50f-bf76-46d9-b6aa-5aa16ec63804.JPG?v=1787631772",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/e652ce9a-ca03-4414-99f6-1f340f15faa4.JPG?v=1787631772"
    ],
    "badges": [
      {
        "label": "43% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "One-Click Self Cleaning Pet Grooming Slicker Brush \n         Say goodbye to painful shedding! Designed with 140° curved stainless steel pins tipped with soft massage resin beads. \n         Key Features: \n         \n           \n One-Click Hair Ejection:  Press the big push button on the back to instantly release shed fur in seconds. \n           \n Resin Bead Massage Tips:  Protects delicate skin while boosting blood circulation and leaving coat glossy. \n           \n Cute Cat-Ear Ergonomic Handle:  Lightweight, anti-slip curved handle for comfortable grooming sessions. \n           \n Fully Washable:  Waterproof stainless steel and ABS construction can be rinsed under running water.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>One-Click Self Cleaning Pet Grooming Slicker Brush</h3>\n        <p>Say goodbye to painful shedding! Designed with 140° curved stainless steel pins tipped with soft massage resin beads.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>One-Click Hair Ejection:</strong> Press the big push button on the back to instantly release shed fur in seconds.</li>\n          <li>\n<strong>Resin Bead Massage Tips:</strong> Protects delicate skin while boosting blood circulation and leaving coat glossy.</li>\n          <li>\n<strong>Cute Cat-Ear Ergonomic Handle:</strong> Lightweight, anti-slip curved handle for comfortable grooming sessions.</li>\n          <li>\n<strong>Fully Washable:</strong> Waterproof stainless steel and ABS construction can be rinsed under running water.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Grooming",
    "vendor": "Petpedia",
    "tags": [
      "Best Deals",
      "Cats",
      "Dogs",
      "Grooming",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670196596930",
        "title": "Mint Green",
        "price": 399,
        "compareAtPrice": 699,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Mint Green"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670196629698",
        "title": "Pastel Pink",
        "price": 399,
        "compareAtPrice": 699,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Pastel Pink"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670196662466",
        "title": "Coffee Brown",
        "price": 399,
        "compareAtPrice": 699,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Coffee Brown"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781941407938",
    "title": "Dual-Sided Reusable Electrostatic Pet Hair Remover Glove / Mitt",
    "handle": "dual-sided-reusable-electrostatic-pet-hair-remover-glove-mitt",
    "price": 249,
    "mrp": 449,
    "rating": 4.8,
    "reviews": 150,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4166119a-e2c9-488b-8983-e4605e7098f5.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/6f9eb2f8-5c0f-4be6-9636-ef0b64e583b6.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/91eb9542-77c0-4cf8-ad10-1537bac043e5.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/97d02a87-0502-4033-9b22-82b54f70d644.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/9eee3003-2042-4797-ae5b-8f9ab4497661.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b7f1dc12-c595-447c-99f4-6d843fc8d547.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c14f74fe-5a72-4ad5-82d7-f0adfb198b0d.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/d4cea5bc-1322-4a14-bb1a-ce0372dd43e3.JPG?v=1787631812",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/f7f28189-646f-4e3c-a6ef-76868c231e4f.JPG?v=1787631812"
    ],
    "badges": [
      {
        "label": "45% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Dual-Directional Static Pet Hair &amp; Lint Cleaning Mitt \n         The ultimate fur-cleaning mitt for your home, car, and pet grooming routine! \n         Key Features: \n         \n           \n Dual-Sided Static Fabric:  Two-sided micro-bristle texture collects fur, hair, and lint instantly with a swipe. \n           \n Multi-Surface Cleaning:  Works miracles on couches, carpets, clothing, car seats, pet beds, and directly on coats. \n           \n Reversible &amp; Reusable:  No sticky tape refills required. Simply roll fur off and reuse infinitely. \n           \n Comfortable Mesh Back:  24cm x 17cm breathable mesh glove fits hands securely with thumb band.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Dual-Directional Static Pet Hair &amp; Lint Cleaning Mitt</h3>\n        <p>The ultimate fur-cleaning mitt for your home, car, and pet grooming routine!</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Dual-Sided Static Fabric:</strong> Two-sided micro-bristle texture collects fur, hair, and lint instantly with a swipe.</li>\n          <li>\n<strong>Multi-Surface Cleaning:</strong> Works miracles on couches, carpets, clothing, car seats, pet beds, and directly on coats.</li>\n          <li>\n<strong>Reversible &amp; Reusable:</strong> No sticky tape refills required. Simply roll fur off and reuse infinitely.</li>\n          <li>\n<strong>Comfortable Mesh Back:</strong> 24cm x 17cm breathable mesh glove fits hands securely with thumb band.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Grooming",
    "vendor": "Petpedia",
    "tags": [
      "Accessories",
      "Best Deals",
      "Cats",
      "Dogs",
      "Grooming",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670197612738",
        "title": "1 Glove (Single)",
        "price": 249,
        "compareAtPrice": 449,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
        "selectedOptions": [
          {
            "name": "Quantity",
            "value": "1 Glove (Single)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670197645506",
        "title": "2 Gloves (Pair)",
        "price": 429,
        "compareAtPrice": 799,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
        "selectedOptions": [
          {
            "name": "Quantity",
            "value": "2 Gloves (Pair)"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781941178562",
    "title": "Ergonomic Retractable Fine-Pin Slicker Brush with Textured Grip",
    "handle": "ergonomic-retractable-fine-pin-slicker-brush-with-textured-grip",
    "price": 449,
    "mrp": 799,
    "rating": 4.8,
    "reviews": 165,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7dc68386-e027-4d5f-bf64-8f99458c4685.JPG?v=1787631784",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7dc68386-e027-4d5f-bf64-8f99458c4685.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/2c454b62-4843-419a-8cad-80738963aed0.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/ab4d87e8-c570-4ce5-892b-2e2a72afbd91.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/afa6812d-3dda-403a-9f8b-75f7c3d39293.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/bd897710-ea7a-46ca-ac0a-a862c6e10f49.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c0601550-5554-440c-9bff-b731e6ef3468.JPG?v=1787631784",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cdc39120-db0a-468c-b56a-32aba34084be.JPG?v=1787631784"
    ],
    "badges": [
      {
        "label": "44% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Professional Retractable Deshedding Pin Brush \n         Easily remove loose undercoat fur, mats, and tangles with this heavy-duty self-cleaning brush. \n         Key Features: \n         \n           \n High-Density Fine Wire Bristles:  Reaches deep into thick double coats without scratching or pulling. \n           \n Instant Hair Release Button:  Push-button mechanism retracts pins to wipe shed hair clean in one swipe. \n           \n Diamond Textured Grip:  Ergonomic anti-slip contoured handle ensures wrist comfort.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Professional Retractable Deshedding Pin Brush</h3>\n        <p>Easily remove loose undercoat fur, mats, and tangles with this heavy-duty self-cleaning brush.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>High-Density Fine Wire Bristles:</strong> Reaches deep into thick double coats without scratching or pulling.</li>\n          <li>\n<strong>Instant Hair Release Button:</strong> Push-button mechanism retracts pins to wipe shed hair clean in one swipe.</li>\n          <li>\n<strong>Diamond Textured Grip:</strong> Ergonomic anti-slip contoured handle ensures wrist comfort.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Grooming",
    "vendor": "Petpedia",
    "tags": [
      "Best Deals",
      "Cats",
      "Dogs",
      "Grooming",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670197055682",
        "title": "Ocean Blue & White",
        "price": 449,
        "compareAtPrice": 799,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7dc68386-e027-4d5f-bf64-8f99458c4685.JPG?v=1787631784",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Ocean Blue & White"
          }
        ]
      }
    ]
  }
];

export const bestsellers: Product[] = [
  {
    "id": "gid://shopify/Product/8781940654274",
    "title": "Gentleman Tuxedo & Plaid Breathable Mesh Harness Vest with Leash Set",
    "handle": "gentleman-tuxedo-plaid-breathable-mesh-harness-vest-with-leash-set",
    "price": 549,
    "mrp": 899,
    "rating": 4.8,
    "reviews": 180,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/50e17592-e67a-4853-945f-42b106e3c784.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/639263fa-8b8c-4cf8-b54a-b3b508a1281b.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/37bda72c-7a4a-4228-b8d8-aaac340e4adb.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/8d913b7f-2eab-49e9-9135-77baeb7a8371.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/28911819-80e7-46fd-b748-ae1b8dea0779.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4896f1f3-4b18-4bfb-8555-c8a34b508100.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/5258aa4a-c94b-47f9-9431-f1e4e02813c1.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/535be8a9-0dc5-426b-848a-68530df9b469.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0976e620-a7d5-4ea5-88ae-86ef51bd5cd9.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c1961604-e52d-48a1-87a5-dad68768f406.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/ec005569-a295-46b4-9b29-54deb3c56d11.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/edfa7c33-c769-457e-a704-0b3d32780b55.JPG?v=1787631731",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/fb7aa9b5-b083-45bf-89b0-ab353fa189ed.JPG?v=1787631731"
    ],
    "badges": [
      {
        "label": "39% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Formal Tuxedo &amp; Plaid Step-In Harness Vest with Matching Leash \n         Dress up your fur baby in style with this adorable bowtie tuxedo harness vest. Designed for small dogs, puppies, and cats. \n         Key Features: \n         \n           \n Breathable Air Mesh:  Honeycomb padded fabric prevents overheating and chafing, keeping pets cool and cozy. \n           \n Escape-Proof Step-In Design:  Easy to put on and remove with a heavy-duty quick-release buckle and dual metal D-rings. \n           \n Charming Bowtie &amp; Buttons:  Dapper gentleman design with decorative bowtie and contrast suit buttons. \n           \n Matching 1.2m Leash Included:  High-tensile matching lead with 360° tangle-free swivel hook.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Formal Tuxedo &amp; Plaid Step-In Harness Vest with Matching Leash</h3>\n        <p>Dress up your fur baby in style with this adorable bowtie tuxedo harness vest. Designed for small dogs, puppies, and cats.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Breathable Air Mesh:</strong> Honeycomb padded fabric prevents overheating and chafing, keeping pets cool and cozy.</li>\n          <li>\n<strong>Escape-Proof Step-In Design:</strong> Easy to put on and remove with a heavy-duty quick-release buckle and dual metal D-rings.</li>\n          <li>\n<strong>Charming Bowtie &amp; Buttons:</strong> Dapper gentleman design with decorative bowtie and contrast suit buttons.</li>\n          <li>\n<strong>Matching 1.2m Leash Included:</strong> High-tensile matching lead with 360° tangle-free swivel hook.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Accessories",
    "vendor": "Petpedia",
    "tags": [
      "Accessories",
      "Best Deals",
      "Cats",
      "Dogs",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670194794690",
        "title": "Small (Chest 23-42cm) / Classic Black Tuxedo",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194827458",
        "title": "Small (Chest 23-42cm) / Red Plaid Gentleman",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194860226",
        "title": "Small (Chest 23-42cm) / Formal Red Tuxedo",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194892994",
        "title": "Small (Chest 23-42cm) / Houndstooth Checkered",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194925762",
        "title": "Small (Chest 23-42cm) / Wild Leopard",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194958530",
        "title": "Small (Chest 23-42cm) / Star Blue",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670194991298",
        "title": "Small (Chest 23-42cm) / Navy Anchor",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195024066",
        "title": "Small (Chest 23-42cm) / Red Anchor",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Small (Chest 23-42cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195056834",
        "title": "Medium (Chest 28-46cm) / Classic Black Tuxedo",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195089602",
        "title": "Medium (Chest 28-46cm) / Red Plaid Gentleman",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195122370",
        "title": "Medium (Chest 28-46cm) / Formal Red Tuxedo",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195155138",
        "title": "Medium (Chest 28-46cm) / Houndstooth Checkered",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195187906",
        "title": "Medium (Chest 28-46cm) / Wild Leopard",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195220674",
        "title": "Medium (Chest 28-46cm) / Star Blue",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195253442",
        "title": "Medium (Chest 28-46cm) / Navy Anchor",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195286210",
        "title": "Medium (Chest 28-46cm) / Red Anchor",
        "price": 599,
        "compareAtPrice": 999,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Medium (Chest 28-46cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195318978",
        "title": "Large (Chest 35-50cm) / Classic Black Tuxedo",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195351746",
        "title": "Large (Chest 35-50cm) / Red Plaid Gentleman",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195384514",
        "title": "Large (Chest 35-50cm) / Formal Red Tuxedo",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195417282",
        "title": "Large (Chest 35-50cm) / Houndstooth Checkered",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195450050",
        "title": "Large (Chest 35-50cm) / Wild Leopard",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195482818",
        "title": "Large (Chest 35-50cm) / Star Blue",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195515586",
        "title": "Large (Chest 35-50cm) / Navy Anchor",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195548354",
        "title": "Large (Chest 35-50cm) / Red Anchor",
        "price": 649,
        "compareAtPrice": 1099,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "selectedOptions": [
          {
            "name": "Size",
            "value": "Large (Chest 35-50cm)"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781941440706",
    "title": "Hexagonal Double Food & Water Feeding Bowl Station",
    "handle": "hexagonal-double-food-water-feeding-bowl-station",
    "price": 349,
    "mrp": 599,
    "rating": 4.8,
    "reviews": 195,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/8fac1c61-ab66-440f-be1c-7c7ab0c5a0aa.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/2c72fb23-fdc8-4445-808f-90b83d21e791.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/95a6ac91-ab41-4f1c-be5b-37f6ca3c6b93.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/a862ed0a-3f29-4bff-a673-5ddf6abd5830.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b932b79f-9cb7-4cc3-a728-b40d719ad411.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/bd226b0f-b14c-42b8-b421-938b3b1ba94c.JPG?v=1787631825",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/baceeb48-8234-4e54-ae4b-37bc7004cea8.JPG?v=1787631825"
    ],
    "badges": [
      {
        "label": "42% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Geometric Hexagon Dual Food &amp; Water Feeding Dish \n         A modern, anti-tip double pet bowl designed for comfortable daily feeding for cats, puppies, and small-to-medium dogs. \n         Key Features: \n         \n           \n 2-in-1 Dual Dish Design:  Serves dry/wet food and fresh water side-by-side. \n           \n Anti-Spill Hexagonal Base:  Wide geometric foundation prevents tipping over and keeps feeding areas tidy. \n           \n Food-Grade PP Resin:  Non-toxic, BPA-free, odorless, and heat-resistant plastic. \n           \n Easy to Clean:  Seamless rounded corners rinse sparkling clean in seconds.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Geometric Hexagon Dual Food &amp; Water Feeding Dish</h3>\n        <p>A modern, anti-tip double pet bowl designed for comfortable daily feeding for cats, puppies, and small-to-medium dogs.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>2-in-1 Dual Dish Design:</strong> Serves dry/wet food and fresh water side-by-side.</li>\n          <li>\n<strong>Anti-Spill Hexagonal Base:</strong> Wide geometric foundation prevents tipping over and keeps feeding areas tidy.</li>\n          <li>\n<strong>Food-Grade PP Resin:</strong> Non-toxic, BPA-free, odorless, and heat-resistant plastic.</li>\n          <li>\n<strong>Easy to Clean:</strong> Seamless rounded corners rinse sparkling clean in seconds.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Bowls & Feeders",
    "vendor": "Petpedia",
    "tags": [
      "Accessories",
      "Best Deals",
      "Cats",
      "Dogs",
      "Food",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670197711042",
        "title": "Sunset Orange",
        "price": 349,
        "compareAtPrice": 599,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sunset Orange"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670197743810",
        "title": "Teal Green",
        "price": 349,
        "compareAtPrice": 599,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Teal Green"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670197776578",
        "title": "Sunny Yellow",
        "price": 349,
        "compareAtPrice": 599,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sunny Yellow"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670197809346",
        "title": "Nordic Blue",
        "price": 349,
        "compareAtPrice": 599,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Nordic Blue"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781940850882",
    "title": "Pastel Adjustable Pet Bell Collar with Silicone Smile Charm",
    "handle": "pastel-adjustable-pet-bell-collar-with-silicone-smile-charm",
    "price": 199,
    "mrp": 399,
    "rating": 4.8,
    "reviews": 210,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/271ecd71-e1bc-45e2-9341-cc996d791d5d.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/959743d5-6118-48b9-83a0-6d849422bac5.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/408f6c5d-844e-4f1b-a096-106c3c5556c6.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/d54086ad-e02e-4ce1-bc18-ac28c713d6b7.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/9ae7fefc-363d-4dfa-9355-1452939424ea.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4c6953fe-0916-4401-a13d-66a51c765f95.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/ea4ade76-ffc7-44d1-9676-a8f6b37b280e.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7cc50eca-67e5-42d7-921f-6b3d5e2d289c.JPG?v=1787631747",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/fa4ed9dc-c461-415c-bebf-2b5ddd2a05bb.JPG?v=1787631747"
    ],
    "badges": [
      {
        "label": "50% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Soft Pastel Breakaway Bell Collar with Smile Tag \n         A lightweight, skin-friendly collar designed for puppies, kittens, cats, and small dogs. \n         Key Features: \n         \n           \n Safety Breakaway Buckle:  Releases under tension if snagged, preventing accidental choking. \n           \n Soft High-Density Webbing:  Gentle on fur and skin, fully adjustable from 19cm to 32cm neck circumference. \n           \n Melodious Bell &amp; Charm:  Includes a color-coordinated chime bell and cheerful silicone smile badge.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Soft Pastel Breakaway Bell Collar with Smile Tag</h3>\n        <p>A lightweight, skin-friendly collar designed for puppies, kittens, cats, and small dogs.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Safety Breakaway Buckle:</strong> Releases under tension if snagged, preventing accidental choking.</li>\n          <li>\n<strong>Soft High-Density Webbing:</strong> Gentle on fur and skin, fully adjustable from 19cm to 32cm neck circumference.</li>\n          <li>\n<strong>Melodious Bell &amp; Charm:</strong> Includes a color-coordinated chime bell and cheerful silicone smile badge.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Accessories",
    "vendor": "Petpedia",
    "tags": [
      "Accessories",
      "Best Deals",
      "Cats",
      "Dogs",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670195744962",
        "title": "Sunny Yellow",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sunny Yellow"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195777730",
        "title": "Sakura Pink",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sakura Pink"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195810498",
        "title": "Lavender Purple",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Lavender Purple"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195843266",
        "title": "Sky Blue",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Sky Blue"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195876034",
        "title": "Forest Green",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Forest Green"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195908802",
        "title": "Coffee Brown",
        "price": 199,
        "compareAtPrice": 399,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0c0038ae-46b7-4a1a-b98c-e9d325c42ac7.JPG?v=1787631747",
        "selectedOptions": [
          {
            "name": "Color",
            "value": "Coffee Brown"
          }
        ]
      }
    ]
  },
  {
    "id": "gid://shopify/Product/8781940883650",
    "title": "Pet Soft Grooming & Hygiene Wipes (100 Pcs - Fresh Apple Scent)",
    "handle": "pet-soft-grooming-hygiene-wipes-100-pcs-fresh-apple-scent",
    "price": 299,
    "mrp": 499,
    "rating": 4.8,
    "reviews": 225,
    "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19d92b6e-225f-480b-bfc0-8d0fda836cf8.JPG?v=1787631760",
    "images": [
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19d92b6e-225f-480b-bfc0-8d0fda836cf8.JPG?v=1787631760",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/24fbe061-0ce7-480f-b9e7-4ab7378d01c2.JPG?v=1787631760",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/49d60686-08a3-47ca-87f5-5679d22ee54e.JPG?v=1787631760",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4afc3d4e-e8bd-405f-8009-2f51cdd88c30.JPG?v=1787631760",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/8349458f-f7ba-439c-80a7-b1d6a57b9a82.JPG?v=1787631761",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b6795bb6-0490-4521-9f44-50815c125d4b.JPG?v=1787631761",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b8a53afd-3e4c-4a92-b8d0-ca636591e809.JPG?v=1787631761",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/d07c000b-8ade-454c-99a4-e6f064484baa.JPG?v=1787631761",
      "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/ee33873c-d519-4f24-a604-29d3fab2f3f8.JPG?v=1787631761"
    ],
    "badges": [
      {
        "label": "40% OFF",
        "tone": "off"
      },
      {
        "label": "HOT",
        "tone": "hot"
      },
      {
        "label": "BEST DEALS",
        "tone": "deal"
      }
    ],
    "description": "Pet Soft Fresh Apple Scent Hygiene Wipes (100 Count) \n         Specially formulated hypoallergenic wet wipes for dogs, cats, puppies, and kittens. \n         Key Features: \n         \n           \n Alcohol-Free &amp; Gentle:  Safely cleans face, ears, paws, eyes, and coat without irritating sensitive skin. \n           \n Fresh Natural Apple Scent:  Deodorizes fur and neutralizes pet odors instantly. \n           \n Thick Textured Embossed Fabric:  20cm x 15cm size traps dirt, dander, and loose hair effortlessly. \n           \n Moisture-Lock Seal:  Durable flip-top lid preserves wetness and prevents drying out.",
    "descriptionHtml": "<div class=\"product-description\">\n        <h3>Pet Soft Fresh Apple Scent Hygiene Wipes (100 Count)</h3>\n        <p>Specially formulated hypoallergenic wet wipes for dogs, cats, puppies, and kittens.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Alcohol-Free &amp; Gentle:</strong> Safely cleans face, ears, paws, eyes, and coat without irritating sensitive skin.</li>\n          <li>\n<strong>Fresh Natural Apple Scent:</strong> Deodorizes fur and neutralizes pet odors instantly.</li>\n          <li>\n<strong>Thick Textured Embossed Fabric:</strong> 20cm x 15cm size traps dirt, dander, and loose hair effortlessly.</li>\n          <li>\n<strong>Moisture-Lock Seal:</strong> Durable flip-top lid preserves wetness and prevents drying out.</li>\n        </ul>\n      </div>",
    "availableForSale": true,
    "productType": "Grooming",
    "vendor": "Petpedia",
    "tags": [
      "Best Deals",
      "Cats",
      "Dogs",
      "Grooming",
      "Hot",
      "Puppies",
      "Sale"
    ],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/48670195941570",
        "title": "1 Pack (100 Wipes)",
        "price": 299,
        "compareAtPrice": 499,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19d92b6e-225f-480b-bfc0-8d0fda836cf8.JPG?v=1787631760",
        "selectedOptions": [
          {
            "name": "Pack Size",
            "value": "1 Pack (100 Wipes)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670195974338",
        "title": "2 Packs (200 Wipes Value Bundle)",
        "price": 549,
        "compareAtPrice": 899,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19d92b6e-225f-480b-bfc0-8d0fda836cf8.JPG?v=1787631760",
        "selectedOptions": [
          {
            "name": "Pack Size",
            "value": "2 Packs (200 Wipes Value Bundle)"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/48670196007106",
        "title": "3 Packs (300 Wipes Mega Saver)",
        "price": 749,
        "compareAtPrice": 1299,
        "availableForSale": true,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19d92b6e-225f-480b-bfc0-8d0fda836cf8.JPG?v=1787631760",
        "selectedOptions": [
          {
            "name": "Pack Size",
            "value": "3 Packs (300 Wipes Mega Saver)"
          }
        ]
      }
    ]
  }
];

export const columnProducts: { title: string; items: Product[] }[] = [
  {
    "title": "Top Rated Essentials",
    "items": [
      {
        "id": "gid://shopify/Product/8781940162754",
        "title": "Automatic Cage-Hanging Pet Feeder & Water Dispenser (1L)",
        "handle": "automatic-cage-hanging-pet-feeder-water-dispenser-1l",
        "price": 699,
        "mrp": 1199,
        "rating": 4.8,
        "reviews": 120,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
        "images": [
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/02291d08-c439-4bff-af9b-1775531b28a4.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/14f159a7-7f01-4fad-85b2-5dbf448ab8e6.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/371b5483-97c3-4614-a3b7-192ababa932f.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/50a5ca0b-be4f-48ec-863c-703a95de60a4.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/6e4c2262-864f-474b-8df9-e9727a993c61.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/73f8b973-d806-4b02-8bde-0f5cd58bb86e.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/bf85bf94-b04e-493d-ab2a-97c0f7ca4af1.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cdf5e113-5ff8-4ff3-8bc9-aa693c6d758c.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/f407cc06-4a78-489a-999d-551b8a2d5cfd.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/fc8be5f6-78aa-442a-8959-ac87d1496f1d.JPG?v=1787631697"
        ],
        "badges": [
          {
            "label": "42% OFF",
            "tone": "off"
          },
          {
            "label": "HOT",
            "tone": "hot"
          },
          {
            "label": "BEST DEALS",
            "tone": "deal"
          }
        ],
        "description": "Automatic Gravity Pet Feeder &amp; Water Dispenser (1000ml) \n         Ensure your dogs, cats, puppies, rabbits, and small pets stay hydrated and well-fed throughout the day with this hanging automatic feeder and waterer set. \n         Key Features: \n         \n           \n Dual Usage Modes:  Securely mounts to any wire cage/crate with the heavy-duty twist lock, or stands stably on flat floors. \n           \n Large 1L (1000ml) Capacity:  Provides 3–5 days of continuous fresh water and kibble for small to medium pets. \n           \n Siphon Gravity Refill:  Automatic replenishment prevents spills, leaks, and overflows while maintaining water freshness. \n           \n Anti-Clog 75° Ramp:  Wide feeder mouth and 75-degree sloping ramp prevent dry kibble from jamming. \n           \n Top-Refill Lid:  Refill dry food or water easily from the top without detaching the main unit. \n           \n BPA-Free Food Grade Material:  Safe, durable, eco-friendly PP plastic with smooth, easy-to-clean surfaces.",
        "descriptionHtml": "<div class=\"product-description\">\n        <h3>Automatic Gravity Pet Feeder &amp; Water Dispenser (1000ml)</h3>\n        <p>Ensure your dogs, cats, puppies, rabbits, and small pets stay hydrated and well-fed throughout the day with this hanging automatic feeder and waterer set.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Dual Usage Modes:</strong> Securely mounts to any wire cage/crate with the heavy-duty twist lock, or stands stably on flat floors.</li>\n          <li>\n<strong>Large 1L (1000ml) Capacity:</strong> Provides 3–5 days of continuous fresh water and kibble for small to medium pets.</li>\n          <li>\n<strong>Siphon Gravity Refill:</strong> Automatic replenishment prevents spills, leaks, and overflows while maintaining water freshness.</li>\n          <li>\n<strong>Anti-Clog 75° Ramp:</strong> Wide feeder mouth and 75-degree sloping ramp prevent dry kibble from jamming.</li>\n          <li>\n<strong>Top-Refill Lid:</strong> Refill dry food or water easily from the top without detaching the main unit.</li>\n          <li>\n<strong>BPA-Free Food Grade Material:</strong> Safe, durable, eco-friendly PP plastic with smooth, easy-to-clean surfaces.</li>\n        </ul>\n      </div>",
        "availableForSale": true,
        "productType": "Bowls & Feeders",
        "vendor": "Petpedia",
        "tags": [
          "Accessories",
          "Best Deals",
          "Cats",
          "Dogs",
          "Food",
          "Hot",
          "Puppies",
          "Rabbits",
          "Sale",
          "Small Pets"
        ],
        "variants": [
          {
            "id": "gid://shopify/ProductVariant/48670193811650",
            "title": "Automatic Water Dispenser (1L - Mint Blue)",
            "price": 699,
            "compareAtPrice": 1199,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
            "selectedOptions": [
              {
                "name": "Type",
                "value": "Automatic Water Dispenser (1L - Mint Blue)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670193844418",
            "title": "Automatic Food Feeder (1L - Mint Blue)",
            "price": 749,
            "compareAtPrice": 1299,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
            "selectedOptions": [
              {
                "name": "Type",
                "value": "Automatic Food Feeder (1L - Mint Blue)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670193877186",
            "title": "2-in-1 Feeder & Waterer Combo Set",
            "price": 1299,
            "compareAtPrice": 2199,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
            "selectedOptions": [
              {
                "name": "Type",
                "value": "2-in-1 Feeder & Waterer Combo Set"
              }
            ]
          }
        ]
      },
      {
        "id": "gid://shopify/Product/8781940981954",
        "title": "Cute Cat-Ear Self-Cleaning Slicker Brush (Massage Bead Pins)",
        "handle": "cute-cat-ear-self-cleaning-slicker-brush-massage-bead-pins",
        "price": 399,
        "mrp": 699,
        "rating": 4.8,
        "reviews": 135,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
        "images": [
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/aba19b7d-e3c0-4c73-a566-79c7f2452dd5.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cbb429fc-ab6f-4cff-86ef-3e1edff51bbe.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/29371db1-002a-42da-97b2-707e4d99660a.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/297a3d24-2f61-4f64-8a5c-44a1ef94d713.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/5036ce28-4bf8-4d98-b548-131d0d3204a8.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/a5bea1ae-f928-478f-b3f2-e71f55165ec3.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c5cec50f-bf76-46d9-b6aa-5aa16ec63804.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/e652ce9a-ca03-4414-99f6-1f340f15faa4.JPG?v=1787631772"
        ],
        "badges": [
          {
            "label": "43% OFF",
            "tone": "off"
          },
          {
            "label": "HOT",
            "tone": "hot"
          },
          {
            "label": "BEST DEALS",
            "tone": "deal"
          }
        ],
        "description": "One-Click Self Cleaning Pet Grooming Slicker Brush \n         Say goodbye to painful shedding! Designed with 140° curved stainless steel pins tipped with soft massage resin beads. \n         Key Features: \n         \n           \n One-Click Hair Ejection:  Press the big push button on the back to instantly release shed fur in seconds. \n           \n Resin Bead Massage Tips:  Protects delicate skin while boosting blood circulation and leaving coat glossy. \n           \n Cute Cat-Ear Ergonomic Handle:  Lightweight, anti-slip curved handle for comfortable grooming sessions. \n           \n Fully Washable:  Waterproof stainless steel and ABS construction can be rinsed under running water.",
        "descriptionHtml": "<div class=\"product-description\">\n        <h3>One-Click Self Cleaning Pet Grooming Slicker Brush</h3>\n        <p>Say goodbye to painful shedding! Designed with 140° curved stainless steel pins tipped with soft massage resin beads.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>One-Click Hair Ejection:</strong> Press the big push button on the back to instantly release shed fur in seconds.</li>\n          <li>\n<strong>Resin Bead Massage Tips:</strong> Protects delicate skin while boosting blood circulation and leaving coat glossy.</li>\n          <li>\n<strong>Cute Cat-Ear Ergonomic Handle:</strong> Lightweight, anti-slip curved handle for comfortable grooming sessions.</li>\n          <li>\n<strong>Fully Washable:</strong> Waterproof stainless steel and ABS construction can be rinsed under running water.</li>\n        </ul>\n      </div>",
        "availableForSale": true,
        "productType": "Grooming",
        "vendor": "Petpedia",
        "tags": [
          "Best Deals",
          "Cats",
          "Dogs",
          "Grooming",
          "Hot",
          "Puppies",
          "Sale"
        ],
        "variants": [
          {
            "id": "gid://shopify/ProductVariant/48670196596930",
            "title": "Mint Green",
            "price": 399,
            "compareAtPrice": 699,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
            "selectedOptions": [
              {
                "name": "Color",
                "value": "Mint Green"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670196629698",
            "title": "Pastel Pink",
            "price": 399,
            "compareAtPrice": 699,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
            "selectedOptions": [
              {
                "name": "Color",
                "value": "Pastel Pink"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670196662466",
            "title": "Coffee Brown",
            "price": 399,
            "compareAtPrice": 699,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
            "selectedOptions": [
              {
                "name": "Color",
                "value": "Coffee Brown"
              }
            ]
          }
        ]
      },
      {
        "id": "gid://shopify/Product/8781941407938",
        "title": "Dual-Sided Reusable Electrostatic Pet Hair Remover Glove / Mitt",
        "handle": "dual-sided-reusable-electrostatic-pet-hair-remover-glove-mitt",
        "price": 249,
        "mrp": 449,
        "rating": 4.8,
        "reviews": 150,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
        "images": [
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4166119a-e2c9-488b-8983-e4605e7098f5.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/6f9eb2f8-5c0f-4be6-9636-ef0b64e583b6.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/91eb9542-77c0-4cf8-ad10-1537bac043e5.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/97d02a87-0502-4033-9b22-82b54f70d644.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/9eee3003-2042-4797-ae5b-8f9ab4497661.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b7f1dc12-c595-447c-99f4-6d843fc8d547.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c14f74fe-5a72-4ad5-82d7-f0adfb198b0d.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/d4cea5bc-1322-4a14-bb1a-ce0372dd43e3.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/f7f28189-646f-4e3c-a6ef-76868c231e4f.JPG?v=1787631812"
        ],
        "badges": [
          {
            "label": "45% OFF",
            "tone": "off"
          },
          {
            "label": "HOT",
            "tone": "hot"
          },
          {
            "label": "BEST DEALS",
            "tone": "deal"
          }
        ],
        "description": "Dual-Directional Static Pet Hair &amp; Lint Cleaning Mitt \n         The ultimate fur-cleaning mitt for your home, car, and pet grooming routine! \n         Key Features: \n         \n           \n Dual-Sided Static Fabric:  Two-sided micro-bristle texture collects fur, hair, and lint instantly with a swipe. \n           \n Multi-Surface Cleaning:  Works miracles on couches, carpets, clothing, car seats, pet beds, and directly on coats. \n           \n Reversible &amp; Reusable:  No sticky tape refills required. Simply roll fur off and reuse infinitely. \n           \n Comfortable Mesh Back:  24cm x 17cm breathable mesh glove fits hands securely with thumb band.",
        "descriptionHtml": "<div class=\"product-description\">\n        <h3>Dual-Directional Static Pet Hair &amp; Lint Cleaning Mitt</h3>\n        <p>The ultimate fur-cleaning mitt for your home, car, and pet grooming routine!</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Dual-Sided Static Fabric:</strong> Two-sided micro-bristle texture collects fur, hair, and lint instantly with a swipe.</li>\n          <li>\n<strong>Multi-Surface Cleaning:</strong> Works miracles on couches, carpets, clothing, car seats, pet beds, and directly on coats.</li>\n          <li>\n<strong>Reversible &amp; Reusable:</strong> No sticky tape refills required. Simply roll fur off and reuse infinitely.</li>\n          <li>\n<strong>Comfortable Mesh Back:</strong> 24cm x 17cm breathable mesh glove fits hands securely with thumb band.</li>\n        </ul>\n      </div>",
        "availableForSale": true,
        "productType": "Grooming",
        "vendor": "Petpedia",
        "tags": [
          "Accessories",
          "Best Deals",
          "Cats",
          "Dogs",
          "Grooming",
          "Hot",
          "Puppies",
          "Sale"
        ],
        "variants": [
          {
            "id": "gid://shopify/ProductVariant/48670197612738",
            "title": "1 Glove (Single)",
            "price": 249,
            "compareAtPrice": 449,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
            "selectedOptions": [
              {
                "name": "Quantity",
                "value": "1 Glove (Single)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670197645506",
            "title": "2 Gloves (Pair)",
            "price": 429,
            "compareAtPrice": 799,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
            "selectedOptions": [
              {
                "name": "Quantity",
                "value": "2 Gloves (Pair)"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "title": "Grooming & Wellness",
    "items": [
      {
        "id": "gid://shopify/Product/8781940981954",
        "title": "Cute Cat-Ear Self-Cleaning Slicker Brush (Massage Bead Pins)",
        "handle": "cute-cat-ear-self-cleaning-slicker-brush-massage-bead-pins",
        "price": 399,
        "mrp": 699,
        "rating": 4.8,
        "reviews": 135,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
        "images": [
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/aba19b7d-e3c0-4c73-a566-79c7f2452dd5.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cbb429fc-ab6f-4cff-86ef-3e1edff51bbe.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/29371db1-002a-42da-97b2-707e4d99660a.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/297a3d24-2f61-4f64-8a5c-44a1ef94d713.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/5036ce28-4bf8-4d98-b548-131d0d3204a8.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/a5bea1ae-f928-478f-b3f2-e71f55165ec3.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c5cec50f-bf76-46d9-b6aa-5aa16ec63804.JPG?v=1787631772",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/e652ce9a-ca03-4414-99f6-1f340f15faa4.JPG?v=1787631772"
        ],
        "badges": [
          {
            "label": "43% OFF",
            "tone": "off"
          },
          {
            "label": "HOT",
            "tone": "hot"
          },
          {
            "label": "BEST DEALS",
            "tone": "deal"
          }
        ],
        "description": "One-Click Self Cleaning Pet Grooming Slicker Brush \n         Say goodbye to painful shedding! Designed with 140° curved stainless steel pins tipped with soft massage resin beads. \n         Key Features: \n         \n           \n One-Click Hair Ejection:  Press the big push button on the back to instantly release shed fur in seconds. \n           \n Resin Bead Massage Tips:  Protects delicate skin while boosting blood circulation and leaving coat glossy. \n           \n Cute Cat-Ear Ergonomic Handle:  Lightweight, anti-slip curved handle for comfortable grooming sessions. \n           \n Fully Washable:  Waterproof stainless steel and ABS construction can be rinsed under running water.",
        "descriptionHtml": "<div class=\"product-description\">\n        <h3>One-Click Self Cleaning Pet Grooming Slicker Brush</h3>\n        <p>Say goodbye to painful shedding! Designed with 140° curved stainless steel pins tipped with soft massage resin beads.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>One-Click Hair Ejection:</strong> Press the big push button on the back to instantly release shed fur in seconds.</li>\n          <li>\n<strong>Resin Bead Massage Tips:</strong> Protects delicate skin while boosting blood circulation and leaving coat glossy.</li>\n          <li>\n<strong>Cute Cat-Ear Ergonomic Handle:</strong> Lightweight, anti-slip curved handle for comfortable grooming sessions.</li>\n          <li>\n<strong>Fully Washable:</strong> Waterproof stainless steel and ABS construction can be rinsed under running water.</li>\n        </ul>\n      </div>",
        "availableForSale": true,
        "productType": "Grooming",
        "vendor": "Petpedia",
        "tags": [
          "Best Deals",
          "Cats",
          "Dogs",
          "Grooming",
          "Hot",
          "Puppies",
          "Sale"
        ],
        "variants": [
          {
            "id": "gid://shopify/ProductVariant/48670196596930",
            "title": "Mint Green",
            "price": 399,
            "compareAtPrice": 699,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
            "selectedOptions": [
              {
                "name": "Color",
                "value": "Mint Green"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670196629698",
            "title": "Pastel Pink",
            "price": 399,
            "compareAtPrice": 699,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
            "selectedOptions": [
              {
                "name": "Color",
                "value": "Pastel Pink"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670196662466",
            "title": "Coffee Brown",
            "price": 399,
            "compareAtPrice": 699,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/19e6cc27-3ff9-490b-8f23-7a3e55d5a2cb.JPG?v=1787631772",
            "selectedOptions": [
              {
                "name": "Color",
                "value": "Coffee Brown"
              }
            ]
          }
        ]
      },
      {
        "id": "gid://shopify/Product/8781941407938",
        "title": "Dual-Sided Reusable Electrostatic Pet Hair Remover Glove / Mitt",
        "handle": "dual-sided-reusable-electrostatic-pet-hair-remover-glove-mitt",
        "price": 249,
        "mrp": 449,
        "rating": 4.8,
        "reviews": 150,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
        "images": [
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4166119a-e2c9-488b-8983-e4605e7098f5.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/6f9eb2f8-5c0f-4be6-9636-ef0b64e583b6.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/91eb9542-77c0-4cf8-ad10-1537bac043e5.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/97d02a87-0502-4033-9b22-82b54f70d644.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/9eee3003-2042-4797-ae5b-8f9ab4497661.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b7f1dc12-c595-447c-99f4-6d843fc8d547.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c14f74fe-5a72-4ad5-82d7-f0adfb198b0d.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/d4cea5bc-1322-4a14-bb1a-ce0372dd43e3.JPG?v=1787631812",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/f7f28189-646f-4e3c-a6ef-76868c231e4f.JPG?v=1787631812"
        ],
        "badges": [
          {
            "label": "45% OFF",
            "tone": "off"
          },
          {
            "label": "HOT",
            "tone": "hot"
          },
          {
            "label": "BEST DEALS",
            "tone": "deal"
          }
        ],
        "description": "Dual-Directional Static Pet Hair &amp; Lint Cleaning Mitt \n         The ultimate fur-cleaning mitt for your home, car, and pet grooming routine! \n         Key Features: \n         \n           \n Dual-Sided Static Fabric:  Two-sided micro-bristle texture collects fur, hair, and lint instantly with a swipe. \n           \n Multi-Surface Cleaning:  Works miracles on couches, carpets, clothing, car seats, pet beds, and directly on coats. \n           \n Reversible &amp; Reusable:  No sticky tape refills required. Simply roll fur off and reuse infinitely. \n           \n Comfortable Mesh Back:  24cm x 17cm breathable mesh glove fits hands securely with thumb band.",
        "descriptionHtml": "<div class=\"product-description\">\n        <h3>Dual-Directional Static Pet Hair &amp; Lint Cleaning Mitt</h3>\n        <p>The ultimate fur-cleaning mitt for your home, car, and pet grooming routine!</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Dual-Sided Static Fabric:</strong> Two-sided micro-bristle texture collects fur, hair, and lint instantly with a swipe.</li>\n          <li>\n<strong>Multi-Surface Cleaning:</strong> Works miracles on couches, carpets, clothing, car seats, pet beds, and directly on coats.</li>\n          <li>\n<strong>Reversible &amp; Reusable:</strong> No sticky tape refills required. Simply roll fur off and reuse infinitely.</li>\n          <li>\n<strong>Comfortable Mesh Back:</strong> 24cm x 17cm breathable mesh glove fits hands securely with thumb band.</li>\n        </ul>\n      </div>",
        "availableForSale": true,
        "productType": "Grooming",
        "vendor": "Petpedia",
        "tags": [
          "Accessories",
          "Best Deals",
          "Cats",
          "Dogs",
          "Grooming",
          "Hot",
          "Puppies",
          "Sale"
        ],
        "variants": [
          {
            "id": "gid://shopify/ProductVariant/48670197612738",
            "title": "1 Glove (Single)",
            "price": 249,
            "compareAtPrice": 449,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
            "selectedOptions": [
              {
                "name": "Quantity",
                "value": "1 Glove (Single)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670197645506",
            "title": "2 Gloves (Pair)",
            "price": 429,
            "compareAtPrice": 799,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b0eb346f-8b21-43f6-8035-6fdba63e404a.JPG?v=1787631812",
            "selectedOptions": [
              {
                "name": "Quantity",
                "value": "2 Gloves (Pair)"
              }
            ]
          }
        ]
      },
      {
        "id": "gid://shopify/Product/8781941178562",
        "title": "Ergonomic Retractable Fine-Pin Slicker Brush with Textured Grip",
        "handle": "ergonomic-retractable-fine-pin-slicker-brush-with-textured-grip",
        "price": 449,
        "mrp": 799,
        "rating": 4.8,
        "reviews": 165,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7dc68386-e027-4d5f-bf64-8f99458c4685.JPG?v=1787631784",
        "images": [
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7dc68386-e027-4d5f-bf64-8f99458c4685.JPG?v=1787631784",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/2c454b62-4843-419a-8cad-80738963aed0.JPG?v=1787631784",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/ab4d87e8-c570-4ce5-892b-2e2a72afbd91.JPG?v=1787631784",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/afa6812d-3dda-403a-9f8b-75f7c3d39293.JPG?v=1787631784",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/bd897710-ea7a-46ca-ac0a-a862c6e10f49.JPG?v=1787631784",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c0601550-5554-440c-9bff-b731e6ef3468.JPG?v=1787631784",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cdc39120-db0a-468c-b56a-32aba34084be.JPG?v=1787631784"
        ],
        "badges": [
          {
            "label": "44% OFF",
            "tone": "off"
          },
          {
            "label": "HOT",
            "tone": "hot"
          },
          {
            "label": "BEST DEALS",
            "tone": "deal"
          }
        ],
        "description": "Professional Retractable Deshedding Pin Brush \n         Easily remove loose undercoat fur, mats, and tangles with this heavy-duty self-cleaning brush. \n         Key Features: \n         \n           \n High-Density Fine Wire Bristles:  Reaches deep into thick double coats without scratching or pulling. \n           \n Instant Hair Release Button:  Push-button mechanism retracts pins to wipe shed hair clean in one swipe. \n           \n Diamond Textured Grip:  Ergonomic anti-slip contoured handle ensures wrist comfort.",
        "descriptionHtml": "<div class=\"product-description\">\n        <h3>Professional Retractable Deshedding Pin Brush</h3>\n        <p>Easily remove loose undercoat fur, mats, and tangles with this heavy-duty self-cleaning brush.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>High-Density Fine Wire Bristles:</strong> Reaches deep into thick double coats without scratching or pulling.</li>\n          <li>\n<strong>Instant Hair Release Button:</strong> Push-button mechanism retracts pins to wipe shed hair clean in one swipe.</li>\n          <li>\n<strong>Diamond Textured Grip:</strong> Ergonomic anti-slip contoured handle ensures wrist comfort.</li>\n        </ul>\n      </div>",
        "availableForSale": true,
        "productType": "Grooming",
        "vendor": "Petpedia",
        "tags": [
          "Best Deals",
          "Cats",
          "Dogs",
          "Grooming",
          "Hot",
          "Puppies",
          "Sale"
        ],
        "variants": [
          {
            "id": "gid://shopify/ProductVariant/48670197055682",
            "title": "Ocean Blue & White",
            "price": 449,
            "compareAtPrice": 799,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/7dc68386-e027-4d5f-bf64-8f99458c4685.JPG?v=1787631784",
            "selectedOptions": [
              {
                "name": "Color",
                "value": "Ocean Blue & White"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "title": "Feeding & Daily Care",
    "items": [
      {
        "id": "gid://shopify/Product/8781940162754",
        "title": "Automatic Cage-Hanging Pet Feeder & Water Dispenser (1L)",
        "handle": "automatic-cage-hanging-pet-feeder-water-dispenser-1l",
        "price": 699,
        "mrp": 1199,
        "rating": 4.8,
        "reviews": 120,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
        "images": [
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/02291d08-c439-4bff-af9b-1775531b28a4.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/14f159a7-7f01-4fad-85b2-5dbf448ab8e6.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/371b5483-97c3-4614-a3b7-192ababa932f.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/50a5ca0b-be4f-48ec-863c-703a95de60a4.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/6e4c2262-864f-474b-8df9-e9727a993c61.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/73f8b973-d806-4b02-8bde-0f5cd58bb86e.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/bf85bf94-b04e-493d-ab2a-97c0f7ca4af1.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/cdf5e113-5ff8-4ff3-8bc9-aa693c6d758c.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/f407cc06-4a78-489a-999d-551b8a2d5cfd.JPG?v=1787631697",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/fc8be5f6-78aa-442a-8959-ac87d1496f1d.JPG?v=1787631697"
        ],
        "badges": [
          {
            "label": "42% OFF",
            "tone": "off"
          },
          {
            "label": "HOT",
            "tone": "hot"
          },
          {
            "label": "BEST DEALS",
            "tone": "deal"
          }
        ],
        "description": "Automatic Gravity Pet Feeder &amp; Water Dispenser (1000ml) \n         Ensure your dogs, cats, puppies, rabbits, and small pets stay hydrated and well-fed throughout the day with this hanging automatic feeder and waterer set. \n         Key Features: \n         \n           \n Dual Usage Modes:  Securely mounts to any wire cage/crate with the heavy-duty twist lock, or stands stably on flat floors. \n           \n Large 1L (1000ml) Capacity:  Provides 3–5 days of continuous fresh water and kibble for small to medium pets. \n           \n Siphon Gravity Refill:  Automatic replenishment prevents spills, leaks, and overflows while maintaining water freshness. \n           \n Anti-Clog 75° Ramp:  Wide feeder mouth and 75-degree sloping ramp prevent dry kibble from jamming. \n           \n Top-Refill Lid:  Refill dry food or water easily from the top without detaching the main unit. \n           \n BPA-Free Food Grade Material:  Safe, durable, eco-friendly PP plastic with smooth, easy-to-clean surfaces.",
        "descriptionHtml": "<div class=\"product-description\">\n        <h3>Automatic Gravity Pet Feeder &amp; Water Dispenser (1000ml)</h3>\n        <p>Ensure your dogs, cats, puppies, rabbits, and small pets stay hydrated and well-fed throughout the day with this hanging automatic feeder and waterer set.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Dual Usage Modes:</strong> Securely mounts to any wire cage/crate with the heavy-duty twist lock, or stands stably on flat floors.</li>\n          <li>\n<strong>Large 1L (1000ml) Capacity:</strong> Provides 3–5 days of continuous fresh water and kibble for small to medium pets.</li>\n          <li>\n<strong>Siphon Gravity Refill:</strong> Automatic replenishment prevents spills, leaks, and overflows while maintaining water freshness.</li>\n          <li>\n<strong>Anti-Clog 75° Ramp:</strong> Wide feeder mouth and 75-degree sloping ramp prevent dry kibble from jamming.</li>\n          <li>\n<strong>Top-Refill Lid:</strong> Refill dry food or water easily from the top without detaching the main unit.</li>\n          <li>\n<strong>BPA-Free Food Grade Material:</strong> Safe, durable, eco-friendly PP plastic with smooth, easy-to-clean surfaces.</li>\n        </ul>\n      </div>",
        "availableForSale": true,
        "productType": "Bowls & Feeders",
        "vendor": "Petpedia",
        "tags": [
          "Accessories",
          "Best Deals",
          "Cats",
          "Dogs",
          "Food",
          "Hot",
          "Puppies",
          "Rabbits",
          "Sale",
          "Small Pets"
        ],
        "variants": [
          {
            "id": "gid://shopify/ProductVariant/48670193811650",
            "title": "Automatic Water Dispenser (1L - Mint Blue)",
            "price": 699,
            "compareAtPrice": 1199,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
            "selectedOptions": [
              {
                "name": "Type",
                "value": "Automatic Water Dispenser (1L - Mint Blue)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670193844418",
            "title": "Automatic Food Feeder (1L - Mint Blue)",
            "price": 749,
            "compareAtPrice": 1299,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
            "selectedOptions": [
              {
                "name": "Type",
                "value": "Automatic Food Feeder (1L - Mint Blue)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670193877186",
            "title": "2-in-1 Feeder & Waterer Combo Set",
            "price": 1299,
            "compareAtPrice": 2199,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/01c02ab4-9c3c-4b12-806f-4b90683c8b69.JPG?v=1787631697",
            "selectedOptions": [
              {
                "name": "Type",
                "value": "2-in-1 Feeder & Waterer Combo Set"
              }
            ]
          }
        ]
      },
      {
        "id": "gid://shopify/Product/8781940654274",
        "title": "Gentleman Tuxedo & Plaid Breathable Mesh Harness Vest with Leash Set",
        "handle": "gentleman-tuxedo-plaid-breathable-mesh-harness-vest-with-leash-set",
        "price": 549,
        "mrp": 899,
        "rating": 4.8,
        "reviews": 180,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
        "images": [
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/50e17592-e67a-4853-945f-42b106e3c784.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/639263fa-8b8c-4cf8-b54a-b3b508a1281b.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/37bda72c-7a4a-4228-b8d8-aaac340e4adb.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/8d913b7f-2eab-49e9-9135-77baeb7a8371.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/28911819-80e7-46fd-b748-ae1b8dea0779.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/4896f1f3-4b18-4bfb-8555-c8a34b508100.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/5258aa4a-c94b-47f9-9431-f1e4e02813c1.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/535be8a9-0dc5-426b-848a-68530df9b469.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/0976e620-a7d5-4ea5-88ae-86ef51bd5cd9.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c1961604-e52d-48a1-87a5-dad68768f406.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/ec005569-a295-46b4-9b29-54deb3c56d11.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/edfa7c33-c769-457e-a704-0b3d32780b55.JPG?v=1787631731",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/fb7aa9b5-b083-45bf-89b0-ab353fa189ed.JPG?v=1787631731"
        ],
        "badges": [
          {
            "label": "39% OFF",
            "tone": "off"
          },
          {
            "label": "HOT",
            "tone": "hot"
          },
          {
            "label": "BEST DEALS",
            "tone": "deal"
          }
        ],
        "description": "Formal Tuxedo &amp; Plaid Step-In Harness Vest with Matching Leash \n         Dress up your fur baby in style with this adorable bowtie tuxedo harness vest. Designed for small dogs, puppies, and cats. \n         Key Features: \n         \n           \n Breathable Air Mesh:  Honeycomb padded fabric prevents overheating and chafing, keeping pets cool and cozy. \n           \n Escape-Proof Step-In Design:  Easy to put on and remove with a heavy-duty quick-release buckle and dual metal D-rings. \n           \n Charming Bowtie &amp; Buttons:  Dapper gentleman design with decorative bowtie and contrast suit buttons. \n           \n Matching 1.2m Leash Included:  High-tensile matching lead with 360° tangle-free swivel hook.",
        "descriptionHtml": "<div class=\"product-description\">\n        <h3>Formal Tuxedo &amp; Plaid Step-In Harness Vest with Matching Leash</h3>\n        <p>Dress up your fur baby in style with this adorable bowtie tuxedo harness vest. Designed for small dogs, puppies, and cats.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>Breathable Air Mesh:</strong> Honeycomb padded fabric prevents overheating and chafing, keeping pets cool and cozy.</li>\n          <li>\n<strong>Escape-Proof Step-In Design:</strong> Easy to put on and remove with a heavy-duty quick-release buckle and dual metal D-rings.</li>\n          <li>\n<strong>Charming Bowtie &amp; Buttons:</strong> Dapper gentleman design with decorative bowtie and contrast suit buttons.</li>\n          <li>\n<strong>Matching 1.2m Leash Included:</strong> High-tensile matching lead with 360° tangle-free swivel hook.</li>\n        </ul>\n      </div>",
        "availableForSale": true,
        "productType": "Accessories",
        "vendor": "Petpedia",
        "tags": [
          "Accessories",
          "Best Deals",
          "Cats",
          "Dogs",
          "Hot",
          "Puppies",
          "Sale"
        ],
        "variants": [
          {
            "id": "gid://shopify/ProductVariant/48670194794690",
            "title": "Small (Chest 23-42cm) / Classic Black Tuxedo",
            "price": 549,
            "compareAtPrice": 899,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Small (Chest 23-42cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670194827458",
            "title": "Small (Chest 23-42cm) / Red Plaid Gentleman",
            "price": 549,
            "compareAtPrice": 899,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Small (Chest 23-42cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670194860226",
            "title": "Small (Chest 23-42cm) / Formal Red Tuxedo",
            "price": 549,
            "compareAtPrice": 899,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Small (Chest 23-42cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670194892994",
            "title": "Small (Chest 23-42cm) / Houndstooth Checkered",
            "price": 549,
            "compareAtPrice": 899,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Small (Chest 23-42cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670194925762",
            "title": "Small (Chest 23-42cm) / Wild Leopard",
            "price": 549,
            "compareAtPrice": 899,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Small (Chest 23-42cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670194958530",
            "title": "Small (Chest 23-42cm) / Star Blue",
            "price": 549,
            "compareAtPrice": 899,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Small (Chest 23-42cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670194991298",
            "title": "Small (Chest 23-42cm) / Navy Anchor",
            "price": 549,
            "compareAtPrice": 899,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Small (Chest 23-42cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195024066",
            "title": "Small (Chest 23-42cm) / Red Anchor",
            "price": 549,
            "compareAtPrice": 899,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Small (Chest 23-42cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195056834",
            "title": "Medium (Chest 28-46cm) / Classic Black Tuxedo",
            "price": 599,
            "compareAtPrice": 999,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Medium (Chest 28-46cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195089602",
            "title": "Medium (Chest 28-46cm) / Red Plaid Gentleman",
            "price": 599,
            "compareAtPrice": 999,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Medium (Chest 28-46cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195122370",
            "title": "Medium (Chest 28-46cm) / Formal Red Tuxedo",
            "price": 599,
            "compareAtPrice": 999,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Medium (Chest 28-46cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195155138",
            "title": "Medium (Chest 28-46cm) / Houndstooth Checkered",
            "price": 599,
            "compareAtPrice": 999,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Medium (Chest 28-46cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195187906",
            "title": "Medium (Chest 28-46cm) / Wild Leopard",
            "price": 599,
            "compareAtPrice": 999,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Medium (Chest 28-46cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195220674",
            "title": "Medium (Chest 28-46cm) / Star Blue",
            "price": 599,
            "compareAtPrice": 999,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Medium (Chest 28-46cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195253442",
            "title": "Medium (Chest 28-46cm) / Navy Anchor",
            "price": 599,
            "compareAtPrice": 999,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Medium (Chest 28-46cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195286210",
            "title": "Medium (Chest 28-46cm) / Red Anchor",
            "price": 599,
            "compareAtPrice": 999,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Medium (Chest 28-46cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195318978",
            "title": "Large (Chest 35-50cm) / Classic Black Tuxedo",
            "price": 649,
            "compareAtPrice": 1099,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Large (Chest 35-50cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195351746",
            "title": "Large (Chest 35-50cm) / Red Plaid Gentleman",
            "price": 649,
            "compareAtPrice": 1099,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Large (Chest 35-50cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195384514",
            "title": "Large (Chest 35-50cm) / Formal Red Tuxedo",
            "price": 649,
            "compareAtPrice": 1099,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Large (Chest 35-50cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195417282",
            "title": "Large (Chest 35-50cm) / Houndstooth Checkered",
            "price": 649,
            "compareAtPrice": 1099,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Large (Chest 35-50cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195450050",
            "title": "Large (Chest 35-50cm) / Wild Leopard",
            "price": 649,
            "compareAtPrice": 1099,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Large (Chest 35-50cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195482818",
            "title": "Large (Chest 35-50cm) / Star Blue",
            "price": 649,
            "compareAtPrice": 1099,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Large (Chest 35-50cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195515586",
            "title": "Large (Chest 35-50cm) / Navy Anchor",
            "price": 649,
            "compareAtPrice": 1099,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Large (Chest 35-50cm)"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670195548354",
            "title": "Large (Chest 35-50cm) / Red Anchor",
            "price": 649,
            "compareAtPrice": 1099,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/c02cf5fe-499a-4e8b-9ec6-b38f4c26dc92.JPG?v=1787631731",
            "selectedOptions": [
              {
                "name": "Size",
                "value": "Large (Chest 35-50cm)"
              }
            ]
          }
        ]
      },
      {
        "id": "gid://shopify/Product/8781941440706",
        "title": "Hexagonal Double Food & Water Feeding Bowl Station",
        "handle": "hexagonal-double-food-water-feeding-bowl-station",
        "price": 349,
        "mrp": 599,
        "rating": 4.8,
        "reviews": 195,
        "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
        "images": [
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/8fac1c61-ab66-440f-be1c-7c7ab0c5a0aa.JPG?v=1787631825",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/2c72fb23-fdc8-4445-808f-90b83d21e791.JPG?v=1787631825",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/95a6ac91-ab41-4f1c-be5b-37f6ca3c6b93.JPG?v=1787631825",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/a862ed0a-3f29-4bff-a673-5ddf6abd5830.JPG?v=1787631825",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/b932b79f-9cb7-4cc3-a728-b40d719ad411.JPG?v=1787631825",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/bd226b0f-b14c-42b8-b421-938b3b1ba94c.JPG?v=1787631825",
          "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/baceeb48-8234-4e54-ae4b-37bc7004cea8.JPG?v=1787631825"
        ],
        "badges": [
          {
            "label": "42% OFF",
            "tone": "off"
          },
          {
            "label": "HOT",
            "tone": "hot"
          },
          {
            "label": "BEST DEALS",
            "tone": "deal"
          }
        ],
        "description": "Geometric Hexagon Dual Food &amp; Water Feeding Dish \n         A modern, anti-tip double pet bowl designed for comfortable daily feeding for cats, puppies, and small-to-medium dogs. \n         Key Features: \n         \n           \n 2-in-1 Dual Dish Design:  Serves dry/wet food and fresh water side-by-side. \n           \n Anti-Spill Hexagonal Base:  Wide geometric foundation prevents tipping over and keeps feeding areas tidy. \n           \n Food-Grade PP Resin:  Non-toxic, BPA-free, odorless, and heat-resistant plastic. \n           \n Easy to Clean:  Seamless rounded corners rinse sparkling clean in seconds.",
        "descriptionHtml": "<div class=\"product-description\">\n        <h3>Geometric Hexagon Dual Food &amp; Water Feeding Dish</h3>\n        <p>A modern, anti-tip double pet bowl designed for comfortable daily feeding for cats, puppies, and small-to-medium dogs.</p>\n        <h4>Key Features:</h4>\n        <ul>\n          <li>\n<strong>2-in-1 Dual Dish Design:</strong> Serves dry/wet food and fresh water side-by-side.</li>\n          <li>\n<strong>Anti-Spill Hexagonal Base:</strong> Wide geometric foundation prevents tipping over and keeps feeding areas tidy.</li>\n          <li>\n<strong>Food-Grade PP Resin:</strong> Non-toxic, BPA-free, odorless, and heat-resistant plastic.</li>\n          <li>\n<strong>Easy to Clean:</strong> Seamless rounded corners rinse sparkling clean in seconds.</li>\n        </ul>\n      </div>",
        "availableForSale": true,
        "productType": "Bowls & Feeders",
        "vendor": "Petpedia",
        "tags": [
          "Accessories",
          "Best Deals",
          "Cats",
          "Dogs",
          "Food",
          "Hot",
          "Puppies",
          "Sale"
        ],
        "variants": [
          {
            "id": "gid://shopify/ProductVariant/48670197711042",
            "title": "Sunset Orange",
            "price": 349,
            "compareAtPrice": 599,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
            "selectedOptions": [
              {
                "name": "Color",
                "value": "Sunset Orange"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670197743810",
            "title": "Teal Green",
            "price": 349,
            "compareAtPrice": 599,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
            "selectedOptions": [
              {
                "name": "Color",
                "value": "Teal Green"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670197776578",
            "title": "Sunny Yellow",
            "price": 349,
            "compareAtPrice": 599,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
            "selectedOptions": [
              {
                "name": "Color",
                "value": "Sunny Yellow"
              }
            ]
          },
          {
            "id": "gid://shopify/ProductVariant/48670197809346",
            "title": "Nordic Blue",
            "price": 349,
            "compareAtPrice": 599,
            "availableForSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0770/7931/4626/files/84be20fc-2983-4016-a539-58da2060d5d9.JPG?v=1787631825",
            "selectedOptions": [
              {
                "name": "Color",
                "value": "Nordic Blue"
              }
            ]
          }
        ]
      }
    ]
  }
];

export const animals = [
  { id: "dogs", name: "Dogs", image: animalDog, count: 11 },
  { id: "cats", name: "Cats", image: animalCat, count: 11 },
  { id: "rabbits", name: "Rabbits", image: animalRabbit, count: 4 },
  { id: "hamsters", name: "Hamsters", image: animalHamster, count: 3 },
  { id: "guineapigs", name: "Guinea Pigs", image: animalGuineapig, count: 3 },
  { id: "birds", name: "Birds", image: animalBird, count: 2 },
  { id: "fish", name: "Fish", image: animalFish, count: 2 },
  { id: "smallpets", name: "Small Pets", image: animalHedgehog, count: 4 },
  { id: "puppies", name: "Puppies", image: animalPuppy, count: 11 },
];

export const stores = [
  {
    id: "monsoon",
    name: "Monsoon Store",
    image: storeMonsoon,
    circle: "#FFE7D6",
    pill: "#FFD2B8",
    offer: "Upto 50% OFF",
    link: "/shop?q=monsoon",
  },
  {
    id: "fashion",
    name: "Fashion Store",
    image: storeFashion,
    circle: "#E1F2FF",
    pill: "#BFE3FF",
    offer: "Upto 60% OFF",
    link: "/shop?category=accessories",
  },
  {
    id: "grooming",
    name: "Grooming Store",
    image: groomingImg,
    circle: "#FFF1D6",
    pill: "#FFE2A8",
    offer: "Upto 40% OFF",
    link: "/shop?category=grooming",
  },
  {
    id: "supplement",
    name: "Supplement Store",
    image: supplementImg,
    circle: "#E8F8F5",
    pill: "#C3F0E8",
    offer: "Upto 35% OFF",
    link: "/shop?category=health",
  },
  {
    id: "accessories",
    name: "Accessories Store",
    image: accessoriesImg,
    circle: "#F3E8FF",
    pill: "#E2CEFF",
    offer: "Upto 45% OFF",
    link: "/shop?category=accessories",
  },
  {
    id: "toys",
    name: "Toys Store",
    image: toysImg,
    circle: "#FFEAE9",
    pill: "#FFD0CE",
    offer: "Upto 55% OFF",
    link: "/shop?category=toys",
  },
];

export const brands = [
  { id: "petpedia", name: "Petpedia", logo: brandPetfuel, link: "/shop?vendor=Petpedia" },
  { id: "drools", name: "Drools", logo: brandDrools, link: "/shop?vendor=Drools" },
  { id: "merrick", name: "Merrick", logo: brandMerrick, link: "/shop?vendor=Merrick" },
  { id: "orijen", name: "Orijen", logo: brandOrijen, link: "/shop?vendor=Orijen" },
  { id: "royalcanin", name: "Royal Canin", logo: brandRoyalcanin, link: "/shop?vendor=Royal+Canin" },
  { id: "whiskas", name: "Whiskas", logo: brandWhiskas, link: "/shop?vendor=Whiskas" },
  { id: "purepet", name: "Purepet", logo: brandPurepet, link: "/shop?vendor=Purepet" },
  { id: "acana", name: "Acana", logo: brandAcana, link: "/shop?vendor=Acana" },
];
