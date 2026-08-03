import SectionHeading from "./SectionHeading";
import { stores } from "@/data/home";

export default function ShopByStore() {
  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Shop by store" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-6 md:gap-6">
          {stores.map((s) => (
            <a key={s.name} href="#" className="group flex flex-col items-center gap-3">
              <span
                className="flex h-[130px] w-[130px] items-center justify-center overflow-hidden rounded-full transition-transform group-hover:-translate-y-1 md:h-[190px] md:w-[190px]"
                style={{ backgroundColor: s.circle }}
              >
                <img
                  src={s.image}
                  alt={s.name}
                  width={512}
                  height={512}
                  loading="lazy"
                  className="h-[78%] w-[78%] object-contain"
                />
              </span>
              <span className="text-sm font-semibold text-foreground md:text-base">{s.name}</span>
              <span
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-foreground/85 md:text-sm"
                style={{ backgroundColor: s.pill }}
              >
                Upto 60% OFF
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}