import { Link } from "@tanstack/react-router";
import SectionHeading from "./SectionHeading";
import { ShopifyCollectionItem } from "@/lib/shopify/products";
import { animals as defaultAnimals } from "@/data/home";

type ShopByAnimalProps = {
  animals?: ShopifyCollectionItem[];
};

export default function ShopByAnimal({ animals }: ShopByAnimalProps) {
  const ANIMAL_LIST = defaultAnimals;

  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Shop By Animal" />
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-9 md:gap-4 lg:gap-5">
          {ANIMAL_LIST.map((a) => {
            const handle = a.name.toLowerCase().replace(/\s+/g, "-");

            return (
              <Link
                key={a.name}
                to={`/shop?pet=${encodeURIComponent(handle)}`}
                className="group flex flex-col items-center gap-2"
              >
                <span className="flex h-[84px] w-[84px] sm:h-[96px] sm:w-[96px] md:h-[118px] md:w-[118px] items-center justify-center overflow-hidden rounded-full bg-[#FF5500] shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-sm">
                  <img
                    src={a.image}
                    alt={a.name}
                    width={260}
                    height={260}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-102"
                  />
                </span>
                <span className="text-[13px] font-semibold text-foreground md:text-[14px] lg:text-[15px] group-hover:text-[#FF5500] transition-colors">
                  {a.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}