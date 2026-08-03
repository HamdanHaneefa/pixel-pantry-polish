import SectionHeading from "./SectionHeading";
import { animals } from "@/data/home";

export default function ShopByAnimal() {
  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Shop By Animal" />
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 md:grid-cols-9 md:gap-5">
          {animals.map((a) => (
            <a key={a.name} href="#" className="group flex flex-col items-center gap-2.5">
              <span className="flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-full bg-primary transition-transform group-hover:-translate-y-1 md:h-[132px] md:w-[132px]">
                <img
                  src={a.image}
                  alt={a.name}
                  width={512}
                  height={512}
                  loading="lazy"
                  className="h-[78%] w-[78%] object-contain drop-shadow-sm"
                />
              </span>
              <span className="text-[13px] font-medium text-foreground md:text-[15px]">{a.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}