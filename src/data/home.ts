import pCatfood from "@/assets/p-catfood.png";
import pTreats from "@/assets/p-treats.png";
import pGrooming from "@/assets/p-grooming.png";
import pLitterbox from "@/assets/p-litterbox.png";
import pLitter from "@/assets/p-litter.png";
import pPads from "@/assets/p-pads.png";
import pSupplement from "@/assets/p-supplement.png";
import pToys from "@/assets/p-toys.png";
import pBed from "@/assets/p-bed.png";

import animalDog from "@/assets/animal-dog.png";
import animalCat from "@/assets/animal-cat.png";
import animalRabbit from "@/assets/animal-rabbit.png";
import animalHamster from "@/assets/animal-hamster.png";
import animalGuineapig from "@/assets/animal-guineapig.png";
import animalBird from "@/assets/animal-bird.png";
import animalFish from "@/assets/animal-fish.png";
import animalHedgehog from "@/assets/animal-hedgehog.png";
import animalPuppy from "@/assets/animal-puppy.png";

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
};

const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatPrice = inr;

export const hotPicks: Product[] = [
  {
    id: "hp1",
    title: "Royal Canin Veterinary Cardiac Dry Dog Food",
    price: 800,
    rating: 4,
    reviews: 740,
    image: pCatfood,
    badges: [{ label: "BEST DEALS", tone: "deal" }],
  },
  {
    id: "hp2",
    title: "Chip Chops Chicken Jerky Dog Treats (Pack of 2)",
    price: 800,
    rating: 4,
    reviews: 740,
    image: pTreats,
    badges: [{ label: "HOT", tone: "hot" }],
  },
  {
    id: "hp3",
    title: "Big Boy Slicker Brush & Nail Clipper Grooming Kit",
    price: 800,
    mrp: 900,
    rating: 4,
    reviews: 740,
    image: pGrooming,
    badges: [
      { label: "32% OFF", tone: "off" },
      { label: "HOT", tone: "hot" },
    ],
  },
  {
    id: "hp4",
    title: "Catmee Hooded Cat Litter Box With Odour Lock",
    price: 800,
    rating: 4,
    reviews: 740,
    image: pLitterbox,
    badges: [{ label: "SALE", tone: "sale" }],
  },
  {
    id: "hp5",
    title: "Catmee Unscented Clumping Cat Litter 5kg",
    price: 800,
    mrp: 900,
    rating: 4,
    reviews: 740,
    image: pLitter,
    badges: [{ label: "32% OFF", tone: "off" }],
  },
];

export const bestsellers: Product[] = [
  { id: "bs1", title: "Big Boy Slicker Brush & Nail Clipper Grooming Kit", price: 800, rating: 4, reviews: 740, image: pGrooming },
  { id: "bs2", title: "Gourmet Chicken Donut Dog Treats 70g", price: 800, rating: 4, reviews: 740, image: pTreats },
  { id: "bs3", title: "Big Boy Puppy Care Grooming Combo", price: 800, rating: 4, reviews: 740, image: pSupplement },
  { id: "bs4", title: "Purple Tails Pet Training Pads (50 Pcs)", price: 800, rating: 4, reviews: 740, image: pPads },
  { id: "bs5", title: "Calm Down Natural Wood Cat Litter 10L", price: 800, rating: 4, reviews: 740, image: pLitter },
];

export const columnProducts: { title: string; items: Product[] }[] = [
  {
    title: "Recommended Products",
    items: [
      { id: "c1", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months)", price: 800, rating: 4, reviews: 740, image: pCatfood },
      { id: "c2", title: "Royal Canin Kitten Instinctive Gravy Pouch", price: 800, rating: 4, reviews: 740, image: pTreats },
      { id: "c3", title: "Drools Absolute Calcium Bone Jar", price: 800, rating: 4, reviews: 740, image: pSupplement },
    ],
  },
  {
    title: "Top Rated",
    items: [
      { id: "c4", title: "Applod Hip & Joint Soft Chews", price: 800, rating: 4, reviews: 740, image: pSupplement },
      { id: "c5", title: "Big Boy Slicker Brush For Cats", price: 800, rating: 4, reviews: 740, image: pGrooming },
      { id: "c6", title: "Catmee Odour Lock Litter Box", price: 800, rating: 4, reviews: 740, image: pLitterbox },
    ],
  },
  {
    title: "New Arrival",
    items: [
      { id: "c7", title: "Tan Line Tick & Flea Spray For Dogs", price: 800, rating: 4, reviews: 740, image: pLitter },
      { id: "c8", title: "Purple Tails Training Pads 45x60cm", price: 800, rating: 4, reviews: 740, image: pPads },
      { id: "c9", title: "Pogsing Rope & Ball Toy Combo", price: 800, rating: 4, reviews: 740, image: pToys },
    ],
  },
  {
    title: "Most Ordered",
    items: [
      { id: "c10", title: "Jerhigh Carrot Stick Dog Treats", price: 800, rating: 4, reviews: 740, image: pTreats },
      { id: "c11", title: "Comfy Plush Pet Bed With Toys", price: 800, rating: 4, reviews: 740, image: pBed },
      { id: "c12", title: "Kitty Yums Ocean Fish Kitten Food", price: 800, rating: 4, reviews: 740, image: pCatfood },
    ],
  },
];

export const animals = [
  { name: "Dogs", image: animalDog },
  { name: "Cats", image: animalCat },
  { name: "Rabbits", image: animalRabbit },
  { name: "Hamsters", image: animalHamster },
  { name: "Guinea Pigs", image: animalGuineapig },
  { name: "Birds", image: animalBird },
  { name: "Fish", image: animalFish },
  { name: "Small Pets", image: animalHedgehog },
  { name: "Others", image: animalPuppy },
];

export const stores = [
  { name: "Mansoon Store", image: storeMonsoon, circle: "oklch(0.92 0.05 165)", pill: "oklch(0.9 0.07 165)" },
  { name: "Fashion Store", image: storeFashion, circle: "oklch(0.93 0.04 20)", pill: "oklch(0.91 0.06 20)" },
  { name: "Supplement Store", image: pSupplement, circle: "oklch(0.93 0.05 155)", pill: "oklch(0.91 0.07 155)" },
  { name: "Grooming Store", image: pGrooming, circle: "oklch(0.95 0.05 80)", pill: "oklch(0.92 0.08 80)" },
  { name: "Accessories Store", image: pBed, circle: "oklch(0.92 0.05 285)", pill: "oklch(0.9 0.07 285)" },
  { name: "Toys Store", image: pToys, circle: "oklch(0.94 0.05 60)", pill: "oklch(0.92 0.08 60)" },
];

export const brands = [
  "Merrick",
  "Orijen",
  "drools",
  "petfuel",
  "ACANA",
  "whiskas",
  "ROYAL CANIN",
  "Farmina",
  "Pedigree",
];