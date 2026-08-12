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
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-9 md:gap-5">
          {ANIMAL_LIST.map((a) => {
            const handle = a.name.toLowerCase().replace(/\s+/g, "-");

            return (
              <Link
                key={a.name}
                to={`/shop?pet=${encodeURIComponent(handle)}`}
                className="group flex flex-col items-center gap-2.5"
              >
                <span className="flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-full bg-[#FF5B00] transition-all group-hover:-translate-y-1 group-hover:shadow-lg md:h-[132px] md:w-[132px]">
                  <img
                    src={a.image}
                    alt={a.name}
                    width={512}
                    height={512}
                    loading="lazy"
                    className="h-[80%] w-[80%] object-contain drop-shadow-sm transition-transform group-hover:scale-105"
                  />
                </span>
                <span className="text-[13px] font-semibold text-foreground md:text-[15px] group-hover:text-[#FF5B00] transition-colors">
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