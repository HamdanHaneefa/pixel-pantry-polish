import { Link } from "@tanstack/react-router";
import SectionHeading from "./SectionHeading";
import { ShopifyCollectionItem } from "@/lib/shopify/products";

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
  icon: React.FC<IconProps>;
}> = [
  { name: "Food", handle: "food", icon: FoodIcon },
  { name: "Toys", handle: "toys", icon: ToyIcon },
  { name: "Accessories", handle: "accessories", icon: CollarIcon },
  { name: "Grooming", handle: "grooming", icon: GroomingIcon },
  { name: "Travel", handle: "travel", icon: TravelIcon },
  { name: "Bedding", handle: "beds", icon: BeddingIcon },
  { name: "Pet Care", handle: "pet-care", icon: PetCareIcon },
  { name: "Health", handle: "health", icon: HealthIcon },
];

type CategoryStripProps = {
  categories?: ShopifyCollectionItem[];
};

export default function CategoryStrip({ categories }: CategoryStripProps) {
  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Shop By Category" />
        <div className="grid grid-cols-4 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-8 md:gap-6">
          {ORDERED_CATEGORIES.map(({ name, handle, icon: IconComponent }) => {
            // Find live Shopify collection image if configured
            const liveCol = categories?.find(
              (c) =>
                c.handle === handle ||
                c.handle.includes(handle) ||
                c.title.toLowerCase() === name.toLowerCase()
            );
            const liveImage = liveCol?.image;

            return (
              <Link
                key={name}
                to={`/shop?category=${encodeURIComponent(handle)}`}
                className="group flex flex-col items-center gap-2.5 md:gap-3"
              >
                <span className="flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-full bg-[#FFF4E9] border border-[#F4E1D0] transition-all group-hover:-translate-y-1 group-hover:border-[#FF5B00] group-hover:shadow-md md:h-[120px] md:w-[120px]">
                  {liveImage ? (
                    <img
                      src={liveImage}
                      alt={name}
                      width={120}
                      height={120}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <IconComponent className="h-11 w-11 md:h-16 md:w-16 transition-transform group-hover:scale-110" />
                  )}
                </span>
                <span className="text-center text-[12px] leading-tight font-semibold text-foreground group-hover:text-[#FF5B00] transition-colors md:text-[15px]">
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