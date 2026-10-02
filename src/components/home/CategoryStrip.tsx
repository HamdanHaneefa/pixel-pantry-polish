import { Link } from "@tanstack/react-router";
import SectionHeading from "./SectionHeading";
import { ShopifyCollectionItem } from "@/lib/shopify/products";
import foodImg from "@/assets/categories/food.webp";
import toysImg from "@/assets/categories/toys.webp";
import accessoriesImg from "@/assets/categories/accessories.webp";
import groomingImg from "@/assets/categories/grooming.webp";
import travelImg from "@/assets/categories/travel.webp";
import beddingImg from "@/assets/categories/bedding.webp";
import petCareImg from "@/assets/categories/pet-care.webp";
import healthImg from "@/assets/categories/health.webp";

type IconProps = { className?: string };
const stroke = "oklch(0.32 0.11 295)";
const fill = "oklch(0.638 0.221 36.5)";

function FoodIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path d="M10 30h44l-4 20a6 6 0 0 1-6 5H20a6 6 0 0 1-6-5l-4-20Z" fill="#fff" stroke={stroke} strokeWidth="3" />
      <circle cx="24" cy="24" r="6" fill={fill} />
      <circle cx="36" cy="20" r="6" fill={fill} />
      <circle cx="46" cy="26" r="5" fill={fill} />
      <circle cx="16" cy="27" r="4" fill={fill} />
      <path d="M32 39c3 0 6 2.5 6 5.5S35 50 32 50s-6-2-6-5.5S29 39 32 39Z" fill={fill} />
    </svg>
  );
}
function ToyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path d="M18 22c5 0 8 4 8 10s-3 10-8 10-9-4-9-10 4-10 9-10Z" fill={fill} stroke={stroke} strokeWidth="3" />
      <path d="M46 22c5 0 9 4 9 10s-4 10-9 10-8-4-8-10 3-10 8-10Z" fill={fill} stroke={stroke} strokeWidth="3" />
      <path d="M24 27h16v10H24z" fill="#fff" stroke={stroke} strokeWidth="3" />
    </svg>
  );
}
function CollarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <ellipse cx="32" cy="26" rx="20" ry="12" stroke={stroke} strokeWidth="3" fill={fill} fillOpacity="0.9" />
      <ellipse cx="32" cy="26" rx="13" ry="6" fill="#fff" />
      <path d="M32 38v6" stroke={stroke} strokeWidth="3" />
      <path d="M27 48a5 5 0 0 1 10 0 5 5 0 0 1-10 0Z" fill={fill} stroke={stroke} strokeWidth="3" />
    </svg>
  );
}
function GroomingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <rect x="8" y="12" width="20" height="26" rx="10" fill={fill} stroke={stroke} strokeWidth="3" />
      <path d="M18 38v14" stroke={stroke} strokeWidth="3" />
      <rect x="36" y="24" width="18" height="28" rx="5" fill={fill} stroke={stroke} strokeWidth="3" />
      <path d="M45 24v-6h6" stroke={stroke} strokeWidth="3" />
    </svg>
  );
}
function TravelIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <rect x="10" y="18" width="44" height="34" rx="6" fill={fill} stroke={stroke} strokeWidth="3" />
      <path d="M24 18v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" stroke={stroke} strokeWidth="3" />
      <circle cx="32" cy="32" r="5" fill="#fff" />
      <circle cx="26" cy="26" r="2.5" fill="#fff" />
      <circle cx="38" cy="26" r="2.5" fill="#fff" />
    </svg>
  );
}
function BeddingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path d="M8 30c0-8 10-14 24-14s24 6 24 14-10 16-24 16S8 38 8 30Z" fill={fill} stroke={stroke} strokeWidth="3" />
      <path d="M24 28l4 4m0-4l-4 4M36 28l4 4m0-4l-4 4" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function PetCareIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path d="M32 54S8 40 8 25a12 12 0 0 1 24-5 12 12 0 0 1 24 5c0 15-24 29-24 29Z" stroke={stroke} strokeWidth="3" fill="#fff" />
      <path d="M32 26c5 0 9 4 9 8.5S37 42 32 42s-9-3-9-7.5S27 26 32 26Z" fill={fill} />
      <circle cx="24" cy="22" r="3.5" fill={fill} />
      <circle cx="32" cy="19" r="3.5" fill={fill} />
      <circle cx="40" cy="22" r="3.5" fill={fill} />
    </svg>
  );
}
function HealthIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path d="M32 8l20 7v18c0 12-9 19-20 23-11-4-20-11-20-23V15l20-7Z" stroke={stroke} strokeWidth="3" fill="#fff" />
      <path d="M32 20v20M22 30h20" stroke={fill} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

// Exact 8 categories in precise user requested order
const ORDERED_CATEGORIES: Array<{
  name: string;
  handle: string;
  image?: string;
  icon: React.FC<IconProps>;
}> = [
  { name: "Food", handle: "food", image: foodImg, icon: FoodIcon },
  { name: "Toys", handle: "toys", image: toysImg, icon: ToyIcon },
  { name: "Accessories", handle: "accessories", image: accessoriesImg, icon: CollarIcon },
  { name: "Grooming", handle: "grooming", image: groomingImg, icon: GroomingIcon },
  { name: "Travel", handle: "travel", image: travelImg, icon: TravelIcon },
  { name: "Bedding", handle: "beds", image: beddingImg, icon: BeddingIcon },
  { name: "Pet Care", handle: "pet-care", image: petCareImg, icon: PetCareIcon },
  { name: "Health", handle: "health", image: healthImg, icon: HealthIcon },
];

type CategoryStripProps = {
  categories?: ShopifyCollectionItem[];
};

export default function CategoryStrip({ categories }: CategoryStripProps) {
  return (
    <section className="bg-background pt-3 pb-6 md:pt-4 md:pb-8">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Shop By Category" />
        <div className="grid grid-cols-3 gap-x-3 gap-y-3.5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-5 md:grid-cols-8 md:gap-5">
          {ORDERED_CATEGORIES.map(({ name, handle, image, icon: IconComponent }) => {
            const displayImage = image;

            return (
              <Link
                key={name}
                to={`/shop?category=${encodeURIComponent(handle)}`}
                className="group flex flex-col items-center gap-1.5 md:gap-2.5"
              >
                <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#FFF3E8] p-1 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-sm sm:h-[80px] sm:w-[80px] sm:p-1.5 md:h-[120px] md:w-[120px] md:p-0">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={name}
                      width={120}
                      height={120}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <IconComponent className="h-7 w-7 sm:h-9 sm:w-9 md:h-16 md:w-16 transition-transform duration-200 group-hover:scale-105" />
                  )}
                </span>
                <span className="text-center text-[11px] leading-tight font-medium text-foreground group-hover:text-[#FF5B00] transition-colors sm:text-xs md:text-[15px]">
                  {name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}