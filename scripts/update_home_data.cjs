const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'normalized_products.json'), 'utf8'));

const hotPicks = products.slice(0, 4);
const bestsellers = products.slice(4, 8);
const columnProducts = [
  {
    title: 'Top Rated Essentials',
    items: products.slice(0, 3)
  },
  {
    title: 'Grooming & Wellness',
    items: products.filter(p => p.productType === 'Grooming').slice(0, 3)
  },
  {
    title: 'Feeding & Daily Care',
    items: products.filter(p => p.productType === 'Bowls & Feeders' || p.productType === 'Accessories').slice(0, 3)
  }
];

const fileContent = `import animalDog from "@/assets/animal-dog.png";
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

import storeMonsoon from "@/assets/store-monsoon.png";
import storeFashion from "@/assets/store-fashion.png";

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
  productType?: string;
  vendor?: string;
  tags?: string[];
  variants?: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    availableForSale: boolean;
    image?: string;
    selectedOptions?: Array<{ name: string; value: string }>;
  }>;
};

const inr = (n: number) =>
  \`₹\${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;

export const formatPrice = inr;

export const allProductsCatalog: Product[] = ${JSON.stringify(products, null, 2)};

export const hotPicks: Product[] = ${JSON.stringify(hotPicks, null, 2)};

export const bestsellers: Product[] = ${JSON.stringify(bestsellers, null, 2)};

export const columnProducts: { title: string; items: Product[] }[] = ${JSON.stringify(columnProducts, null, 2)};

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
    id: "essentials",
    title: "Daily Grooming Store",
    subtitle: "Up to 40% OFF on slicker brushes, chamois towels & wipes",
    image: storeMonsoon,
    tag: "DAILY ESSENTIALS",
  },
  {
    id: "fashion",
    title: "Pet Fashion & Walking",
    subtitle: "Harness vests, pastel bell collars & interactive toys",
    image: storeFashion,
    tag: "TRENDING NOW",
  },
];

export const brands = [
  { id: "petpedia", name: "Petpedia", logo: brandPetfuel },
  { id: "drools", name: "Drools", logo: brandDrools },
  { id: "merrick", name: "Merrick", logo: brandMerrick },
  { id: "orijen", name: "Orijen", logo: brandOrijen },
];
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'home.ts'), fileContent);
console.log('Updated src/data/home.ts with animals, stores, brands exports.');
