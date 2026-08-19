import { Link } from "@tanstack/react-router";
import SectionHeading from "./SectionHeading";
import { brands } from "@/data/home";

export default function BrandStrip() {
  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Top Brands We Love" />
      </div>
      <div className="flex snap-x gap-3.5 sm:gap-4 overflow-x-auto px-4 pb-3 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {brands.map((b) => (
          <Link
            key={b.name}
            to={`/shop?vendor=${encodeURIComponent(b.name)}`}
            className="flex h-[72px] w-[140px] sm:w-[160px] md:h-[86px] md:w-[185px] shrink-0 snap-start items-center justify-center rounded-2xl border border-[#FCECE0] bg-white p-3 shadow-[0_2px_10px_#FCECE0] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_#FCECE0] group"
          >
            {b.logo ? (
              <img
                src={b.logo}
                alt={b.name}
                width={180}
                height={80}
                loading="lazy"
                className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <span className="text-center text-base font-bold tracking-tight text-foreground/80 group-hover:text-primary transition-colors md:text-lg">
                {b.name}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}