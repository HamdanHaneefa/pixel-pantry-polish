import animalDog from "@/assets/animal-dog.webp";
import animalCat from "@/assets/animal-cat.webp";
import animalRabbit from "@/assets/animal-rabbit.webp";
import animalHamster from "@/assets/animal-hamster.webp";
import animalGuineapig from "@/assets/animal-guineapig.webp";
import animalBird from "@/assets/animal-bird.webp";
import animalFish from "@/assets/animal-fish.webp";
import animalHedgehog from "@/assets/animal-hedgehog.webp";
import animalPuppy from "@/assets/animal-puppy.webp";

import brandMerrick from "@/assets/brands/brand-merrick.svg";
import brandDrools from "@/assets/brands/brand-drools.webp";
import brandOrijen from "@/assets/brands/brand-orijen.webp";
import brandPetfuel from "@/assets/brands/brand-petfuel.webp";
import brandRoyalcanin from "@/assets/brands/brand-royalcanin.svg";
import brandWhiskas from "@/assets/brands/brand-whiskas.webp";
import brandPurepet from "@/assets/brands/brand-purepet.webp";
import brandAcana from "@/assets/brands/brand-acana.webp";
import brandPetpedia from "@/assets/brands/brand-petpedia.png";
import brandPedigree from "@/assets/brands/brand-pedigree.webp";
import brandHimalaya from "@/assets/brands/brand-himalaya.webp";
import brandNd from "@/assets/brands/brand-nd.webp";

import storeMonsoon from "@/assets/stores/store-monsoon.webp";
import storeFashion from "@/assets/stores/store-fashion.webp";
import groomingImg from "@/assets/stores/store-grooming.webp";
import supplementImg from "@/assets/stores/store-supplement.webp";
import accessoriesImg from "@/assets/stores/store-accessories.webp";
import toysImg from "@/assets/p-toys.webp";

export type { Badge, Product } from "./catalog";
export { formatPrice, inr } from "./formatPrice";
export { allProductsCatalog, hotPicks, bestsellers, columnProducts } from "./catalog";

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
    circle: "#CDEFE1",
    pill: "#A2DFC5",
    offer: "Upto 50% OFF",
    link: "/shop?q=monsoon",
  },
  {
    id: "fashion",
    name: "Fashion Store",
    image: storeFashion,
    circle: "#FEDEE4",
    pill: "#FCC0CD",
    offer: "Upto 60% OFF",
    link: "/shop?category=accessories",
  },
  {
    id: "grooming",
    name: "Grooming Store",
    image: groomingImg,
    circle: "#FEF0D6",
    pill: "#FEDBA5",
    offer: "Upto 40% OFF",
    link: "/shop?category=grooming",
  },
  {
    id: "supplement",
    name: "Supplement Store",
    image: supplementImg,
    circle: "#E0F3E3",
    pill: "#BFE3C5",
    offer: "Upto 35% OFF",
    link: "/shop?category=health",
  },
  {
    id: "accessories",
    name: "Accessories Store",
    image: accessoriesImg,
    circle: "#E0DFFD",
    pill: "#C9C7FC",
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
  { id: "petpedia", name: "Petpedia", logo: brandPetpedia, link: "/shop?vendor=Petpedia" },
  {
    id: "royalcanin",
    name: "Royal Canin",
    logo: brandRoyalcanin,
    link: "/shop?vendor=Royal+Canin",
  },
  { id: "whiskas", name: "Whiskas", logo: brandWhiskas, link: "/shop?vendor=Whiskas" },
  { id: "drools", name: "Drools", logo: brandDrools, link: "/shop?vendor=Drools" },
  { id: "pedigree", name: "Pedigree", logo: brandPedigree, link: "/shop?vendor=Pedigree" },
  { id: "himalaya", name: "Himalaya", logo: brandHimalaya, link: "/shop?vendor=Himalaya" },
  { id: "n-d", name: "N & D", logo: brandNd, link: "/shop?vendor=N%26D" },
  { id: "petfuel", name: "Petfuel", logo: brandPetfuel, link: "/shop?vendor=Petfuel" },
];
