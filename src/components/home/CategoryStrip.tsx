import SectionHeading from "./SectionHeading";

const CATEGORIES = [
  { name: "Food", icon: FoodIcon },
  { name: "Toys", icon: ToyIcon },
  { name: "Accessories", icon: CollarIcon },
  { name: "Grooming", icon: GroomingIcon },
  { name: "Travel", icon: TravelIcon },
  { name: "Bedding", icon: BeddingIcon },
  { name: "Pet Care", icon: PetCareIcon },
  { name: "Health", icon: HealthIcon },
  { name: "Others", icon: FoodIcon },
];

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

export default function CategoryStrip() {
  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Shop By Category" />
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-8 md:gap-6">
          {CATEGORIES.slice(0, 8).map(({ name, icon: Icon }) => (
            <a key={name} href="#" className="group flex flex-col items-center gap-2.5 md:gap-3">
              <span className="flex h-[86px] w-[86px] items-center justify-center rounded-full bg-secondary transition-transform group-hover:-translate-y-1 md:h-[120px] md:w-[120px]">
                <Icon className="h-11 w-11 md:h-16 md:w-16" />
              </span>
              <span className="text-[13px] font-medium text-foreground md:text-[15px]">{name}</span>
            </a>
          ))}
          <a href="#" className="group flex flex-col items-center gap-2.5 md:hidden">
            <span className="flex h-[86px] w-[86px] items-center justify-center rounded-full bg-secondary transition-transform group-hover:-translate-y-1">
              <FoodIcon className="h-11 w-11" />
            </span>
            <span className="text-[13px] font-medium text-foreground">Others</span>
          </a>
        </div>
      </div>
    </section>
  );
}