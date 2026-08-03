import SectionHeading from "./SectionHeading";
import { brands } from "@/data/home";

export default function BrandStrip() {
  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Top Brands We Love" />
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {brands.map((b) => (
          <a
            key={b}
            href="#"
            className="flex h-[76px] w-[150px] shrink-0 snap-start items-center justify-center rounded-xl border border-border bg-card px-4 md:h-[92px] md:w-[200px]"
          >
            <span className="text-center text-lg font-extrabold tracking-tight text-foreground/80 md:text-xl">
              {b}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}