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
        <SectionHeading title="Shop By Animal" action="View All" />
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5 md:grid-cols-9 md:gap-x-3 lg:gap-x-5">
          {ANIMAL_LIST.map((a) => {
            const handle = a.name.toLowerCase().replace(/\s+/g, "-");

            return (
              <Link
                key={a.name}
                to="/shop"
                search={{ pet: handle }}
                className="group flex flex-col items-center gap-2.5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <span className="relative block w-full max-w-[92px] sm:max-w-[104px] md:max-w-[124px] aspect-square rounded-full p-1 ring-1 ring-[#FF5500]/15 bg-white shadow-[0_4px_14px_-6px_rgba(255,85,0,0.35)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-[#FF5500] group-hover:shadow-[0_12px_24px_-10px_rgba(255,85,0,0.55)]">
                  <span className="block h-full w-full overflow-hidden rounded-full bg-[#FF5500]">
                    <img
                      src={a.image}
                      alt=""
                      width={260}
                      height={260}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  </span>
                </span>
                <span className="text-center text-[13px] font-semibold leading-tight text-foreground transition-colors md:text-[14px] lg:text-[15px] group-hover:text-[#FF5500]">
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
